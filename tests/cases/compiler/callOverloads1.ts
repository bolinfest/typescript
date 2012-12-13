class Foo {    
    bar1() { /*WScript.Echo("bar1");*/ }

    constructor(x: any) {
        // WScript.Echo("Constructor function has executed");
    }
}

function Foo(); // no error - Foo() becomes the call signature for class Foo
function F1(s:string);
function F1(a:any) { return a;}

var f1 = new Foo("hey");


f1.bar1();
Foo();