///<reference path="runnerbase.ts" />
///<reference path="compiler/runner.ts" />
///<reference path="compiler/sourcemapRunner.ts" />
///<reference path="flags/flagsrunner.ts" />
///<reference path="fourslash/fsrunner.ts" />
///<reference path="projects/runner.ts" />
///<reference path="unittest/unittestrunner.ts" />

class RunnerFactory {
    private runners = {};

    public addTest(name: string) {
        if (/tests\\cases\\compiler/.test(name)) {            
            this.runners['compiler'] = this.runners['compiler'] || new CompilerBaselineRunner();
            this.runners['compiler'].addTest(Harness.userSpecifiedroot + name);
        }
        else if (/tests\\cases\\fourslash/.test(name)) {
            this.runners['fourslash'] = this.runners['fourslash'] || new FourslashRunner();
            this.runners['fourslash'].addTest(Harness.userSpecifiedroot + name);
        } else {
            this.runners['unitTestRunner'] = this.runners['unitTestRunner'] || new UnitTestRunner();
            this.runners['unitTestRunner'].addTest(Harness.userSpecifiedroot + name);
        }
    }

    public getRunners() {
        var runners = [];
        for (var p in this.runners) {
            runners.push(this.runners[p]);
        }
        return runners;
    }
}
