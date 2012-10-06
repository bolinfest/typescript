/// <reference path='..\..\src\harness\harness.ts' />

function checkDeclOutput(filename: string) {
    var dFilename = filename.replace(/\.ts/, '.d.ts');
    dFilename = dFilename.substr(dFilename.lastIndexOf('\\') + 1);
    Harness.Baseline.runBaseline('.d.ts output for ' + filename, dFilename, () => {
        return Harness.Compiler.generateDeclFile(IO.readFile(Harness.userSpecifiedroot + filename), false);
    });
}

function checkNoDeclFile(filename: string) {
    Harness.Compiler.generateDeclFile(IO.readFile(Harness.userSpecifiedroot + filename), true);
}

checkNoDeclFile('tests\\compiler\\testCode\\giant.ts');
checkNoDeclFile('tests\\compiler\\testCode\\declInput.ts');
checkNoDeclFile('tests\\compiler\\testCode\\declInput-2.ts');
checkDeclOutput('tests\\compiler\\testCode\\vardecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\funcdecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\classdecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\interfacedecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\moduledecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\interfaceOnly.ts');
