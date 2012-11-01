/// <reference path="fourslash.ts" />

////var x = n => p => {
////    while (true) {
////        void 0;
////    }/**/
////};

goTo.marker();
format.document();
// Bug 17854: Bad formatting after chained fat arrow
// verify.currentLineContentIs('    }');
verify.currentLineContentIs('}');

