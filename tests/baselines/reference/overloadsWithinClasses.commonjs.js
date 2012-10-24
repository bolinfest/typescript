var foo = (function () {
    function foo() { }
    foo.fnOverload = function fnOverload() {
    }
    foo.fnOverload = function fnOverload(foo) {
    }
    return foo;
})();
var bar = (function () {
    function bar() { }
    bar.fnOverload = function fnOverload(foo) {
    }
    return bar;
})();
var X = (function () {
    function X() { }
    X.prototype.attr = function (first, second) {
    };
    return X;
})();