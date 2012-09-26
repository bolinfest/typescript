///<reference path='_project.ts'/>

describe('getBraceMatchingAtPosition', function() {
    var typescriptLS = new Harness.TypeScriptLS();

    typescriptLS.addDefaultLibrary();

    var fileName = 'services/testCode/getBraceMatchingAtPosition.ts';

    typescriptLS.addFile(fileName);

    var ls = typescriptLS.getLanguageService();

    //
    // line and column are 1-based
    //
    function lineColToPosition(fileName: string, line: number, col: number): number {
        var script = ls.languageService.getScriptAST(fileName);
        assert.notNull(script);

        var lineMap = script.locationInfo.lineMap;

        assert(line >= 1);
        assert(col >= 1);
        assert(line < lineMap.length);
        var offset = lineMap[line] + (col - 1);

        assert(offset < script.limChar);
        return offset;
    }

    //
    // line and column are 1-based
    //
    function getBraceMatching(fileName, line, column): Services.TextRange[]{
        var position = lineColToPosition(fileName, line, column);
        return ls.languageService.getBraceMatchingAtPosition(fileName, position);
    }

    describe("test cases for brace matching", function() {

        it("matches open curly brace", function() {
            var result = getBraceMatching(fileName, 1, 12);

            assert.notNull(result);
            assert.equal(2, result.length);
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 1, 12); });
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 12, 1); });
        });

        it("matches close curly brace", function() {
            var result = getBraceMatching(fileName, 12, 2);

            assert.notNull(result);
            assert.equal(2, result.length);
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 1, 12); });
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 12, 1); });
        });

        it("matches both open and close curly brace", function() {
            var result = getBraceMatching(fileName, 9, 25);

            assert.notNull(result);
            assert.equal(4, result.length);
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 9, 22); });
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 9, 24); });
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 9, 25); });
            assert.arrayContainsOnce(result, function(item) { return item.minChar === lineColToPosition(fileName, 9, 27); });
        });

        it("does not match curly brace in comments", function() {
            var result = getBraceMatching(fileName, 15, 4);

            assert.notNull(result);
            assert.equal(0, result.length);
        });

        it("does not match parenthesis in comments", function() {
            var result = getBraceMatching(fileName, 16, 4);

            assert.notNull(result);
            assert.equal(0, result.length);
        });

        it("does not match square brace in comments", function() {
            var result = getBraceMatching(fileName, 17, 4);

            assert.notNull(result);
            assert.equal(0, result.length);
        });
    });
});
