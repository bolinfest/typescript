class Base { 
    constructor (x: string) {}
}

class Foo extends Base {
    constructor (public x: string) {
        super(this.x);
    }
}
