/// <reference path='fourslash.ts' />

////module Bar {
////    export class Blah { }
////}
////
////class Point {
////    public Foo(x: Bar./**/Blah, y: Bar.Blah) { }
////}

goTo.marker();
//Bug 17382
verify.not.memberListContains('Blah');
//verify.memberListContains('Blah');