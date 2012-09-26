var simpleVar;
this.exportedSimpleVar;
var anotherVar;
var varWithSimpleType;
var varWithArrayType;
var varWithInitialValue = 30;
this.exportedVarWithInitialValue = 70;
var withComplicatedValue = {
    x: 30,
    y: 70,
    desc: "position"
};
this.exportedWithComplicatedValue = {
    x: 30,
    y: 70,
    desc: "position"
};
var arrayVar = [
    'a', 
    'b'
];
this.exportedArrayVar;
this.exportedArrayVar.push({
    x: 30,
    y: 'hello world'
});