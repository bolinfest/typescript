var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var B = (function () {
    function B(y) {
        this.y = y;
    }
    return B;
})();
var C = (function (_super) {
    __extends(C, _super);
    function C(y, z, w) {
        _super.call(this, y);
        var x = 10 + w;
        var ll = x * w;
    }
    C.prototype.liftxyz = function () {
        return x + z + this.y;
    };
    C.prototype.liftxylocllz = function () {
        return x + z + this.y + this.ll;
    };
    return C;
})(B);