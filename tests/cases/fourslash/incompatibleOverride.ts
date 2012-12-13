/// <reference path="fourslash.ts"/>

// Squiggle for implementing a derived class with an incompatible override is too large

//// class Foo { xyz: string; }
//// class Bar extends Foo { /*1*/xyz/*2*/: number; }

verify.errorExistsBetweenMarkers('1', '2');
verify.numberOfErrorsInCurrentFile(1);