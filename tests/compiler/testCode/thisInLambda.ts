class Foo {
 
    x = "hello";
 
    bar() {
 
        this.x; // 'this' is type 'Foo'
 
        var f = () => this.x; // 'this' should be type 'Foo' as well

    }
 
}
