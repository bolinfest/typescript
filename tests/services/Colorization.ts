///<reference path='_project.ts'/>

describe('Colorization', function() {
    var typescriptLS = new Harness.TypeScriptLS();
    var ls = typescriptLS.getLanguageService();
    
    var classifier = new Services.ClassifierShim(ls.host);
    
    /*  Classifications
        
        0 => "OPERATOR"
        1 => "KEYWORD"
        2 => "OPERATOR"
        3 => "COMMENT"
        4 => "WHITESPACE"
        5 => "IDENTIFIER"
        6 => "STRING"
    */
        
    // Returns classifiers in the following format
    // Location:Classification
    function getClassifiers(code:string) {
        var classResult = classifier.getClassificationsForLine(code, 0).split('\n');
        var tuples = [];
        var i = 0;
        
        
        for (; i < classResult.length - 1; i += 2) {
            tuples[i/2] = classResult[i] + ":" + classResult[i + 1];
        }
        
        return tuples;    
    }
    
    describe("test cases for colorization", function() {
        var results = getClassifiers('var x:string = "foo"; //Hello');
        
        it("checks for an operator", function() {
            assert.equal(results[3], "6:0");
        });
        
        it("checks for a keyword", function() {
            assert.equal(results[0], "3:1");
        });
        
        it("checks for a operator", function() {
            assert.equal(results[6], "14:2");
        });
        
        it("checks for a comment", function() {
            assert.equal(results[11], "29:3");
        });
        
        it("checks for a whitespace", function() {
            assert.equal(results[1], "4:4");
        });
        
        it("checks for a identifier", function() {
            assert.equal(results[2], "5:5");
        });
        
        it("checks for a string", function() {
            assert.equal(results[8], "20:6");
        });
    });
});