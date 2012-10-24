/// <reference path="fourslash.ts"/>
////declare module "fs" { };
////import im = module("fs");/**/

goTo.marker();
edit.insert("\n");
//verify.smartIndentLevelIs(0);  // TODO: BUG : 15684 Switch with line below when fixed.
verify.smartIndentLevelIs(1);
