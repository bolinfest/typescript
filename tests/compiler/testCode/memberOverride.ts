// test case for #17337
// Should compile, since the second declaration of a overrides the first
var x = {
    a: "", 
    a: 5
}

var n: number = x.a;