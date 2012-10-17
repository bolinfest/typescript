(function (TopLevelModule1) {
    (function (SubModule1) {
        (function (SubSubModule1) {
            var ClassA = (function () {
                function ClassA() { }
                ClassA.prototype.AisIn1_1_1 = function () {
                    var a1;
                    a1.AisIn1_1_1();
                    var a2;
                    a2.AisIn1_1_1();
                    var a3;
                    a3.AisIn1_1_1();
                    var a4;
                    a4.AisIn1_1_1();
                    var b1;
                    b1.BisIn1_1_1();
                    var b2;
                    b2.BisIn1_1_1();
                    var c1;
                    c1.AisIn1_2_2();
                    var d1;
                    d1.XisIn1_1_1();
                    var d2;
                    d2.XisIn1_1_1();
                };
                return ClassA;
            })();
            SubSubModule1.ClassA = ClassA;            
            var ClassB = (function () {
                function ClassB() { }
                ClassB.prototype.BisIn1_1_1 = function () {
                    var a1;
                    a1.AisIn1_1_1();
                    var a2;
                    a2.AisIn1_1_1();
                    var a3;
                    a3.AisIn1_1_1();
                    var a4;
                    a4.AisIn1_1_1();
                    var b1;
                    b1.BisIn1_1_1();
                    var b2;
                    b2.BisIn1_1_1();
                    var c1;
                    c1.AisIn1_2_2();
                    var c2;
                    c2.AisIn2_3();
                    var d1;
                    d1.XisIn1_1_1();
                    var d2;
                    d2.XisIn1_1_1();
                };
                return ClassB;
            })();
            SubSubModule1.ClassB = ClassB;            
            var NonExportedClassQ = (function () {
                function NonExportedClassQ() {
function QQ() {
                        var a4;
                        a4.AisIn1_1_1();
                        var c1;
                        c1.AisIn1_2_2();
                        var d1;
                        d1.XisIn1_1_1();
                        var c2;
                        c2.AisIn2_3();
                    }
                }
                return NonExportedClassQ;
            })();            
        })(SubModule1.SubSubModule1 || (SubModule1.SubSubModule1 = {}));
        var SubSubModule1 = SubModule1.SubSubModule1;
        var ClassA = (function () {
            function ClassA() {
function AA() {
                    var a2;
                    a2.AisIn1_1_1();
                    var a3;
                    a3.AisIn1_1_1();
                    var a4;
                    a4.AisIn1_1_1();
                    var d2;
                    d2.XisIn1_1_1();
                }
            }
            return ClassA;
        })();        
    })(TopLevelModule1.SubModule1 || (TopLevelModule1.SubModule1 = {}));
    var SubModule1 = TopLevelModule1.SubModule1;
    (function (SubModule2) {
        (function (SubSubModule2) {
            var ClassA = (function () {
                function ClassA() { }
                ClassA.prototype.AisIn1_2_2 = function () {
                };
                return ClassA;
            })();
            SubSubModule2.ClassA = ClassA;            
            var ClassB = (function () {
                function ClassB() { }
                ClassB.prototype.BisIn1_2_2 = function () {
                };
                return ClassB;
            })();
            SubSubModule2.ClassB = ClassB;            
            var ClassC = (function () {
                function ClassC() { }
                ClassC.prototype.CisIn1_2_2 = function () {
                };
                return ClassC;
            })();
            SubSubModule2.ClassC = ClassC;            
        })(SubModule2.SubSubModule2 || (SubModule2.SubSubModule2 = {}));
        var SubSubModule2 = SubModule2.SubSubModule2;
    })(TopLevelModule1.SubModule2 || (TopLevelModule1.SubModule2 = {}));
    var SubModule2 = TopLevelModule1.SubModule2;
    var ClassA = (function () {
        function ClassA() { }
        ClassA.prototype.AisIn1 = function () {
        };
        return ClassA;
    })();    
    var NotExportedModule;
    (function (NotExportedModule) {
        var ClassA = (function () {
            function ClassA() { }
            return ClassA;
        })();
        NotExportedModule.ClassA = ClassA;        
    })(NotExportedModule || (NotExportedModule = {}));
})(exports.TopLevelModule1 || (exports.TopLevelModule1 = {}));
var TopLevelModule1 = exports.TopLevelModule1;
var TopLevelModule2;
(function (TopLevelModule2) {
    (function (SubModule3) {
        var ClassA = (function () {
            function ClassA() { }
            ClassA.prototype.AisIn2_3 = function () {
            };
            return ClassA;
        })();
        SubModule3.ClassA = ClassA;        
    })(TopLevelModule2.SubModule3 || (TopLevelModule2.SubModule3 = {}));
    var SubModule3 = TopLevelModule2.SubModule3;
})(TopLevelModule2 || (TopLevelModule2 = {}));