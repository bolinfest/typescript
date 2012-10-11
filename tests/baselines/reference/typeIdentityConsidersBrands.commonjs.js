var X = (function () {
    function X() { }
    return X;
})();
var Y = (function () {
    function Y() { }
    return Y;
})();
function foo(arg) {
    console.log("called");
}
var a = new Y();
var b = new X();
a = b;
foo(a);