/// <reference path="fourslash.ts" />

var testList: string[] = [];

if (IO.arguments.length === 0) {
    IO.dir(Harness.userSpecifiedroot + 'tests/ls/fourslash', /\.ts$/).forEach(fn => {
        if (!fn.match(/fourslash.ts$/i)) {
            testList.push(fn);
        }
    });
} else {
    IO.arguments.forEach(tests => tests.split(',').forEach(test => {
        testList.push(test);
    }));
}

var passCount = 0, failCount = 0;
testList.forEach(test => {
    try {
        IO.print('Running ' + test.substr(IO.dirName(test).length + 1) + '... ');
        FourSlash.runFourSlashTest(test);
        IO.printLine('passed.');
        passCount++;
    } catch (e) {
        IO.printLine(e);
        if (e.stack) {
            IO.printLine(e.stack);
        }
        failCount++;
    }
});

IO.printLine(passCount + ' passed, ' + failCount + ' failed.');