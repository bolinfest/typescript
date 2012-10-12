///<reference path="..\..\src\harness\harness.ts" />

describe('Compiling samples', function() {
    function loadSample(path: string) {
        return IO.readFile(Harness.userSpecifiedroot + "samples\\" + path);
    }

    // d3
    it('compiles the d3 sample without error', function() {
        var src = loadSample("d3\\data.ts");
        var types = loadSample("d3\\d3types.ts");
        
        Harness.Compiler.compileUnits(function(result) {
            assert.equal(result.errors.length, 0);
        }, function () { 
            Harness.Compiler.addUnit(src);
            Harness.Compiler.addUnit(types);
        });
    });

    // greeter
    it('compiles greeter without error', function() {

        var src = loadSample("greeter\\greeter.ts");
        Harness.Compiler.compileString(src, 'greeter.ts', function(result) {          
            assert.equal(result.errors.length, 0);
        });
       
    });
    
    // imageboard
    it('compiles the imageboard sample without error', function () {
        /*var node = loadSample("node\\node.d.ts");
        var imgBoard = loadSample("imageboard\\app.ts");
        var db = loadSample("imageboard\\db.ts");
        var express = loadSample("imageboard\\express.d.ts");
        var mongodb = loadSample("imageboard\\mongodb.ts");
        var routes = loadSample("imageboard\\routes\\index.ts");
        
        Harness.Compiler.addUnit(node);
        Harness.Compiler.addUnit(mongodb);
        Harness.Compiler.addUnit(db);
        Harness.Compiler.addUnit(express);
        Harness.Compiler.addUnit(routes);
        Harness.Compiler.addUnit(imgBoard);
        
        Harness.Compiler.compileUnits(function (result) {
            WScript.Echo(result.errors);
            assert.equal(result.errors.length, 0);
        });
        */
    });

    // interfaces
    it('compiles the interfaces sample without error', function () {
        var interfaces = loadSample("interfaces\\interfaces.ts");

        Harness.Compiler.compileUnits(function (result) {
            assert.equal(result.errors.length, 0);
        }, function () {
            Harness.Compiler.addUnit(interfaces);
        });
    });

    // jquery
    it('compiles the jquery sample without error', function () {
        var scroller = loadSample("jquery\\parallax.ts");
        var lib = loadSample("jquery\\jquery.d.ts");

        Harness.Compiler.compileUnits(function (result) {
            assert.equal(result.errors.length, 0);
        }, function () { 
            Harness.Compiler.addUnit(lib, false, true);
            Harness.Compiler.addUnit(scroller);
        });
    });

    // mankala
    it('compiles the mankala sample without error', function() {
        var base = loadSample("mankala\\Base.ts");
        var driver = loadSample("mankala\\Driver.ts");
        var features = loadSample("mankala\\Features.ts");
        var game = loadSample("mankala\\Game.ts");
        var geometry = loadSample("mankala\\Geometry.ts");
        var position = loadSample("mankala\\Position.ts");
        
        Harness.Compiler.compileUnits(function(result) {
            assert.arrayLengthIs(result.errors, 0);
        }, function () { 
            Harness.Compiler.addUnit(base);
            Harness.Compiler.addUnit(driver);
            Harness.Compiler.addUnit(features);
            Harness.Compiler.addUnit(game);
            Harness.Compiler.addUnit(geometry);
            Harness.Compiler.addUnit(position);
        });
    });

    // node
    it('compiles the node sample-1 without error', function () {
        var HttpServer = loadSample("node\\HttpServer.ts");
        var lib = loadSample("node\\node.d.ts");
        
        Harness.Compiler.compileUnits(function (result) {
            assert.equal(result.errors.length, 0);
        }, function () { 
            Harness.Compiler.addUnit(lib, false, true);
            Harness.Compiler.addUnit(HttpServer);
        });
    });

    it('compiles the node sample-2 without error', function () {
        var HttpServer = loadSample("node\\TcpServer.ts");
        var lib = loadSample("node\\node.d.ts");
        
        Harness.Compiler.compileUnits(function (result) {
            assert.equal(result.errors.length, 0);
        }, function () { 
            Harness.Compiler.addUnit(lib, false, true);
            Harness.Compiler.addUnit(HttpServer);
        });
    });

    // raytracer
    it('compiles raytracer without error', function() {
        var src = "..//samples//raytracer//raytracer.ts";

        Harness.Compiler.compileUnit(src, function(result) {
            assert.equal(result.errors.length, 0);
        });    
    });

    // simple
    it('compiles simple without error', function() {
        var src =  "..//samples//simple//animals.ts";
        
        Harness.Compiler.compileUnit(src, function(result) {
            assert.equal(result.errors.length, 0);
        });
    });

    // todomvc
    it('compiles the todo mvc sample without error', function() {
        var src =  "..//samples//todomvc//js//todos.ts";
        
        Harness.Compiler.compileUnit(src, function(result) {
            assert.equal(result.errors.length, 0);
        });
    });

    // warship
    it('compiles warship combat without error', function() {
        var src = loadSample("warship\\warship.ts");
        var lib = loadSample("warship\\jquery.d.ts");
        var uilib = loadSample("warship\\jqueryui.d.ts");

        Harness.Compiler.compileUnits(function (result) {
            assert.equal(result.errors.length, 0);
        }, function () { 
            Harness.Compiler.addUnit(lib);
            Harness.Compiler.addUnit(uilib);
            Harness.Compiler.addUnit(src);
        });
    });

    // win8
    it('compiles the win8 sample without error', function() {
        var units = [
            loadSample("win8\\encyclopedia\\Encyclopedia\\js\\data.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\default.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\groupDetailPage.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\groupedItemsPage.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\itemDetailPage.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\navigator.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\topic.ts")
          , loadSample("win8\\encyclopedia\\Encyclopedia\\js\\win.ts")
        ]
        
        Harness.Compiler.compileUnits(function(result) {
            assert.equal(result.errors.length, 0);
        }, function () { 
            Harness.Compiler.addUnit(IO.readFile(Harness.userSpecifiedroot + "typings\\winrt.d.ts"), true, true);
            Harness.Compiler.addUnit(IO.readFile(Harness.userSpecifiedroot + "typings\\winjs.d.ts"), true, true);

            for (var i = 0; i < units.length; i++) {
                Harness.Compiler.addUnit(units[i], true);
            }
        });
        
    });
});
