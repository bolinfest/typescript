(function (Baz) {
    Baz.x = "hello";
})(exports.Baz || (exports.Baz = {}));

Baz.x = "goodbye";
