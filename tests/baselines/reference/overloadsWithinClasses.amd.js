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