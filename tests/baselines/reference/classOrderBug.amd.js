var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var bar = (function () {
    function bar() {
        this.baz = new foo();
    }
    return bar;
})();
var baz = (function () {
    function baz() { }
    return baz;
})();
var foo = (function (_super) {
    __extends(foo, _super);
    function foo() {
        _super.apply(this, arguments);

    }
    return foo;
})(baz);