/// <reference path='..\..\..\..\src\harness\harness.ts' />

function checkDeclOutput(filename: string) {
    filename = filename.replace(/\\/g, "/");
    var dFilename = filename.replace(/\.ts/, '.d.ts');
    dFilename = dFilename.substr(dFilename.lastIndexOf('/') + 1);
    Harness.Baseline.runBaseline('.d.ts output for ' + filename, dFilename, () => {
        return Harness.Compiler.generateDeclFile(IO.readFile(Harness.userSpecifiedroot + filename), false);
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
