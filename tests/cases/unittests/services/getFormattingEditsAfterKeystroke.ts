///<reference path='_project.ts'/>

describe('getFormattingEditsAfterKeystroke', function() {
    //
    // Verify that formatting the typescript file "sourceFileName" results in the
    // baseline file "baselineFileName".
    //
    function getFormattingEditsAfterKeystroke(sourceFileName:string, line:number, column:number, key:string): void {
        var baselineFileName = "tests/cases/unittests/services/testCode/formatAfterKeystroke/" + sourceFileName + "BaseLine.ts";
        sourceFileName = "tests/cases/unittests/services/testCode/formatAfterKeystroke/" + sourceFileName + ".ts";

        var typescriptLS = new Harness.TypeScriptLS();
        typescriptLS.addDefaultLibrary();
        typescriptLS.addFile(sourceFileName);
        
        var ls = typescriptLS.getLanguageService();
        var script = ls.languageService.getScriptAST(sourceFileName);
        assert.notNull(script);

        var position = typescriptLS.lineColToPosition(sourceFileName, line, column);
        var edits = ls.languageService.getFormattingEditsAfterKeystroke(sourceFileName, position, key, new Services.FormatCodeOptions());
        typescriptLS.checkEdits(sourceFileName, baselineFileName, edits);
    }

    describe('test cases for formatting after ";"', function() { 
        it("formats array literals", function() {
            getFormattingEditsAfterKeystroke('arrayLiteral', 1, 6, ";");
        });

        it("Preserve single line unterminated object type on single line", function() {
            getFormattingEditsAfterKeystroke('preserveSingleLine', 1, 29, ";");
        });
    });
});
