var simpleVar;

var anotherVar: any;
var varWithSimpleType: number;
var varWithArrayType: number[];

var varWithInitialValue = 30;

var withComplicatedValue = { x: 30, y: 70, desc: "position" };

declare var declaredVar;
declare var declareVar2

declare var declaredVar;
declare var deckareVarWithType: number;

var arrayVar: string[] = ['a', 'b'];

var complicatedArrayVar: { x: number; y: string; }[] ;
complicatedArrayVar.push({ x: 30, y : 'hello world' });

var n1: { [s: string]: number; };

var c : {
        new? (): any;
    }

var d: {
    foo? (): {
        x: number;
    };
}

var d3: {
    foo(): {
        x: number;
        y: number;
    };
}

var d2: {
    foo (): {
        x: number;
    };
}

var n2: {
    (): void;
}
var n4: {
    (): void;
}[];

var d4: {
    foo(n: string, x: { x: number; y: number; }): {
        x: number;
        y: number;
    };
}

