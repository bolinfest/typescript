/// <reference path='fourslash.ts' />

//// var fn = () => () => null/**/

goTo.marker();
edit.insert(';');
// Bug 15097: [Formatting] Incorrect spacing around arrow in chained fat arrow syntax
// verify.currentLineContentIs('var fn = () => () => null;');
verify.currentLineContentIs('var fn = () =>() => null;');
