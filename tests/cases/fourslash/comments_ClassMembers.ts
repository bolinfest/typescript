/// <reference path='fourslash.ts' />

/////// This is comment for c1
////class c/*1*/1 {
////    /// p1 is property of c1
////    public p/*2*/1: number;
////    /// sum with property
////    public p/*3*/2(/** number to add*/b: number) {
////        return this./*4*/p1 + /*5*/b;
////    }
////    /// getter property
////    public get p/*6*/3() {
////        return this./*7*/p2(/*8*/this./*9*/p1);
////    }
////    /// setter property
////    public set p/*10*/3(/** this is value*/value: number) {
////        this./*11*/p1 = this./*12*/p2(/*13*/value);
////    }
////    /// pp1 is property of c1
////    private p/*14*/p1: number;
////    /// sum with property
////    private p/*15*/p2(/** number to add*/b: number) {
////        return this./*16*/p1 + /*17*/b;
////    }
////    /// getter property
////    private get p/*18*/p3() {
////        return this./*19*/pp2(/*20*/this./*21*/pp1);
////    }
////    /// setter property
////    private set p/*22*/p3( /** this is value*/value: number) {
////        this./*23*/pp1 = this./*24*/pp2(/*25*/value);
////    }
////    /// Constructor method
////    constru/*26*/ctor() {
////    }
////    /// s1 is static property of c1
////    static s/*27*/1: number;
////    /// static sum with property
////    static s/*28*/2(/** number to add*/b: number) {
////        return /*29*/c1./*30*/s1 + /*31*/b;
////    }
////    /// static getter property
////    static get s/*32*/3() {
////        return /*33*/c1./*34*/s2(/*35*/c1./*36*/s1);
////    }
////    /// setter property
////    static set s/*37*/3( /** this is value*/value: number) {
////        /*38*/c1./*39*/s1 = /*40*/c1./*41*/s2(/*42*/value);
////    }
////    public nc_/*43*/p1: number;
////    public nc_/*44*/p2(b: number) {
////        return this.nc_p1 + /*45*/b;
////    }
////    public get nc_/*46*/p3() {
////        return this.nc_p2(/*47*/this.nc_p1);
////    }
////    public set nc/*48*/_p3(value: number) {
////        this.nc_p1 = this.nc_p2(/*49*/value);
////    }
////    private nc/*50*/_pp1: number;
////    private nc_/*51*/pp2(b: number) {
////        return this.nc_pp1 + /*52*/b;
////    }
////    private get nc/*53*/_pp3() {
////        return this.nc_pp2(/*54*/this.nc_pp1);
////    }
////    private set nc_p/*55*/p3(value: number) {
////        this.nc_pp1 = this.nc_pp2(/*56*/value);
////    }
////    static nc/*57*/_s1: number;
////    static nc/*58*/_s2(b: number) {
////        return c1.nc_s1 + /*59*/b;
////    }
////    static get nc/*60*/_s3() {
////        return c1.nc_s2(/*61*/c1.nc_s1);
////    }
////    static set nc/*62*/_s3(value: number) {
////        c1.nc_s1 = c1.nc_s2(/*63*/value);
////    }
////}
////var i/*64*/1 = new c1(/*65*/);
////var i1/*66*/_p = i1./*67*/p1;
////var i1/*68*/_f = i1.p/*69*/2;
////var i1/*70*/_r = i1.p2(/*71*/20);
////var i1_p/*72*/rop = i1./*73*/p3;
////i1./*74*/p3 = i1_/*75*/prop;
////var i1_/*76*/nc_p = i1.n/*77*/c_p1;
////var i1/*78*/_ncf = i1.nc_/*79*/p2;
////var i1_/*80*/ncr = i1.nc_p2(/*81*/20);
////var i1_n/*82*/cprop = i1.n/*83*/c_p3;
////i1.nc/*84*/_p3 = i1_/*85*/ncprop;
////var i1_/*86*/s_p = /*87*/c1./*88*/s1;
////var i1_s/*89*/_f = c1./*90*/s2;
////var i1_/*91*/s_r = c1.s2(/*92*/20);
////var i1_s/*93*/_prop = c1.s/*94*/3;
////c1.s/*95*/3 = i1_s/*96*/_prop;
////var i1_s/*97*/_nc_p = c1.n/*98*/c_s1;
////var i1_s_/*99*/ncf = c1.nc/*100*/_s2;
////var i1_s_/*101*/ncr = c1.nc_s2(/*102*/20);
////var i1_s_n/*103*/cprop = c1.nc/*104*/_s3;
////c1.nc/*105*/_s3 = i1_s_nc/*106*/prop;
////var i1/*107*/_c = c/*108*/1;
/////*109*/
////class cProperties {
////    private val: number;
////    /// getter only property
////    public get p1() {
////        return this.val;
////    }
////    public get nc_p1() {
////        return this.val;
////    }
////    ///setter only property
////    public set p2(value: number) {
////        this.val = value;
////    }
////    public set nc_p2(value: number) {
////        this.val = value;
////    }
////}
////var cProperties_i = new cProperties();
////cProperties_i./*110*/p2 = cProperties_i.p/*111*/1;
////cProperties_i.nc/*112*/_p2 = cProperties_i.nc/*113*/_p1;


goTo.marker('1');
verify.quickInfoIs("{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }\nThis is comment for c1");

goTo.marker('2');
verify.quickInfoIs("number");

goTo.marker('3');
verify.quickInfoIs("(b: number) => number");

goTo.marker('4');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('5');
verify.completionListContains("b", "number", "number to add");

goTo.marker('6');
verify.quickInfoIs("() => number");

goTo.marker('7');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");

goTo.marker('9');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('10');
verify.quickInfoIs("(value: number) => void");

goTo.marker('11');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('12');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('13');
verify.currentSignatureHelpDocCommentIs("sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");
verify.completionListContains("value", "number", "this is value");

goTo.marker('14');
verify.quickInfoIs("number");

goTo.marker('15');
verify.quickInfoIs("(b: number) => number");

goTo.marker('16');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('17');
verify.completionListContains("b", "number", "number to add");

goTo.marker('18');
verify.quickInfoIs("() => number");

goTo.marker('19');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('20');
verify.currentSignatureHelpDocCommentIs("sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");

goTo.marker('21');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('22');
verify.quickInfoIs("(value: number) => void");

goTo.marker('23');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('24');
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("pp1", "number", "pp1 is property of c1");
verify.memberListContains("pp2", "(b: number) => number", "sum with property");
verify.memberListContains("pp3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");
verify.memberListContains("nc_pp1", "number", "");
verify.memberListContains("nc_pp2", "(b: number) => number", "");
verify.memberListContains("nc_pp3", "number", "");

goTo.marker('25');
verify.currentSignatureHelpDocCommentIs("sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");
verify.completionListContains("value", "number", "this is value");

goTo.marker('26');
verify.quickInfoIs("{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }\nThis is comment for c1");

goTo.marker('27');
verify.quickInfoIs("number");

goTo.marker('28');
verify.quickInfoIs("(b: number) => number");

goTo.marker('29');
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");

goTo.marker('30');
verify.memberListContains("s1", "number", "s1 is static property of c1");
verify.memberListContains("s2", "(b: number) => number", "static sum with property");
verify.memberListContains("s3", "number", "static getter property\nsetter property");
verify.memberListContains("nc_s1", "number", "");
verify.memberListContains("nc_s2", "(b: number) => number", "");
verify.memberListContains("nc_s3", "number", "");

goTo.marker('31');
verify.completionListContains("b", "number", "number to add");

goTo.marker('32');
verify.quickInfoIs("() => number");

goTo.marker('33');
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");

goTo.marker('34');
verify.memberListContains("s1", "number", "s1 is static property of c1");
verify.memberListContains("s2", "(b: number) => number", "static sum with property");
verify.memberListContains("s3", "number", "static getter property\nsetter property");
verify.memberListContains("nc_s1", "number", "");
verify.memberListContains("nc_s2", "(b: number) => number", "");
verify.memberListContains("nc_s3", "number", "");

goTo.marker('35');
verify.currentSignatureHelpDocCommentIs("static sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");

goTo.marker('36');
verify.memberListContains("s1", "number", "s1 is static property of c1");
verify.memberListContains("s2", "(b: number) => number", "static sum with property");
verify.memberListContains("s3", "number", "static getter property\nsetter property");
verify.memberListContains("nc_s1", "number", "");
verify.memberListContains("nc_s2", "(b: number) => number", "");
verify.memberListContains("nc_s3", "number", "");

goTo.marker('37');
verify.quickInfoIs("(value: number) => void");

goTo.marker('38');
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");

goTo.marker('39');
verify.memberListContains("s1", "number", "s1 is static property of c1");
verify.memberListContains("s2", "(b: number) => number", "static sum with property");
verify.memberListContains("s3", "number", "static getter property\nsetter property");
verify.memberListContains("nc_s1", "number", "");
verify.memberListContains("nc_s2", "(b: number) => number", "");
verify.memberListContains("nc_s3", "number", "");

goTo.marker('40');
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");

goTo.marker('41');
verify.memberListContains("s1", "number", "s1 is static property of c1");
verify.memberListContains("s2", "(b: number) => number", "static sum with property");
verify.memberListContains("s3", "number", "static getter property\nsetter property");
verify.memberListContains("nc_s1", "number", "");
verify.memberListContains("nc_s2", "(b: number) => number", "");
verify.memberListContains("nc_s3", "number", "");

goTo.marker('42');
verify.currentSignatureHelpDocCommentIs("static sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");
verify.completionListContains("value", "number", "this is value");

goTo.marker('43');
verify.quickInfoIs("number");

goTo.marker('44');
verify.quickInfoIs("(b: number) => number");

goTo.marker('45');
verify.completionListContains("b", "number", "");

goTo.marker('46');
verify.quickInfoIs("() => number");

goTo.marker('47');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('48');
verify.quickInfoIs("(value: number) => void");

goTo.marker('49');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");
verify.completionListContains("value", "number", "");

goTo.marker('50');
verify.quickInfoIs("number");

goTo.marker('51');
verify.quickInfoIs("(b: number) => number");

goTo.marker('52');
verify.completionListContains("b", "number", "");

goTo.marker('53');
verify.quickInfoIs("() => number");

goTo.marker('54');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('55');
verify.quickInfoIs("(value: number) => void");

goTo.marker('56');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");
verify.completionListContains("value", "number", "");

goTo.marker('57');
verify.quickInfoIs("number");

goTo.marker('58');
verify.quickInfoIs("(b: number) => number");

goTo.marker('59');
verify.completionListContains("b", "number", "");

goTo.marker('60');
verify.quickInfoIs("() => number");

goTo.marker('61');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('62');
verify.quickInfoIs("(value: number) => void");

goTo.marker('63');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");
verify.completionListContains("value", "number", "");

goTo.marker('64');
verify.quickInfoIs("c1\nThis is comment for c1");

goTo.marker('65');
verify.currentSignatureHelpDocCommentIs("Constructor method");

goTo.marker('66');
verify.quickInfoIs("number");

goTo.marker('67');
verify.quickInfoIs("number");
verify.memberListContains("p1", "number", "p1 is property of c1");
verify.memberListContains("p2", "(b: number) => number", "sum with property");
verify.memberListContains("p3", "number", "getter property\nsetter property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "(b: number) => number", "");
verify.memberListContains("nc_p3", "number", "");

goTo.marker('68');
verify.quickInfoIs("(b: number) => number");

goTo.marker('69');
verify.quickInfoIs("(b: number) => number");

goTo.marker('70');
verify.quickInfoIs("number");

goTo.marker('71');
verify.currentSignatureHelpDocCommentIs("sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");

goTo.marker('72');
verify.quickInfoIs("number");
goTo.marker('73');
verify.quickInfoIs("number");
goTo.marker('74');
verify.quickInfoIs("number");
goTo.marker('75');
verify.quickInfoIs("number");

goTo.marker('76');
verify.quickInfoIs("number");

goTo.marker('77');
verify.quickInfoIs("number");

goTo.marker('78');
verify.quickInfoIs("(b: number) => number");

goTo.marker('79');
verify.quickInfoIs("(b: number) => number");

goTo.marker('80');
verify.quickInfoIs("number");

goTo.marker('81');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('82');
verify.quickInfoIs("number");
goTo.marker('83');
verify.quickInfoIs("number");
goTo.marker('84');
verify.quickInfoIs("number");
goTo.marker('85');
verify.quickInfoIs("number");

goTo.marker('86');
verify.quickInfoIs("number");

goTo.marker('87');
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");

goTo.marker('88');
verify.quickInfoIs("number");
verify.memberListContains("s1", "number", "s1 is static property of c1");
verify.memberListContains("s2", "(b: number) => number", "static sum with property");
verify.memberListContains("s3", "number", "static getter property\nsetter property");
verify.memberListContains("nc_s1", "number", "");
verify.memberListContains("nc_s2", "(b: number) => number", "");
verify.memberListContains("nc_s3", "number", "");

goTo.marker('89');
verify.quickInfoIs("(b: number) => number");

goTo.marker('90');
verify.quickInfoIs("(b: number) => number");

goTo.marker('91');
verify.quickInfoIs("number");

goTo.marker('92');
verify.currentSignatureHelpDocCommentIs("static sum with property");
verify.currentParameterHelpArgumentDocCommentIs("number to add");

goTo.marker('93');
verify.quickInfoIs("number");
goTo.marker('94');
verify.quickInfoIs("number");
goTo.marker('95');
verify.quickInfoIs("number");
goTo.marker('96');
verify.quickInfoIs("number");

goTo.marker('97');
verify.quickInfoIs("number");

goTo.marker('98');
verify.quickInfoIs("number");

goTo.marker('99');
verify.quickInfoIs("(b: number) => number");

goTo.marker('100');
verify.quickInfoIs("(b: number) => number");

goTo.marker('101');
verify.quickInfoIs("number");

goTo.marker('102');
verify.currentSignatureHelpDocCommentIs("");
verify.currentParameterHelpArgumentDocCommentIs("");

goTo.marker('103');
verify.quickInfoIs("number");
goTo.marker('104');
verify.quickInfoIs("number");
goTo.marker('105');
verify.quickInfoIs("number");
goTo.marker('106');
verify.quickInfoIs("number");

goTo.marker('107');
verify.quickInfoIs("{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }\nThis is comment for c1");

goTo.marker('108');
verify.quickInfoIs("{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }\nThis is comment for c1");

goTo.marker('109');
verify.completionListContains("c1", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "This is comment for c1");
verify.completionListContains("i1", "c1", "");
verify.completionListContains("i1_p", "number", "");
verify.completionListContains("i1_f", "(b: number) => number", "");
verify.completionListContains("i1_r", "number", "");
verify.completionListContains("i1_prop", "number", "");
verify.completionListContains("i1_nc_p", "number", "");
verify.completionListContains("i1_ncf", "(b: number) => number", "");
verify.completionListContains("i1_ncr", "number", "");
verify.completionListContains("i1_ncprop", "number", "");
verify.completionListContains("i1_s_p", "number", "");
verify.completionListContains("i1_s_f", "(b: number) => number", "");
verify.completionListContains("i1_s_r", "number", "");
verify.completionListContains("i1_s_prop", "number", "");
verify.completionListContains("i1_s_nc_p", "number", "");
verify.completionListContains("i1_s_ncf", "(b: number) => number", "");
verify.completionListContains("i1_s_ncr", "number", "");
verify.completionListContains("i1_s_ncprop", "number", "");
verify.completionListContains("i1_c", "{ s1: number; s2(b: number): number; s3: number; nc_s1: number; nc_s2(b: number): number; nc_s3: number; new(): c1; }", "");

goTo.marker('110');
verify.quickInfoIs("number");
verify.memberListContains("p1", "number", "getter only property");
verify.memberListContains("p2", "number", "setter only property");
verify.memberListContains("nc_p1", "number", "");
verify.memberListContains("nc_p2", "number", "");

goTo.marker('111');
verify.quickInfoIs("number");
goTo.marker('112');
verify.quickInfoIs("number");
goTo.marker('113');
verify.quickInfoIs("number");