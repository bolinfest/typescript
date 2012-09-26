var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var bar = (function () {
    function bar() {
        this.baz = new tester();
    }
    return bar;
})();
var baz = (function () {
    function baz() { }
    return baz;
})();
var tester = (function (_super) {
    __extends(tester, _super);
    function tester() {
        _super.apply(this, arguments);

    }
    return tester;
})(baz);
