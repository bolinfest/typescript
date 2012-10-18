/// <reference path='fourslash.ts' />

////switch (null) {
////    case 0:
////        /**/
////}

goTo.marker();
edit.insert('case 1:\n');

// Bug 16999: Formatting of switch statements indents correctly as you type
// Actually correct: verify.smartIndentLevelIs(2);
verify.smartIndentLevelIs(3);
