var Foo = (function () {
    function Foo() {
        this.x = 1;
    }
    return Foo;
})();
var f = new Foo();
var Foo2 = (function () {
    function Foo2() {
        this.x = 1;
    }
    return Foo2;
})();
var f2 = new Foo2();