/// <reference path="fourslash.ts"/>
//// import f = module('foo');/**/

goTo.marker();
edit.insert("\n");
verify.smartIndentLevelIs(0);