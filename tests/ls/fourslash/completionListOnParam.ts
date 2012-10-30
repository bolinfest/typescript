/// <reference path='fourslash.ts' />

////module Bar {
////    export class Blah { }
////}
////
////class Point {
////    public Foo(x: Bar./**/Blah, y: Bar.Blah) { }
////}

goTo.marker();
// Bug 17382: Completion list wont work on a certain position
verify.not.memberListContains('Blah');
//verify.memberListContains('Blah');