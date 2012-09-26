var M;
(function (M) {
    (function (Color) {
        Color._map = [];
        Color._map[0] = "Green";
        Color.Green = 0;
        Color._map[1] = "Blue";
        Color.Blue = 1;
        Color._map[2] = "Brown";
        Color.Brown = 2;
    })(M.Color || (M.Color = {}));
    var Color = M.Color;

    function CompareEyes(a, b) {
        return a.color - b.color;
    }
    M.CompareEyes = CompareEyes;
    function CompareYeux(a, b) {
        return a.coleur - b.coleur;
    }
    M.CompareYeux = CompareYeux;
    function test() {
        var x = new Array();
        var result = "";
        x[0] = {
            color: Color.Brown
        };
        x[1] = {
            color: Color.Blue
        };
        x[2] = {
            color: Color.Green
        };
        x = x.sort(CompareYeux);
        var z = x.sort(CompareEyes);
        for(var i = 0, len = z.length; i < len; i++) {
            result += ((Color._map[z[i].color]) + "\r\n");
        }
        var eeks = new Array();
        for(var j = z.length = 1; j >= 0; j--) {
            eeks[j] = z[j];
        }
        eeks = z;
        return result;
    }
    M.test = test;
})(M || (M = {}));

M.test();