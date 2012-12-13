class C {
    public get Foo() { return "foo";} // ok
    public set Foo(foo:string) {} // ok

    public Foo = 0; // error - duplicate identifier Foo - confirmed
    public get Goo(v:string):string {return null;} // error - setters must have a parameter
    public set Goo(v:string):string {} // error - setters may not specify a return type

    private get Baz():number { return 0; }
    public set Baz(n:number) {} // error - accessors do not agree in visibility

}


