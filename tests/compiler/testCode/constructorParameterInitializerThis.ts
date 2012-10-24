// bug 15937
// this should not compiler, this reference in in 
// constructor parameter initializer not allowed

class Foo {
    public y;
    constructor(x = this.y) { }
}
