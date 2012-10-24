/// <reference path="fourslash.ts"/>
//function a(/*1*/.../*2*/) {}   // BUG 17898: Error info should be between *1* and *2* markers, but is as per line below.
////function b(.../*1*/)/*2*/ {}  

verify.errorExistsBetweenMarkers('1', '2');