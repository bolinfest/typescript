/// <reference path='fourslash.ts' />

//// var foo;
//// if (foo &&
////     foo) {
//// /*comment*/    // This is a comment
////     foo.toString();
//// /**/

goTo.marker();
edit.insert('}');
goTo.marker('comment');
// Bug 15035: [Formatting] Comment below multi-line 'if' condition gets tabbed too far in
// verify.currentLineContentIs('    // This is a comment');
verify.currentLineContentIs('        // This is a comment');