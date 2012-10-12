var n1: () => bool = function () { }; // expect an error here
var n2: () => bool = function ():bool { }; // expect an error here
