/// <reference path='..\..\src\harness\harness.ts' />

function checkDeclOutput(filename: string) {
    var dFilename = filename.replace(/\.ts/, '.d.ts');
    dFilename = dFilename.substr(dFilename.lastIndexOf('\\') + 1);
    Harness.Baseline.runBaseline('.d.ts output for ' + filename, dFilename, () => {
        return Harness.Compiler.generateDeclFile(IO.readFile(Harness.userSpecifiedroot + filename));
    });
}

checkDeclOutput('tests\\compiler\\testCode\\giant.ts');
checkDeclOutput('tests\\compiler\\testCode\\declInput.ts');
checkDeclOutput('tests\\compiler\\testCode\\declInput-2.ts');
checkDeclOutput('tests\\compiler\\testCode\\vardecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\funcdecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\classdecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\interfacedecl.ts');
checkDeclOutput('tests\\compiler\\testCode\\moduledecl.ts');
