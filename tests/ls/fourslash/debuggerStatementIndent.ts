/// <reference path='fourslash.ts' />
//// if (false) {
////     debugger;
//// /**/
goTo.marker();
edit.insert('}');
verify.smartIndentLevelIs(0);
