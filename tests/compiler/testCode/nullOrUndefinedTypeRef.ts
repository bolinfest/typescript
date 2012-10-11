var n: null; // error
var u: undefined; // error

function t1(n:null) {} // error
function t2(u:undefined) {} // error
function t3():null {} // error
function t4():undefined {} // error

interface I1 {
	n:null; // error
}

interface I2 {
	u:undefined; // error
}

class C1 {
	public n1: null; // error
	public u1: undefined; // error
}