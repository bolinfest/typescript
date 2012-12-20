/// <reference path='..\..\..\..\src\harness\harness.ts' />

// Runs 2 baseline checks: verifies that the given file generates the expected .d.ts, and that the generated .d.ts compiles correctly itself
function checkDeclOutput(filename: string, unitName?: string, context?: Harness.Compiler.CompilationContext, references?: TypeScript.IFileReference[]) {
    filename = filename.replace(/\\/g, "/");
    var dFilename = filename.replace(/\.ts/, '.d.ts');
    dFilename = dFilename.substr(dFilename.lastIndexOf('/') + 1);
      
    var declFileCode: string;        
    Harness.Baseline.runBaseline('.d.ts output for ' + filename, dFilename, () => {
        var testCode = IO.readFile(Harness.userSpecifiedroot + filename);
        assert.bugs(testCode); // TODO: right now this doesn't do anything with runImmediate === true
        declFileCode = Harness.Compiler.generateDeclFile(testCode, false, unitName, context, references);
        return declFileCode;
    }, true); // runImmediate so that temp files/units can be immediately cleaned up and not leak into compilerBaselines

    var errorDescriptionLocal = '';
    Harness.Compiler.compileString(declFileCode, dFilename, function (result) {
        for (var i = 0; i < result.errors.length; i++) {
            errorDescriptionLocal += result.errors[i].file + ' line ' + result.errors[i].line + ' col ' + result.errors[i].column + ': ' + result.errors[i].message + '\r\n';
        }
    });

    Harness.Baseline.runBaseline('.d.ts for ' + filename + ' compiles without error', dFilename.replace(/\.ts/, '.errors.txt'), () => {
        return (errorDescriptionLocal === '') ? null : errorDescriptionLocal;
    });
}

function checkNoDeclFile(filename: string) {
    Harness.Compiler.generateDeclFile(IO.readFile(Harness.userSpecifiedroot + filename), true);
}

checkNoDeclFile('tests/cases/compiler/giant.ts');
checkNoDeclFile('tests/cases/compiler/declInput.ts');
checkNoDeclFile('tests/cases/compiler/declInput-2.ts');
checkDeclOutput('tests/cases/compiler/vardecl.ts');
checkDeclOutput('tests/cases/compiler/funcdecl.ts');
checkDeclOutput('tests/cases/compiler/classdecl.ts');
checkDeclOutput('tests/cases/compiler/interfacedecl.ts');
checkDeclOutput('tests/cases/compiler/moduledecl.ts');
checkDeclOutput('tests/cases/compiler/interfaceOnly.ts');
checkDeclOutput('tests/cases/compiler/withExportDecl.ts');
checkDeclOutput('tests/cases/compiler/withImportDecl.ts');
checkDeclOutput('tests/cases/compiler/importDecl.ts');

// Add multi-file tests to this list as necessary
var multiFileTests = [];
multiFileTests.forEach(file => {
    var basePath = 'tests/cases/compiler/';
    var content = IO.readFile(basePath + file);
    var units = Harness.Compiler.makeUnitsFromTest(content, file);
    units.forEach(unit => {
        if (!Harness.Compiler.isDeclareFile(unit.name)) {           
            var unitIdx = units.indexOf(unit);
            var dependencies = units.slice(0, unitIdx);
            // generateDeclFile will use this to ensure prerequisities are added to the compiler and cleaned up after typecheck/emit
            // and will itself ensure that the current unit is also cleaned up.
            var compilationContext = Harness.Compiler.defineCompilationContextForTest(unit.name, dependencies, basePath); // TODO: runtime type tests need a different base path

            var isMultiFileTest = units.length > 1;
            var tempFilePath = basePath + unit.name;
            if (isMultiFileTest) {
                IO.writeFile(tempFilePath, unit.content);
            }

            var baselinePath = 'tests/baselines/reference/';
            var declFileName = unit.name.replace(/\\/g, "/").replace(/\.ts/, '.d.ts');
            var unitPath = basePath + unit.name;
            var uName = dependencies.length === 0 ? undefined : unit.name; // just use 0.ts if this is the only file
            // Assume that if a baseline .d.ts exists for this unit then it should generate a valid decl file
            if (IO.fileExists(baselinePath + declFileName)) {
                checkDeclOutput(unitPath, uName, compilationContext, unit.references);
            } else {
                checkNoDeclFile(unitPath);
            }

            if (compilationContext && compilationContext.postCompile) {
                compilationContext.postCompile();
            }

            if (isMultiFileTest) {
                IO.deleteFile(tempFilePath);
            }
        }
    });
});
