

var foo1: { new ():any; }   
var bar1: { x : number; }

var foo2: { [index]; }
var bar2: { x : number; }

var foo3: { ():void; }
var bar3: { x : number; }



foo1 = bar1; // should be an error
foo2 = bar2; // should be an error
foo3 = bar3; // should be an error