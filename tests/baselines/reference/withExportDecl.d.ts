var simpleVar;
export var exportedSimpleVar;
var anotherVar: any;
var varWithSimpleType: number;
var varWithArrayType: number[];
var varWithInitialValue: number;
export var exportedVarWithInitialValue: number;
var withComplicatedValue: { x: number; y: number; desc: string; };
export var exportedWithComplicatedValue: { x: number; y: number; desc: string; };
var declaredVar;
var declareVar2;
var declaredVar;
var deckareVarWithType: number;
var arrayVar: string[];
export var exportedArrayVar: { x: number; y: string; }[];
function simpleFunction(): { x: string; y: string; n: number; };
export function exportedFunction(): { x: string; y: string; n: number; };
module m1 {
    export function foo(): string;
}
export module m2 {
    export var a: number;
}
export module m3 {
    export function foo(): string;
}

