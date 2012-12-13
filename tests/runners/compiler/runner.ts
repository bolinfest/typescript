/// <reference path='..\..\..\src\harness\harness.ts' />
/// <reference path='..\..\..\src\compiler\diagnostics.ts' />
/// <reference path='..\runnerbase.ts' />

class CompilerBaselineRunner extends RunnerBase
{
    public checkTestCodeOutput(filename: string)
    {
        // strips the filename from the path.
        var justName = filename.replace(/^.*[\\\/]/, '');

        describe('JS output and errors for ' + justName, function ()
        {
            var content = IO.readFile(filename);
            var bugs = content.match(/\bbug (\d+)/i);
            if (bugs)
            {
                bugs.forEach(bug => assert.bug(bug));
            }

            var jsOutputAsync = '';
            var jsOutputSync = '';
            var errorDescriptionAsync = '';
            var errorDescriptionLocal = '';

            //TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            Harness.Compiler.compileUnit(filename, function (result)
            {
                for (var i = 0; i < result.errors.length; i++)
                {
                    errorDescriptionLocal += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
                }
                jsOutputSync = result.code;
            }, function ()
            {
                TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            });


            Harness.Compiler.compileUnit(filename, function (result)
            {
                for (var i = 0; i < result.errors.length; i++)
                {
                    errorDescriptionAsync += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
                }
                jsOutputAsync = result.code;
            }, function ()
            {
                TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
            });

            Harness.Baseline.runBaseline('Correct errors for ' + justName + ' (local)', justName.replace(/\.ts/, '.errors.txt'), () => {
                if (errorDescriptionLocal === '')
                {
                    return null;
                } else {
                    return errorDescriptionLocal;
                }
            });

            Harness.Baseline.runBaseline('Correct JS output (commonjs) for ' + justName, justName.replace(/\.ts/, '.commonjs.js'), () => {
                return jsOutputSync;
            });

            Harness.Baseline.runBaseline('Correct JS output (AMD) for ' + justName, justName.replace(/\.ts/, '.amd.js'), () => {
                return jsOutputAsync;
            });

            Harness.Baseline.runBaseline('Correct runtime output for ' + justName, justName.replace(/\.ts/, '.output.txt'), () => {
                var runResult = null;
                Harness.Runner.runJSString(jsOutputSync, (error, result) => {
                    if (error === null)
                    {
                        runResult = result;
                    }
                });

                if (typeof runResult === 'string')
                {
                    // Some interesting runtime result to report
                    return runResult;
                } else
                {
                    return null;
                }
            });
        });

    }

    public runTests()
    {
        Harness.Compiler.recreate()

        this.enumerateFiles('tests/cases/compiler').forEach(fn => {
            fn = fn.replace(/\\/g, "/");
            this.checkTestCodeOutput(fn);
        });
    }
}