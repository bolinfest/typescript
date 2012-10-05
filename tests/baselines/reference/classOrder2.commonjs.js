var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var A = (function (_super) {
    __extends(A, _super);
    function A() {
        _super.apply(this, arguments);

    }
    A.prototype.foo = function () {
        this.bar();
    };
    return A;
})(B);
var B = (function () {
    function B() { }
    B.prototype.bar = function () {
    };
    return B;
})();
var a = new A();
a.foo();