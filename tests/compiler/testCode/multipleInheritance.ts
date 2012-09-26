class B1 {
    public x;
}

class B2 {
    public x;
}

class C extends B1, B2 { // duplicate member
}

class D1 extends B1 {
}

class D2 extends B2 {
}

class E extends D1, D2 { // nope, duplicate member
}

class N {
    public y:number;
}

class ND extends N {    // change to type not a subtype
    public y;
}

class Good {
    public f:() { return number; }
    public g() { return 0; }
}

class Baad extends Good {
    public f() { 0; }
    public g(n:number) { return 0; }
}
