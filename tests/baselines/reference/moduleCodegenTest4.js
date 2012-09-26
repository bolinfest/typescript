(function (Baz) {
    Baz.x = "hello";
})(this.Baz || (this.Baz = {}));

this.Baz.x = "goodbye";