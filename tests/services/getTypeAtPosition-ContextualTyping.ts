///<reference path='_project.ts'/>

describe('Contextual typed literals with getTypeAtPosition', function() {
    var typescriptLS = new Harness.TypeScriptLS();
    
    typescriptLS.addDefaultLibrary();
    
    var fileName = 'compiler\\testCode\\contextualTyping.ts';
    typescriptLS.addFile(fileName);
    
    var ls = typescriptLS.getLanguageService();
    
    function lineToOffset(line: number, col = 0) {
        var script: TypeScript.Script = ls.languageService.getScriptAST(fileName);
        return script.locationInfo.lineMap[line] + col;
    }
    
    function getTypeAtPosition(fileName, pos): string {
        return TypeScript.MemberName.memberNameToString(ls.languageService.getTypeAtPosition(fileName, pos).memberName);
    }

    describe('in class property decls', function() {
        it('contextually types a function literal with different arity', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(15, 58)), '(i: number,s: string) => number');
            
            // parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(15, 53)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(16, 15)), 'number');
        });
    });
    
    describe('in module property decls', function() {
        it('contextually types a function literal with different arity', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(22, 60)), '(i: number,s: string) => number');
            
            // parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(22, 64)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(23, 15)), 'number');
        });
    });
    
    describe('in variable decls', function() {
        it('does not contextually type inside a parenthesized expression', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(28, 40)), '(s: any) => any');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(28, 44)), 'any');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(28, 56)), 'any');
        });
        
        
        it('contextually types object literals to interfaces', function() {
            // Object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(29, 16)), 'IFoo');
            
            // Property
            assert.equal(getTypeAtPosition(fileName, lineToOffset(30, 4)), '{ n: number; }');
        });
        
        it('contextually types array literals', function() {
            // Array literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(32, 21)), 'number[]');
        });
        
        it('contextually types a function literal with zero parameters', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(33, 28)), '() => IFoo');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(33, 43)), 'IFoo');
        });
        
        it('contextually types a function literal with one parameter', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(34, 37)), '(n: number) => IFoo');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(34, 41)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(34, 53)), 'IFoo');
        });
        
        it('contextually types a function literal with two parameters', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(35, 47)), '(n: number,s: string) => IFoo');
            
            // Parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(35, 52)), 'number');
            
            // Parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(35, 55)), 'string');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(35, 67)), 'IFoo');
        });
        
        it('does not contextually type a function literal to an overloaded function', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(39, 8)), '{ (n: any): number; (s1: any): number; }');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(39, 13)), 'any');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(39, 25)), 'any');
        });
        
        
        it('contextually types a function literal with different arity than the target', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(41, 49)), '(n: number,s: string) => number');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(41, 54)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(41, 66)), 'number');
        });
        
        it('contextually types a nested array', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(42, 23)), 'number[][]');
            
            // inner array 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(42, 24)), 'number[]');
            
            // inner array 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(42, 27)), 'number[]');
        });
        
        it('contextually types object literals inside arrays', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(43, 20)), 'IFoo[]');
            
            // inner object 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(43, 21)), 'IFoo');
            
            // inner object 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(43, 24)), 'IFoo');
        });
        
        it('contextually types function literals inside arrays', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(44, 49)), '{ (n: number,s: string): string; }[]');
            
            // inner function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(44, 53)), '(n: number,s: string) => string');
            
            // inner parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(44, 59)), 'number');
            
            // inner parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(44, 62)), 'string');
            
            // inner return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(44, 74)), 'string');
        });
        
        it('contextually types nested object', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(45, 18)), 'IBar');
            
            // outer property foo
            assert.equal(getTypeAtPosition(fileName, lineToOffset(46, 6)), 'IFoo');
            
            // inner literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(46, 9)), 'IFoo');
        });
        
        it('contextually types functions in objects', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(48, 16)), 'IFoo');
            
            // outer property f
            assert.equal(getTypeAtPosition(fileName, lineToOffset(49, 4)), '{ f: (i: any,s: any) => any; }');
            
            // inner function literal
            // Note: this is not '(i: number,s: string) => string', since we're using a type assertion
            assert.equal(getTypeAtPosition(fileName, lineToOffset(49, 12)), '(i: any,s: any) => any');
            
            // inner function parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(49, 16)), 'any');
            
            // inner function parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(49, 19)), 'any');
            
            // inner function return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(49, 31)), 'any');
        });
        
        it('contextually types arrays in objects', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(51, 16)), 'IFoo');
            
            // outer property a
            assert.equal(getTypeAtPosition(fileName, lineToOffset(52, 4)), '{ a: any[]; }');
            
            // inner literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(52, 7)), 'any[]');
        });
    });
    
    describe('in class property assignments', function() {
        it('contextually types a function literal with same arity', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(59, 20)), '(i: number,s: string) => string');
            
            // parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(59, 28)), 'number');
            
            // parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(59, 31)), 'string');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(60, 19)), 'string');
        });
    });
    
    describe('in module property assignments', function() {
        it('contextually types a function literal with same arity', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(68, 15)), '(i: number,s: string) => string');
            
            // parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(68, 19)), 'number');
            
            // parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(68, 22)), 'string');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(69, 15)), 'string');
        });
    });
    
    describe('in variable assignments', function() {
        it('contextually types a function literal with one parameter', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(75, 31)), '(n: number) => IFoo');
            
            // parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(75, 16)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(75, 28)), '(n: number) => IFoo');
        });
    });
    
    describe('in array index assignments', function() {
        it('contextually types an object to an interface', function() {
            // object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(79, 10)), 'IFoo');

            // object literal property
            assert.equal(getTypeAtPosition(fileName, lineToOffset(79, 11)), 'IFoo');
        });
    });
    
    describe('in object property assignments', function() {
        it('does not contextually type inside a parenthesized expression', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(122, 17)), '(s: any) => any');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(122, 21)), 'any');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(122, 33)), 'any');
        });
        
        
        it('contextually types object literals to interfaces', function() {
            // Object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(123, 11)), 'IFoo');
            
            // Property
            assert.equal(getTypeAtPosition(fileName, lineToOffset(124, 4)), '{ n: number; }');
        });
        
        it('contextually types array literals', function() {
            // Array literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(126, 11)), 'number[]');
        });
        
        it('contextually types a function literal with zero parameters', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(127, 16)), '() => IFoo');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(127, 31)), 'IFoo');
        });
        
        it('contextually types a function literal with one parameter', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(128, 16)), '(n: number) => IFoo');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(128, 20)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(128, 32)), 'IFoo');
        });
        
        it('contextually types a function literal with two parameters', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(129, 16)), '(n: number,s: string) => IFoo');
            
            // Parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(129, 20)), 'number');
            
            // Parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(129, 23)), 'string');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(129, 35)), 'IFoo');
        });
        
        it('does not contextually type a function literal to an overloaded function', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(130, 16)), '(n: number,s: string) => number');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(130, 20)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(130, 40)), 'number');
        });
        
        it('contextually types a function literal with different arity than the target', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(132, 16)), '(n: number,s: string) => number');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(132, 20)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(132, 32)), 'number');
        });
        
        it('contextually types a nested array', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(133, 11)), 'number[][]');
            
            // inner array 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(133, 12)), 'number[]');
            
            // inner array 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(133, 15)), 'number[]');
        });
        
        it('contextually types object literals inside arrays', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(134, 12)), 'IFoo[]');
            
            // inner object 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(134, 13)), 'IFoo');
            
            // inner object 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(134, 16)), 'IFoo');
        });
        
        it('contextually types function literals inside arrays', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(135, 12)), '{ (n: number,s: string): string; }[]');
            
            // inner function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(135, 18)), '(n: number,s: string) => string');
            
            // inner parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(135, 22)), 'number');
            
            // inner parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(135, 25)), 'string');
            
            // inner return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(135, 37)), 'string');
        });
        
        it('contextually types nested object', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(136, 12)), 'IBar');
            
            // outer property foo
            assert.equal(getTypeAtPosition(fileName, lineToOffset(137, 6)), 'IFoo');
            
            // inner literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(137, 9)), 'IFoo');
        });
        
        it('contextually types functions in objects', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(139, 16)), 'IFoo');
            
            // outer property f
            assert.equal(getTypeAtPosition(fileName, lineToOffset(140, 4)), '{ f: (i: any,s: any) => any; }');
            
            // inner function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(140, 12)), '(i: any,s: any) => any');
            
            // inner function parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(140, 16)), 'any');
            
            // inner function parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(140, 19)), 'any');
            
            // inner function return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(140, 31)), 'any');
        });
        
        it('contextually types arrays in objects', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(142, 12)), 'IFoo');
            
            // outer property a
            assert.equal(getTypeAtPosition(fileName, lineToOffset(143, 4)), '{ a: any[]; }');
            
            // inner literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(143, 7)), 'any[]');
        });
    });
    
    describe('in a function call', function() {
        it('contextually types a function literal with one parameter', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(147, 10)), '(n: number) => IFoo');
            
            // parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(147, 14)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(148, 11)), 'IFoo');
        });
    });
    
    describe('in a return statement call', function() {
        it('contextually types a function literal with one parameter', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(152, 65)), '(n: number) => IFoo');
            
            // parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(152, 68)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(152, 80)), 'IFoo');
        });
    });
    
    describe('in a new expression', function() {
        it('contextually types a function literal with one parameter', function() {
            // function itself
            assert.equal(getTypeAtPosition(fileName, lineToOffset(156, 22)), '(n: number) => IFoo');
            
            // parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(156, 27)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(156, 39)), 'IFoo');
        });
    });
     
    describe('in type annotated expressions', function() {
        it('does not contextually type inside a parenthesized expression', function() {
            // function itself
            // We have param and return types of 'string' and not 'any' because the type assertion
            // sets the type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(159, 42)), '(s: any) => any');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(159, 46)), 'any');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(159, 58)), 'any');
        });
        
        
        it('contextually types object literals to interfaces', function() {
            // Object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(160, 16)), 'IFoo');
            
            // Property
            assert.equal(getTypeAtPosition(fileName, lineToOffset(161, 4)), '{ n: number; }');
        });
        
        it('contextually types array literals', function() {
            // Array literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(161, 23)), 'number[]');
        });
        
        it('contextually types a function literal with zero parameters', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(164, 30)), '() => IFoo');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(164, 45)), 'IFoo');
        });
        
        it('contextually types a function literal with one parameter', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(165, 38)), '(n: number) => IFoo');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(165, 43)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(165, 55)), 'IFoo');
        });
        
        it('contextually types a function literal with two parameters', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(166, 50)), '(n: number,s: string) => IFoo');
            
            // Parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(166, 54)), 'number');
            
            // Parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(166, 57)), 'string');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(166, 69)), 'IFoo');
        });
        
        it('does not contextually type a function literal to an overloaded function', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(170, 8)), '(n: number) => number');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(170, 12)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(170, 31)), 'number');
        });
        
        it('contextually types a function literal with different arity than the target', function() {
            // Function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(172, 52)), '(n: number) => number');
            
            // Parameter
            assert.equal(getTypeAtPosition(fileName, lineToOffset(172, 56)), 'number');
            
            // Return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(172, 68)), 'number');
        });
        
        it('contextually types a nested array', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(173, 25)), 'number[][]');
            
            // inner array 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(173, 26)), 'number[]');
            
            // inner array 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(173, 29)), 'number[]');
        });
        
        it('contextually types object literals inside arrays', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(174, 22)), 'IFoo[]');
            
            // inner object 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(174, 23)), 'IFoo');
            
            // inner object 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(174, 26)), 'IFoo');
        });
        
        it('contextually types function literals inside arrays', function() {
            // outer array
            assert.equal(getTypeAtPosition(fileName, lineToOffset(175, 51)), '{ (n: number,s: string): string; }[]');
            
            // inner function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(175, 56)), '(n: number,s: string) => string');
            
            // inner parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(175, 61)), 'number');
            
            // inner parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(175, 64)), 'string');
            
            // inner return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(175, 76)), 'string');
        });
        
        it('contextually types nested object', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(176, 20)), '{ foo: IFoo; }');
            
            // outer property foo
            assert.equal(getTypeAtPosition(fileName, lineToOffset(177, 6)), 'IFoo');
            
            // inner literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(177, 9)), 'IFoo');
        });
        
        it('contextually types functions in objects', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(179, 16)), 'IFoo');
            
            // outer property f
            assert.equal(getTypeAtPosition(fileName, lineToOffset(180, 4)), '{ f: (i: any,s: any) => any; }');
            
            // inner function literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(180, 12)), '(i: any,s: any) => any');
            
            // inner function parameter 1
            assert.equal(getTypeAtPosition(fileName, lineToOffset(180, 16)), 'any');
            
            // inner function parameter 2
            assert.equal(getTypeAtPosition(fileName, lineToOffset(180, 19)), 'any');
            
            // inner function return type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(180, 31)), 'any');
        });
        
        it('contextually types arrays in objects', function() {
            // outer literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(182, 16)), 'IFoo');
            
            // outer property a
            assert.equal(getTypeAtPosition(fileName, lineToOffset(183, 4)), '{ a: any[]; }');
            
            // inner literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(183, 7)), 'any[]');
        });
    });
    
    describe('from ambient declarations', function() {
        it('contextually types a function declaration', function() {
            // type of the function
            assert.equal(getTypeAtPosition(fileName, lineToOffset(190, 12)), '(a: number,b: number) => number');
            
            // type of param 'a'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(191, 13)), 'number');
            
            // type of param 'b'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(191, 15)), 'number');
        });
        it('contextually types a class declaration', function() {
            // constructor function type
            assert.equal(getTypeAtPosition(fileName, lineToOffset(207, 12)), '{ origin: Point; new(x: number,y: number): Point; }');
            
            // constructor param x
            assert.equal(getTypeAtPosition(fileName, lineToOffset(207, 15)), 'number');
            
            // constructor param y
            assert.equal(getTypeAtPosition(fileName, lineToOffset(207, 18)), 'number');
            
            // constructor 'this' pointer
            assert.equal(getTypeAtPosition(fileName, lineToOffset(208, 7)), 'any');
            
            // constructor 'this.x'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(208, 11)), 'number');
            
            // constructor 'this.y'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(209, 11)), 'number');
            
            // constructor type in 'new' expression
            assert.equal(getTypeAtPosition(fileName, lineToOffset(212, 21)), '{ origin: Point; new(x: number,y: number): Point; }');
            
            // target type function on assignment to 'add'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(214, 25)), '(dx: number,dy: number) => Point');            
            
            // target type of 'add' in object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(221, 6)), '(dx: number,dy: number) => Point');
            
            // target type of add's 'dx' argument in object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(221, 19)), 'number');
            
            // target type of add's 'dy' argument in object literal
            assert.equal(getTypeAtPosition(fileName, lineToOffset(221, 23)), 'number');
            
        });
        it('contextually types a lambda to a library function', function() {
            // type of function
            assert.equal(getTypeAtPosition(fileName, lineToOffset(227, 25)), '(ev: MouseEvent) => any');
            
            // type of function param 'ev'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(227, 31)), 'MouseEvent');
            
            // type of 'ev.bubbles'
            assert.equal(getTypeAtPosition(fileName, lineToOffset(228, 10)), 'bool');
        });        
    });        
});