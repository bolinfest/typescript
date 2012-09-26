var M;
(function (M) {
    var test1 = x;
    var test2 = y;
})(M || (M = {}));

var N;
(function (N) {
    var test3 = M.y;
    var test4 = M.z;
})(N || (N = {}));
