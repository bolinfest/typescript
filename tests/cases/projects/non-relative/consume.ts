import mod = module("decl");
import x = module("lib/foo/a");
import y = module("lib/bar/a");

x.hello();
y.hello();

var str = mod.call();


declare function fail();
if(str !== "success") {
    fail();
}