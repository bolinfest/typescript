///<reference path='..\..\..\..\src\harness\harness.ts'/>

describe("Assignment compatibility", function() {
    var typeFactory = new Harness.Compiler.TypeFactory();

    var any     = typeFactory.any;
    var number  = typeFactory.number;
    var string  = typeFactory.string;
    var bool    = typeFactory.bool;

    var anyArray     = typeFactory.get('var arr = []', 'arr');
    var someFunction = typeFactory.get('function f() {}', 'f');
    var someObject   = typeFactory.get('var obj = {one: 1}', 'obj');
    var someClass    = typeFactory.get('class Foo {};', 'Foo');
    var someInstance = typeFactory.get('class Foo {}; var f = new Foo();', 'f');

    describe("any type", function() {
        it("is assignment compatible with everything", function() {
            any.assertAssignmentCompatibleWith([
                any,
                number,
                string,
                anyArray,
                someFunction,
                someObject,
                someClass,
                someInstance
            ]);
        });
    });

    describe("number type", function() {
        it("is assignment compatible with any and number", function() {
            number.assertAssignmentCompatibleWith([any, number]);
        });

        it("is not assignment compatible with anything else", function() {
            number.assertNotAssignmentCompatibleWith([
                string,
                bool,
                anyArray,
                someFunction,
                someObject,
                someClass,
                someInstance
            ]);
        });
    });

    describe("bool type", function() {
        it("is assignment compatible with any and bool", function() {
            bool.assertAssignmentCompatibleWith([any, bool]);
        });

        it("is not assignment compatible with anything else", function() {
            bool.assertNotAssignmentCompatibleWith([
                string,
                number,
                anyArray,
                someFunction,
                someObject,
                someClass,
                someInstance
            ]);
        });
    });

    describe("string type", function() {
        it("is assignment compatible with any and string", function() {
            string.assertAssignmentCompatibleWith([any, string]);
        });

        it("is not assignment compatible with anything else", function() {
            string.assertNotAssignmentCompatibleWith([
                bool,
                number,
                anyArray,
                someFunction,
                someObject,
                someClass,
                someInstance
            ]);
        });
    });


    describe("array type", function() {
        var boolArray   = typeFactory.get('var arr : bool[]', 'arr');
        var numberArray = typeFactory.get('var arr : number[]', 'arr');
        var stringArray = typeFactory.get('var arr : string[]', 'arr');
        var funcArray   = typeFactory.get('var f : () => void = null; var arr = [f];', 'arr');
        var objectArray = typeFactory.get('var o ={one: 1}; var arr = [o];', 'arr');
        var instanceArray = typeFactory.get('class Foo {}; var arr : Foo[];', 'arr');
        var classArray = typeFactory.get('class Foo {}; var arr = [Foo]', 'arr');

        describe("any[]", function() {
            it("is assignment compatible with any and all arrays", function() {
                anyArray.assertAssignmentCompatibleWith([
                    any,
                    anyArray,
                    boolArray,
                    numberArray,
                    stringArray,
                    funcArray,
                    objectArray,
                    instanceArray,
                    funcArray,
                    objectArray,
                    instanceArray,
                    classArray
                ]);
            });

            it("is not assignment compatible with anything else", function() {
                anyArray.assertNotAssignmentCompatibleWith([
                    bool,
                    number,
                    string,
                    someFunction,
                    someObject,
                    someClass,
                    someInstance,
                    someObject,
                    someClass,
                    someInstance
                ]);
            });
        });

        describe("bool[]", function() {
            it("is assignment compatible with any, any arrays, and bool arrays", function() {
                boolArray.assertAssignmentCompatibleWith([any, boolArray, anyArray]);
            });

            it("is not assignment compatible with anything else", function() {
                boolArray.assertNotAssignmentCompatibleWith([
                    bool,
                    number,
                    string,
                    someFunction,
                    numberArray,
                    stringArray,
                    funcArray,
                    objectArray,
                    instanceArray,
                    someObject,
                    someClass,
                    someInstance,
                    classArray
                ]);
            });
        });

        describe("number[]", function() {
            it("is assignment compatible with any, any arrays, and number arrays", function() {
                numberArray.assertAssignmentCompatibleWith([any, numberArray, anyArray]);
            });

            it("is not assignment compatible with anything else", function() {
                numberArray.assertNotAssignmentCompatibleWith([
                    bool,
                    number,
                    string,
                    someFunction,
                    boolArray,
                    stringArray,
                    funcArray,
                    objectArray,
                    instanceArray,
                    someObject,
                    someClass,
                    someInstance,
                    classArray
                ]);
            });
        });

        describe("string[]", function() {
            it("is assignment compatible with any, any arrays, and string arrays", function() {
                stringArray.assertAssignmentCompatibleWith([any, stringArray, anyArray]);
            });

            it("is not assignment compatible with anything else", function() {
                stringArray.assertNotAssignmentCompatibleWith([
                    bool,
                    number,
                    string,
                    someFunction,
                    boolArray,
                    numberArray,
                    funcArray,
                    objectArray,
                    instanceArray,
                    someObject,
                    someClass,
                    someInstance,
                    classArray
                ]);
            });
        });
    });
    describe("Objects", function() {
        var singleObj = typeFactory.get('var obj = {one: 1}', 'obj');
        var callObj = typeFactory.get('var obj: { (a:string):string;}', 'obj');
        it("Properties with assign compat types", function() {
            singleObj.assertAssignmentCompatibleWith([
                typeFactory.get('var a:{};','a'), 
                typeFactory.get('var a:{one:number;};','a')
            ]);
        });  
        it("Properties not assignment compatible types", function() {
            singleObj.assertNotAssignmentCompatibleWith([
                typeFactory.get('var a:{one:string;};','a'),
                typeFactory.get('var a:{two:number;};','a')
            ]);
        });  
        it("Properties not assignment compatible types", function() {
            callObj.assertNotAssignmentCompatibleWith([
                typeFactory.get('var a:{};', 'a'),
                typeFactory.get('var a:{one:number;};', 'a'),
                typeFactory.get('var a:{[index:number];};', 'a'),
                typeFactory.get('var a:{ new (param: number); };', 'a')
            ]);
        });  
    });
});
