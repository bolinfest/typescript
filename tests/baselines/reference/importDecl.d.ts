export module "m4" {
    class d {
    }
    var x: d;
    function foo(): d;
}
export import m4 = module ("m4");
export var x4: m4.d;
export var d4: new() => m4.d;
export var f4: m4.d;
export module m1 {
    module "m2" {
        class d {
        }
        var x: d;
        function foo(): d;
    }
    import m2 = module ("m2");
    import m3 = module ("m4");
    var x2: m2.d;
    var d2: new() => m2.d;
    var f2: m2.d;
    var x3: m3.d;
    var d3: new() => m3.d;
    var f3: m3.d;
}
export var x2: m1.m2.d;
export var d2: new() => m1.m2.d;
export var f2: m1.m2.d;
export var x3: m4.d;
export var d3: new() => m4.d;
export var f3: m4.d;
export module m5 {
    var x2: m1.m2.d;
    var d2: new() => m1.m2.d;
    var f2: m1.m2.d;
    var x3: m4.d;
    var d3: new() => m4.d;
    var f3: m4.d;
}

