/// <reference path="fourslash.ts" />

////"an unclosed string is a terrible thing!
////
////class foo { public x() { } }
////var f = new foo();
////f./**/

goTo.marker();
// Bug 16635: Error recovery for unclosed string literals
// verify.memberListContains('x');
verify.not.memberListContains('x');
