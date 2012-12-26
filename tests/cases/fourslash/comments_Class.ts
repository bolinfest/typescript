/// <reference path='fourslash.ts' />

/////// This is class c2 without constuctor
////class c/*1*/2 {
////}
////var i/*2*/2 = new c2(/*3*/);
////var i2/*4*/_c = c/*5*/2;
////class c/*6*/3 {
////    /// Constructor comment
////    constructor() {
////    }
////}
////var i/*7*/3 = new c3(/*8*/);
////var i3/*9*/_c = c/*10*/3;
/////// Class comment
////class c/*11*/4 {
////    /// Constructor comment
////    constructor() {
////    }
////}
////var i/*12*/4 = new c4(/*13*/);
////var i4/*14*/_c = c/*15*/4;
/////// Class with statics
////class c/*16*/5 {
////    static s1: number;
////}
////var i/*17*/5 = new c5(/*18*/);
////var i5_/*19*/c = c/*20*/5;
/////// class with statics and constructor
////class c/*21*/6 {
////    /// s1 comment
////    static s1: number;
////    /// constructor comment
////    constructor() {
////    }
////}
////var i/*22*/6 = new c6(/*23*/);
////var i6/*24*/_c = c/*25*/6;
/////*26*/

goTo.marker('1');
verify.quickInfoIs("new() => c2\nThis is class c2 without constuctor");

goTo.marker('2');
verify.quickInfoIs("c2\nThis is class c2 without constuctor");

goTo.marker('3');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('4');
verify.quickInfoIs("new() => c2\nThis is class c2 without constuctor");

goTo.marker('5');
verify.quickInfoIs("new() => c2\nThis is class c2 without constuctor");

goTo.marker('6');
verify.quickInfoIs("new() => c3");

goTo.marker('7');
verify.quickInfoIs("c3");

goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("Constructor comment");

goTo.marker('9');
verify.quickInfoIs("new() => c3");

goTo.marker('10');
verify.quickInfoIs("new() => c3");

goTo.marker('11');
verify.quickInfoIs("new() => c4\nClass comment");

goTo.marker('12');
verify.quickInfoIs("c4\nClass comment");

goTo.marker('13');
verify.currentSignatureHelpDocCommentIs("Constructor comment");

goTo.marker('14');
verify.quickInfoIs("new() => c4\nClass comment");

goTo.marker('15');
verify.quickInfoIs("new() => c4\nClass comment");

goTo.marker('16');
verify.quickInfoIs("{ s1: number; new(): c5; }\nClass with statics");

goTo.marker('17');
verify.quickInfoIs("c5\nClass with statics");

goTo.marker('18');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('19');
verify.quickInfoIs("{ s1: number; new(): c5; }\nClass with statics");

goTo.marker('20');
verify.quickInfoIs("{ s1: number; new(): c5; }\nClass with statics");

goTo.marker('21');
verify.quickInfoIs("{ s1: number; new(): c6; }\nclass with statics and constructor");

goTo.marker('22');
verify.quickInfoIs("c6\nclass with statics and constructor");

goTo.marker('23');
verify.currentSignatureHelpDocCommentIs("constructor comment");

goTo.marker('24');
verify.quickInfoIs("{ s1: number; new(): c6; }\nclass with statics and constructor");

goTo.marker('25');
verify.quickInfoIs("{ s1: number; new(): c6; }\nclass with statics and constructor");

goTo.marker('26');
verify.completionListContains("c2", "new() => c2", "This is class c2 without constuctor");
verify.completionListContains("i2", "c2", "");
verify.completionListContains("i2_c", "new() => c2", "");
verify.completionListContains("c3", "new() => c3", "");
verify.completionListContains("i3", "c3", "");
verify.completionListContains("i3_c", "new() => c3", "");
verify.completionListContains("c4", "new() => c4", "Class comment");
verify.completionListContains("i4", "c4", "");
verify.completionListContains("i4_c", "new() => c4", "");
verify.completionListContains("c5", "{ s1: number; new(): c5; }", "Class with statics");
verify.completionListContains("i5", "c5", "");
verify.completionListContains("i5_c", "{ s1: number; new(): c5; }", "");
verify.completionListContains("c6", "{ s1: number; new(): c6; }", "class with statics and constructor");
verify.completionListContains("i6", "c6", "");
verify.completionListContains("i6_c", "{ s1: number; new(): c6; }", "");