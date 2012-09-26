(function (Foo) {
    var C = (function () {
        function C() { }
        return C;
    })();
    Foo.C = C;    
})(this.Foo || (this.Foo = {}));

(function (Foo) {
    function Bar() {
        if(true) {
            return Bar();
        }
        return new Foo.C();
    }
    function Baz() {
        var c = Baz();
        return Bar();
    }
    function Gar() {
        var c = Baz();
        return;
    }
})(this.Foo || (this.Foo = {}));
