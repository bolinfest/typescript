var C = (function () {
    function C() { }
    C.s = undefined;
    C.prototype.a = function () {
        s = 1;
    };
    return C;
})();
var Foo = (function () {
    function Foo() { }
    Foo.bar = undefined;
    return Foo;
})();