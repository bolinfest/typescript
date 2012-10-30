// Bug 17406: Binding for an import statement in a typeref position is being added to the global scope
// Shouldn't compile b.B is not defined in C
module A {
    import b = module(B);
    import c = module(C);
}

module B {
    import a = module(A);
    export class B { }
}

module C {
    import a = module(A);
    function hello(): b.B { return null; }
}