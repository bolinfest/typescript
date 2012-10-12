///<reference path="../../src/harness/harness.ts" />
///<reference path="../../src/harness/exec.ts" />

class HarnessHost implements TypeScript.IResolverHost {

    resolveCompilationEnvironment(preEnv: TypeScript.CompilationEnvironment,
        resolver: TypeScript.ICodeResolver,
        traceDependencies: bool): TypeScript.CompilationEnvironment {
        var resolvedEnv = new TypeScript.CompilationEnvironment(preEnv.compilationSettings, preEnv.ioHost);

        var nCode = preEnv.code.length;
        var nRCode = preEnv.residentCode.length;
        var resolvedPaths: any = {};

        var postResolutionError =
            function (errorFile: string, errorMessage: string) {
                TypeScript.CompilerDiagnostics.debugPrint("Could not resolve file '" + errorFile + "'" + (errorMessage == "" ? "" : ": " + errorMessage));
            }

        var resolutionDispatcher: TypeScript.IResolutionDispatcher = {
            postResolutionError: postResolutionError,
            postResolution: function (path: string, code: TypeScript.ISourceText) {
                if (!resolvedPaths[path]) {
                    resolvedEnv.code.push(<TypeScript.SourceUnit>code);
                    resolvedPaths[path] = true;
                }
            }
        };

        var residentResolutionDispatcher: TypeScript.IResolutionDispatcher = {
            postResolutionError: postResolutionError,
            postResolution: function (path: string, code: TypeScript.ISourceText) {
                if (!resolvedPaths[path]) {
                    resolvedEnv.residentCode.push(<TypeScript.SourceUnit>code);
                    resolvedPaths[path] = true;
                }
            }
        };

        for (var i = 0; i < nRCode; i++) {
            resolver.resolveCode(TypeScript.switchToForwardSlashes(preEnv.ioHost.resolvePath(preEnv.residentCode[i].path)), "", false, residentResolutionDispatcher);
        }

        for (var i = 0; i < nCode; i++) {
            resolver.resolveCode(TypeScript.switchToForwardSlashes(preEnv.ioHost.resolvePath(preEnv.code[i].path)), "", false, resolutionDispatcher);
        }

        return resolvedEnv;
    }
}
class HarnessBatch {
    public host: IIO;
    public compilationSettings: TypeScript.CompilationSettings;
    public compilationEnvironment: TypeScript.CompilationEnvironment;
    public commandLineHost: HarnessHost;
    public resolvedEnvironment: TypeScript.CompilationEnvironment;
    public errout: Harness.Compiler.WriterAggregator;

    constructor () {
        this.host = IO;
        this.compilationSettings = new TypeScript.CompilationSettings();
        this.compilationEnvironment = new TypeScript.CompilationEnvironment(this.compilationSettings, this.host);
        this.commandLineHost = new HarnessHost();
        this.resolvedEnvironment = null;
        this.errout = new Harness.Compiler.WriterAggregator();

        this.harnessCompile = function (files: string[]) {
            TypeScript.CompilerDiagnostics.diagnosticWriter = { Alert: function (s: string) { this.host.printLine(s); } }

            files.unshift(Harness.userSpecifiedroot + 'typings\\lib.d.ts');

            for (var i = 0; i < files.length; i++) {
                var code = new TypeScript.SourceUnit(files[i], null);
                this.compilationEnvironment.code.push(code);
            }

            // set the root
            if (this.compilationSettings.rootPath == "" && this.compilationEnvironment.code.length > 0) {
                var rootPath = TypeScript.getRootFilePath(this.compilationEnvironment.ioHost.resolvePath(this.compilationEnvironment.code[0].path));
                this.compilationSettings.rootPath = rootPath;
            }

            // resolve file dependencies
            this.resolvedEnvironment = this.resolve();

            this.compile();
        }
    }

    private resolve() {
        var resolver = new TypeScript.CodeResolver(this.compilationEnvironment);
        return this.commandLineHost.resolveCompilationEnvironment(this.compilationEnvironment, resolver, true);
    }

    /// Do the actual compilation reading from input files and
    /// writing to output file(s).
    private compile() {
        var outfile: ITextWriter = this.compilationSettings.outputFileName ? this.host.createFile(this.compilationSettings.outputFileName) : null;
        var compiler: TypeScript.TypeScriptCompiler;
        var _self = this;
        this.errout.reset();

        compiler = new TypeScript.TypeScriptCompiler(outfile, new TypeScript.NullLogger(), this.compilationSettings);
        compiler.setErrorOutput(this.errout);

        if (this.compilationSettings.emitComments) {
            compiler.emitCommentsToOutput();
        }

        function consumeUnit(code: TypeScript.SourceUnit, addAsResident: bool) {
            try {
                // if file resolving is disabled, the file's content will not yet be loaded
                if (!(_self.compilationSettings.resolve)) {
                    code.content = this.host.readFile(code.path);
                }
                if (code.content != null) {
                    if (_self.compilationSettings.parseOnly) {
                        compiler.parseUnit(code.content, code.path);
                    }
                    else {
                        if (_self.compilationSettings.errorRecovery) {
                            compiler.parser.setErrorRecovery(outfile, -1, -1);
                        }
                        compiler.addUnit(code.content, code.path, addAsResident);
                    }
                }
            }
            catch (err) {
                // This includes syntax errors thrown from error callback if not in recovery mode
                if (_self.errout != null) {
                    _self.errout.WriteLine(err.message)
                } else {
                    _self.host.stderr.WriteLine(err.message);
                }
            }
        }

        for (var iResCode = 0 ; iResCode < this.resolvedEnvironment.residentCode.length; iResCode++) {
            if (!this.compilationSettings.parseOnly) {
                consumeUnit(this.resolvedEnvironment.residentCode[iResCode], true);
            }
        }

        for (var iCode = 0 ; iCode < this.resolvedEnvironment.code.length; iCode++) {
            if (!this.compilationSettings.parseOnly || (iCode > 0)) {
                consumeUnit(this.resolvedEnvironment.code[iCode], false);
            }
        }

        if (!this.compilationSettings.parseOnly) {
            compiler.typeCheck();
            compiler.emit(this.host.createFile);
        }

        if (outfile) {
            outfile.Close();
        }

        if (this.errout) {
            this.errout.Close();
        }

    }

    // Execute the provided inputs
    private run() {
        for (var i = 0; i < this.resolvedEnvironment.code.length; i++) {
            var unit = this.resolvedEnvironment.code[i];
            var outputFileName = unit.path.replace(/\.ts$/, ".js");
            var unitRes = this.host.readFile(outputFileName)
            this.host.run(unitRes, outputFileName);
        }
    }

    /// Begin batch compilation
    public harnessCompile;

    public getResolvedFilePaths() {
        var paths = [];
        for (var i = 1; i < this.resolvedEnvironment.code.length; i++) {
            paths.push(this.resolvedEnvironment.code[i].path);
        }

        return paths;
    }
}

describe("Compiling a project", function (done) {
    var rPath = Harness.userSpecifiedroot + 'tests\\projects\\r.js';
    var testExec = true;

    function cleanProjectDirectory(directory: string) {
        var files = IO.dir(Harness.userSpecifiedroot + directory, /.*\.js/);
        for (var i = 0; i < files.length; i++) {
            IO.deleteFile(files[i]);
        }
    }

    function assertRelativePathsInArray(arr, relativePaths) {
        for (var i = 0; i < relativePaths.length; i++) {
            var found = false;
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].match(new RegExp(relativePaths[i].replace(/\\/g, "\\\\") + "$"))) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                throw new Error("Expected array to contain path " + relativePaths[i]);
            }
        }
    }

    function assertAllFilesExist(files) {
        for (var i = 0; i < files.length; i++) {
            if (!IO.fileExists(files[i])) {
                throw new Error("Expected the file " + files[i] + " to exist.");
            }
        }
    }

    function createTest(spec: any) {
        var inputFiles = [];
        for (var i = 0; i < spec.inputFiles.length; i++) {
            inputFiles.push(Harness.userSpecifiedroot + spec.projectRoot + "/" + spec.inputFiles[i]);
        }

        var outputFiles = [];
        for (var i = 0; i < spec.outputFiles.length; i++) {
            outputFiles.push(Harness.userSpecifiedroot + spec.projectRoot + "/" + spec.outputFiles[i]);
        }

        /********************************************************
                             NODE CODEGEN
        *********************************************************/

        describe("with " + spec.scenario + " - Node Codegen", function () {
            cleanProjectDirectory(spec.projectRoot);

            TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            var batch = new HarnessBatch();
            batch.harnessCompile(inputFiles);

            it("collects the right files", function () {

                var resolvedFiles = batch.getResolvedFilePaths();
                assertRelativePathsInArray(resolvedFiles, spec.collectedFiles);
                assert.equal(resolvedFiles.length, spec.collectedFiles.length);
            });

            if (!spec.negative) {
                it("compiles without error", function () {
                    assert.equal(batch.errout.lines.join("\n"), '');
                });
            } else {
                it("compiles without error", function () {
                    assert.equal(batch.errout.lines.join("\n"), spec.errors.join("\n") + "\n");
                });
            }

            it("creates the proper output files", function () {
                assertAllFilesExist(outputFiles);
            });

            if (testExec && !spec.skipRun && !spec.skipNodeRun) {
                it("runs without error", function (done) {
                    Exec.exec("node.exe", ['"' + outputFiles[0] + '"'], function (res) {
                        assert.equal(res.stdout, "");
                        assert.equal(res.stderr, "");
                        done();
                    })
                });
            }

            if (spec.baselineCheck) {
                it("checks baseline", function () {
                    assert.noDiff(Harness.CollateralReader.read(spec.path + spec.outputFiles[0] + ""),
                         Harness.CollateralReader.read(spec.path + spec.baselineFiles[0] + ".node"));
                });
            }
        });

        describe("with " + spec.scenario + " - AMD Codegen", function () {
            cleanProjectDirectory(spec.projectRoot);

            TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
            var batch = new HarnessBatch();
            batch.harnessCompile(inputFiles);

            it("collects the right files", function () {
                var resolvedFiles = batch.getResolvedFilePaths();

                assert.equal(resolvedFiles.length, spec.collectedFiles.length);
                assertRelativePathsInArray(resolvedFiles, spec.collectedFiles);
            });

            if (!spec.negative) {
                it("compiles without error", function () {
                    assert.equal(batch.errout.lines.join("\n"), '');
                });
            } else {
                it("compiles without error", function () {
                    assert.equal(batch.errout.lines.join("\n"), spec.errors.join("\n") + "\n");
                });
            }

            it("creates the proper output files", function () {
                assertAllFilesExist(outputFiles);
            });

            if (testExec && !spec.skipRun) {
                it("runs without error", function (done) {
                    Exec.exec("node.exe", [rPath, '"' + outputFiles[0] + '"'], function (res) {
                        assert.equal(res.stdout, "");
                        assert.equal(res.stderr, "");
                        done();
                    })
                });
            }

            if (spec.baselineCheck) {
                it("checks baseline", function () {
                    assert.noDiff(Harness.CollateralReader.read(spec.path + spec.outputFiles[0] + ""),
                         Harness.CollateralReader.read(spec.path + spec.baselineFiles[0] + ".amd"));
                });
            }
        });
    }

    var tests = [];

    tests.push({
        scenario: 'module identifier'

            , projectRoot: 'tests/projects/module identifier'
            , inputFiles: ['consume.ts']
            , collectedFiles: ['consume.ts', 'decl.ts']
            , outputFiles: ['consume.js', 'decl.js']
    });

    tests.push({
        scenario: 'relative - global'
            , projectRoot: 'tests/projects/relative - global'
            , inputFiles: ['consume.ts']
            , collectedFiles: ['consume.ts', 'decl.ts']
            , outputFiles: ['consume.js', 'decl.js']
    });

    tests.push({
        scenario: 'relative - nested'
            , projectRoot: 'tests/projects/relative - nested'
            , inputFiles: ['main/consume.ts']
            , collectedFiles: ['main/consume.ts', 'decl.ts']
            , outputFiles: ['main/consume.js', 'decl.js']
    });

    tests.push({
        scenario: 'non-relative'
            , projectRoot: 'tests/projects/non-relative'
            , inputFiles: ['consume.ts']
            , collectedFiles: ['consume.ts', 'decl.ts', 'lib/foo/a.ts', 'lib/foo/b.ts', 'lib/bar/a.ts']
            , outputFiles: ['consume.js', 'decl.js', 'lib/bar/a.js', 'lib/foo/a.js']
    });

    tests.push({
        scenario: "can't find the module"
            , projectRoot: 'tests/projects/no module'
            , inputFiles: ['decl.ts']
            , collectedFiles: ['decl.ts']
            , outputFiles: []
            , negative: true
            , skipRun: true
            , errors: [TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/projects/no module/decl.ts(1,24): The name \'"./foo/bar.js"\' does not exist in the current scope'
                , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/projects/no module/decl.ts(1,24): A module cannot be aliased to a non-module type'
                , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/projects/no module/decl.ts(2,24): The name \'"baz"\' does not exist in the current scope'
                , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/projects/no module/decl.ts(2,24): A module cannot be aliased to a non-module type'
                , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/projects/no module/decl.ts(3,24): The name \'"./baz"\' does not exist in the current scope'
                , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/projects/no module/decl.ts(3,24): A module cannot be aliased to a non-module type']
    });

    tests.push({
        scenario: 'baseline'
            , projectRoot: 'tests/projects/baseline'
            , inputFiles: ['emit.ts']
            , collectedFiles: ['emit.ts', 'decl.ts']
            , outputFiles: ['emit.js']
            , baselineCheck: true
            , baselineFiles: ['base-emit']
            , path: 'projects/baseline/'
    });

    tests.push({
        scenario: 'baseline 2'
            , projectRoot: 'tests/projects/baseline'
            , inputFiles: ['dont-emit.ts']
            , collectedFiles: ['dont-emit.ts', 'decl.ts']
            , outputFiles: ['dont-emit.js']
            , baselineCheck: true
            , baselineFiles: ['base-dont-emit']
            , path: 'projects/baseline/'
    });

    tests.push({
        scenario: 'baseline 3'
            , projectRoot: 'tests/projects/baseline'
            , inputFiles: ['nestedModule.ts']
            , collectedFiles: ['nestedModule.ts']
            , outputFiles: ['nestedModule.js']
            , baselineCheck: true
            , baselineFiles: ['base-nestedModule']
            , path: 'projects/baseline/'
    });

    tests.push({
        scenario: 'relative - global - ref'
            , projectRoot: 'tests/projects/relative - global - ref'
            , inputFiles: ['consume.ts']
            , collectedFiles: ['consume.ts', 'decl.d.ts']
            , outputFiles: ['consume.js']
            , skipRun: true
    });

    tests.push({
        scenario: 'relative - nested - ref'
            , projectRoot: 'tests/projects/relative - nested - ref'
            , inputFiles: ['main/consume.ts']
            , collectedFiles: [(Harness.userSpecifiedroot == "" ? "main/consume.ts" : 'main/consume.ts'), 'decl.d.ts']
            , outputFiles: ['main/consume.js']
            , skipRun: true
    });


    tests.push({
        scenario: 'nested declare'
            , projectRoot: 'tests/projects/nested declare'
            , inputFiles: ['consume.ts']
            , collectedFiles: ['consume.ts']
            , outputFiles: []
            , skipRun: true
    });

    tests.push({
        scenario: 'ext referencing ext and int'
            , projectRoot: 'tests/projects/ext-int-ext'
            , inputFiles: ['external.ts']
            , collectedFiles: ['external.ts', 'external-2.ts', 'internal.ts']
            , outputFiles: ['external.js', 'external-2.js', 'internal.js']
            , skipNodeRun: true
    });

    tests.push({
        scenario: 'int referencing ext and int'
            , projectRoot: 'tests/projects/ext-int-ext'
            , inputFiles: ['internal-2.ts']
            , collectedFiles: ['internal-2.ts', 'external-2.ts']
            , outputFiles: ['external-2.js']
            , skipNodeRun: true
    });

    tests.push({
        scenario: 'nested reference tags'
            , projectRoot: 'tests/projects/reference - 1'
            , inputFiles: ['main.ts']
            , collectedFiles: ['main.ts', 'ClassA.ts', 'ClassB.ts']
            , outputFiles: ['main.js', 'lib/ClassA.js', 'lib/ClassB.js']
            , skipNodeRun: true
    });
    
    tests.push({ 
        scenario: 'circular referencing'
            , projectRoot: 'tests/projects/circular referencing'
            , inputFiles: ['consume.ts']
            , collectedFiles: ['consume.ts', 'decl.ts']
            , outputFiles: ['consume.js', 'decl.js']
            , skipRun: true
    });
    

    for (var i = 0; i < tests.length; i++) {
        createTest(tests[i]);
    }

    Exec.exec("node.exe", ['-v'], function (res) {
        if (res.stderr.length > 0) {
            testExec = false;
        }

        done();
    })
});
