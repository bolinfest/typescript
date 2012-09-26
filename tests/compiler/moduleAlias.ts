///<reference path='..\..\compiler\typescript.ts' />
///<reference path='..\..\harness\harness.ts' />

describe('Compiling tests\\compiler\\moduleAlias.ts', function() {
    describe('Internal module alias test', function() {
        it("basic test", function() {
            var code = "module A.B.C { import XYZ = X.Y.Z; export function ping(x: number) { if (x > 0) XYZ.pong(x-1);}};";
            code += "module X.Y.Z { import ABC = A.B.C; export function pong(x: number) { if (x > 0) ABC.ping(x-1);}};";
            Harness.Compiler.compileString(code, 'module alias', function(result) {
                assert.equal(result.errors.length, 0);
            });
        });
    });
});
