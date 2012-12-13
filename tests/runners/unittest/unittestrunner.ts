///<reference path="../../../src/harness/harness.ts" />
///<reference path="../runnerbase.ts" />

class UnitTestRunner extends RunnerBase {
    constructor(private name?: string) {
        super();
    }

    // contains the tests to run
    private tests: string[] = [];

    public addTest(filename: string) {
        this.tests.push(filename);
    }

    public runTests() {

        switch (this.name) {
            case 'compiler':
                this.tests = this.enumerateFiles('tests/cases/unittests/compiler');
                break;
            case 'ls':
                this.tests = this.enumerateFiles('tests/cases/unittests/ls');
                break;
            case 'services':
                this.tests = this.enumerateFiles('tests/cases/unittests/services');
                break;
            case 'harness':
                this.tests = this.enumerateFiles('tests/cases/unittests/harness');
                break;
            case 'samples':
                this.tests = this.enumerateFiles('tests/cases/unittests/samples');
            default:
                if (this.tests.length === 0) {
                    throw new Error('Unsupported test cases: ' + this.name);
                }
                break;
        }

        var outfile = new Harness.Compiler.WriterAggregator()
      , outerr = new Harness.Compiler.WriterAggregator()
      , compiler = <TypeScript.TypeScriptCompiler>new TypeScript.TypeScriptCompiler(outerr)
      , code;

        compiler.parser.errorRecovery = true;
        compiler.addUnit(Harness.Compiler.libText, "lib.d.ts", true);

        for (var i = 0; i < this.tests.length; i++) {
            try {
                compiler.addUnit(IO.readFile(this.tests[i]), this.tests[i]);
            } catch (e) {
                IO.printLine('FATAL ERROR COMPILING TEST: ' + this.tests[i]);
                throw e;
            }
        }

        compiler.typeCheck();
        compiler.emitToOutfile(outfile);

        code = outfile.lines.join("\n") + ";";

        if (typeof require !== "undefined") {
            var vm = require('vm');
            vm.runInNewContext(code,
                {
                    require: require,
                    TypeScript: TypeScript,
                    process: process,
                    describe: describe,
                    it: it,
                    assert: assert,
                    Harness: Harness,
                    IO: IO,
                    Exec: Exec,
                    Services: Services,
                    DumpAST: DumpAST,
                    Formatting: Formatting,
                    Diff: Diff,
                    FourSlash: FourSlash
                },
                "generated_test_code.js"
            );
        } else {
            eval(code);
        }

        // clean up 
        Harness.Compiler.recreate();
    }
}