///<reference path='..\..\..\..\src\compiler\typescript.ts' />
///<reference path='..\..\..\..\src\harness\harness.ts' />


describe('Compiling unittests\\compiler\\class.ts', function() {
    var typeFactory = new Harness.Compiler.TypeFactory();
    
    describe('Class Declarations', function() {
        it("Extending class and referencing itself indirectly", function() {
            var code = "class c1 extends c2{ }; ";
            code    += "class c2 extends c1{ }; ";

            Harness.Compiler.compileString(code, 'circularExtending', function(result) {          
                assert.arrayLengthIs(result.errors, 2);
            });
        });
    })
});

describe('Testing function signatures inside classes', function () {
    it('Regression test - was previously giving runtime error', function () {
        var code = "class A { a(completed: () => any): void; }";
        Harness.Compiler.compileString(code, 'fnsig-inside-classes', function (result) {
            assert.compilerWarning(result, 1, 10, 'Overload declaration lacks definition');
            assert.equal(result.errors.length, 1);
        });
    });
});

describe("Uses of 'this' are illegal within the outer class body", function () {
    it('Regression test - check fat arrow this', function () {
        var code = "class foo { bar: any[]; baz = () => this.bar.push('test'); }";
        Harness.Compiler.compileString(code, 'fat arrow this', function (result) {
            assert.compilerWarning(result, 1, 36, "Keyword 'this' cannot be referenced in initializers in a class body, or in super constructor calls");
            assert.equal(result.errors.length, 1);
        });
    });
});



describe('Having a class and an interface with the same name throws extra error', function () {
    it('Regression test - was previously giving extra error', function () {
        var code = "interface foo{ } class foo{ }";
        Harness.Compiler.compileString(code, 'interface-class-samename', function (result) {
            assert.compilerWarning(result, 1, 17, "Duplicate identifier 'foo'");
            assert.equal(result.errors.length, 1);
        });
    });
});

describe('Statics inside class constructors should be an error', function () {
    it('Regression test - was previously not an error', function () {
        var code = "class foo { constructor() { static f = 3; } }";
        Harness.Compiler.compileString(code, 'statics-inside-class-constr', function (result) {
            assert.compilerWarning(result, 1, 28, 'Statics may only be class members');
            assert.equal(result.errors.length, 1);
        });
    });
});

