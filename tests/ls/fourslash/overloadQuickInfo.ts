/// <reference path='fourslash.ts' />

////function Foo(a: string, b: number, c: bool);
////function Foo(a: any, name: string, age: number);
////function Foo(fred: any[], name: string, age: number);
////function Foo(fred: any[  ] , name: string[], age: number);
////function Foo(fred: any[], name: string[], age: number[]);
////function Foo(fred:         any, name: string[], age: number[]); // Extraneous spaces should get removed
////function Foo(fred: any, name: bool, age: number[]);
////function Foo(dave: bool, name: string);
////function Foo(fred: any, mandy: {(): number}, age: number[]);    // Embedded interface will get converted to shorthand notation, () => 
////function Foo(fred: any, name: string, age: { });
////function Foo(fred: any, name: string, age: number[]);
////function Foo(test: string, name, age: number);
////function Foo();
////function Foo(x?: any, y?: any, z?: any) {
////}
////Fo/**/o();

var expected = "{ (a: string, b: number, c: bool): any; \
(a: any, name: string, age: number): any; \
(fred: any[], name: string, age: number): any; \
(fred: any[], name: string[], age: number): any; \
(fred: any[], name: string[], age: number[]): any; \
(fred: any, name: string[], age: number[]): any; \
(fred: any, name: bool, age: number[]): any; \
(dave: bool, name: string): any; \
(fred: any, mandy: () => number, age: number[]): any; \
(fred: any, name: string, age: {}): any; \
(fred: any, name: string, age: number[]): any; \
(test: string, name: any, age: number): any; \
(): any; }"
goTo.marker();
verify.quickInfoIs(expected);


