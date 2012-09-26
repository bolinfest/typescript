var Foo;
(function (Foo) {
    var a = 1;
    var b = 1;

    a = b + 2;
})(Foo || (Foo = {}));

var foo = 4;
var bar = 5;
