/// <reference path='fourslash.ts' />

//// var x: () =>           string/**/

goTo.marker();
edit.insert(';');
// Bug 17051: No formatting on function return type
// verify.currentLineContentIs('var x: () => string;');
verify.currentLineContentIs('var x: () =>           string;');

