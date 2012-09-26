"use strict";
var Test;
(function (Test) {
    var Gar = (function () {
        function Gar() {
            this.moo = 0;
        }
        return Gar;
    })();
    Test.Gar = Gar;    
})(Test || (Test = {}));