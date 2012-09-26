///<reference path='_project.ts'/>

describe('incrementalParser tests', function() {
    var fileName = 'services/testCode/incrementalParser.ts';

    function applyEditInRange(fileName, startLine, startCol, endLine, endCol, newText) {
        var typescriptLS = new Harness.TypeScriptLS();
        typescriptLS.addDefaultLibrary();
        typescriptLS.addFile(fileName);

        var ls = typescriptLS.getLanguageService();

        var script = ls.languageService.getScriptAST(fileName);
        assert.notNull(script);

        var offset1 = typescriptLS.lineColToPosition(fileName, startLine, startCol);
        var offset2 = typescriptLS.lineColToPosition(fileName, endLine, endCol);
        var textEdit = new Services.TextEdit(offset1, offset2, newText);
        var newContent = typescriptLS.applyEdits(typescriptLS.getScriptContent(1), [textEdit]);
        var newSourceText = new TypeScript.StringSourceText(newContent);

        var logger = new TypeScript.BufferedLogger();
        var parser = new TypeScript.IncrementalParser(logger);

        var delta = newText.length - (offset2 - offset1);
        var result = parser.attemptIncrementalUpdateUnit(script, fileName, newSourceText, new TypeScript.ScriptEditRange(offset1, offset2, delta));
        if (result === null) {
            var sep = "\r\n   | ";
            throw new Error("Incremental parser should not have bailed out:" + sep + logger.logContents.join(sep));
        }
        assert.notNull(result);
        parser.mergeTrees(result);

        var finalScript = result.script1;
        var nonIncrementalScript = typescriptLS.parseSourceText(fileName, newSourceText);

        var logger1 = new TypeScript.BufferedLogger();
        var astLogger1 = new TypeScript.AstLogger(logger1);
        astLogger1.logScript(finalScript);

        var logger2 = new TypeScript.BufferedLogger();
        var astLogger2 = new TypeScript.AstLogger(logger2);
        astLogger2.logScript(nonIncrementalScript);

        var log1 = logger1.logContents.join("\r\n");
        var log2 = logger2.logContents.join("\r\n");

        assert.noDiff(log1, log2);
    }

    describe('Incremental edits to unit', function() {
        it("Simple delete inside a function should be incremental", function() {
            applyEditInRange(fileName, 10, 5, 10, 39, "");
        });
        it("Simple insert inside a function should be incremental", function() {
            applyEditInRange(fileName, 10, 5, 10, 6, "test-test-test");
        });
    });
});