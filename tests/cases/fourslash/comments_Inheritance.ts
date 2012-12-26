/// <reference path='fourslash.ts' />

/////// i1 is interface with properties
////interface i1 {
////    /// i1_p1
////    i1_p1: number;
////    /// i1_f1
////    i1_f1(): void;
////    /// i1_l1
////    i1_l1: () => void;
////    i1_nc_p1: number;
////    i1_nc_f1(): void;
////    i1_nc_l1: () => void;
////    p1: number;
////    f1(): void;
////    l1: () => void;
////    nc_p1: number;
////    nc_f1(): void;
////    nc_l1: () => void;
////}
////class c1 implements i1 {
////    public i1_p1: number;
////    public i1_f1() {
////    }
////    public i1_l1: () => void;
////    public i1_nc_p1: number;
////    public i1_nc_f1() {
////    }
////    public i1_nc_l1: () => void;
////    /// c1_p1
////    public p1: number;
////    /// c1_f1
////    public f1() {
////    }
////    /// c1_l1
////    public l1: () => void;
////    /// c1_nc_p1
////    public nc_p1: number;
////    /// c1_nc_f1
////    public nc_f1() {
////    }
////    /// c1_nc_l1
////    public nc_l1: () => void;
////}
////var i1_i: i1;
////i1_i./*1*/i1_f1(/*2*/);
////i1_i.i1_nc_f1(/*3*/);
////i1_i.f1(/*4*/);
////i1_i.nc_f1(/*5*/);
////i1_i.i1_l1(/*l2*/);
////i1_i.i1_nc_l1(/*l3*/);
////i1_i.l1(/*l4*/);
////i1_i.nc_l1(/*l5*/);
////var c1_i = new c1();
////c1_i./*6*/i1_f1(/*7*/);
////c1_i.i1_nc_f1(/*8*/);
////c1_i.f1(/*9*/);
////c1_i.nc_f1(/*10*/);
////c1_i.i1_l1(/*l7*/);
////c1_i.i1_nc_l1(/*l8*/);
////c1_i.l1(/*l9*/);
////c1_i.nc_l1(/*l10*/);
////// assign to interface
////i1_i = c1_i;
////i1_i./*11*/i1_f1(/*12*/);
////i1_i.i1_nc_f1(/*13*/);
////i1_i.f1(/*14*/);
////i1_i.nc_f1(/*15*/);
////i1_i.i1_l1(/*l12*/);
////i1_i.i1_nc_l1(/*l13*/);
////i1_i.l1(/*l14*/);
////i1_i.nc_l1(/*l15*/);
/////*16*/
////class c2 {
////    /// c2 c2_p1
////    public c2_p1: number;
////    /// c2 c2_f1
////    public c2_f1() {
////    }
////    /// c2 c2_prop
////    public get c2_prop() {
////        return 10;
////    }
////    public c2_nc_p1: number;
////    public c2_nc_f1() {
////    }
////    public get c2_nc_prop() {
////        return 10;
////    }
////    /// c2 p1
////    public p1: number;
////    /// c2 f1
////    public f1() {
////    }
////    /// c2 prop
////    public get prop() {
////        return 10;
////    }
////    public nc_p1: number;
////    public nc_f1() {
////    }
////    public get nc_prop() {
////        return 10;
////    }
////    /// c2 constructor
////    constructor(a: number) {
////        this.c2_p1 = a;
////    }
////}
////class c3 extends c2 {
////    constructor() {
////        super(10);
////    }
////    /// c3 p1
////    public p1: number;
////    /// c3 f1
////    public f1() {
////    }
////    /// c3 prop
////    public get prop() {
////        return 10;
////    }
////    public nc_p1: number;
////    public nc_f1() {
////    }
////    public get nc_prop() {
////        return 10;
////    }
////}
////var c2_i = new c2(/*17*/10);
////var c3_i = new c3(/*18*/);
////c2_i./*19*/c2_f1(/*20*/);
////c2_i.c2_nc_f1(/*21*/);
////c2_i.f1(/*22*/);
////c2_i.nc_f1(/*23*/);
////c3_i./*24*/c2_f1(/*25*/);
////c3_i.c2_nc_f1(/*26*/);
////c3_i.f1(/*27*/);
////c3_i.nc_f1(/*28*/);
////// assign
////c2_i = c3_i;
////c2_i./*29*/c2_f1(/*30*/);
////c2_i.c2_nc_f1(/*31*/);
////c2_i.f1(/*32*/);
////c2_i.nc_f1(/*33*/);
////class c4 extends c2 {
////}
////var c4_i = new c4(/*34*/10);
/////*35*/
////interface i2 {
////    /// i2_p1
////    i2_p1: number;
////    /// i2_f1
////    i2_f1(): void;
////    /// i2_l1
////    i2_l1: () => void;
////    i2_nc_p1: number;
////    i2_nc_f1(): void;
////    i2_nc_l1: () => void;
////    /// i2 p1
////    p1: number;
////    /// i2 f1
////    f1(): void;
////    /// i2 l1
////    l1: () => void;
////    nc_p1: number;
////    nc_f1(): void;
////    nc_l1: () => void;
////}
////interface i3 extends i2 {
////    /// i3 p1
////    p1: number;
////    /// i3 f1
////    f1(): void;
////    /// i3 l1
////    l1: () => void;
////    nc_p1: number;
////    nc_f1(): void;
////    nc_l1: () => void;
////}
////var i2_i: i2;
////var i3_i: i3;
////i2_i./*36*/i2_f1(/*37*/);
////i2_i.i2_nc_f1(/*38*/);
////i2_i.f1(/*39*/);
////i2_i.nc_f1(/*40*/);
////i2_i.i2_l1(/*l37*/);
////i2_i.i2_nc_l1(/*l38*/);
////i2_i.l1(/*l39*/);
////i2_i.nc_l1(/*l40*/);
////i3_i./*41*/i2_f1(/*42*/);
////i3_i.i2_nc_f1(/*43*/);
////i3_i.f1(/*44*/);
////i3_i.nc_f1(/*45*/);
////i3_i.i2_l1(/*l42*/);
////i3_i.i2_nc_l1(/*l43*/);
////i3_i.l1(/*l44*/);
////i3_i.nc_l1(/*l45*/);
////// assign to interface
////i2_i = i3_i;
////i2_i./*46*/i2_f1(/*47*/);
////i2_i.i2_nc_f1(/*48*/);
////i2_i.f1(/*49*/);
////i2_i.nc_f1(/*50*/);
////i2_i.i2_l1(/*l47*/);
////i2_i.i2_nc_l1(/*l48*/);
////i2_i.l1(/*l49*/);
////i2_i.nc_l1(/*l50*/);
/////*51*/

goTo.marker('1');
verify.memberListContains("i1_p1", "number", "i1_p1");
verify.memberListContains("i1_f1", "() => void", "i1_f1");
verify.memberListContains("i1_l1", "() => void", "i1_l1");
verify.memberListContains("i1_nc_p1", "number", "");
verify.memberListContains("i1_nc_f1", "() => void", "");
verify.memberListContains("i1_nc_l1", "() => void", "");
verify.memberListContains("p1", "number", "");
verify.memberListContains("f1", "() => void", "");
verify.memberListContains("l1", "() => void", "");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_l1", "() => void", "");
goTo.marker('2');
verify.currentSignatureHelpDocCommentIs("i1_f1");
goTo.marker('3');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('4');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('5');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l2');
verify.currentSignatureHelpDocCommentIs("i1_l1");
goTo.marker('l3');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l4');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l5');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('6');
verify.memberListContains("i1_p1", "number", "");
verify.memberListContains("i1_f1", "() => void", "");
verify.memberListContains("i1_l1", "() => void", "");
verify.memberListContains("i1_nc_p1", "number", "");
verify.memberListContains("i1_nc_f1", "() => void", "");
verify.memberListContains("i1_nc_l1", "() => void", "");
verify.memberListContains("p1", "number", "c1_p1");
verify.memberListContains("f1", "() => void", "c1_f1");
verify.memberListContains("l1", "() => void", "c1_l1");
verify.memberListContains("nc_p1", "number", "c1_nc_p1");
verify.memberListContains("nc_f1", "() => void", "c1_nc_f1");
verify.memberListContains("nc_l1", "() => void", "c1_nc_l1");
goTo.marker('7');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('9');
verify.currentSignatureHelpDocCommentIs("c1_f1");
goTo.marker('10');
verify.currentSignatureHelpDocCommentIs("c1_nc_f1");
goTo.marker('l7');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l8');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l9');
verify.currentSignatureHelpDocCommentIs("c1_l1");
goTo.marker('l10');
verify.currentSignatureHelpDocCommentIs("c1_nc_l1");

goTo.marker('11');
verify.memberListContains("i1_p1", "number", "i1_p1");
verify.memberListContains("i1_f1", "() => void", "i1_f1");
verify.memberListContains("i1_l1", "() => void", "i1_l1");
verify.memberListContains("i1_nc_p1", "number", "");
verify.memberListContains("i1_nc_f1", "() => void", "");
verify.memberListContains("i1_nc_l1", "() => void", "");
verify.memberListContains("p1", "number", "");
verify.memberListContains("f1", "() => void", "");
verify.memberListContains("l1", "() => void", "");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_l1", "() => void", "");
goTo.marker('12');
verify.currentSignatureHelpDocCommentIs("i1_f1");
goTo.marker('13');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('14');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('15');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l12');
verify.currentSignatureHelpDocCommentIs("i1_l1");
goTo.marker('l13');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l14');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l15');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('16');
verify.completionListContains("i1", "i1", "i1 is interface with properties");
verify.completionListContains("i1_i", "i1", "");
verify.completionListContains("c1", "new() => c1", "");
verify.completionListContains("c1_i", "c1", "");

goTo.marker('17');
verify.currentSignatureHelpDocCommentIs("c2 constructor");

goTo.marker('18');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('19');
verify.memberListContains("c2_p1", "number", "c2 c2_p1");
verify.memberListContains("c2_f1", "() => void", "c2 c2_f1");
verify.memberListContains("c2_prop", "number", "c2 c2_prop");
verify.memberListContains("c2_nc_p1", "number", "");
verify.memberListContains("c2_nc_f1", "() => void", "");
verify.memberListContains("c2_nc_prop", "number", "");
verify.memberListContains("p1", "number", "c2 p1");
verify.memberListContains("f1", "() => void", "c2 f1");
verify.memberListContains("prop", "number", "c2 prop");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_prop", "number", "");
goTo.marker('20');
verify.currentSignatureHelpDocCommentIs("c2 c2_f1");
goTo.marker('21');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('22');
verify.currentSignatureHelpDocCommentIs("c2 f1");
goTo.marker('23');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('24');
verify.memberListContains("c2_p1", "number", "c2 c2_p1");
verify.memberListContains("c2_f1", "() => void", "c2 c2_f1");
verify.memberListContains("c2_prop", "number", "c2 c2_prop");
verify.memberListContains("c2_nc_p1", "number", "");
verify.memberListContains("c2_nc_f1", "() => void", "");
verify.memberListContains("c2_nc_prop", "number", "");
verify.memberListContains("p1", "number", "c3 p1");
verify.memberListContains("f1", "() => void", "c3 f1");
verify.memberListContains("prop", "number", "c3 prop");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_prop", "number", "");
goTo.marker('25');
verify.currentSignatureHelpDocCommentIs("c2 c2_f1");
goTo.marker('26');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('27');
verify.currentSignatureHelpDocCommentIs("c3 f1");
goTo.marker('28');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('29');
verify.memberListContains("c2_p1", "number", "c2 c2_p1");
verify.memberListContains("c2_f1", "() => void", "c2 c2_f1");
verify.memberListContains("c2_prop", "number", "c2 c2_prop");
verify.memberListContains("c2_nc_p1", "number", "");
verify.memberListContains("c2_nc_f1", "() => void", "");
verify.memberListContains("c2_nc_prop", "number", "");
verify.memberListContains("p1", "number", "c2 p1");
verify.memberListContains("f1", "() => void", "c2 f1");
verify.memberListContains("prop", "number", "c2 prop");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_prop", "number", "");
goTo.marker('30');
verify.currentSignatureHelpDocCommentIs("c2 c2_f1");
goTo.marker('31');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('32');
verify.currentSignatureHelpDocCommentIs("c2 f1");
goTo.marker('33');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('34');
verify.currentSignatureHelpDocCommentIs("c2 constructor");

goTo.marker('35');
verify.completionListContains("c2", "new(a: number) => c2", "");
verify.completionListContains("c2_i", "c2", "");
verify.completionListContains("c3", "new() => c3", "");
verify.completionListContains("c3_i", "c3", "");
verify.completionListContains("c4", "new(a: number) => c4", "");
verify.completionListContains("c4_i", "c4", "");

goTo.marker('36');
verify.memberListContains("i2_p1", "number", "i2_p1");
verify.memberListContains("i2_f1", "() => void", "i2_f1");
verify.memberListContains("i2_l1", "() => void", "i2_l1");
verify.memberListContains("i2_nc_p1", "number", "");
verify.memberListContains("i2_nc_f1", "() => void", "");
verify.memberListContains("i2_nc_l1", "() => void", "");
verify.memberListContains("p1", "number", "i2 p1");
verify.memberListContains("f1", "() => void", "i2 f1");
verify.memberListContains("l1", "() => void", "i2 l1");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_l1", "() => void", "");
goTo.marker('37');
verify.currentSignatureHelpDocCommentIs("i2_f1");
goTo.marker('38');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('39');
verify.currentSignatureHelpDocCommentIs("i2 f1");
goTo.marker('40');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l37');
verify.currentSignatureHelpDocCommentIs("i2_l1");
goTo.marker('l38');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l39');
verify.currentSignatureHelpDocCommentIs("i2 l1");
goTo.marker('l40');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('41');
verify.memberListContains("i2_p1", "number", "i2_p1");
verify.memberListContains("i2_f1", "() => void", "i2_f1");
verify.memberListContains("i2_l1", "() => void", "i2_l1");
verify.memberListContains("i2_nc_p1", "number", "");
verify.memberListContains("i2_nc_f1", "() => void", "");
verify.memberListContains("i2_nc_l1", "() => void", "");
verify.memberListContains("p1", "number", "i3 p1");
verify.memberListContains("f1", "() => void", "i3 f1");
verify.memberListContains("l1", "() => void", "i3 l1");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_l1", "() => void", "");
goTo.marker('42');
verify.currentSignatureHelpDocCommentIs("i2_f1");
goTo.marker('43');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('44');
verify.currentSignatureHelpDocCommentIs("i3 f1");
goTo.marker('45');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l42');
verify.currentSignatureHelpDocCommentIs("i2_l1");
goTo.marker('l43');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l44');
verify.currentSignatureHelpDocCommentIs("i3 l1");
goTo.marker('l45');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('46');
verify.memberListContains("i2_p1", "number", "i2_p1");
verify.memberListContains("i2_f1", "() => void", "i2_f1");
verify.memberListContains("i2_l1", "() => void", "i2_l1");
verify.memberListContains("i2_nc_p1", "number", "");
verify.memberListContains("i2_nc_f1", "() => void", "");
verify.memberListContains("i2_nc_l1", "() => void", "");
verify.memberListContains("p1", "number", "i2 p1");
verify.memberListContains("f1", "() => void", "i2 f1");
verify.memberListContains("l1", "() => void", "i2 l1");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_f1", "() => void", "");
verify.memberListContains("nc_l1", "() => void", "");
goTo.marker('47');
verify.currentSignatureHelpDocCommentIs("i2_f1");
goTo.marker('48');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('49');
verify.currentSignatureHelpDocCommentIs("i2 f1");
goTo.marker('50');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l47');
verify.currentSignatureHelpDocCommentIs("i2_l1");
goTo.marker('l48');
verify.currentSignatureHelpDocCommentIs("");
goTo.marker('l49');
verify.currentSignatureHelpDocCommentIs("i2 l1");
goTo.marker('l50');
verify.currentSignatureHelpDocCommentIs("");

goTo.marker('51');
verify.completionListContains("i2", "i2", "");
verify.completionListContains("i2_i", "i2", "");
verify.completionListContains("i3", "i3", "");
verify.completionListContains("i3_i", "i3", "");
