/// <reference path='fourslash.ts' />

/////// This is my variable
////var myV/*1*/ariable = 10;
/////*2*/
/////// d variable
////var d = 10;
////myVariable = d;
/////*3*/
/////// foos comment
////function foo() {
////}
/////// fooVar comment
////var fooVar: () => void;
/////*4*/
////foo(/*5*/);
////fooVar(/*6*/);
////fooVar = foo;
/////*7*/
////foo(/*8*/);
////fooVar(/*9*/);
///////class comment
////class c {
////    /// constructor comment
////    constructor() {
////    }
////}
///////instance comment
////var i = new c();
/////*10*/
/////// interface comments
////interface i1 {
////}
///////interface instance comments
////var i1_i: i1;
/////*11*/

goTo.marker('1');
verify.quickInfoIs("number");

goTo.marker('2');
verify.completionListContains("myVariable", "number", "This is my variable");

goTo.marker('3');
verify.completionListContains("myVariable", "number", "This is my variable");
verify.completionListContains("d", "number", "d variable");

goTo.marker('4');
verify.completionListContains("foo", "() => void", "foos comment");
verify.completionListContains("fooVar", "() => void", "fooVar comment");

goTo.marker('5');
verify.currentSignatureHelpDocCommentIs("foos comment");

goTo.marker('6');
//verify.currentSignatureHelpDocCommentIs("fooVar comment");
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('7');
verify.completionListContains("foo", "() => void", "foos comment");
verify.completionListContains("fooVar", "() => void", "fooVar comment");

goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("foos comment");

goTo.marker('9');
//verify.currentSignatureHelpDocCommentIs("fooVar comment");
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('10');
verify.completionListContains("i", "c", "instance comment");

goTo.marker('11');
verify.completionListContains("i1_i", "i1", "interface instance comments");