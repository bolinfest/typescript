var simpleVar;
exports.exportedSimpleVar;
var anotherVar;
var varWithSimpleType;
var varWithArrayType;
var varWithInitialValue = 30;
exports.exportedVarWithInitialValue = 70;
var withComplicatedValue = {
    x: 30,
    y: 70,
    desc: "position"
};
exports.exportedWithComplicatedValue = {
    x: 30,
    y: 70,
    desc: "position"
};
var arrayVar = [
    'a', 
    'b'
];
exports.exportedArrayVar;
exports.exportedArrayVar.push({
    x: 30,
    y: 'hello world'
});
