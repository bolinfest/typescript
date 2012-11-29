///<reference path="../../src/harness/harness.ts" />

IO.dir(Harness.userSpecifiedroot + 'tests/flags/testcode', /\.ts$/).forEach(fn => {
    if (!fn.match(/flags.ts$/i))
    {
        describe('Compiler flags test ' + fn, () =>
        {
            Flags.runTest(fn);
        });
    }
});

class Flags
{
    private fsOutput = new Harness.Compiler.WriterAggregator();
    private fsErrors = new Harness.Compiler.WriterAggregator();
    // Regex for parsing options in the format "@Alpha: Value of any sort"
    // want to write a regexp like : /^[//]*\s*@(\w+): (.*)\s*/gm
    private optionRegex = new RegExp("^[//]*\\s*@(\\w+): (\\w+)\\s*", "gm");  // multiple matches on multiple lines

    private supportedFlags = [
    { flag: 'comments', setFlag: (x: TypeScript.CompilationSettings, value: string) =>{ x.emitComments = value.toLowerCase() === 'true' ? true : false; } },
    { flag: 'declaration', setFlag: (x: TypeScript.CompilationSettings, value: string) =>{ x.generateDeclarationFiles = value.toLowerCase() === 'true' ? true : false; } },
    {
        flag: 'module', setFlag: (x: TypeScript.CompilationSettings, value: any) =>{
            switch (value.toLowerCase())
            {
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
    { flag: 'nolib', setFlag: (x: TypeScript.CompilationSettings, value: string) =>{ x.useDefaultLib = value.toLowerCase() === 'true' ? true : false; } },
    { flag: 'sourcemap', setFlag: (x: TypeScript.CompilationSettings, value: string) =>{ x.mapSourceFiles = value.toLowerCase() === 'true' ? true : false; } },
    { flag: 'target', setFlag: (x: TypeScript.CompilationSettings, value: string) =>{ x.codeGenTarget = value.toLowerCase() === 'es3' ? TypeScript.CodeGenTarget.ES3 : TypeScript.CodeGenTarget.ES5; } }
    ];

    public static runTest(filename: string): void
    {
        var runner = new Flags();
        runner.runTest(filename);
    }

    private runTest(filename: string): void
    {
        it('Runs correctly', () =>
        {
            var content = IO.readFile(filename);
            var bugs = content.match(/bug (\d+)/i);
            if (bugs)
            {
                bugs.forEach(bug => assert.bug(bug));
            }

            var compilerFlags = this.parseFlags(content);
            var settings = new TypeScript.CompilationSettings();

            for (var prop in compilerFlags)
            {
                var idx = this.supportedFlags.filter((x) => x.flag === prop);
                if (idx && idx.length != 1)
                {
                    throw new Error('Unsupported flag \'' + prop + '\'');
                }

                idx[0].setFlag(settings, compilerFlags[prop]);
            }

            // due to the way we output and baseline we should only output 1 file
            settings.outputMany = false;

            var compiler = new TypeScript.TypeScriptCompiler(this.fsErrors, new TypeScript.NullLogger(), settings);
            compiler.addUnit(Harness.Compiler.libText, 'lib.d.ts', true);
            compiler.addUnit(content, 'test_input.ts');
            compiler.typeCheck();
            compiler.emit(() => this.fsOutput);

            if (settings.generateDeclarationFiles)
            {
                this.fsOutput.WriteLine("/* DECLARATION FILE */");
                compiler.emitDeclarationFile(() => this.fsOutput);
            }
        });

        var baseLineFileName = 'flags_' + filename.replace(/^.*[\\\/]/, '');

        Harness.Baseline.runBaseline('correct JS output for ' + filename, baseLineFileName.replace(/\.ts/, '.js'), () =>
        {
            return this.fsOutput.lines.join('\n');
        });

        this.fsErrors.Close();
        this.fsOutput.Close();
    }

    // returns the compiler flags settings defined in the testfile
    private parseFlags(content: string)
    {
        var opts = {};

        var match;
        while ((match = this.optionRegex.exec(content)) != null)
        {
            opts[match[1]] = match[2];
        }

        return opts;
    }
}
