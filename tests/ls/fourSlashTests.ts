///<reference path='..\..\src\harness\fourslash.ts' />

IO.dir(Harness.userSpecifiedroot + 'tests\\ls\\fourslash', /\.ts$/).forEach(fn => {
    if (!fn.match(/fourslash.ts$/i)) {
        describe('FourSlash test ' + fn, function () {
            FourSlash.runFourSlashTest(fn);
        });
    }
});
