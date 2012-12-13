/// <reference path='fourslash.ts' />

////var foo = '';
////( // f/**/

goTo.marker();
// Bug 17185: Completion list is available within comments
// verify.not.completionListContains('foo');

verify.completionListContains('foo');
