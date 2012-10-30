foo((...Far:any[])=>{return 0;})
foo((1)=>{return 0;}); 
foo((x?)=>{return x;})
foo((x=0)=>{return x;})
var y = x:number => x*x;
//bug 17513: Fat arrow lambda expressions in ternary conditional fails to parse
false? (() => null): null;