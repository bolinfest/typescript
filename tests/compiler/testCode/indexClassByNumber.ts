// test for 17506

class foo { }

var f = new foo();

f[0] = 4; // Shouldn't be allowed