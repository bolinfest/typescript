///<reference path='..\..\..\src\harness\fourslash.ts' />
///<reference path='..\runnerbase.ts' />

class FourslashRunner extends RunnerBase
{
    public runTests()
    {
        this.enumerateFiles('tests/cases/fourslash').forEach((fn) => {

            var justName = fn.replace(/^.*[\\\/]/, '');

            if (!justName.match(/fourslash.ts$/i))
            {
                describe('FourSlash test ' + justName, function ()
                {
                    it('Runs correctly', function ()
                    {
                        FourSlash.runFourSlashTest(fn);
                    });
                });
            }
        });
    }
}

