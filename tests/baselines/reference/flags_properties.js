[test_input.js]
var MyClass = (function () {
    function MyClass() { }
    Object.defineProperty(MyClass.prototype, "Count", {
        get: function () {
            return 42;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    return MyClass;
})();
//@ sourceMappingURL=test_input.js.map

[test_input.js.map]
{"version":3,"file":"test_input.js","sources":["test_input.ts"],"names":["MyClass","MyClass.constructor","MyClass.get_Count","MyClass.set_Count"],"mappings":"AAAA;IAKAA;AAWCA,IATGA;QAAAA,KAAAA;YAEIE,OAAOA,EAAEA,CAACA;QACdA,CAACA;QAEDF,KAAAA,UAAiBA,KAAaA;QAG9BG,CAACA;;;;AALAH,IAMLA;AAACA,CAAAA,IAAA;AAAA"}
[test_input.d.ts]
class MyClass {
    public Count : number;
}

