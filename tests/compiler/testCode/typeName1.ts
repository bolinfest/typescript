interface I {
    k;
}
class C {
    public eek:string;
    static zeek:number;
}

var x1:{ f(s:string):number;f(n:number):string; }=3;
var x2:{ f(s:string):number; } =3;
var x3:{ (s:string):number;(n:number):string; }=3;
var x4:{ x;y;z:number;f(n:number):string;f(s:string):number; }=3;
var x5:{ (s:string):number;(n:number):string;x;y;z:number;f(n:number):string;f(s:string):number; }=3;
var x6:{ z:number;f:{(n:number):string;(s:string):number;}; }=3;
var x7:(s:string)=>bool=3;
var x8:{ z:I;[s:string]:{ x; y; };[n:number]:{x; y;};():bool; }=3;
var x9:I=3;
var x10:I[][][][]=3;
var x11:{z:I;x:bool;}[][]=3;
var x12:{z:I;x:bool;y:(s:string)=>bool;w:{ z:I;[s:string]:{ x; y; };[n:number]:{x; y;};():bool; };}[][]=3;
var x13:{ new(): number; new(n:number):number; x: string; w: {y: number;}; (): {}; } = 3;
var x14:{ f(x:number):bool; p; q; ():string; }=3;
var x15:number=C;



