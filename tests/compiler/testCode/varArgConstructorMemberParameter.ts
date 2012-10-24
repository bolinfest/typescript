class Foo1 {
    // Works
    constructor (...args: string[]) { }
}

class Foo2 {
    // Works
    constructor (public args: string[]) { }
}

class Foo3 {
    // Doesn't work, but should (bug 17115)
    constructor (public ...args: string[]) { }
}
