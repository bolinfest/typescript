[test_input.js]
var A = (function () {
    function A() {
    }
    A.prototype.B = function () {
        return 42;
    };
    return A;
})();

[test_input.d.ts]
class A {
    constructor ();
    public B(): number;
}

