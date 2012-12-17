/// <reference path='fourslash.ts' />
//// declare var $: any;
//// $(".contentDiv").each(function (index, element) {/**/
////     // <-- ensure cursor is here after return on above
//// }); // Ensure indent is 0 after LBrace

goTo.marker();
edit.insert("\n");
verify.smartIndentLevelIs(1);
edit.insert("}");
verify.smartIndentLevelIs(0);
