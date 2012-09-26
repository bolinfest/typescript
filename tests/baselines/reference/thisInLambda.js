var Foo = (function () {
    function Foo() {
        this.x = "hello";
    }
    Foo.prototype.bar = function () {
        var _this = this;
        this.x;
        var f = function () {
            return _this.x;
        };
    };
    return Foo;
})();