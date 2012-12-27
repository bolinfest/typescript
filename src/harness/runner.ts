// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\compiler\optionsParser.ts' />
///<reference path='..\compiler\io.ts'/>
///<reference path='..\compiler\typescript.ts'/>
///<reference path='harness.ts'/>
///<reference path='dumpAST-baselining.ts'/>
///<reference path='exec.ts'/>
///<reference path='diff.ts'/>
///<reference path='..\..\tests\runners\runnerfactory.ts' />
///<reference path='..\..\tests\runners\flags\flagsrunner.ts' />
///<reference path='..\..\tests\runners\compiler\runner.ts' />
///<reference path='..\..\tests\runners\compiler\sourcemapRunner.ts' />
///<reference path='..\..\tests\runners\fourslash\fsrunner.ts' />
///<reference path='..\..\tests\runners\projects\runner.ts' />
///<reference path='..\..\tests\runners\unittest\unittestrunner.ts' />

declare var IO: IIO;
declare var Exec: IExec;
declare var process: any;
declare var _inheritsFrom; // reference base inheritsFrom in child contexts.

class ConsoleLogger extends Harness.Logger {
    private descriptionStack: string[] = [];
    private errorString: string = '';
    private passCounts = { Scenario: 0, Testcase: 0 };
    private failCounts = { Scenario: 0, Testcase: 0 };
    private blockedScenarioCount = 0;

    // Adds the specified indentation to each line in the string
    private fixIndent(str: string, indent: string) {
        var lines = str.split('\n');

        for (var i = 0; i < lines.length; i++) {
            lines[i] = indent + lines[i];
        }

        return lines.join('\n');
    }

    private addError(error: Error) {
        var tab = '  ';
        var indent = (new Array(this.descriptionStack.length + 1)).join(tab);

        for (var i = 0; i < this.descriptionStack.length; i++) {
            this.errorString += (new Array(i + 1)).join(tab) + this.descriptionStack[i] + '\n';
        }

        var stack = (<any>error).stack;
        if (stack) {
            this.errorString += this.fixIndent(stack, indent) + '\n';
        } else {
            this.errorString += indent + error.message + '\n';
        }
    }

    public start() {
        IO.printLine("Running tests.");
    }

    public end() {
        // Test execution is complete
        IO.printLine('');
        IO.printLine('');
        IO.printLine(this.errorString);
        IO.printLine('');

        IO.printLine('Scenarios: ' + (this.passCounts['Scenario'] || 0) + ' passed, ' + (this.failCounts['Scenario'] || 0) + ' failed.');
        IO.printLine('Testcases: ' + (this.passCounts['Testcase'] || 0) + ' passed, ' + (this.failCounts['Testcase'] || 0) + ' failed.');
        IO.printLine('  Blocked: ' + this.blockedScenarioCount);
        return;
    }

    public testStart(test: Harness.ITestMetadata) {
        this.descriptionStack.push(test.desc);
    }

    public pass(test: Harness.ITestMetadata) {
        if (test.perfResults) {
            IO.printLine(test.desc + ": " + test.perfResults.trials.length + " trials");
            IO.printLine('    mean: ' + test.perfResults.mean.toFixed(1) + "ms");
            IO.printLine('     min: ' + test.perfResults.min.toFixed(1) + "ms");
            IO.printLine('     max: ' + test.perfResults.max.toFixed(1) + "ms");
            IO.printLine('  stdDev: ' + test.perfResults.stdDev.toFixed(1) + "ms");
            IO.printLine('');
            this.descriptionStack.pop();
        } else {
            IO.print(".");
            this.passCounts.Testcase++;
            this.descriptionStack.pop();
        }
    }

    public bug(test: Harness.ITestMetadata) {
        IO.print('*');
    }

    public fail(test: Harness.ITestMetadata) {
        IO.print("F");
        this.failCounts.Testcase++;
        this.descriptionStack.pop();
    }

    public error(test: Harness.ITestMetadata, error: Error) {
        IO.print("F");
        this.failCounts.Testcase++;
        this.addError(error);
        this.descriptionStack.pop();
    }

    public scenarioStart(scenario: Harness.IScenarioMetadata) {
        this.descriptionStack.push(scenario.desc);
    }

    public scenarioEnd(scenario: Harness.IScenarioMetadata, error?: Error) {
        if (scenario.pass) {
            this.passCounts.Scenario++;
        } else {
            this.failCounts.Scenario++;
        }

        if (scenario.bugs && scenario.bugs.length > 0) {
            this.blockedScenarioCount++;
        }

        if (error) {
            this.addError(error);
        }
        this.descriptionStack.pop();
    }
}

class JSONLogger extends Harness.Logger {
    private root = [];
    private scenarioStack: Harness.IScenarioMetadata[] = [];

    constructor(public path: string) {
        super();
    }

    private addTestResult(test: Harness.ITestMetadata) {
        if (this.scenarioStack.length === 0) {
            this.root.push(test);
        } else {
            (<any>this.scenarioStack[this.scenarioStack.length - 1]).children.push(test);
        }
    }

    public pass(test: Harness.ITestMetadata) {
        this.addTestResult(test);
    }

    public fail(test: Harness.ITestMetadata) {
        this.addTestResult(test);
    }

    public error(test: Harness.ITestMetadata, error: Error) {
        (<any>test).errorString = error.message;
        this.addTestResult(test);
    }

    public scenarioStart(scenario: Harness.IScenarioMetadata) {
        (<any>scenario).children = [];

        if (this.scenarioStack.length === 0) {
            this.root.push(scenario);
        } else {
            (<any>this.scenarioStack[this.scenarioStack.length - 1]).children.push(scenario);
        }

        this.scenarioStack.push(scenario);
    }

    public scenarioEnd() {
        this.scenarioStack.pop();
    }

    public end() {
        IO.writeFile(this.path, JSON.stringify(this.root));
    }
}

function runTests(tests: RunnerBase[]) {

    for (var i = 0; i < tests.length; i++) {
        tests[i].runTests();
    }

    run();
}

var runners: RunnerBase[] = [];

var opts = new OptionsParser(IO);

opts.option('compiler', {
    set: function () {
        runners.push(new UnitTestRunner('compiler'));
        runners.push(new CompilerBaselineRunner());
        runners.push(new SourcemapRunner());
        runners.push(new ProjectRunner());
        runners.push(new FlagsRunner());
    }
});

opts.option('project', {
    set: function () {
        runners.push(new ProjectRunner());
    }
});

opts.option('flags', {
    set: function () {
        runners.push(new FlagsRunner());
    }
});

opts.option('fourslash', {
    set: function () {
        runners.push(new FourslashRunner());
    }
});

opts.option('ls', {
    set: function () {
        runners.push(new UnitTestRunner('ls'));
        runners.push(new FourslashRunner());
    }
});

opts.option('services', {
    set: function () {
        runners.push(new UnitTestRunner('services'));
    }
});

opts.option('harness', {
    set: function () => {
        runners.push(new UnitTestRunner('harness'));
    }
});

opts.option('dump', {
    set: function (file) => Harness.registerLogger(new JSONLogger(file))
});

opts.option('root', {
    usage: 'Sets the root for the tests")',
    experimental: true,
    set: function (str) {
        Harness.userSpecifiedroot = str;
    }
});
opts.parse(IO.arguments)

if (runners.length === 0) {
    if (opts.unnamed.length === 0) {
        // compiler
        runners.push(new UnitTestRunner('compiler'));
        runners.push(new CompilerBaselineRunner());
        runners.push(new SourcemapRunner());
        runners.push(new FlagsRunner());
        runners.push(new ProjectRunner());

        // language services
        runners.push(new UnitTestRunner('ls'));
        runners.push(new FourslashRunner());

        // services
        runners.push(new UnitTestRunner('services'));

        // samples
        runners.push(new UnitTestRunner('samples'));
    } else if (runners.length == 0) {
        var runnerFactory = new RunnerFactory();
        var tests = opts.unnamed[0].split(' ');
        for (var i = 0; i < tests.length; i++) {
            runnerFactory.addTest(tests[i]);
        }
        runners = runnerFactory.getRunners();
    }
}

var c = new ConsoleLogger();
Harness.registerLogger(c);
runTests(runners);

