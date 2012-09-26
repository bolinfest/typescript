
function foo(bar:{a:number;}[]):string;
function foo(bar:{a:bool;}[]):number;
function foo(bar:{a:any;}[]):any{ return bar };

var x1 = foo([{a:true}]); // works
var x11 = foo([{a:0}]); // works
var x111 = foo([{a:"s"}]); // error - does not match any signature
var x1111 = foo([{a:null}]); // error - ambiguous



function foo2(bar:{a:number;}):string;
function foo2(bar:{a:bool;}):number;
function foo2(bar:{a:any;}):any{ return bar };

var x2 = foo2({a:0}); // works
var x3 = foo2({a:true}); // works
var x4 = foo2({a:"s"}); // error


function foo4(bar:{a:number;}):number;
function foo4(bar:{a:string;}):string;
function foo4(bar:{a:any;}):any{ return bar };
var x = foo4({a:true}); // error