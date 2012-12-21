///<reference path="../../../src/harness/harness.ts" />
///<reference path="../../../src/harness/exec.ts" />
///<reference path="../runnerbase.ts" />

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

    constructor(getDeclareFiles: bool, generateMapFiles: bool, outputOption: string) {
        this.host = IO;
        this.compilationSettings = new TypeScript.CompilationSettings();
        this.compilationSettings.generateDeclarationFiles = getDeclareFiles;
        this.compilationSettings.mapSourceFiles = generateMapFiles;
        this.compilationSettings.outputOption = outputOption;
        this.compilationEnvironment = new TypeScript.CompilationEnvironment(this.compilationSettings, this.host);
        this.commandLineHost = new HarnessHost();
        this.resolvedEnvironment = null;
        this.errout = new Harness.Compiler.WriterAggregator();

        this.harnessCompile = function (
            files: string[],
            createEmitFiles: (path: string, useUTF8?: bool) => ITextWriter,
            createDeclareFile: (path: string, useUTF8?: bool) => ITextWriter) {
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

            this.compile(createEmitFiles, createDeclareFile);
        }
    }

    private resolve() {
        var resolver = new TypeScript.CodeResolver(this.compilationEnvironment);
        return this.commandLineHost.resolveCompilationEnvironment(this.compilationEnvironment, resolver, true);
    }

    /// Do the actual compilation reading from input files and
    /// writing to output file(s).
    private compile(
        createEmitFile: (path: string, useUTF8?: bool) => ITextWriter,
        createDeclareFile: (path: string, useUTF8?: bool) => ITextWriter) {
        var compiler: TypeScript.TypeScriptCompiler;
        var _self = this;
        this.errout.reset();

        compiler = new TypeScript.TypeScriptCompiler(this.errout, new TypeScript.NullLogger(), this.compilationSettings);
        compiler.setErrorOutput(this.errout);
        compiler.parser.errorRecovery = true;

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
                    // Log any bugs associated with the test
                    var bugs = code.content.match(/\bbug (\d+)/i);
                    if (bugs) {
                        bugs.forEach(bug => assert.bug(bug));
                    }

                    if (_self.compilationSettings.parseOnly) {
                        compiler.parseUnit(code.content, code.path);
                    }
                    else {
                        if (_self.compilationSettings.errorRecovery) {
                            compiler.parser.setErrorRecovery(this.errorOut);
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
            compiler.emit({
                createFile: createEmitFile,
                directoryExists: IO.directoryExists,
                fileExists: IO.fileExists,
                resolvePath: IO.resolvePath
            });
            compiler.emitSettings.ioHost.createFile = createDeclareFile;
            compiler.emitDeclarations();
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

    public getResolvedFilePaths(): string[] {
        var paths: string[] = [];
        for (var i = 1; i < this.resolvedEnvironment.code.length; i++) {
            paths.push(this.resolvedEnvironment.code[i].path);
        }

        return paths;
    }
}

class ProjectRunner extends RunnerBase {
    public runTests() {
        describe("Compiling a project", function (done) {
            var rPath = Harness.userSpecifiedroot + 'tests\\cases\\projects\\r.js';
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

                var generatedDeclareFiles: { fname: string; file: Harness.Compiler.WriterAggregator;  }[] = [];
                var getDeclareFiles = false;
                if (spec.declareFiles) {
                    getDeclareFiles = true;
                }

                var writeGeneratedFile = (files: { fname: string; file: Harness.Compiler.WriterAggregator; }[], fn: string) => {
                    var fnEntry = { fname: fn, file: new Harness.Compiler.WriterAggregator() };
                    files.push(fnEntry);
                    return fnEntry.file;
                }

                var writeDeclareFile = (fn: string) => {
                    return writeGeneratedFile(generatedDeclareFiles, fn);
                }

                var generatedEmitFiles: { fname: string; file: Harness.Compiler.WriterAggregator; }[] = [];
                var writeGeneratedEmitFile = (fn: string) => {
                    return writeGeneratedFile(generatedEmitFiles, fn);
                }

                var writeEmitFile = (fileName: string, useUTF8?: bool) => createFileAndFolderStructure(IO, fileName, useUTF8);
                var verifyEmitFiles = false;
                if (spec.verifyEmitFiles) {
                    verifyEmitFiles = true;
                    writeEmitFile = writeGeneratedEmitFile;
                }

                var generateMapFiles = false;
                var sourcemapDir = "";
                if (spec.generateMapFiles) {
                    generateMapFiles = true;
                    sourcemapDir = "sourcemap/"
                }

                var baseFileName = TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + "/" + spec.projectRoot + "/";
                var outputOption = "";
                if (spec.outputOption) {
                    outputOption = baseFileName + spec.outputOption;
                }

                var codeGenType: string;
                var compareGeneratedFiles = (
                    generatedFiles: { fname: string; file: Harness.Compiler.WriterAggregator; }[],
                    expectedFiles: string[]
                    ) => {
                    assert.equal(generatedFiles.length, expectedFiles.length);
                    for (var i = 0; i < expectedFiles.length; i++) {
                        var expectedFName = baseFileName + expectedFiles[i];
                        assert.equal(IO.resolvePath(generatedFiles[i].fname), IO.resolvePath(expectedFName));
                        if (spec.verifyFileNamesOnly) {
                            continue;
                        }
                        var fileContents = generatedFiles[i].file.lines.join("\n");
                        var localFileName = baseFileName + "local/" + codeGenType + "/" + sourcemapDir + expectedFiles[i];
                        var localFile = createFileAndFolderStructure(IO, localFileName);
                        var referenceFileName = baseFileName + "reference/" + codeGenType + "/" + sourcemapDir + expectedFiles[i];
                        localFile.Write(fileContents);
                        localFile.Close();
                        assert.noDiff(fileContents, IO.readFile(referenceFileName));
                    }
                }

                /********************************************************
                                     NODE CODEGEN
                *********************************************************/

                describe("with " + spec.scenario + " - Node Codegen", function () {
                    if (spec.bug && spec.bug !== '') {
                        assert.bug(spec.bug)
                    }

                    cleanProjectDirectory(spec.projectRoot);

                    generatedDeclareFiles = [];
                    generatedEmitFiles = [];
                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                    codeGenType = "node";
                    var batch = new HarnessBatch(getDeclareFiles, generateMapFiles, outputOption);
                    batch.harnessCompile(inputFiles, writeEmitFile, writeDeclareFile);
                    
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
                        it("compiles with errors", function () {
                            assert.equal(batch.errout.lines.join("\n"), spec.errors.join("\n") + "\n");
                        });
                    }

                    if (verifyEmitFiles) {
                        it("checks emit files baseline", function () {
                            compareGeneratedFiles(generatedEmitFiles, spec.outputFiles);
                        });
                    } else {
                        it("creates the proper output files", function () {
                            assertAllFilesExist(outputFiles);
                        });
                    }

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
                            assert.noDiff(Harness.readFile(spec.path + spec.outputFiles[0] + ""),
                                 Harness.readFile(spec.path + spec.baselineFiles[0] + "." + codeGenType));
                        });
                    }

                    if (getDeclareFiles) {
                        it("checks declare files baseline", function () {
                            compareGeneratedFiles(generatedDeclareFiles, spec.declareFiles);
                        });
                    }
                });

                /// AMD Codegen

                describe("with " + spec.scenario + " - AMD Codegen", function () {
                    if (spec.bug && spec.bug !== '') {
                        assert.bug(spec.bug)
                    }

                    cleanProjectDirectory(spec.projectRoot);

                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                    generatedDeclareFiles = [];
                    generatedEmitFiles = [];
                    codeGenType = "amd";
                    var batch = new HarnessBatch(getDeclareFiles, generateMapFiles, outputOption);
                    batch.harnessCompile(inputFiles, writeEmitFile, writeDeclareFile);

                    it("collects the right files", function () {
                        var resolvedFiles = batch.getResolvedFilePaths();

                        assert.equal(resolvedFiles.length, spec.collectedFiles.length);
                        assertRelativePathsInArray(resolvedFiles, spec.collectedFiles);
                    });

                    if (!spec.negative) {
                        it("compiles without error", function () {
                            assert.equal(batch.errout.lines.join("\n"), '');
                        });
                    }
                    else {
                        it("compiles with errors", function () {
                            assert.equal(batch.errout.lines.join("\n"), spec.errors.join("\n") + "\n");
                        });
                    }

                    if (verifyEmitFiles) {
                        it("checks emit files baseline", function () {
                            compareGeneratedFiles(generatedEmitFiles, spec.outputFiles);
                        });
                    } else {
                        it("creates the proper output files", function () {
                            assertAllFilesExist(outputFiles);
                        });
                    }

                    if (testExec && !spec.skipRun) {
                        var moduleName = spec.outputFiles[0].replace(/\.js$/, "");
                        IO.writeFile(spec.projectRoot + '/driver.js', amdDriverTemplate.replace(/\{0}/g, moduleName));

                        it("runs without error", function (done) {
                            Exec.exec("node.exe", ['"' + spec.projectRoot + '/driver.js"'], function (res) {
                                assert.equal(res.stdout, "");
                                assert.equal(res.stderr, "");
                                done();
                            })
                        });
                    }

                    if (spec.baselineCheck) {
                        it("checks baseline", function () {
                            assert.noDiff(Harness.readFile(spec.path + spec.outputFiles[0] + ""),
                                 Harness.readFile(spec.path + spec.baselineFiles[0] + "." + codeGenType));
                        });
                    }

                    if (getDeclareFiles) {
                        it("checks declare files baseline", function () {
                            compareGeneratedFiles(generatedDeclareFiles, spec.declareFiles);
                        });
                    }
                });
            }

            var tests = [];

            tests.push({
                scenario: 'module identifier'
                    , projectRoot: 'tests/cases/projects/ModuleIdentifier'
                    , inputFiles: ['consume.ts']
                    , collectedFiles: ['consume.ts', 'decl.ts']
                    , outputFiles: ['consume.js', 'decl.js']
            });

            tests.push({
                scenario: 'relative - global'
                    , projectRoot: 'tests/cases/projects/relative-global'
                    , inputFiles: ['consume.ts']
                    , collectedFiles: ['consume.ts', 'decl.ts']
                    , outputFiles: ['consume.js', 'decl.js']
            });

            tests.push({
                scenario: 'relative - nested'
                    , projectRoot: 'tests/cases/projects/relative-nested'
                    , inputFiles: ['app.ts']
                    , collectedFiles: ['app.ts', 'main/consume.ts', 'decl.ts']
                    , outputFiles: ['app.js', 'main/consume.js', 'decl.js']
            });

            tests.push({
                scenario: 'non-relative'
                    , projectRoot: 'tests/cases/projects/non-relative'
                    , inputFiles: ['consume.ts']
                    , collectedFiles: ['consume.ts', 'decl.ts', 'lib/foo/a.ts', 'lib/foo/b.ts', 'lib/bar/a.ts']
                    , outputFiles: ['consume.js', 'decl.js', 'lib/bar/a.js', 'lib/foo/a.js']
            });

            tests.push({
                scenario: "can't find the module"
                    , projectRoot: 'tests/cases/projects/NoModule'
                    , inputFiles: ['decl.ts']
                    , collectedFiles: ['decl.ts']
                    , outputFiles: []
                    , negative: true
                    , skipRun: true
                    , errors: [TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NoModule/decl.ts(1,24): The name \'"./foo/bar.js"\' does not exist in the current scope'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NoModule/decl.ts(1,24): A module cannot be aliased to a non-module type'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NoModule/decl.ts(2,24): The name \'"baz"\' does not exist in the current scope'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NoModule/decl.ts(2,24): A module cannot be aliased to a non-module type'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NoModule/decl.ts(3,24): The name \'"./baz"\' does not exist in the current scope'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NoModule/decl.ts(3,24): A module cannot be aliased to a non-module type']
            });

            tests.push({
                scenario: 'baseline'
                    , projectRoot: 'tests/cases/projects/baseline'
                    , inputFiles: ['emit.ts']
                    , collectedFiles: ['emit.ts', 'decl.ts']
                    , outputFiles: ['emit.js']
                    , baselineCheck: true
                    , baselineFiles: ['base-emit']
                    , path: 'cases/projects/baseline/'
            });

            tests.push({
                scenario: 'baseline 2'
                    , projectRoot: 'tests/cases/projects/baseline'
                    , inputFiles: ['dont_emit.ts']
                    , collectedFiles: ['dont_emit.ts', 'decl.ts']
                    , outputFiles: ['dont_emit.js']
                    , baselineCheck: true
                    , baselineFiles: ['base-dont-emit']
                    , path: 'cases/projects/baseline/'
            });

            tests.push({
                scenario: 'baseline 3'
                    , projectRoot: 'tests/cases/projects/baseline'
                    , inputFiles: ['nestedModule.ts']
                    , collectedFiles: ['nestedModule.ts']
                    , outputFiles: ['nestedModule.js']
                    , baselineCheck: true
                    , baselineFiles: ['base-nestedModule']
                    , path: 'cases/projects/baseline/'
            });

            tests.push({
                scenario: 'relative - global - ref'
                    , projectRoot: 'tests/cases/projects/relative-global-ref'
                    , inputFiles: ['consume.ts']
                    , collectedFiles: ['consume.ts', 'decl.d.ts']
                    , outputFiles: ['consume.js']
                    , skipRun: true
            });

            tests.push({
                scenario: 'relative - nested - ref'
                    , projectRoot: 'tests/cases/projects/relative-nested-ref'
                    , inputFiles: ['main/consume.ts']
                    , collectedFiles: [(Harness.userSpecifiedroot == "" ? "main/consume.ts" : 'main/consume.ts'), 'decl.d.ts']
                    , outputFiles: ['main/consume.js']
                    , skipRun: true
            });


            tests.push({
                scenario: 'nested declare'
                    , projectRoot: 'tests/cases/projects/NestedDeclare'
                    , inputFiles: ['consume.ts']
                    , collectedFiles: ['consume.ts']
                    , outputFiles: []
                    , skipRun: true
            });

            tests.push({
                scenario: 'ext referencing ext and int'
                    , projectRoot: 'tests/cases/projects/ext-int-ext'
                    , inputFiles: ['external.ts']
                    , collectedFiles: ['external.ts', 'external2.ts', 'internal.ts']
                    , outputFiles: ['external.js', 'external2.js', 'internal.js']
                    , skipRun: true /* this requires a host which is able to resolve the script in the reference tag */
            });

            tests.push({
                scenario: 'int referencing ext and int'
                    , projectRoot: 'tests/cases/projects/ext-int-ext'
                    , inputFiles: ['internal2.ts']
                    , collectedFiles: ['internal2.ts', 'external2.ts']
                    , outputFiles: ['external2.js']
                    , negative: true
                    , skipRun: true /* this requires a host which is able to resolve the script in the reference tag */
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/ext-int-ext/internal2.ts (2,19): Import declaration of external module is permitted only in global or top level dynamic modules']
            });

            tests.push({
                scenario: 'nested reference tags'
                    , projectRoot: 'tests/cases/projects/reference-1'
                    , inputFiles: ['main.ts']
                    , collectedFiles: ['main.ts', 'ClassA.ts', 'ClassB.ts']
                    , outputFiles: ['main.js', 'lib/ClassA.js', 'lib/ClassB.js']
                    , skipRun: true /* this requires a host which is able to resolve the script in the reference tags */
            });

            tests.push({
                scenario: 'CircularReferencing'
                    , projectRoot: 'tests/cases/projects/CircularReferencing'
                    , inputFiles: ['consume.ts']
                    , collectedFiles: ['consume.ts', 'decl.ts']
                    , outputFiles: ['consume.js', 'decl.js']
                    , skipRun: true
            });

            tests.push({
                scenario: 'circular referencing - 2'
                    , projectRoot: 'tests/cases/projects/CircularReferencing-2'
                    , inputFiles: ['A.ts']
                    , collectedFiles: ['A.ts', 'B.ts', 'C.ts']
                    , outputFiles: ['A.js', 'B.js', 'C.js']
            });

            tests.push({
                scenario: 'nested local module - with recursive typecheck'
                    , projectRoot: 'tests/cases/projects/NestedLocalModule-WithRecursiveTypecheck'
                    , inputFiles: ['test1.ts']
                    , collectedFiles: ['test1.ts', 'test2.ts']
                    , outputFiles: []
                    , negative: true
                    , skipRun: true
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NestedLocalModule-WithRecursiveTypecheck/test1.ts (3,21): Import declaration of external module is permitted only in global or top level dynamic modules'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NestedLocalModule-WithRecursiveTypecheck/test2.ts (5,25): Import declaration of external module is permitted only in global or top level dynamic modules']
            });

            tests.push({
                scenario: 'nested local module - simple case'
                    , projectRoot: 'tests/cases/projects/NestedLocalModule-SimpleCase'
                    , inputFiles: ['test1.ts']
                    , collectedFiles: ['test1.ts', 'test2.ts']
                    , outputFiles: []
                    , negative: true
                    , skipRun: true
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/NestedLocalModule-SimpleCase/test1.ts (2,21): Import declaration of external module is permitted only in global or top level dynamic modules']
            });

            tests.push({
                scenario: "privacy Check on imported module - simple reference"
                    , projectRoot: 'tests/cases/projects/privacyCheck-SimpleReference'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'mExported.ts', 'mNonExported.ts']
                    , outputFiles: ['mExported.js', 'mNonExported.js']
                    , negative: true
                    , skipRun: true
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-SimpleReference/test.ts (1,7): export keyword not permitted on import declaration']
            });

            tests.push({
                scenario: "privacy Check on imported module - declarations inside module"
                    , projectRoot: 'tests/cases/projects/privacyCheck-InsideModule'
                    , inputFiles: ['testGlo.ts']
                    , collectedFiles: ['testGlo.ts', 'mExported.ts', 'mNonExported.ts']
                    , outputFiles: ['mExported.js', 'mNonExported.js']
                    , negative: true
                    , skipRun: true
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts (2,11): export keyword not permitted on import declaration'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts (2,37): Import declaration of external module is permitted only in global or top level dynamic modules'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts (21,33): Import declaration of external module is permitted only in global or top level dynamic modules'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(3,4): exported variable \'c1\' is using inaccessible module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(5,8): exported function return type is using inaccessible module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(7,4): exported variable \'x1\' is using inaccessible module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(9,32): exported class \'class1\' extends class from private module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(22,4): exported variable \'c3\' is using inaccessible module "mNonExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(24,8): exported function return type is using inaccessible module "mNonExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(26,4): exported variable \'x3\' is using inaccessible module "mNonExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/testGlo.ts(28,32): exported class \'class3\' extends class from private module "mNonExported"']
            });

            tests.push({
                scenario: "privacy Check on imported module - declarations inside non exported module"
                    , projectRoot: 'tests/cases/projects/privacyCheck-InsideModule'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'mExported.ts', 'mNonExported.ts']
                    , outputFiles: ['test.js', 'mExported.js', 'mNonExported.js']
                    , negative: true
                    , skipRun: true
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/test.ts (5,11): export keyword not permitted on import declaration'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/test.ts (5,37): Import declaration of external module is permitted only in global or top level dynamic modules'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-InsideModule/test.ts (24,33): Import declaration of external module is permitted only in global or top level dynamic modules']
            });

            tests.push({
                scenario: "privacy Check on imported module - import statement in parent module"
                    , projectRoot: 'tests/cases/projects/privacyCheck-ImportInParent'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'mExported.ts', 'mNonExported.ts']
                    , outputFiles: ['test.js', 'mExported.js', 'mNonExported.js']
                    , negative: true
                    , skipRun: true
                    , errors: ['// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts (2,11): export keyword not permitted on import declaration'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts (2,37): Import declaration of external module is permitted only in global or top level dynamic modules'
                        , '// ' + TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts (42,33): Import declaration of external module is permitted only in global or top level dynamic modules'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(24,8): exported variable \'c1\' is using inaccessible module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(26,12): exported function return type is using inaccessible module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(28,8): exported variable \'x1\' is using inaccessible module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(30,36): exported class \'class1\' extends class from private module "mExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(64,8): exported variable \'c3\' is using inaccessible module "mNonExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(66,12): exported function return type is using inaccessible module "mNonExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(68,8): exported variable \'x3\' is using inaccessible module "mNonExported"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/privacyCheck-ImportInParent/test.ts(70,36): exported class \'class3\' extends class from private module "mNonExported"']
            });

            tests.push({
                scenario: "declare export added"
                , projectRoot: 'tests/cases/projects/DeclareExportAdded'
                , inputFiles: ['consumer.ts']
                , collectedFiles: ['consumer.ts', 'ref.d.ts']
                , outputFiles: ['consumer.js']
                , skipRun: true
                , baselineCheck: true
                , path: 'cases/projects/DeclareExportAdded/'
                , baselineFiles: ['base-declare-export']
            })


            tests.push({
                scenario: "relative paths"
                , projectRoot: 'tests/cases/projects/RelativePaths'
                , inputFiles: ['app.ts']
                , collectedFiles: ['app.ts', 'A.ts', 'B.ts']
                , outputFiles: ['app.js', 'A/A.js', 'A/B.js']
                , skipRun: true
            })

            tests.push({
                scenario: "declare Variable Collision"
                , projectRoot: 'tests/cases/projects/declareVariableCollision'
                , inputFiles: ['decl.d.ts', 'in1.d.ts', 'in2.d.ts']
                , collectedFiles: ['decl.d.ts', 'in1.d.ts', 'in2.d.ts']
                , outputFiles: []
                , negative: true
                , skipRun: true
                , errors: [TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/declareVariableCollision/in2.d.ts(1,0): Duplicate identifier \'a\''
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/declareVariableCollision/in2.d.ts(1,0): Duplicate identifier \'a\''
                ]
            })

            tests.push({
                scenario: "module merging ordering 1"
                , projectRoot: 'tests/cases/projects/moduleMergeOrder'
                , inputFiles: ['a.ts', 'b.ts']
                , collectedFiles: ['a.ts', 'b.ts']
                , outputFiles: ['a.js']
                , skipRun: true
            });

            tests.push({
                scenario: "module merging ordering 2"
                , projectRoot: 'tests/cases/projects/moduleMergeOrder'
                , inputFiles: ['b.ts', 'a.ts']
                , collectedFiles: ['a.ts', 'b.ts']
                , outputFiles: ['a.js']
                , skipRun: true
                , negative: true
                , bug: "524607"
                , errors: [TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/moduleMergeOrder/a.ts(11,24): The name \'A\' does not exist in the current scope'
                ]
            });

            tests.push({
                scenario: "declarations_SimpleImport"
                    , projectRoot: 'tests/cases/projects/declarations_SimpleImport'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'm4.ts']
                    , outputFiles: ['useModule.js', 'm4.js']
                    , declareFiles: ['m4.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_GlobalImport"
                    , projectRoot: 'tests/cases/projects/declarations_GlobalImport'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'glo_m4.ts']
                    , outputFiles: ['useModule.js', 'glo_m4.js']
                    , declareFiles: ['glo_m4.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_ImportedInPrivate"
                    , projectRoot: 'tests/cases/projects/declarations_ImportedInPrivate'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'private_m4.ts']
                    , outputFiles: ['useModule.js', 'private_m4.js']
                    , declareFiles: ['private_m4.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_ImportedUseInFunction"
                    , projectRoot: 'tests/cases/projects/declarations_ImportedUseInFunction'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'fncOnly_m4.ts']
                    , outputFiles: ['useModule.js', 'fncOnly_m4.js']
                    , declareFiles: ['fncOnly_m4.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_MultipleTimesImport"
                    , projectRoot: 'tests/cases/projects/declarations_MultipleTimesImport'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'm4.ts']
                    , outputFiles: ['useModule.js', 'm4.js']
                    , declareFiles: ['m4.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_MultipleTimesMultipleImport"
                    , projectRoot: 'tests/cases/projects/declarations_MultipleTimesMultipleImport'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'm4.ts', 'm5.ts']
                    , outputFiles: ['useModule.js', 'm4.js', 'm5.js']
                    , declareFiles: ['m4.d.ts', 'm5.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_CascadingImports"
                    , projectRoot: 'tests/cases/projects/declarations_CascadingImports'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'm4.ts']
                    , outputFiles: ['m4.js']
                    , declareFiles: ['m4.d.ts', 'useModule.d.ts']
                    , skipRun: true
            });

            tests.push({
                scenario: "declarations_IndirectImport should result in error"
                    , projectRoot: 'tests/cases/projects/declarations_IndirectImport'
                    , inputFiles: ['useModule.ts']
                    , collectedFiles: ['useModule.ts', 'm4.ts', 'm5.ts']
                    , outputFiles: ['useModule.js', 'm4.js', 'm5.js']
                    , negative: true
                    , skipRun: true
                    , errors: [TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/declarations_IndirectImport/useModule.ts(3,0): exported variable \'d\' is using inaccessible module "m4"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/declarations_IndirectImport/useModule.ts(4,0): exported variable \'x\' is using inaccessible module "m4"'
                        , TypeScript.switchToForwardSlashes(IO.resolvePath(Harness.userSpecifiedroot)) + '/tests/cases/projects/declarations_IndirectImport/useModule.ts(7,4): exported function return type is using inaccessible module "m4"']
            });

            tests.push({
                scenario: "outputdir_singleFile: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_singleFile'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts']
                    , outputFiles: ['test.js']
                    , declareFiles: ['test.d.ts']
                    , verifyEmitFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_singleFile: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_singleFile'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts']
                    , outputFiles: ['bin/test.js']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_singleFile: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_singleFile'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts']
                    , outputFiles: ['outdir/simple/test.js']
                    , verifyEmitFiles: true
                    , declareFiles: ['outdir/simple/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_singleFile: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_singleFile'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts']
                    , outputFiles: ['test.js', 'test.js.map']
                    , declareFiles: ['test.d.ts']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_singleFile: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_singleFile'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts']
                    , outputFiles: ['bin/test.js', 'bin/test.js.map']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_singleFile: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_singleFile'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts']
                    , outputFiles: ['outdir/simple/test.js', 'outdir/simple/test.js.map']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , declareFiles: ['outdir/simple/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_simple: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_simple'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'm1.ts']
                    , outputFiles: ['m1.js', 'test.js']
                    , declareFiles: ['m1.d.ts', 'test.d.ts']
                    , verifyEmitFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_simple: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_simple'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'm1.ts']
                    , outputFiles: ['bin/test.js']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_simple: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_simple'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'm1.ts']
                    , outputFiles: ['outdir/simple/m1.js', 'outdir/simple/test.js']
                    , verifyEmitFiles: true
                    , declareFiles: ['outdir/simple/m1.d.ts', 'outdir/simple/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_simple: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_simple'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'm1.ts']
                    , outputFiles: ['m1.js', 'm1.js.map', 'test.js', 'test.js.map']
                    , declareFiles: ['m1.d.ts', 'test.d.ts']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_simple: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_simple'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'm1.ts']
                    , outputFiles: ['bin/test.js', 'bin/test.js.map']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_simple: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_simple'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'm1.ts']
                    , outputFiles: ['outdir/simple/m1.js', 'outdir/simple/m1.js.map', 'outdir/simple/test.js', 'outdir/simple/test.js.map']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , declareFiles: ['outdir/simple/m1.d.ts', 'outdir/simple/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_subfolder: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_subfolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts']
                    , outputFiles: ['ref/m1.js', 'test.js']
                    , declareFiles: ['ref/m1.d.ts', 'test.d.ts']
                    , verifyEmitFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_subfolder: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_subfolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts']
                    , outputFiles: ['bin/test.js']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_subfolder: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_subfolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts']
                    , outputFiles: ['outdir/simple/ref/m1.js', 'outdir/simple/test.js']
                    , verifyEmitFiles: true
                    , declareFiles: ['outdir/simple/ref/m1.d.ts', 'outdir/simple/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_subfolder: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_subfolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts']
                    , outputFiles: ['ref/m1.js', 'ref/m1.js.map', 'test.js', 'test.js.map']
                    , declareFiles: ['ref/m1.d.ts', 'test.d.ts']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_subfolder: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_subfolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts']
                    , outputFiles: ['bin/test.js', 'bin/test.js.map']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_subfolder: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_subfolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts']
                    , outputFiles: ['outdir/simple/ref/m1.js', 'outdir/simple/ref/m1.js.map', 'outdir/simple/test.js', 'outdir/simple/test.js.map']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , declareFiles: ['outdir/simple/ref/m1.d.ts', 'outdir/simple/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            // TODO: Add for multi folder that spans one level below where we are building
            //  Need to verify baselines as well

            tests.push({
                scenario: "outputdir_multifolder: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_multifolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts', '../outputdir_multifolder_ref/m2.ts']
                    , outputFiles: ['ref/m1.js', '../outputdir_multifolder_ref/m2.js', 'test.js']
                    , declareFiles: ['ref/m1.d.ts', '../outputdir_multifolder_ref/m2.d.ts', 'test.d.ts']
                    , verifyEmitFiles: true
                    , verifyFileNamesOnly: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_multifolder: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_multifolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts', '../outputdir_multifolder_ref/m2.ts']
                    , outputFiles: ['bin/test.js']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , verifyFileNamesOnly: true
                    , skipRun: true
            });

            tests.push({
                scenario: "outputdir_multifolder: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_multifolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts', '../outputdir_multifolder_ref/m2.ts']
                    , outputFiles: ['outdir/simple/outputdir_multifolder/ref/m1.js', 'outdir/simple/outputdir_multifolder_ref/m2.js', 'outdir/simple/outputdir_multifolder/test.js']
                    , verifyEmitFiles: true
                    , verifyFileNamesOnly: true
                    , declareFiles: ['outdir/simple/outputdir_multifolder/ref/m1.d.ts', 'outdir/simple/outputdir_multifolder_ref/m2.d.ts', 'outdir/simple/outputdir_multifolder/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_multifolder: no outdir"
                    , projectRoot: 'tests/cases/projects/outputdir_multifolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts', '../outputdir_multifolder_ref/m2.ts']
                    , outputFiles: ['ref/m1.js', 'ref/m1.js.map', '../outputdir_multifolder_ref/m2.js', '../outputdir_multifolder_ref/m2.js.map', 'test.js', 'test.js.map']
                    , declareFiles: ['ref/m1.d.ts', '../outputdir_multifolder_ref/m2.d.ts', 'test.d.ts']
                    , verifyEmitFiles: true
                    , generateMapFiles: true
                    , verifyFileNamesOnly: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_multifolder: specify outputFile"
                    , projectRoot: 'tests/cases/projects/outputdir_multifolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts', '../outputdir_multifolder_ref/m2.ts']
                    , outputFiles: ['bin/test.js', 'bin/test.js.map']
                    , declareFiles: ['bin/test.d.ts']
                    , outputOption: 'bin/test.js'
                    , verifyEmitFiles: true
                    , verifyFileNamesOnly: true
                    , generateMapFiles: true
                    , skipRun: true
            });

            tests.push({
                scenario: "[Sourcemap]: outputdir_multifolder: specify outputDirectory"
                    , projectRoot: 'tests/cases/projects/outputdir_multifolder'
                    , inputFiles: ['test.ts']
                    , collectedFiles: ['test.ts', 'ref/m1.ts', '../outputdir_multifolder_ref/m2.ts']
                    , outputFiles: ['outdir/simple/outputdir_multifolder/ref/m1.js', 'outdir/simple/outputdir_multifolder/ref/m1.js.map', 'outdir/simple/outputdir_multifolder_ref/m2.js', 'outdir/simple/outputdir_multifolder_ref/m2.js.map', 'outdir/simple/outputdir_multifolder/test.js', 'outdir/simple/outputdir_multifolder/test.js.map']
                    , verifyEmitFiles: true
                    , verifyFileNamesOnly: true
                    , generateMapFiles: true
                    , declareFiles: ['outdir/simple/outputdir_multifolder/ref/m1.d.ts', 'outdir/simple/outputdir_multifolder_ref/m2.d.ts', 'outdir/simple/outputdir_multifolder/test.d.ts']
                    , outputOption: 'outdir/simple'
                    , skipRun: true
            });

            var amdDriverTemplate = "var requirejs = require('../r.js');\n\n" +
        "requirejs.config({\n" +
        "    nodeRequire: require\n" +
        "});\n\n" +
        "requirejs(['{0}'],\n" +
        "function ({0}) {\n" +
        "});";

            for (var i = 0; i < tests.length; i++) {
                createTest(tests[i]);
            }

            Exec.exec("node.exe", ['-v'], function (res) {
                if (res.stderr.length > 0) {
                    testExec = false;
                }

                done();
            });
        });
    }
}