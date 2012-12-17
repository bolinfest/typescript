/// <reference path='fourslash.ts' />
//// class C2 {
////     eventEmitter: any;
////     constructor() {
////         this.eventEmitter.on(5, (msg) => {
//// console.log/**/
////         });
////     }
//// }

goTo.marker();
edit.insert(";");
verify.smartIndentLevelIs(3);
verify.currentLineContentIs("            console.log;");   // Ensure line is indented correctly and doesn't jump up to previous line on semi-colon
