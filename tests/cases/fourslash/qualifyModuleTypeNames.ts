/// <reference path='fourslash.ts' />

////module m { export class c { } };
////function x(arg: m.c) { return arg; }
////x(/**/

goTo.marker();
// Bug 15052: Signature help should show qualified type names
// Correct: verify.currentSignatureHelpReturnTypeIs('m.c');
verify.currentSignatureHelpReturnTypeIs('c');
