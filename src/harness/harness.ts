// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\compiler\io.ts'/>
///<reference path='..\compiler\typescript.ts'/>
///<reference path='..\services\typescriptServices.ts' />
///<reference path='diff.ts'/>

declare var assert: Harness.IAssert;
declare var it;
declare var describe;
declare var run;
declare var IO: IIO;
declare var __dirname; // Node-specific

declare module process {
    export function nextTick(callback: () => any): void;
}

module Harness {
    var global = <any>Function("return this").call(null);
    export var userSpecifiedroot = "";

    export interface ITestMetadata {
        id: string;
        desc: string;
        pass: bool;
        perfResults: {
            mean: number;
            min: number;
            max: number;
            stdDev: number;
            trials: number[];
        };
    }

    export interface IScenarioMetadata {
        id: string;
        desc: string;
        pass: bool;
    }

    // Logger compatible with the Glue loggers.
    export interface ILogger {
        start: (fileName?: string, priority?: number) => void;
        end: (fileName?: string) => void;
        scenarioStart: (scenario: IScenarioMetadata) => void;
        scenarioEnd: (scenario: IScenarioMetadata, error?: Error) => void;
        testStart: (test: ITestMetadata) => void;
        pass: (test: ITestMetadata) => void;
        fail: (test: ITestMetadata) => void;
        error: (test: ITestMetadata, error: Error) => void;
        comment: (comment: string) => void;
        verify: (test: ITestMetadata, passed: bool, actual: any, expected: any, message: string) => void;
    }

    export class Logger implements ILogger {
        public start(fileName?: string, priority?: number) { }
        public end(fileName?: string) { }
        public scenarioStart(scenario: IScenarioMetadata) { }
        public scenarioEnd(scenario: IScenarioMetadata, error?: Error) { }
        public testStart(test: ITestMetadata) { }
        public pass(test: ITestMetadata) { }
        public fail(test: ITestMetadata) { }
        public error(test: ITestMetadata, error: Error) { }
        public comment(comment: string) { }
        public verify(test: ITestMetadata, passed: bool, actual: any, expected: any, message: string) { }
    }

    export module Perf {
        export module Clock {
            export var now: () => number;
            export var resolution: number;

            declare module WScript {
                export function InitializeProjection();
            }

            declare module TestUtilities {
                export function QueryPerformanceCounter(): number;
                export function QueryPerformanceFrequency(): number;
            }

            if (typeof WScript !== "undefined" && typeof global['WScript'].InitializeProjection !== "undefined") {
                // Running in JSHost.
                global['WScript'].InitializeProjection();

                now = function () {
                    return TestUtilities.QueryPerformanceCounter();
                }

                resolution = TestUtilities.QueryPerformanceFrequency();
            } else {
                now = function () {
                    return Date.now();
                }

                resolution = 1000;
            }
        }

        export class Timer {
            public startTime;
            public time = 0;

            public start() {
                this.time = 0;
                this.startTime = Clock.now();
            }

            public end() {
                // Set time to MS.
                this.time = (Clock.now() - this.startTime) / Clock.resolution * 1000;
            }
        }

        export class Dataset {
            public data: number[] = [];

            public add(value: number) {
                this.data.push(value);
            }

            public mean() {
                var sum = 0;
                for (var i = 0; i < this.data.length; i++) {
                    sum += this.data[i];
                }

                return sum / this.data.length;
            }

            public min() {
                var min = this.data[0];

                for (var i = 1; i < this.data.length; i++) {
                    if (this.data[i] < min) {
                        min = this.data[i];
                    }
                }

                return min;
            }

            public max() {
                var max = this.data[0];

                for (var i = 1; i < this.data.length; i++) {
                    if (this.data[i] > max) {
                        max = this.data[i];
                    }
                }

                return max;
            }

            public stdDev() {
                var sampleMean = this.mean();
                var sumOfSquares = 0;
                for (var i = 0; i < this.data.length; i++) {
                    sumOfSquares += Math.pow(this.data[i] - sampleMean, 2);
                }

                return Math.sqrt(sumOfSquares / this.data.length);
            }
        }

        // Base benchmark class with some defaults.
        export class Benchmark {
            public iterations = 10;
            public description = "";
            public bench(subBench?: () => void ) { };
            public before() { };
            public beforeEach() { };
            public after() { };
            public afterEach() { };
            public results: { [x:string]: Dataset; } = <{ [x:string]: Dataset; }>{};

            public addTimingFor(name: string, timing: number) {
                this.results[name] = this.results[name] || new Dataset();
                this.results[name].add(timing);
            }
        }

        export var benchmarks: { new (): Benchmark; }[] = [];

        var timeFunction: (
            benchmark: Benchmark,
            description?: string,
            name?: string,
            f?: (bench?: { (): void; }) => void
        ) => void;

        timeFunction = function (
            benchmark: Benchmark,
            description: string = benchmark.description,
            name: string = '',
            f = benchmark.bench
        ): void {

            var t = new Timer();
            t.start();

            var subBenchmark = function (name, f): void {
                timeFunction(benchmark, description, name, f);
            }

            f.call(benchmark, subBenchmark);

            t.end();

            benchmark.addTimingFor(name, t.time);
        }

        export function runBenchmarks() {
            for (var i = 0; i < benchmarks.length; i++) {
                var b = new benchmarks[i]();


                var t = new Timer();
                b.before();
                for (var j = 0; j < b.iterations; j++) {
                    b.beforeEach();
                    timeFunction(b);
                    b.afterEach();
                }
                b.after();

                for (var prop in b.results) {
                    var description = b.description + (prop ? ": " + prop : '');

                    emitLog('testStart', { desc: description });

                    emitLog('pass', {
                        desc: description, pass: true, perfResults: {
                            mean: b.results[prop].mean(),
                            min: b.results[prop].min(),
                            max: b.results[prop].max(),
                            stdDev: b.results[prop].stdDev(),
                            trials: b.results[prop].data
                        }
                    });
                }

            }
        }

        // Replace with better type when classes are assignment compatible with
        // the below type.
        // export function addBenchmark(BenchmarkClass: {new(): Benchmark;}) {
        export function addBenchmark(BenchmarkClass: any) {
            benchmarks.push(BenchmarkClass);
        }

    }

    // Compiles TypeScript code
    export module Compiler {
        // Aggregate various writes into a single array of lines. Useful for passing to the
        // TypeScript compiler to fill with source code or errors.
        export class WriterAggregator implements ITextWriter {
            public lines: string[] = [];
            public currentLine = "";

            public Write(str) {
                this.currentLine += str;
            }

            public WriteLine(str) {
                this.lines.push(this.currentLine + str);
                this.currentLine = "";
            }

            public Close() {
                this.lines.push(this.currentLine);
                this.currentLine = "";
            }

            public reset() {
                this.lines = [];
                this.currentLine = "";
            }
        }

        var libFolder: string = global['WScript'] ? TypeScript.filePath(global['WScript'].ScriptFullName) : (__dirname + '\\');
        export var libText = IO ? IO.readFile(libFolder + "lib.d.ts") : '';

        var stdout = new WriterAggregator();
        var stderr = new WriterAggregator();
        var currentUnit = 0;
        var maxUnit = 0;

        export var compiler: TypeScript.TypeScriptCompiler;
        recreate();


        export class Type {
            constructor (public type, public code, public identifier) { }

            public normalizeToArray(arg: any) {
                if ((Array.isArray && Array.isArray(arg)) || arg instanceof Array)
                    return arg;

                return [arg];
            }

            public compilesOk(testCode): bool {
                var errors = null;
                compileString(testCode, 'test.ts', function (compilerResult) {
                    errors = compilerResult.errors;
                })

                return errors.length === 0;
            }

            public isSubtypeOf(other: Type) {
                var testCode = 'class __test1__ {\n';
                testCode += '    public test() {\n';
                testCode += '        ' + other.code + ';\n';
                testCode += '        return ' + other.identifier + ';\n';
                testCode += '    }\n';
                testCode += '}\n';
                testCode += 'class __test2__ extends __test1__ {\n';
                testCode += '    public test() {\n';
                testCode += '        ' + this.code + ';\n';
                testCode += '        return ' + other.identifier + ';\n';
                testCode += '    }\n';
                testCode += '}\n';

                return this.compilesOk(testCode);
            }

            // TODO: Find an implementation of isIdenticalTo that works.
            public isIdenticalTo(other: Type) {
                var testCode = 'module __test1__ {\n';
                testCode += '    ' + this.code + ';\n';
                testCode += '    export var __val__ = ' + this.identifier + ';\n';
                testCode += '}\n';
                testCode += 'var __test1__val__ = __test1__.__val__;\n';

                testCode += 'module __test2__ {\n';
                testCode += '    ' + other.code + ';\n';
                testCode += '    export var __val__ = ' + other.identifier + ';\n';
                testCode += '}\n';
                testCode += 'var __test2__val__ = __test2__.__val__;\n';

                testCode += 'function __test__function__() { if(true) { return __test1__val__ }; return __test2__val__; }';

                return this.compilesOk(testCode);
            }

            public assertSubtypeOf(others: any) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    if (!this.isSubtypeOf(others[i])) {
                        throw new Error("Expected " + this.type + " to be a subtype of " + others[i].type);
                    }
                }
            }

            public assertNotSubtypeOf(others: any) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    if (this.isSubtypeOf(others[i])) {
                        throw new Error("Expected " + this.type + " to be a subtype of " + others[i].type);
                    }
                }
            }

            public assertIdenticalTo(other: Type) {
                if (!this.isIdenticalTo(other)) {
                    throw new Error("Expected " + this.type + " to be identical to " + other.type);
                }
            }

            public assertNotIdenticalTo(other: Type) {
                if (!this.isIdenticalTo(other)) {
                    throw new Error("Expected " + this.type + " to not be identical to " + other.type);
                }
            }

            public isAssignmentCompatibleWith(other: Type) {
                var testCode = 'module __test1__ {\n';
                testCode += '    ' + this.code + ';\n';
                testCode += '    export var __val__ = ' + this.identifier + ';\n';
                testCode += '}\n';
                testCode += 'var __test1__val__ = __test1__.__val__;\n';

                testCode += 'module __test2__ {\n';
                testCode += '    ' + other.code + ';\n';
                testCode += '    export var __val__ = ' + other.identifier + ';\n';
                testCode += '}\n';
                testCode += 'var __test2__val__ = __test2__.__val__;\n';

                testCode += '__test2__val__ = __test1__val__;';

                return this.compilesOk(testCode);
            }

            public assertAssignmentCompatibleWith(others: any) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    var other = others[i];

                    if (!this.isAssignmentCompatibleWith(other)) {
                        throw new Error("Expected " + this.type + " to be assignment compatible with " + other.type);
                    }
                }
            }

            public assertNotAssignmentCompatibleWith(others: any) {
                others = this.normalizeToArray(others);

                for (var i = 0; i < others.length; i++) {
                    var other = others[i];

                    if (this.isAssignmentCompatibleWith(other)) {
                        throw new Error("Expected " + this.type + " to not be assignment compatible with " + other.type);
                    }
                }
            }
        }

        export class TypeFactory {
            public any: Type;
            public number: Type;
            public string: Type;
            public bool: Type;

            constructor () {
                this.any = this.get('var x : any', 'x');
                this.number = this.get('var x : number', 'x');
                this.string = this.get('var x : string', 'x');
                this.bool = this.get('var x : bool', 'x');
            }

            public get(code: string, identifier: string) {
                var errors = null;
                compileString(code, 'test.ts', function (compilerResult) {
                    errors = compilerResult.errors;
                })

                if (errors.length > 0)
                    throw new Error("Type definition contains errors: " + errors.join(","));

                // REVIEW: For a multi-file test, this won't work
                var script = compiler.scripts.members[1];
                var enclosingScopeContext = TypeScript.findEnclosingScopeAt(new TypeScript.NullLogger(), <TypeScript.Script>script, new TypeScript.StringSourceText(code), 0, false);
                var entries = new TypeScript.ScopeTraversal(compiler).getScopeEntries(enclosingScopeContext);
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].name === identifier) {
                        return new Type(entries[i].type, code, identifier);
                    }
                }
            }

            public isOfType(expr: string, expectedType: string) {
                var actualType = this.get('var x = ' + expr, 'x');

                it('Expression "' + expr + '" is of type "' + expectedType + '"', function () {
                    assert.equal(actualType.type, expectedType);
                });
            }
        }

        // Contains the code and errors of a compilation and some helper methods to check its status.
        export class CompilerResult {
            public code: string;
            public errors: CompilerError[];

            constructor (codeLines: string[], errorLines: string[], public scripts: TypeScript.Script[]) {
                this.code = codeLines.join("\n")
                this.errors = [];

                for (var i = 0; i < errorLines.length; i++) {
                    var match = errorLines[i].match(/([^\(]*)\((\d+),(\d+)\):\s+((.*[\s\r\n]*.*)+)\s*$/);
                    if (match) {
                        this.errors.push(new CompilerError(match[1], parseFloat(match[2]), parseFloat(match[3]), match[4]));
                    }
                    else {
                        WScript.Echo("non-match on: " + errorLines[i]);
                    }
                }
            }

            public isErrorAt(line: number, column: number, message: string) {
                for (var i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].line === line && this.errors[i].column === column && this.errors[i].message === message)
                        return true;
                }

                return false;
            }
        }

        // Compiler Error.
        export class CompilerError {
            constructor (public file: string,
                    public line: number,
                    public column: number,
                    public message: string) { }

            public toString() {
                return this.file + "(" + this.line + "," + this.column + "): " + this.message;
            }

        }

        export function generateDeclFile(code: string): string {
            reset();

            compiler.settings.generateDeclarationFiles = true;
            try {
                addUnit(code);
                compiler.reTypeCheck();

                var outputs = {};

                compiler.emit(true, (fn: string) => {
                    outputs[fn] = new Harness.Compiler.WriterAggregator();
                    return outputs[fn];
                });

                for (var fn in outputs) {
                    if (fn.indexOf('.d.ts') >= 0) {
                        var writer = <Harness.Compiler.WriterAggregator>outputs[fn];
                        writer.Close();
                        return writer.lines.join('\n');
                    }
                }

                throw new Error('Compilation produced no .d.ts files');
            } finally {
                compiler.settings.generateDeclarationFiles = false;
            }

            return '';
        }

        export function compileCollateral(path: string, callback: (res: CompilerResult) => void ) {
            compileString(CollateralReader.read(path), path.match(/[^\\]*$/)[0], callback);
        }

        export function compileString(code: string, unitName: string, callback: (res: Compiler.CompilerResult) => void , refreshUnitsForLSTests? = false) {
            var scripts: TypeScript.Script[] = [];

            // TODO: How to overload?
            if (typeof unitName === 'function') {
                callback = <(res: CompilerResult) => void >(<any>unitName);
                unitName = 'test.ts';
            }

            reset();

            // Some command-line tests may pollute the global namespace, which could interfere with
            // with language service testing.
            // In the case of LS tests, make sure that we refresh the first unit, and not try to update it
            if (refreshUnitsForLSTests) {
                maxUnit = 0;
            }
            scripts.push(addUnit(code));
            compiler.reTypeCheck();
            compiler.emitToOutfile(stdout);

            callback(new CompilerResult(stdout.lines, stderr.lines, scripts));
        }

        export function recreate() {
            compiler = new TypeScript.TypeScriptCompiler(stderr);
            compiler.parser.errorRecovery = true;
            compiler.settings.codeGenTarget = TypeScript.CodeGenTarget.ES5;
            compiler.settings.controlFlow = true;
            compiler.settings.controlFlowUseDef = true;
            TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            compiler.addUnit(libText, 'lib.d.ts', true);
            compiler.typeCheck();
            currentUnit = 0;
            maxUnit = 0;
        }

        export function reset() {
            stdout.reset();
            stderr.reset();

            for (var i = 0; i < currentUnit; i++) {
                compiler.updateUnit('', i + '.ts', false/*setRecovery*/);
            }

            currentUnit = 0;
        }

        export function addUnit(code: string, isResident?: bool, isDeclareFile?: bool) {
            var script: TypeScript.Script = null;
            if (currentUnit >= maxUnit) {
                script = compiler.addUnit(code, currentUnit++ + (isDeclareFile ? '.d.ts' : '.ts'), isResident);
                maxUnit++;
            } else {
                var filename = currentUnit + (isDeclareFile ? '.d.ts' : '.ts');
                compiler.updateUnit(code, filename, false/*setRecovery*/);

                for (var i = 0; i < compiler.units.length; i++) {
                    if (compiler.units[i].filename === filename)
                        script = <TypeScript.Script>compiler.scripts.members[i];
                }

                currentUnit++;
            }

            return script;
        }

        export function compileUnits(callback: (res: Compiler.CompilerResult) => void ) {
            compiler.reTypeCheck();
            compiler.emitToOutfile(stdout);

            callback(new CompilerResult(stdout.lines, stderr.lines, []));
        }

    }

    // Reads collateral relative to the collateral root.
    export module CollateralReader {
        export var root = "tests\\";

        export function setRoot(newRoot: string) {
            // Normalize root path to end in back slash
            if (newRoot[newRoot.length - 1] !== '\\')
                newRoot += '\\';

            root = newRoot;
        }

        export function read(path: string) {
            return IO.readFile(Harness.userSpecifiedroot + root + path);
        }
    }

    export class ScriptInfo {
        public version: number;
        public editRanges: { length: number; editRange: TypeScript.ScriptEditRange; }[] = [];

        constructor (public name: string, public content: string, public isResident: bool, public maxScriptVersions: number) {
            this.version = 1;
        }

        public updateContent(content: string, isResident: bool) {
            this.editRanges = [];
            this.content = content;
            this.isResident = isResident;
            this.version++;
        }

        public editContent(minChar: number, limChar: number, newText: string) {
            // Apply edits
            var prefix = this.content.substring(0, minChar);
            var middle = newText;
            var suffix = this.content.substring(limChar);
            this.content = prefix + middle + suffix;

            // Store edit range + new length of script
            this.editRanges.push({ 
                length: this.content.length, 
                editRange: new TypeScript.ScriptEditRange(minChar, limChar, (limChar - minChar) + newText.length)
            });

            if (this.editRanges.length > this.maxScriptVersions) {
                this.editRanges.splice(0, this.maxScriptVersions - this.editRanges.length);
            }

            // Update version #
            this.version++;
        }

        public getEditRangeSinceVersion(version: number): TypeScript.ScriptEditRange {
            if (this.version == version) {
                // No edits!
                return null;
            }

            var initialEditRangeIndex = this.editRanges.length - (this.version - version);
            if (initialEditRangeIndex < 0 || initialEditRangeIndex >= this.editRanges.length) {
                // Too far away from what we know
                return TypeScript.ScriptEditRange.unknown();
            }

            var entries = this.editRanges.slice(initialEditRangeIndex);

            var minDistFromStart = entries.map(x => x.editRange.minChar).reduce((prev, current) => Math.min(prev, current));
            var minDistFromEnd = entries.map(x => x.length - x.editRange.limChar).reduce((prev, current) => Math.min(prev, current));
            var aggDelta = entries.map(x => x.editRange.delta).reduce((prev, current) => prev + current);

            return new TypeScript.ScriptEditRange(minDistFromStart, entries[0].length - minDistFromEnd, aggDelta);
        }
    }

    export class TypeScriptLS implements Services.ILanguageServiceShimHost {
        private ls: Services.ILanguageServiceShim = null;

        public scripts: ScriptInfo[] = [];
        public maxScriptVersions = 100;

        public addDefaultLibrary() {
            this.addScript("lib.d.ts", Harness.Compiler.libText, true);
        }

        public addFile(name: string, isResident = false) {
            var code: string = Harness.CollateralReader.read(name);
            this.addScript(name, code, isResident);
        }

        public addScript(name: string, content: string, isResident = false) {
            var script = new ScriptInfo(name, content, isResident, this.maxScriptVersions);
            this.scripts.push(script);
        }

        public updateScript(name: string, content: string, isResident = false) {
            for (var i = 0; i < this.scripts.length; i++) {
                if (this.scripts[i].name == name) {
                    this.scripts[i].updateContent(content, isResident);
                    return;
                }
            }

            this.addScript(name, content, isResident);
        }

        public editScript(name: string, minChar: number, limChar:number, newText:string) {
            for (var i = 0; i < this.scripts.length; i++) {
                if (this.scripts[i].name == name) {
                    this.scripts[i].editContent(minChar, limChar, newText);
                    return;
                }
            }

            throw new Error("No script with name '" + name +"'");
        }

        public getScriptContent(scriptIndex: number): string {
            return this.scripts[scriptIndex].content;
        }

        //////////////////////////////////////////////////////////////////////
        // ILogger implementation
        //
        public information(): bool { return true; }
        public debug(): bool { return true; }
        public warning(): bool { return true; }
        public error(): bool { return true; }
        public fatal(): bool { return true; }

        public log(s: string): void {
            // For debugging...
            //IO.printLine("TypeScriptLS:" + s);
        }

        //////////////////////////////////////////////////////////////////////
        // ILanguageServiceShimHost implementation
        //

        public getCompilationSettings(): string/*json for Tools.CompilationSettings*/ {
            return ""; // i.e. default settings
        }

        public getScriptCount(): number {
            return this.scripts.length;
        }

        public getScriptSourceText(scriptIndex: number, start: number, end: number): string {
            return this.scripts[scriptIndex].content.substring(start, end);
        }

        public getScriptSourceLength(scriptIndex: number): number {
            return this.scripts[scriptIndex].content.length;
        }

        public getScriptId(scriptIndex: number): string {
            return this.scripts[scriptIndex].name;
        }

        public getScriptIsResident(scriptIndex: number): bool {
            return this.scripts[scriptIndex].isResident;
        }

        public getScriptVersion(scriptIndex: number): number {
            return this.scripts[scriptIndex].version;
        }

        public getScriptEditRangeSinceVersion(scriptIndex: number, scriptVersion: number): string {
            var range = this.scripts[scriptIndex].getEditRangeSinceVersion(scriptVersion);
            return (range.minChar + "," + range.limChar + "," + range.delta);
        }

        //
        // Return a new instance of the language service shim, up-to-date wrt to typecheck.
        // To access the non-shim (i.e. actual) language service, use the "ls.languageService" property.
        //
        public getLanguageService(): Services.ILanguageServiceShim {
            var ls = new Services.TypeScriptServicesFactory().createLanguageServiceShim(this);
            ls.refresh(true);
            this.ls = ls;
            return ls;
        }

        //
        // Parse file given its source text
        //
        public parseSourceText(fileName: string, sourceText: TypeScript.ISourceText): TypeScript.Script {
            var parser = new TypeScript.Parser();
            parser.setErrorRecovery(null, -1, -1);
            parser.errorCallback = (a, b, c, d) => { };

            var script = parser.parse(sourceText, fileName, 0);
            return script;
        }

        //
        // Parse a file on disk given its filename
        //
        public parseFile(fileName: string) {
            var sourceText = new TypeScript.StringSourceText(IO.readFile(fileName))
            return this.parseSourceText(fileName, sourceText);
        }

        //
        // line and column are 1-based
        //
        public lineColToPosition(fileName: string, line: number, col: number): number {
            var script = this.ls.languageService.getScriptAST(fileName);
            assert.notNull(script);
            assert(line >= 1);
            assert(col >= 1);
            assert(line < script.locationInfo.lineMap.length);

            return TypeScript.getPositionFromLineColumn(script, line, col);
        }

        //
        // line and column are 1-based
        //
        public positionToLineCol(fileName: string, position: number): TypeScript.ILineCol {
            var script = this.ls.languageService.getScriptAST(fileName);
            assert.notNull(script);

            var result = TypeScript.getLineColumnFromPosition(script, position);

            assert(result.line >= 1);
            assert(result.col >= 1);
            return result;
        }

        //
        // Verify that applying edits to "sourceFileName" result in the content of the file
        // "baselineFileName"
        //
        public checkEdits(sourceFileName: string, baselineFileName: string, edits: Services.TextEdit[]) {
            var script = Harness.CollateralReader.read(sourceFileName);
            var formattedScript = this.applyEdits(script, edits);
            var baseline = Harness.CollateralReader.read(baselineFileName);

            assert.noDiff(formattedScript, baseline);
            assert.equal(formattedScript, baseline);
        }


        //
        // Apply an array of text edits to a string, and return the resulting string.
        //
        public applyEdits(content: string, edits: Services.TextEdit[]): string {
            var result = content;
            edits = this.normalizeEdits(edits);

            for (var i = edits.length - 1; i >= 0; i--) {
                var edit = edits[i];
                var prefix = result.substring(0, edit.minChar);
                var middle = edit.text;
                var suffix = result.substring(edit.limChar);
                result = prefix + middle + suffix;
            }
            return result;
        }

        //
        // Normalize an array of edits by removing overlapping entries and sorting
        // entries on the "minChar" position.
        //
        private normalizeEdits(edits: Services.TextEdit[]): Services.TextEdit[] {
            var result: Services.TextEdit[] = [];

            function mapEdits(edits: Services.TextEdit[]): { edit: Services.TextEdit; index: number; }[] {
                var result = [];
                for (var i = 0; i < edits.length; i++) {
                    result.push({ edit: edits[i], index: i });
                }
                return result;
            }

            var temp = mapEdits(edits).sort(function (a, b) {
                var result = a.edit.minChar - b.edit.minChar;
                if (result == 0)
                    result = a.index - b.index;
                return result;
            });

            var current = 0;
            var next = 1;
            while (current < temp.length) {
                var currentEdit = temp[current].edit;

                // Last edit
                if (next >= temp.length) {
                    result.push(currentEdit);
                    current++;
                    continue;
                }
                var nextEdit = temp[next].edit;

                var gap = nextEdit.minChar - currentEdit.limChar;

                // non-overlapping edits
                if (gap >= 0) {
                    result.push(currentEdit);
                    current = next;
                    next++;
                    continue;
                }

                // overlapping edits: for now, we only support ignoring an next edit 
                // entirely contained in the current edit.
                if (currentEdit.limChar >= nextEdit.limChar) {
                    next++;
                    continue;
                }
                else {
                    throw new Error("Trying to apply overlapping edits");
                }
            }

            return result;
        }

    }

    interface IDone {
        (e?: Error): void;
    }

    class Runnable {
        constructor (public description: string, public block: any) { }

        // The current stack of Runnable objects
        static currentStack: Runnable[] = [];

        // The error, if any, that occurred when running 'block'
        public error: Error = null;

        // Whether or not this object has any failures (including in its descendants)
        public passed = null;

        // A list of all our child Runnables
        public children: Runnable[] = [];

        public addChild(child: Runnable): void {
            this.children.push(child);
        }

        // Call function fn, which may take a done function and may possibly execute
        // asynchronously, calling done when finished. Returns true or false depending
        // on whether the function was asynchronous or not.
        public call(fn: (done?: IDone) => void , done: IDone) {
            var isAsync = true;

            try {
                if (fn.length === 0) {
                    // No async.
                    fn();
                    done();

                    return false;
                } else {
                    // Possibly async

                    Runnable.pushGlobalErrorHandler(done);

                    fn(function () {
                        isAsync = false; // If we execute synchronously, this will get called before the return below.
                        Runnable.popGlobalErrorHandler();
                        done();
                    });

                    return isAsync;
                }

            } catch (e) {
                done(e);

                return false;
            }
        }

        public run(done: IDone) { };

        public runBlock(done: IDone) {
            return this.call(this.block, done);
        }

        public runChild(index: number, done: IDone) {
            return this.call(<any>((done) => this.children[index].run(done)), done);
        }

        static errorHandlerStack: { (e: Error): void; }[] = [];

        static pushGlobalErrorHandler(done: IDone) {
            errorHandlerStack.push(function (e) {
                done(e);
            });
        }

        static popGlobalErrorHandler() {
            errorHandlerStack.pop();
        }

        static handleError(e: Error) {
            if (errorHandlerStack.length === 0) {
                IO.printLine('Global error: ' + e);
            } else {
                errorHandlerStack[errorHandlerStack.length - 1](e);
            }
        }
    }

    export class TestCase extends Runnable {
        public description: string;
        public block;

        constructor (description: string, block: any) {
            super(description, block);
            this.description = description;
            this.block = block;
        }

        public addChild(child: Runnable): void {
            throw new Error("Testcases may not be nested inside other testcases");
        }

        // Run the test case block and fail the test if it raised an error.
        // If no error is raised, the test passes.
        public run(done: IDone) {
            var that = this;

            Runnable.currentStack.push(this);

            emitLog('testStart', { desc: this.description });

            if (this.block) {
                var async = this.runBlock(<any>function (e) {
                    if (e) {
                        that.passed = false;
                        that.error = e;
                        emitLog('error', { desc: this.description, pass: false }, e);
                    } else {
                        that.passed = true;

                        emitLog('pass', { desc: this.description, pass: true });
                    }

                    Runnable.currentStack.pop();

                    done()
                });
            }

        }
    }

    export class Scenario extends Runnable {
        public description: string;
        public block;

        constructor (description: string, block: any) {
            super(description, block);
            this.description = description;
            this.block = block;
        }

        // Run the block, and if the block doesn't raise an error, run the children.
        public run(done: IDone) {
            var that = this;

            Runnable.currentStack.push(this);

            emitLog('scenarioStart', { desc: this.description });

            var async = this.runBlock(<any>function (e) {
                Runnable.currentStack.pop();
                if (e) {
                    that.passed = false;
                    that.error = e;
                    emitLog('scenarioEnd', { desc: this.description, pass: false }, e);
                    done();
                } else {
                    that.passed = true; // so far so good.
                    that.runChildren(done);
                }
            });
        }

        // Run the children of the scenario (other scenarios and test cases). If any fail,
        // set this scenario to failed. Synchronous tests will run synchronously without
        // adding stack frames.
        public runChildren(done: IDone, index = 0) {
            var that = this;
            var async = false;

            for (; index < this.children.length; index++) {
                async = this.runChild(index, <any>function (e) {
                    that.passed = that.passed && that.children[index].passed;

                    if (async)
                        that.runChildren(done, index + 1);
                });

                if (async)
                    return;
            }

            emitLog('scenarioEnd', { desc: this.description, pass: this.passed });

            done();
        }
    }

    export class Run extends Runnable {
        constructor () {
            super('Test Run', null);
        }

        public run() {
            emitLog('start');
            this.runChildren();
        }

        public runChildren(index = 0) {
            var async = false;
            var that = this;

            for (; index < this.children.length; index++) {
                async = this.runChild(index, <any>function (e) {
                    if (async)
                        that.runChildren(index + 1);
                });

                if (async)
                    return;
            }

            Perf.runBenchmarks();
            emitLog('end');
        }
    }

    // Logger-related functions
    var loggers: ILogger[] = [];

    export function registerLogger(logger: ILogger) {
        loggers.push(logger);
    }

    function emitLog(field: string, ... params: any[]) {
        for (var i = 0; i < loggers.length; i++) {
            if (typeof loggers[i][field] === 'function') {
                loggers[i][field].apply(loggers[i], params);
            }
        }
    }


    // Describe/it definitions
    export function describe(description: string, block: () => any) {
        var newScenario = new Scenario(description, block);

        if (Runnable.currentStack.length === 0) {
            Runnable.currentStack.push(currentRun);
        }

        Runnable.currentStack[Runnable.currentStack.length - 1].addChild(newScenario);
    }

    export function it(description: string, block: () => void ) {
        var testCase = new TestCase(description, block);
        Runnable.currentStack[Runnable.currentStack.length - 1].addChild(testCase);
    }

    export function run() {
        if (typeof process !== "undefined") {
            process.on('uncaughtException', Runnable.handleError);
        }

        Baseline.reset();
        currentRun.run();
    }

    export var setCollateralRoot = CollateralReader.setRoot;

    export interface IAssert {
        (result: bool, msg?: string): void;
        equal(left: any, right: any): void;
        notEqual(left: any, right: any): void;
        notNull(result: any): void;
        noDiff(left: string, right: string): void;
        compilerWarning(result: Compiler.CompilerResult, line: number, column: number, desc: string): void;
        arrayContains(left: any[], right: any[]): void;
        arrayContainsOnce(arr: any[], filter: (item: any) =>bool): void;
        arrayLengthIs(arr: any[], length: number);
    }

    export var assert: IAssert = <any>function (result: bool, msg?: string): void {
        if (!result)
            throw new Error(msg ? msg : "Expected true, got false.");
    }

    assert.arrayLengthIs = <any>function (arr: any[], length: number) {
        if (arr.length != length) {
            var actual = '';
            arr.forEach(n => actual = actual + '\n      ' + n.toString());
            throw new Error('Expected array to have ' + length + ' elements. Actual elements were:' + actual);
        }
    }

    assert.equal = function (left, right) {
        if (left !== right) {
            throw new Error("Expected " + left + " to equal " + right);
        }
    }

    assert.notEqual = function (left, right) {
        if (left === right) {
            throw new Error("Expected " + left + " to *not* equal " + right);
        }
    }

    assert.notNull = function (result) {
        if (result === null) {
            throw new Error("Expected " + result + " to *not* be null");
        }
    }

    assert.compilerWarning = function (result: Compiler.CompilerResult, line: number, column: number, desc: string) {
        if (!result.isErrorAt(line, column, desc)) {
            var actual = '';
            result.errors.forEach(err => {
                actual = actual + '\n     ' + err.toString();
            });
            throw new Error("Expected compiler warning at (" + line + ", " + column + "): " + desc + "\nActual errors follow: " + actual);
        }
    }

    assert.noDiff = function (text1, text2) {
        text1 = text1.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n");
        text2 = text2.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n");

        if (text1 !== text2) {
            var errorString = "";
            var text1Lines = text1.split(/\n/);
            var text2Lines = text2.split(/\n/);
            for (var i = 0; i < text1Lines.length; i++) {
                if (text1Lines[i] !== text2Lines[i]) {
                    errorString += "Difference at line " + (i + 1) + ":\n";
                    errorString += "                  Left File: " + text1Lines[i] + "\n";
                    errorString += "                 Right File: " + text2Lines[i] + "\n\n";
                }
            }
            throw new Error(errorString);
        }
    }

    assert.arrayContains = function (arr, contains) {
        var found;

        for (var i = 0; i < contains.length; i++) {
            found = false;

            for (var j = 0; j < arr.length; j++) {
                if (arr[j] === contains[i]) {
                    found = true;
                    break;
                }
            }

            if (!found)
                throw new Error("Expected array to contain \"" + contains[i] + "\"");
        }
    }

    assert.arrayContainsOnce = function (arr: any[], filter: (item: any) =>bool) {
        var foundCount = 0;

        for (var i = 0; i < arr.length; i++) {
            if (filter(arr[i])) {
                foundCount++;
            }
        }

        if (foundCount !== 1)
            throw new Error("Expected array to match element only once (instead of " + foundCount + " time(s))");
    }


    // Runs TypeScript or Javascript code.
    export module Runner {
        export function runCollateral(path: string, callback: (error: Error, result: any) => void ) {
            runString(CollateralReader.read(path), path.match(/[^\\]*$/)[0], callback);
        }
        
        export function runJSString(code: string, callback: (error: Error, result: any) => void ) {
            // List of names that get overriden by various test code we eval
            var dangerNames:any = ['Array'];

            var globalBackup:any = {};
            var n: string = null;
            for (n in dangerNames) {
                globalBackup[dangerNames[n]] = global[dangerNames[n]];
            }

            try {
                var res = eval(code);

                for (n in dangerNames) {
                    global[dangerNames[n]] = globalBackup[dangerNames[n]];
                }

                callback(null, res);
            } catch (e) {
                for (n in dangerNames) {
                    global[dangerNames[n]] = globalBackup[dangerNames[n]];
                }

                callback(e, null);
            }
        }

        export function runString(code: string, unitName: string, callback: (error: Error, result: any) => void ) {
            Compiler.compileString(code, unitName, function (res) {
                runJSString(res.code, callback);
            });
        }
    }

    // Support class for baseline files
    export module Baseline {
        var reportFilename = 'baseline-report.html';

        var firstRun = true;
        var htmlTrailer = '</body></html>';
        var htmlLeader = '<html><head><title>Baseline Report</title>';
        htmlLeader += ("<style>");
        htmlLeader += '\r\n' + (".code { font: 9pt 'Courier New'; }");
        htmlLeader += '\r\n' + (".old { background-color: #EE1111; }");
        htmlLeader += '\r\n' + (".new { background-color: #FFFF11; }");
        htmlLeader += '\r\n' + (".from { background-color: #EE1111; color: #1111EE; }");
        htmlLeader += '\r\n' + (".to { background-color: #EEEE11; color: #1111EE; }");
        htmlLeader += '\r\n' + ("h2 { margin-bottom: 0px; }");
        htmlLeader += '\r\n' + ("h2 { padding-bottom: 0px; }");
        htmlLeader += '\r\n' + ("h4 { font-weight: normal; }");
        htmlLeader += '\r\n' + ("</style>");

        export interface BaselineOptions {
            LineEndingSensitive?: bool;
        }

        function localPath(filename: string) {
            return Harness.userSpecifiedroot + 'tests/baselines/local/' + filename;
        }

        function referencePath(filename: string) {
            return Harness.userSpecifiedroot + 'tests/baselines/reference/' + filename;
        }

        export function reset() {
            IO.deleteFile(reportFilename);
        }

        export function runBaseline(
            descriptionForDescribe: string,
            relativeFilename: string,
            generateContent: () => string,
            opts?: BaselineOptions) {

            describe(descriptionForDescribe, () => {
                var reportContent = htmlLeader;
                // Delete the baseline-report.html file if needed
                if (IO.fileExists(reportFilename)) {
                    reportContent = IO.readFile(reportFilename);
                    reportContent = reportContent.replace(htmlTrailer, '');
                } else {
                    reportContent = htmlLeader;
                }

                var actual = <string>undefined;
                var actualFilename = localPath(relativeFilename);

                it('Can generate the content without error', () => {
                    // Create folders if needed
                    IO.createDirectory(IO.dirName(IO.dirName(actualFilename)));
                    IO.createDirectory(IO.dirName(actualFilename));

                    // Delete the actual file in case it fails
                    if (IO.fileExists(actualFilename)) {
                        IO.deleteFile(actualFilename);
                    }

                    actual = generateContent();

                    if (actual === undefined) {
                        throw new Error('The generated content was "undefined". Return "null" if no baselining is required."');
                    }

                    // Store the content in the 'local' folder so we
                    // can accept it later (manually)
                    if (actual !== null) {
                        IO.writeFile(localPath(relativeFilename), actual);
                    }
                });

                it('Matches the baseline file', () => {
                    // actual is now either undefined (the generator had an error), null (no file requested),
                    // or some real output of the function
                    if (actual === undefined) {
                        // Nothing to do
                        return;
                    }

                    var refFilename = referencePath(relativeFilename);

                    if (actual === null) {
                        actual = '<no content>';
                    }

                    var expected = '<no content>'; 
                    if (IO.fileExists(refFilename)) {
                        expected = IO.readFile(refFilename);
                    }

                    var lineEndingSensitive = opts && opts.LineEndingSensitive;

                    if (!lineEndingSensitive) {
                        expected = expected.replace(/\r\n?/g, '\n')
                        actual = actual.replace(/\r\n?/g, '\n')
                    }

                    if (expected != actual) {
                        // Overwrite & issue error
                        var errMsg = 'The baseline file ' + relativeFilename + ' has changed. Please refer to baseline-report.html and ';
                        errMsg += 'either fix the regression (if unintended) or run nmake baseline-accept (if intended).'

                        // Append diff to the report
                        var diff = new Diff.StringDiff(expected, actual);
                        var header = '<h2>' + descriptionForDescribe + '</h2>';
                        header += '<h4>Left file: ' + actualFilename + '; Right file: ' + refFilename + '</h4>';
                        var trailer = '<hr>';
                        reportContent = reportContent + header + '<div class="code">' + diff.mergedHtml + '</div>' + trailer + htmlTrailer;
                        IO.writeFile(reportFilename, reportContent);

                        throw new Error(errMsg);
                    }
                });
            });
        }
    }

    var currentRun = new Run();

    global.describe = describe;
    global.run = run;
    global.it = it;
    global.assert = assert;
}
