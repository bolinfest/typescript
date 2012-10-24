// Regression test for bug 16104
module Variables{
    var x = function bar(a, b, c) {
    }
    x(1, 2, 3);
}
