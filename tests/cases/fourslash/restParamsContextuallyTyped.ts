/// <reference path='fourslash.ts' />

////var foo: Function = function (a/*1*/, b/*2*/, c/*3*/) { };

goTo.marker('1');
verify.quickInfoIs('any');
goTo.marker('2');
verify.quickInfoIs('any');
goTo.marker('3');
verify.quickInfoIs('any');
