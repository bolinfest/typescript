/// <reference path='fourslash.ts' />

////function aa(x: any) {}
////aa({
////  "1": function () {
////    var b = "";
////    b/**/;
////  }
////});

goTo.marker();
edit.insert('.');

// http://typescript.codeplex.com/workitem/440 bad intellisense in object literal
verify.not.memberListContains('charAt');
// verify.memberListContains('charAt');

