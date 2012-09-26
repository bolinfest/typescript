var Person = (function () {
    function Person(name, children) {
        this.name = name;
        this.addChild = function () {
            return _this.children.push("New child");
        };
        this.children = ko.observableArray(children);
    }
    return Person;
})();