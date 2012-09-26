function simpleFunc() {
    return "this is my simple func";
}
var simpleFuncVar = simpleFunc;
function anotherFuncNoReturn() {
}
var anotherFuncNoReturnVar = anotherFuncNoReturn;
function withReturn() {
    return "Hello";
}
var withReturnVar = withReturn;
function withParams(a) {
    return a;
}
var withparamsVar = withParams;
function withMultiParams(a, b, c) {
    return a;
}
var withMultiParamsVar = withMultiParams;
function withOptionalParams(a) {
}
var withOptionalParamsVar = withOptionalParams;
function withInitializedParams(a, b0, b, c) {
    if (typeof b === "undefined") { b = 30; }
    if (typeof c === "undefined") { c = "string value"; }
}
var withInitializedParamsVar = withInitializedParams;
function withOptionalInitializedParams(a, c) {
    if (typeof c === "undefined") { c = "hello string"; }
}
var withOptionalInitializedParamsVar = withOptionalInitializedParams;
function withRestParams(a) {
    var myRestParameter = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        myRestParameter[_i] = arguments[_i + 1];
    }
    return myRestParameter;
}
var withRestParamsVar = withRestParams;
function overload1(ns) {
    return ns.toString();
}
var withOverloadSignature = overload1;