///<reference path='..\..\src\compiler\typescript.ts' />
///<reference path='..\..\src\harness\harness.ts' />

describe('Property Access', function() {
    var typeFactory = new Harness.Compiler.TypeFactory();

    it("Type of expression is any", function() {
        var code = "var foo: any; foo.bar = 4;";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.equal(result.errors.length, 0);
        });
    });

    it("Type of expression is object", function() {
        var code = "var foo: { a: number; }; foo.a = 4; foo.b = 5;";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.compilerWarning(result, 1, 40, "The property 'b' does not exist on value of type '{ a: number; }'");
            assert.equal(result.errors.length, 1);
        });
    });

    it("Type of expression is string", function() {
        var code = "var foo: string; foo.toUpperCase();";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.equal(result.errors.length, 0);
        });
    });

    it("Type of expression is number", function() {
        var code = "var foo: number; foo.toBAZ();";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.equal(result.errors.length, 1);
        });
    });

    it("Type of expression is bool", function() {
        var code = "var foo: bool; foo.toBAZ();";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.equal(result.errors.length, 1);
        });
    });

    it("Type of expression is null", function() {
        var code = "null.toBAZ();";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.equal(result.errors.length, 1);
        });
    });

    it("Type of expression is undefined", function() {
        var code = "undefined.toBAZ();";
        Harness.Compiler.compileString(code, 'propertyAccess', function(result) {
            assert.equal(result.errors.length, 1);
        });
    });
});

