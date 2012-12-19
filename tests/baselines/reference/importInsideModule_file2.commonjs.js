(function (myModule) {
    var foo = require("./importInsideModule_file1")
    var a = foo.x;
})(exports.myModule || (exports.myModule = {}));
var myModule = exports.myModule;