/// <reference path='..\..\..\src\harness\harness.ts' />
/// <reference path='..\..\..\src\compiler\diagnostics.ts' />
/// <reference path='..\runnerbase.ts' />

class CompilerBaselineRunner extends RunnerBase
{
    public checkTestCodeOutput(filename: string)
    {
        var basePath = 'tests/cases/compiler/';
        // strips the filename from the path.
        var justName = filename.replace(/^.*[\\\/]/, '');
        var content = IO.readFile(filename);
        var units = Harness.Compiler.makeUnitsFromTest(content, justName);    
        units.forEach(unit => {
            if (!Harness.Compiler.isDeclareFile(unit.name)) {
                describe('JS output and errors for ' + unit.name, function () {                    
                    var bugs = content.match(/\bbug (\d+)/i);
                    if (bugs) {
                        bugs.forEach(bug => assert.bug(bug));
                    }

                    var jsOutputAsync = '';
                    var jsOutputSync = '';
                    var errorDescriptionAsync = '';
                    var errorDescriptionLocal = '';

                    var isMultiFileTest = units.length > 1;
                    var tempFilePath = basePath + unit.name;
                    if (isMultiFileTest) {                    
                        IO.writeFile(tempFilePath, unit.content);
                    }

                    var unitIdx = units.indexOf(unit);
                    var dependencies = units.slice(0, unitIdx);
                    var compilationContext = Harness.Compiler.defineCompilationContextForTest(unit.name, dependencies, basePath); 

                    //TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                    var unitPath = basePath + unit.name;
                    Harness.Compiler.compileUnit(unitPath, function (result) {
                        for (var i = 0; i < result.errors.length; i++) {
                            errorDescriptionLocal += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
                        }
                        jsOutputSync = result.code;
                    }, function () {
                        TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                    }, compilationContext, unit.references);

                    Harness.Compiler.compileUnit(unitPath, function (result) {
                        for (var i = 0; i < result.errors.length; i++) {
                            errorDescriptionAsync += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
                        }
                        jsOutputAsync = result.code;
                    }, function () {
                        TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                    }, compilationContext, unit.references);

                    Harness.Baseline.runBaseline('Correct errors for ' + unit.name + ' (local)', unit.name.replace(/\.ts/, '.errors.txt'), () => {
                        if (errorDescriptionLocal === '') {
                            return null;
                        } else {
                            return errorDescriptionLocal;
                        }
                    });

                    Harness.Baseline.runBaseline('Correct JS output (commonjs) for ' + unit.name, unit.name.replace(/\.ts/, '.commonjs.js'), () => {
                        return jsOutputSync;
                    });

                    Harness.Baseline.runBaseline('Correct JS output (AMD) for ' + unit.name, unit.name.replace(/\.ts/, '.amd.js'), () => {
                        return jsOutputAsync;
                    });

                    Harness.Baseline.runBaseline('Correct runtime output for ' + unit.name, unit.name.replace(/\.ts/, '.output.txt'), () => {
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

                    if (isMultiFileTest) {
                        IO.deleteFile(tempFilePath);
                    }
                });
            }
        });

    }

    public runTests()
    {
        Harness.Compiler.recreate()

        if (this.tests.length === 0) {
            this.enumerateFiles('tests/cases/compiler').forEach(fn => {
                fn = fn.replace(/\\/g, "/");
                this.checkTestCodeOutput(fn);
            });
        }
        else {
            this.tests.forEach(test => this.checkTestCodeOutput(test));
        }
    }
}