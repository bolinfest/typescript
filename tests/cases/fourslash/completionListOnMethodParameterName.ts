/// <reference path="fourslash.ts" />

////class A {
////    foo(nu/**/: number) {
////    }
////}

goTo.marker();
// Bug 17383: Completion list shouldn't be present in argument name position
// verify.not.completionListContains('number');
verify.completionListContains('number');