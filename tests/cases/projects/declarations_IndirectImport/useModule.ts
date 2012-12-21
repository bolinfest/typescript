// Do not emit unused import
import m5 = module("m5");
export var d = m5.foo2();
export var x = m5.foo2;

export function n() {
    return m5.foo2();
}