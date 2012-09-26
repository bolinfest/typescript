declare module Foo {
	function a():void;
	var b:number;
	class C {}
}

Foo.a();
Foo.b;
var c = new Foo.C();
