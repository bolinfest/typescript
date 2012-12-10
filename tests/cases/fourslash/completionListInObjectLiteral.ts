/// <reference path="fourslash.ts" />

////interface point {
////    x: number;
////    y: number;
////}
////interface thing {
////    name: string;
////    pos: point;
////}
////var t: thing;
////t.pos = { x: 4, y: 3 + t./**/ };

// Bug 548885: Incorrect member listing in object literal
goTo.marker();
verify.memberListContains('x');
verify.not.memberListContains('name');
// verify.not.memberListContains('x');
// verify.memberListContains('name');