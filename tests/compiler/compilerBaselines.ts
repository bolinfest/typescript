/// <reference path='..\..\src\harness\harness.ts' />
/// <reference path='..\..\src\compiler\diagnostics.ts' />

function checkTestCodeOutput(filename: string) {
    describe('JS output and errors for ' + filename, function () {

        var jsOutputAsync = '';
        var jsOutputSync = '';
        var errorDescriptionAsync = '';
        var errorDescriptionLocal = '';
        
        TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
        Harness.Compiler.compileCollateral('compiler\\testCode\\' + filename, function (result) {
            for (var i = 0; i < result.errors.length; i++) {
                errorDescriptionLocal += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
            }
            jsOutputSync = result.code;
        });

        TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
        Harness.Compiler.compileCollateral('compiler\\testCode\\' + filename, function (result) {
            for (var i = 0; i < result.errors.length; i++) {
                errorDescriptionAsync += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
            }
            jsOutputAsync = result.code;
        });

        Harness.Baseline.runBaseline('Correct errors for ' + filename + ' (local)', filename.replace(/\.ts/, '.errors.txt'), () => {
            if (errorDescriptionLocal === '') {
                return null;
            } else {
                return errorDescriptionLocal;
            }
        });

        Harness.Baseline.runBaseline('Correct JS output (commonjs) for ' + filename, filename.replace(/\.ts/, '.commonjs.js'), () => {
            return jsOutputSync;
        });

        Harness.Baseline.runBaseline('Correct JS output (AMD) for ' + filename, filename.replace(/\.ts/, '.amd.js'), () => {
            return jsOutputAsync;
        });

        Harness.Baseline.runBaseline('Correct runtime output for ' + filename, filename.replace(/\.ts/, '.output.txt'), () => {
            var runResult = null;
            Harness.Runner.runJSString(jsOutputSync, (error, result) => {
                if (error === null) {
                    runResult = result;
                }
            });

            if (typeof runResult === 'string') {
                // Some interesting runtime result to report
                return runResult;
            } else {
                return null;
            }
        });
    });

}

IO.dir(Harness.userSpecifiedroot + 'tests\\compiler\\testCode', /\.ts$/).forEach(fn => {
    checkTestCodeOutput(fn.substr(fn.lastIndexOf('\\') + 1));
});
