/// <reference path='fourslash.ts' />

////function foo() {
////    /**/while (true) { }
////}
 
goTo.marker();
edit.insertLine('');
// Bug 15096: [Smart Indent] 'Enter' should smart indent such that the current line maintains its indentation
// verify.currentLineContentIs('    while (true) { }');
verify.currentLineContentIs('while (true) { }');
