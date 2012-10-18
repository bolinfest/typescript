/// <reference path='fourslash.ts' />

//// var x = r => r => r;
//// /**/

goTo.marker();
// BUG 17676: Smart indent after var initialization with => is wrong
verify.smartIndentLevelIs(1);