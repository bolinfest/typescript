/// <reference path='fourslash.ts' />

/////// ExtMod - contains m1
////declare module /*1*/"extMod" {
////    /// ModuleComment
////    module m/*2*/1 {
////        /// b's comment
////        export var b: number;
////        /// m2 comments
////        export module m2 {
////            /// class comment;
////            export class c {
////            };
////            /// i
////            export var i: c;;
////        }
////        /// exported function
////        export function fooExport(): number;
////    }
////}
/////// Import declaration
////import e/*3*/xtMod = module("e/*4*/xtMod");
/////*5*/extMod./*6*/m1./*7*/fooExport(/*8*/);
////var new/*9*/Var = new extMod.m1.m2./*10*/c();

goTo.marker('1');
verify.quickInfoIs("extMod\nExtMod - contains m1");

goTo.marker('2');
verify.quickInfoIs("m1\nModuleComment");

goTo.marker('3');
verify.quickInfoIs("extMod\nExtMod - contains m1");

goTo.marker('4');
verify.quickInfoIs("extMod\nExtMod - contains m1");

goTo.marker('5');
verify.completionListContains("extMod", "extMod", "Import declaration");

goTo.marker('6');
verify.memberListContains("m1", "extMod.m1", "ModuleComment");

goTo.marker('7');
verify.memberListContains("b", "number", "b's comment");
verify.memberListContains("fooExport", "() => number", "exported function");
verify.memberListContains("m2", "extMod.m1.m2", "m2 comments");

goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("exported function");

goTo.marker('9');
verify.quickInfoIs("extMod.m1.m2.c\nclass comment;");

goTo.marker('10');
verify.memberListContains("c", "new() => extMod.m1.m2.c", "class comment;");
verify.memberListContains("i", "extMod.m1.m2.c", "i");