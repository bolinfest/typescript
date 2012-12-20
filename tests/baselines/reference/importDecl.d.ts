export module "m4" {
    class d {
    }
    var x: d;
    function foo(): d;
}
import m4 = module ("m4");
export var x4: m4.d;
export var d4: new() => m4.d;
export var f4: m4.d;
export module m1 {
    var x2: m4.d;
    var d2: new() => m4.d;
    var f2: m4.d;
}
export module "glo_m4" {
    class d {
    }
    var x: d;
    function foo(): d;
}
import glo_m4 = module ("glo_m4");
export var useGlo_m4_x4: glo_m4.d;
export var useGlo_m4_d4: new() => glo_m4.d;
export var useGlo_m4_f4: glo_m4.d;
export module "fncOnly_m4" {
    class d {
    }
    var x: d;
    function foo(): d;
}
import fncOnly_m4 = module ("fncOnly_m4");
export var useFncOnly_m4_f4: fncOnly_m4.d;
export module "private_m4" {
    class d {
    }
    var x: d;
    function foo(): d;
}
export module usePrivate_m4_m1 {
}
export module "m5" {
    function foo2(): m4.d;
}
export var d: m4.d;
export var useMultiImport_m4_x4: m4.d;
export var useMultiImport_m4_d4: new() => m4.d;
export var useMultiImport_m4_f4: m4.d;

