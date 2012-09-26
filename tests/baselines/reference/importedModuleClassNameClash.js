var foo = this.m1;
; ;
(function (m1) {
})(this.m1 || (this.m1 = {}));

var foo = (function () {
    function foo() { }
    return foo;
})();