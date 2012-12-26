/// <reference path='fourslash.ts' />

/////// This is simple /// comments
////function simple() {
////}
////
////simple( /*1*/);
////
/////// multiLine /// Comments
/////// This is example of multiline /// comments
/////// Another multiLine
////function multiLine() {
////}
////multiLine( /*2*/);
////
/////** this is eg of single line jsdoc style comment */
////function jsDocSingleLine() {
////}
////jsDocSingleLine(/*3*/);
////
////
/////** this is multiple line jsdoc stule comment
////*New line1
////*New Line2*/
////function jsDocMultiLine() {
////}
////jsDocMultiLine(/*4*/);
////
/////** this is multiple line jsdoc stule comment
////*New line1
////*New Line2*/
/////** Shoul mege this line as well
////* and this too*/ /** Another this one too*/
////function jsDocMultiLineMerge() {
////}
////jsDocMultiLineMerge(/*5*/);
////
////
/////// Triple slash comment
/////** jsdoc comment */
////function jsDocMixedComments1() {
////}
////jsDocMixedComments1(/*6*/);
////
/////// Triple slash comment
/////** jsdoc comment */ /*** another jsDocComment*/
////function jsDocMixedComments2() {
////}
////jsDocMixedComments2(/*7*/);
////
/////** jsdoc comment */ /*** another jsDocComment*/
/////// Triple slash comment
////function jsDocMixedComments3() {
////}
////jsDocMixedComments3(/*8*/);
////
/////** jsdoc comment */ /*** another jsDocComment*/
/////// Triple slash comment
/////// Triple slash comment 2
////function jsDocMixedComments4() {
////}
////jsDocMixedComments4(/*9*/);
////
/////// Triple slash comment 1
/////** jsdoc comment */ /*** another jsDocComment*/
/////// Triple slash comment
/////// Triple slash comment 2
////function jsDocMixedComments5() {
////}
////jsDocMixedComments5(/*10*/);
////
/////*** another jsDocComment*/
/////// Triple slash comment 1
/////// Triple slash comment
/////// Triple slash comment 2
/////** jsdoc comment */
////function jsDocMixedComments6() {
////}
////jsDocMixedComments6(/*11*/);
////
////// This shoulnot be help comment
////function noHelpComment1() {
////}
////noHelpComment1(/*12*/);
////
/////* This shoulnot be help comment */
////function noHelpComment2() {
////}
////noHelpComment2(/*13*/);
////
////function noHelpComment3() {
////}
////noHelpComment3(/*14*/);


goTo.marker('1');
verify.currentSignatureHelpDocCommentIs("This is simple /// comments");

goTo.marker('2');
verify.currentSignatureHelpDocCommentIs("multiLine /// Comments\nThis is example of multiline /// comments\nAnother multiLine");

goTo.marker('3');
verify.currentSignatureHelpDocCommentIs("this is eg of single line jsdoc style comment ");

goTo.marker('4');
verify.currentSignatureHelpDocCommentIs("this is multiple line jsdoc stule comment\nNew line1\nNew Line2");

goTo.marker('5');
verify.currentSignatureHelpDocCommentIs("this is multiple line jsdoc stule comment\nNew line1\nNew Line2\nShoul mege this line as well\n and this too\nAnother this one too");

goTo.marker('6');
verify.currentSignatureHelpDocCommentIs("jsdoc comment ");

goTo.marker('7');
verify.currentSignatureHelpDocCommentIs("jsdoc comment \n another jsDocComment");

goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("Triple slash comment");

goTo.marker('9');
verify.currentSignatureHelpDocCommentIs("Triple slash comment\nTriple slash comment 2");

goTo.marker('10');
verify.currentSignatureHelpDocCommentIs("Triple slash comment\nTriple slash comment 2");

goTo.marker('11');
verify.currentSignatureHelpDocCommentIs("jsdoc comment ");

goTo.marker('12');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('13');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('14');
verify.currentSignatureHelpDocCommentIs("");
