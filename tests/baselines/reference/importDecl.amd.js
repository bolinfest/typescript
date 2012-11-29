define(["require", "exports", "m4", "m2", "m4"], function(require, exports, __m4__, __m2__, __m3__) {
        var m4 = __m4__;

    exports.x4 = m4.x;
    exports.d4 = m4.d;
    exports.f4 = m4.foo();
    (function (m1) {
                var m2 = __m2__;

        var m3 = __m3__;

        m1.x2 = m2.x;
        m1.d2 = m2.d;
        m1.f2 = m2.foo();
        m1.x3 = m3.x;
        m1.d3 = m3.d;
        m1.f3 = m3.foo();
    })(exports.m1 || (exports.m1 = {}));
    var m1 = exports.m1;
    exports.x2 = m1.m2.x;
    exports.d2 = m1.m2.d;
    exports.f2 = m1.m2.foo();
    exports.x3 = m1.m3.x;
    exports.d3 = m1.m3.d;
    exports.f3 = m1.m3.foo();
    (function (m5) {
        m5.x2 = m1.m2.x;
        m5.d2 = m1.m2.d;
        m5.f2 = m1.m2.foo();
        m5.x3 = m1.m3.x;
        m5.d3 = m1.m3.d;
        m5.f3 = m1.m3.foo();
    })(exports.m5 || (exports.m5 = {}));
    var m5 = exports.m5;
})