/// <reference path="..\..\..\..\src\harness\harness.ts" />
describe('Literal values are widened', function() {
    var typeFactory = new Harness.Compiler.TypeFactory();

    var isOfType = function(expr: string, expectedType: string) {
        var actualType = typeFactory.get('var x = ' + expr, 'x');
        
        it('Literal "' + expr + '" is of type "' + expectedType + '"', function() {
            assert.equal(actualType.type, expectedType);
        });
    }

    isOfType('null', 'any');
    isOfType('undefined', 'any');

    isOfType('{x: null}', '{ x: any; }');
    isOfType('[{x: null}]', '{ x: any; }[]');
    isOfType('[{x: null, y: void 2}]', '{ x: any; y: any; }[]');
    isOfType('{x: null}', '{ x: any; }');
    isOfType('[{x: null}]', '{ x: any; }[]');
    isOfType('[{x: null, y: void 2}]', '{ x: any; y: any; }[]');

    isOfType('[null, null]', 'any[]');
    isOfType('[void 3, void 2]', 'any[]');
    isOfType('[undefined, undefined]', 'any[]');
    isOfType('[{x: undefined}]', '{ x: any; }[]');
    isOfType('[{x: undefined, y: void 2}]', '{ x: any; y: any; }[]');
});
