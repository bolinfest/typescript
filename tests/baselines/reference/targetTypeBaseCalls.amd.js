var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function foo(x) {
}
var Foo = (function () {
    function Foo(x) {
    }
    return Foo;
})();
foo(function (s) {
    s = 5;
});
new Foo(function (s) {
    s = 5;
});
var Bar = (function (_super) {
    __extends(Bar, _super);
    function Bar() {
        _super.call(this, function (s) {
    s = 5;
});
    }
    return Bar;
})(Foo);