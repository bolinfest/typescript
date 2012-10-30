/// <reference path="fourslash.ts"/>
////declare module "fs" { };
////import im = module("fs");/**/

goTo.marker();
edit.insert("\n");
// Bug 15684: [Smart Indent] Auto indent incorrect after module import decl
//verify.smartIndentLevelIs(0);
verify.smartIndentLevelIs(1);
