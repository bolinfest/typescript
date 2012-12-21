/// <reference path="..\..\..\src\harness\harness.ts" />
/// <reference path="..\..\..\src\compiler\typescript.ts" />
///<reference path="../runnerbase.ts" />

// TODO: revisit this so we can combine this with an existing general purpose runner

class SourcemapRunner extends RunnerBase {
    public runTests() {
        describe('Output of sourcemap matches the baseline', function () {
            var errOut = new Harness.Compiler.WriterAggregator();
            var cc = new TypeScript.TypeScriptCompiler(errOut);
            cc.parser.errorRecovery = true;
            cc.settings.codeGenTarget = TypeScript.CodeGenTarget.ES5;
            cc.settings.controlFlow = true;
            cc.settings.controlFlowUseDef = true;
            TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            cc.addUnit(Harness.Compiler.libText, 'lib.d.ts', true);
            cc.typeCheck();

            // strips the directories from a path, leaving just the filename
            var filenameRegex = /([^\/^\\]+)$/;

            var files: string[] = [];
            var testFile = (fn: string) => files.push(Harness.userSpecifiedroot + 'tests/cases/compiler/' + fn);
            testFile('contextualTyping.ts');
            testFile('typeResolution.ts');
            testFile('es6ClassTest2.ts');
            testFile('recursiveClassReferenceTest.ts');
            testFile('sourceMapSample.ts');

            var emitterIOHost = {
                createFile: (fileName: string, useUTF8?: bool) => createFileAndFolderStructure(IO, fileName, useUTF8),
                directoryExists: IO.directoryExists,
                fileExists: IO.fileExists,
                resolvePath: IO.resolvePath
            };

            files.forEach(filename => {
                var filenameOnly = filenameRegex.exec(filename)[0];

                it('Matches the map of ' + filenameOnly, () => {
                    cc.addUnit(IO.readFile(filename), filename);
                    cc.settings.mapSourceFiles = true;
                    cc.settings.outputOption = "";
                    cc.emit(emitterIOHost);
                    cc.settings.mapSourceFiles = false;
                });

                // since we re-use the ts files we don't need to validate the js files again
                // leaving this in for further refactoring

                //Harness.Baseline.runBaseline('Correct js output for ' + filenameOnly, filenameOnly.replace(/\.ts/, '.js'), () => {
                //    return IO.readFile(filename.replace(/\.ts/, '.js'));
                //});

                Harness.Baseline.runBaseline('Correct map output for ' + filenameOnly, filenameOnly.replace(/\.ts/, '.ts.map'), () => {
                    return IO.readFile(filename.replace(/\.ts/, '.js.map'));
                });

                // clean up
                IO.deleteFile(filename.replace('.ts', '.js'));
                IO.deleteFile(filename.replace('.ts', '.js.map'));
            });
        });
    }
}