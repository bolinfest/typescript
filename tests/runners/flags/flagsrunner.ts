///<reference path="../../../src/harness/harness.ts" />
///<reference path="../runnerbase.ts" />

class FlagsRunner extends RunnerBase {
    private fsErrors = new Harness.Compiler.WriterAggregator();
    private fsOutput = new emitterIOHost();
    // Regex for parsing options in the format "@Alpha: Value of any sort"
    private optionRegex = /^[\/]{2}\s*@(\w+):\s*(\S*)/gm;  // multiple matches on multiple lines

    private supportedFlags = [
    { flag: 'comments', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.emitComments = value.toLowerCase() === 'true' ? true : false; } },
    { flag: 'declaration', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.generateDeclarationFiles = value.toLowerCase() === 'true' ? true : false; } },
    {
        flag: 'module', setFlag: (x: TypeScript.CompilationSettings, value: any) => {
            switch (value.toLowerCase()) {
                // this needs to be set on the global variable
                case 'amd':
                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                    x.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                    break;
                case 'commonjs':
                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                    x.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                    break;
                default:
                    TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Local;
                    x.moduleGenTarget = TypeScript.ModuleGenTarget.Local;
                    break;
            }
        }
    },
    { flag: 'nolib', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.useDefaultLib = value.toLowerCase() === 'true' ? true : false; } },
    { flag: 'sourcemap', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.mapSourceFiles = value.toLowerCase() === 'true' ? true : false; } },
    { flag: 'target', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.codeGenTarget = value.toLowerCase() === 'es3' ? TypeScript.CodeGenTarget.ES3 : TypeScript.CodeGenTarget.ES5; } },
    { flag: 'out', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.outputOption = value; } },
    ];

    public runTests(): void {
        var moduleGen = TypeScript.moduleGenTarget;
        var codeGen = TypeScript.codeGenTarget;

        try {
            this.enumerateFiles('tests/cases/flags').forEach(fn => {
                describe('Compiler flags test ' + fn, () => this.compileFile(fn));
            });
        } finally {
            TypeScript.moduleGenTarget = moduleGen;
            TypeScript.codeGenTarget = codeGen;
            Harness.Compiler.recreate();
        }
    }

    private compileFile(filename: string): void {
        it('compiles correctly', () =>
        {
            this.fsErrors.reset();
            this.fsOutput.reset();

            var content = IO.readFile(filename);
            var bugs = content.match(/\bbug (\d+)/i);
            if (bugs) {
                bugs.forEach(bug => assert.bug(bug));
            }

            var compilerFlags = this.parseFlags(content);
            var settings = new TypeScript.CompilationSettings();

            for (var prop in compilerFlags) {
                var idx = this.supportedFlags.filter((x) => x.flag === prop);
                if (idx && idx.length != 1) {
                    throw new Error('Unsupported flag \'' + prop + '\'');
                }

                idx[0].setFlag(settings, compilerFlags[prop]);
            }

            var compiler = new TypeScript.TypeScriptCompiler(this.fsErrors, new TypeScript.NullLogger(), settings);
            compiler.addUnit(Harness.Compiler.libText, 'lib.d.ts', true);
            compiler.addUnit(content, 'test_input.ts');
            compiler.typeCheck();
            compiler.emit(this.fsOutput);

            if (settings.generateDeclarationFiles) {
                compiler.emitDeclarations();
            }
        });

        var baseLineFileName = 'flags_' + filename.replace(/^.*[\\\/]/, '');

        Harness.Baseline.runBaseline('generated correct JS output for ' + filename, baseLineFileName.replace(/\.ts/, '.js'), () =>
        {
            return this.fsOutput.output();
        });
    }

    // returns the compiler flags settings defined in the testfile
    private parseFlags(content: string) {
        var opts = {};

        var match;
        while ((match = this.optionRegex.exec(content)) != null) {
            opts[match[1]] = match[2];
        }

        return opts;
    }
}

// due to the way we output and baseline we should only output 1 file
class emitterIOHost implements TypeScript.EmitterIOHost {

    /* Dictionary<string, ITextWriter> */
    private fileCollection = {};

    // create file gets the whole path to create, so this works as expected with the --out parameter
    public createFile(s: string, useUTF8?: bool): ITextWriter {

        if (this.fileCollection[s]) {
            return <ITextWriter>this.fileCollection[s];
        }

        var writer = new Harness.Compiler.WriterAggregator();
        writer.WriteLine('[' + s + ']');
        this.fileCollection[s] = writer;
        return writer;
    }
    public directoryExists(s: string) { return false; }
    public fileExists(s: string) { return typeof this.fileCollection[s] !== 'undefined'; }
    public resolvePath(s: string) { return s; }

    public reset() { this.fileCollection = {}; }
    public output() {

        var result = "";

        for (var p in this.fileCollection) {
            if (this.fileCollection.hasOwnProperty(p)) {
                result += this.fileCollection[p].lines.join('\n');
                result += '\n'; // improved readability of the output
            }
        }

        return result;
    }
}
