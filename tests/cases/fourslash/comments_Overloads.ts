/// <reference path='fourslash.ts' />

/////// this is signature 1
////function /*1*/f1(/**param a*/a: number): number;
////function /*2*/f1(b: string): number;
////function /*3*/f1(aOrb: any) {
////    return 10;
////}
////f1(/*4*/"hello");
////f1(/*o4*/10);
////function /*5*/f2(/**param a*/a: number): number;
/////// this is signature 2
////function /*6*/f2(b: string): number;
/////// this is f2 var comment
////function /*7*/f2(aOrb: any) {
////    return 10;
////}
////f2(/*8*/"hello");
////f2(/*o8*/10);
////function /*9*/f3(a: number): number;
////function /*10*/f3(b: string): number;
////function /*11*/f3(aOrb: any) {
////    return 10;
////}
////f3(/*12*/"hello");
////f3(/*o12*/10);
/////// this is signature 4 - with number parameter
////function /*13*/f4(/**param a*/a: number): number;
/////// this is signature 4 - with string parameter
////function /*14*/f4(b: string): number;
////function /*15*/f4(aOrb: any) {
////    return 10;
////}
////f4(/*16*/"hello");
////f4(/*o16*/10);
/////*17*/
////interface i1 {
////    ///this signature 1
////    (/**param a*/ a: number): number;
////    ///this is signature 2
////    (b: string): number;
////    /// foo 1
////    foo(a: number): number;
////    /// foo 2
////    foo(b: string): number;
////    foo2(a: number): number;
////    /// foo2 2
////    foo2(b: string): number;
////    foo3(a: number): number;
////    foo3(b: string): number;
////    /// foo4 1
////    foo4(a: number): number;
////    foo4(b: string): number;
////    /// new 1
////    new (a: string);
////    new (b: number);
////}
////var i1_i: i1;
////interface i2 {
////    new (a: string);
////    /// new 2
////    new (b: number);
////    (a: number): number;
////    ///this is signature 2
////    (b: string): number;
////}
////var i2_i: i2;
////interface i3 {
////    /// new 1
////    new (a: string);
////    /// new 2
////    new (b: number);
////    ///this is signature 1
////    (a: number): number;
////    (b: string): number;
////}
////var i3_i: i3;
////interface i4 {
////    new (a: string);
////    new (b: number);
////    (a: number): number;
////    (b: string): number;
////}
////var i4_i: i4;
////new /*18*/i1_i(/*19*/10);
////new i1_i(/*20*/"Hello");
////i1_i(/*21*/10);
////i1_i(/*22*/"hello");
////i1_i./*23*/foo(/*24*/10);
////i1_i.foo(/*25*/"hello");
////i1_i.foo2(/*26*/10);
////i1_i.foo2(/*27*/"hello");
////i1_i.foo3(/*28*/10);
////i1_i.foo3(/*29*/"hello");
////i1_i.foo4(/*30*/10);
////i1_i.foo4(/*31*/"hello");
////new i2_i(/*32*/10);
////new i2_i(/*33*/"Hello");
////i2_i(/*34*/10);
////i2_i(/*35*/"hello");
////new i3_i(/*36*/10);
////new i3_i(/*37*/"Hello");
////i3_i(/*38*/10);
////i3_i(/*39*/"hello");
////new i4_i(/*40*/10);
////new i4_i(/*41*/"Hello");
////i4_i(/*42*/10);
////i4_i(/*43*/"hello");
////class c {
////    public prop1(a: number): number;
////    public prop1(b: string): number;
////    public prop1(aorb: any) {
////        return 10;
////    }
////    /// prop2 1
////    public prop2(a: number): number;
////    public prop2(b: string): number;
////    public prop2(aorb: any) {
////        return 10;
////    }
////    public prop3(a: number): number;
////    /// prop3 2
////    public prop3(b: string): number;
////    public prop3(aorb: any) {
////        return 10;
////    }
////    /// prop4 1
////    public prop4(a: number): number;
////    /// prop4 2
////    public prop4(b: string): number;
////    public prop4(aorb: any) {
////        return 10;
////    }
////    /// prop5 1
////    public prop5(a: number): number;
////    /// prop5 2
////    public prop5(b: string): number;
////    /// Prop5 implementaion
////    public prop5(aorb: any) {
////        return 10;
////    }
////}
////class c1 {
////    constructor(a: number);
////    constructor(b: string);
////    constructor(aorb: any) {
////    }
////}
////class c2 {
////    /// c2 1
////    constructor(a: number);
////    constructor(b: string);
////    constructor(aorb: any) {
////    }
////}
////class c3 {
////    constructor(a: number);
////    /// c3 2
////    constructor(b: string);
////    constructor(aorb: any) {
////    }
////}
////class c4 {
////    /// c4 1
////    constructor(a: number);
////    /// c4 2
////    constructor(b: string);
////    constructor(aorb: any) {
////    }
////}
////class c5 {
////    /// c5 1
////    constructor(a: number);
////    /// c5 2
////    constructor(b: string);
////    /// c5 implementation
////    constructor(aorb: any) {
////    }
////}
////var c_i = new c();
////c_i./*44*/prop1(/*45*/10);
////c_i.prop1(/*46*/"hello");
////c_i.prop2(/*47*/10);
////c_i.prop2(/*48*/"hello");
////c_i.prop3(/*49*/10);
////c_i.prop3(/*50*/"hello");
////c_i.prop4(/*51*/10);
////c_i.prop4(/*52*/"hello");
////c_i.prop5(/*53*/10);
////c_i.prop5(/*54*/"hello");
////var c1/*66*/_i_1 = new c1(/*55*/10);
////var c1_i_2 = new c1(/*56*/"hello");
////var c2_i_1 = new c2(/*57*/10);
////var c/*67*/2_i_2 = new c2(/*58*/"hello");
////var c3_i_1 = new c3(/*59*/10);
////var c/*68*/3_i_2 = new c3(/*60*/"hello");
////var c4/*69*/_i_1 = new c4(/*61*/10);
////var c4_i_2 = new c4(/*62*/"hello");
////var c/*70*/5_i_1 = new c5(/*63*/10);
////var c5_i_2 = new c5(/*64*/"hello");
/////*65*/

goTo.marker('1');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('2');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('3');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");

goTo.marker('4');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('o4');
verify.currentSignatureHelpDocCommentIs("this is signature 1");
verify.currentParameterHelpArgumentDocCommentIs("param a");

goTo.marker('5');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('6');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('7');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");

goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("this is signature 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('o8');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("param a");

goTo.marker('9');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('10');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('11');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");

goTo.marker('12');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('o12');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('13');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('14');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");
goTo.marker('15');
verify.quickInfoIs("{ (a: number): number; (b: string): number; }");

goTo.marker('16');
verify.currentSignatureHelpDocCommentIs("this is signature 4 - with string parameter");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('o16');
verify.currentSignatureHelpDocCommentIs("this is signature 4 - with number parameter");
verify.currentParameterHelpArgumentDocCommentIs("param a");

goTo.marker('17');
verify.completionListContains('f1', '{ (a: number): number; (b: string): number; }', '');
verify.completionListContains('f2', '{ (a: number): number; (b: string): number; }', 'this is f2 var comment');
verify.completionListContains('f3', '{ (a: number): number; (b: string): number; }', '');
verify.completionListContains('f4', '{ (a: number): number; (b: string): number; }', '');

goTo.marker('18');
verify.completionListContains('i1', 'i1', '');
verify.completionListContains('i1_i', 'i1', '');
verify.completionListContains('i2', 'i2', '');
verify.completionListContains('i2_i', 'i2', '');
verify.completionListContains('i3', 'i3', '');
verify.completionListContains('i3_i', 'i3', '');
verify.completionListContains('i4', 'i4', '');
verify.completionListContains('i4_i', 'i4', '');

goTo.marker('19');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('20');
verify.currentSignatureHelpDocCommentIs("new 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('21');
verify.currentSignatureHelpDocCommentIs("this signature 1");
verify.currentParameterHelpArgumentDocCommentIs("param a");

goTo.marker('22');
verify.currentSignatureHelpDocCommentIs("this is signature 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('23');
verify.memberListContains('foo', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('foo2', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('foo3', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('foo4', '{ (a: number): number; (b: string): number; }', '');

goTo.marker('24');
verify.currentSignatureHelpDocCommentIs("foo 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('25');
verify.currentSignatureHelpDocCommentIs("foo 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('26');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('27');
verify.currentSignatureHelpDocCommentIs("foo2 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('28');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('29');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('30');
verify.currentSignatureHelpDocCommentIs("foo4 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('31');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('32');
verify.currentSignatureHelpDocCommentIs("new 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('33');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('34');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('35');
verify.currentSignatureHelpDocCommentIs("this is signature 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('36');
verify.currentSignatureHelpDocCommentIs("new 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('37');
verify.currentSignatureHelpDocCommentIs("new 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('38');
verify.currentSignatureHelpDocCommentIs("this is signature 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('39');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('40');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('41');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('42');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('43');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('44');
verify.memberListContains('prop1', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('prop2', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('prop3', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('prop4', '{ (a: number): number; (b: string): number; }', '');
verify.memberListContains('prop5', '{ (a: number): number; (b: string): number; }', 'Prop5 implementaion');

goTo.marker('45');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('46');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('47');
verify.currentSignatureHelpDocCommentIs("prop2 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('48');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('49');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('50');
verify.currentSignatureHelpDocCommentIs("prop3 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('51');
verify.currentSignatureHelpDocCommentIs("prop4 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('52');
verify.currentSignatureHelpDocCommentIs("prop4 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('53');
verify.currentSignatureHelpDocCommentIs("prop5 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('54');
verify.currentSignatureHelpDocCommentIs("prop5 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('55');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('56');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('57');
verify.currentSignatureHelpDocCommentIs("c2 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('58');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('59');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('60');
verify.currentSignatureHelpDocCommentIs("c3 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('61');
verify.currentSignatureHelpDocCommentIs("c4 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('62');
verify.currentSignatureHelpDocCommentIs("c4 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('63');
verify.currentSignatureHelpDocCommentIs("c5 1");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('64');
verify.currentSignatureHelpDocCommentIs("c5 2");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('65');
verify.completionListContains("c", "new() => c", "");
verify.completionListContains("c1", "{ new(a: number): c1; new(b: string): c1; }", "");
verify.completionListContains("c2", "{ new(a: number): c2; new(b: string): c2; }", "");
verify.completionListContains("c3", "{ new(a: number): c3; new(b: string): c3; }", "");
verify.completionListContains("c4", "{ new(a: number): c4; new(b: string): c4; }", "");
verify.completionListContains("c5", "{ new(a: number): c5; new(b: string): c5; }", "");
verify.completionListContains("c_i", "c", "");
verify.completionListContains("c1_i_1", "c1", "");
verify.completionListContains("c2_i_1", "c2", "");
verify.completionListContains("c3_i_1", "c3", "");
verify.completionListContains("c4_i_1", "c4", "");
verify.completionListContains("c5_i_1", "c5", "");
verify.completionListContains("c1_i_2", "c1", "");
verify.completionListContains("c2_i_2", "c2", "");
verify.completionListContains("c3_i_2", "c3", "");
verify.completionListContains("c4_i_2", "c4", "");
verify.completionListContains("c5_i_2", "c5", "");

goTo.marker('66');
verify.quickInfoIs("c1");
goTo.marker('67');
verify.quickInfoIs("c2");
goTo.marker('68');
verify.quickInfoIs("c3");
goTo.marker('69');
verify.quickInfoIs("c4");
goTo.marker('70');
verify.quickInfoIs("c5");