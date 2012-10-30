/// <reference path="fourslash.ts"/>
//// 

goTo.bof();
edit.insert("interface Person {\n");
// Bug 17899: No indentation on newline after "interface {"
// verify.smartIndentLevelIs(1);
verify.smartIndentLevelIs(0);
