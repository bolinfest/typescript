/// <reference path="fourslash.ts"/>
//// 

goTo.bof();
edit.insert("interface Person {\n");
// verify.smartIndentLevelIs(1);  // BUG #17899.  Indentation is incorrect.
verify.smartIndentLevelIs(0);
