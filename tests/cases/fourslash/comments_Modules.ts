/// <reference path='fourslash.ts' />

/////// Module comment
////module m/*1*/1 {
////    /// b's comment
////    export var b: number;
////    /// foo's comment
////    function foo() {
////        return /*2*/b;
////    }
////    /// m2 comments
////    export module m2 {
////        /// class comment;
////        export class c {
////        };
////        /// i
////        export var i = new c();
////    }
////    /// exported function
////    export function fooExport() {
////        return foo(/*3*/);
////    }
////}
/////*4*/m1./*5*/fooExport(/*6*/);
////var my/*7*/var = new m1.m2./*8*/c();

goTo.marker('1');
verify.quickInfoIs("m1\nModule comment");

goTo.marker('2');
verify.completionListContains("b", "number", "b's comment");
verify.completionListContains("foo", "() => number", "foo's comment");

goTo.marker('3');
verify.currentSignatureHelpDocCommentIs("foo's comment");

goTo.marker('4');
verify.completionListContains("m1", "m1", "Module comment");

goTo.marker('5');
verify.memberListContains("b", "number", "b's comment");
verify.memberListContains("fooExport", "() => number", "exported function");
verify.memberListContains("m2", "m1.m2", "m2 comments");

goTo.marker('6');
verify.currentSignatureHelpDocCommentIs("exported function");

goTo.marker('7');
verify.quickInfoIs("m1.m2.c\nclass comment;");

goTo.marker('8');
verify.memberListContains("c", "new() => m1.m2.c", "class comment;");
verify.memberListContains("i", "m1.m2.c", "i");
