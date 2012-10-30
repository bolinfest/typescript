var X = (function () {
    function X() { }
    return X;
})();
var Y = (function () {
    function Y() { }
    return Y;
})();
function foo(arg) {
}
var a = new Y();
var b = new X();
a = b;
foo(a);