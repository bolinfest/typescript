// Bug 16074: Can't implement an 'any' return type with 'void' function

interface I {
    foo(value: number);
}

class Bug implements I {
    public foo(value: number) {
    }
}
