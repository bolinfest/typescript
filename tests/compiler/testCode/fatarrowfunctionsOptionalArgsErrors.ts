(arg1?, arg2) => 101;
(...arg?) => 102;
(...arg) => 103;
(...arg:number [] = []) => 104;
(...) => 105;

/// Bug 512325
var tt1 = (a, (b, c)) => a+b+c;
var tt2 = ((a), b, c) => a+b+c;
// Still not fixed
// var tt3 = ((a)) => a;
