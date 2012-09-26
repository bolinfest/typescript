///<reference path='..\..\compiler\typescript.ts' />
///<reference path='..\..\harness\harness.ts' />

describe('Compiling tests\\compiler\\scopeTests.ts', function() {
    it("Scope check inside a public method inside public method", function() {
        var code  = 'class C {';
            code += '   static s;'
            code += '   public a() {'
            code += '      s = 1;' // ERR
            code += '   }'
            code += '}';
        Harness.Compiler.compileString(code, 'declarations', function(result) {
            assert.equal(result.errors.length, 1);
        });
    });
    
    it("Scope check inside a static method inside static method", function() {
        var code  = 'class C {';
            code += '   private v;'
            code += '   public p;'
            code += '   static s;'
            code += '   static b() {'
            code += '      v = 1;' // ERR
            code += '      s = 1;' // OK
            code += '      this.p = 1;'// ERR
            code += '   }'
            code += '}';
        Harness.Compiler.compileString(code, 'declarations', function(result) {
            assert.arrayLengthIs(result.errors, 1);
            assert.compilerWarning(result, 1, 67, "The name 'v' does not exist in the current scope");
        });
    });

    it("Scope check extended class", function() {
        var code  = 'class C { private v; public p; static s; }';
        code += 'class D extends C {';
        code += '  public v: number;';
        code += '  public p: number;'
        code += '  constructor() {';
        code += '   super();'
        code += '   this.v = 1;';
        code += '   this.p = 1;';
        code += '   C.s = 1;';
        code += '  }';
        code += '}';
        Harness.Compiler.compileString(code, 'declarations', function(result) {
            assert.arrayLengthIs(result.errors, 0);
        });
    });

    it("Scope check extended class inside public method", function() {
        var code  = 'class C { private v; public p; static s; }';
            code += 'class D extends C {'
            code += '   public c() {'
            code += '      v = 1;'
            code += '      this.p = 1;'
            code += '      s = 1;'
            code += '   }'
            code += '}';
        Harness.Compiler.compileString(code, 'declarations', function(result) {
            assert.arrayLengthIs(result.errors, 2);
            assert.compilerWarning(result, 1, 82, "The name 'v' does not exist in the current scope");
            assert.compilerWarning(result, 1, 111, "The name 's' does not exist in the current scope");
        });
    });

    it("Scope check extended class inside public method", function() {
        var code  = 'class C { private v; public p; static s; }';
            code += 'class D extends C {'
            code += '   public c() {'
            code += '      v = 1;'
            code += '      this.p = 1;'
            code += '      s = 1;'
            code += '   }'
            code += '}';
        Harness.Compiler.compileString(code, 'declarations', function(result) {
            assert.arrayLengthIs(result.errors, 2);
            assert.compilerWarning(result, 1, 82, "The name 'v' does not exist in the current scope");
            assert.compilerWarning(result, 1, 111, "The name 's' does not exist in the current scope");
        });
    });
    
    it("Scope check extended class inside static method", function() {
        var code  = 'class C { private v; public p; static s; }';
            code += 'class D extends C {'
            code += '   static c() {'
            code += '      v = 1;'
            code += '      this.p = 1;'
            code += '      s = 1;'
            code += '   }'
            code += '}';
        Harness.Compiler.compileString(code, 'declarations', function(result) {
            assert.arrayLengthIs(result.errors, 2);
            assert.compilerWarning(result, 1, 82, "The name 'v' does not exist in the current scope");
            assert.compilerWarning(result, 1, 111, "The name 's' does not exist in the current scope");
        });
    });
});