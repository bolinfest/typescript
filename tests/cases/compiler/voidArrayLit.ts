var va = [(() => {})()]; // error
(() => {})(); // ok
function foo(s:string) {}
foo((()=>{})()); // error
