///<reference path='..\..\..\src\harness\fourslash.ts' />
///<reference path='..\runnerbase.ts' />

class FourslashRunner extends RunnerBase
{
    public runTests()
    {
        var runSingleFourslashTest = (fn: string) => {
            var justName = fn.replace(/^.*[\\\/]/, '');

            if (!justName.match(/fourslash.ts$/i)) {
                describe('FourSlash test ' + justName, function () {
                    it('Runs correctly', function () {
                        FourSlash.runFourSlashTest(fn);
                    });
                });
            }
        }

        //runSingleFourslashTest(Harness.userSpecifiedroot + 'tests/cases/fourslash/comments_Interface.ts');
        this.enumerateFiles('tests/cases/fourslash').forEach(runSingleFourslashTest);
    }
}

