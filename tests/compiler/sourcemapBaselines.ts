/// <reference path="..\..\src\harness\harness.ts" />
/// <reference path="..\..\src\compiler\typescript.ts" />

describe('Output of sourcemap matches the baseline', function () {
    var baselinePath = Harness.userSpecifiedroot + 'tests/compiler/baselines/maps/';
    if(!IO.directoryExists(baselinePath)) IO.createDirectory(baselinePath);

    var cc = Harness.Compiler;
    var filenameRegex = <RegExp>/([^\/^\\]+)$/;

    var files: string[] = [];
    var testFile = fn => files.push(Harness.userSpecifiedroot + 'tests/compiler/testCode/' + fn);
    testFile('contextualTyping.ts');
    testFile('typeResolution.ts');
    testFile('es6ClassTest2.ts');
    testFile('recursiveClassReferenceTest.ts');
    testFile('sourceMapSample.ts');

    files.forEach(filename => {
        var filenameOnly = filenameRegex.exec(filename)[0];

        it('Matches the map of ' + filenameOnly, () => {
            cc.recreate();
            cc.compiler.addUnit(IO.readFile(filename), filename);
            cc.compiler.settings.mapSourceFiles = true;
            var oldOutputMany = cc.compiler.settings.outputMany;
            cc.compiler.settings.outputMany = true;
            cc.compiler.emit(IO.createFile);
            cc.compiler.settings.mapSourceFiles = false;
            cc.compiler.settings.outputMany = oldOutputMany;
            cc.recreate(); // In case we are the last test, we need the compiler to be in a clean state for other tests

            // The compiler has now produced a .js file (which we want to delete)
            IO.deleteFile(filename.replace('.ts', '.js'));
            // ... and a map, which we want to verify against the baseline
            var mapFile = filename.replace('.ts', '.js.map');

            if (IO.fileExists(mapFile)) {
                var mapContents = IO.readFile(mapFile);

                // Clean this up
                IO.deleteFile(mapFile);

                var baselineFile = baselinePath + filenameOnly + '.map';
                if (IO.fileExists(baselineFile)) {
                    var baselineContents = IO.readFile(baselineFile);

                    if (baselineContents === mapContents) {
                        // Pass
                    } else {
                        // Overwrite and issue error
                        IO.writeFile(baselineFile, mapContents);
                        throw new Error('Source map file ' + baselineFile + ' differed from baseline; it has been replaced. Please verify the changes.');
                    }
                } else {
                    // Baseline does not exist; create it
                    IO.writeFile(baselineFile, mapContents);

                    throw new Error('Baseline source map file ' + baselineFile + ' did not exist; it has been added. No verification occurred.');
                }
            } else {
                throw new Error('Compiling ' + filename + ' did not produce a map file at ' + mapFile);
            }
        });
    });
});