var C = (function () {
    function C() { }
    C.prototype.foo = function () {
    }
    (function (foo) {
        foo.z = 1;
    })(C.prototype.foo);
;
    return C;
})();