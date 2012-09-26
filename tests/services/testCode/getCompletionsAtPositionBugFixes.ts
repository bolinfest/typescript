module BugFixes {
    enum Foo {
        bar,
        baz
    }

    var f: Foo = Foo./*here*/;

    import foo f = Foo;
    foo./*here*/;
}