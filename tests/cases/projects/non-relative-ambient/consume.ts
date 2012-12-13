import mod = module("decl");
var str = mod.call();

declare function fail();

if(str !== "success") {
    fail();
}