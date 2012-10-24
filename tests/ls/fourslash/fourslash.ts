// Welcome to the FourSlash syntax guide!

// A line in the source text is indicated by four slashes (////)
// Tip: Hit Ctrl-K Ctrl-C Ctrl-K Ctrl-C to prefix-slash any selected block of text in Visual Studio
//// This is a line in the source text!
// Files are terminated by any entirely blank line (e.g.
// interspersed //-initiated comments are allowed)

// You can indicate a 'marker' with /**/
//// function./**/
// ... goTo.marker();

// Optionally, markers may have names:
//// function.go(/*1*/x, /*2*/y);
// goTo.marker('1');
// Marker names may consist of any alphanumeric characters

// File metadata must occur directly before the first line of source text
// and is indicated by an @ symbol:
// @Filename: lib.d.ts
//// this is the first line of my file

// Global options may appear anywhere
// @Module: Node
// @Target: ES5

// In the imperative section, you can write any valid TypeScript code. If
// you need help finding a something in Intellisense, you can
// type 'fs.' as an alternate way of accessing the top-level objects
// (e.g. 'fs.goTo.eof();')

module FourSlashInterface {
    declare var FourSlash;

    export class goTo {
        // Moves the caret to the specified marker,
        // or the anonymous marker ('/**/') if no name
        // is given
        public marker(name?: string) {
            FourSlash.currentTestState.goToMarker(name);
        }

        public bof() {
            FourSlash.currentTestState.goToBOF();
        }

        public eof() {
            FourSlash.currentTestState.goToEOF();
        }

        public definition() {
            FourSlash.currentTestState.goToDefinition();
        }

        // Opens a file, given either its index as it
        // appears in the test source, or its filename
        // as specified in the test metadata
        public file(index: number);
        public file(name: string);
        public file(indexOrName: any) {
            FourSlash.currentTestState.openFile(indexOrName);
        }
    }

    export class verifyNegatable {
        public not: verifyNegatable;

        constructor (private negative ?= false) {
            if (!negative) {
                this.not = new verifyNegatable(true);
            }
        }

        // Verifies the member list contains the specified symbol. The
        // member list is brought up if necessary
        public memberListContains(symbol: string) {
            if (this.negative) {
                FourSlash.currentTestState.verifyMemberListDoesNotContain(symbol);
            } else {
                FourSlash.currentTestState.verifyMemberListContains(symbol);
            }
        }

        // Verifies the completion list contains the specified symbol. The
        // completion list is brought up if necessary
        public completionListContains(symbol: string) {
            if (this.negative) {
                FourSlash.currentTestState.verifyCompletionListDoesNotContain(symbol);
            } else {
                FourSlash.currentTestState.verifyCompletionListContains(symbol);
            }
        }

        public currentParameterIsVariable() {
            FourSlash.currentTestState.verifyCurrentParameterIsVariable(!this.negative);
        }
    }

    export class verify extends verifyNegatable {
        public caretAtMarker(markerName?: string) {
            FourSlash.currentTestState.verifyCaretAtMarker(markerName);
        }

        public smartIndentLevelIs(numberOfTabs: number) {
            FourSlash.currentTestState.verifySmartIndentLevel(numberOfTabs);
        }

        public textAtCaretIs(text: string) {
            FourSlash.currentTestState.verifyTextAtCaretIs(text);
        }

        public currentLineContentIs(text: string) {
            FourSlash.currentTestState.verifyCurrentLineContent(text);
        }

        public currentParameterHelpArgumentNameIs(name: string) {
            FourSlash.currentTestState.verifyCurrentParameterHelpName(name);
        }

        public currentSignatureHelpReturnTypeIs(returnTypeName: string) {
            FourSlash.currentTestState.verifyCurrentSignatureHelpReturnType(returnTypeName);
        }

        public quickInfoIs(typeName: string) {
            FourSlash.currentTestState.verifyQuickInfo(typeName);
        }

        public currentSignatureHelpCountIs(expected: number) {
            FourSlash.currentTestState.verifyCurrentSignatureHelpCount(expected);
        }
    }
    
    export class edit {
        public insert(text: string) {
            this.insertLines(text);
        }

        public insertLine(text: string) {
            this.insertLines(text + '\n');
        }

        public insertLines(...lines: string[]) {
            FourSlash.currentTestState.type(lines.join('\n'));
        }

        public moveRight(count?: number) {
            FourSlash.currentTestState.moveCaretRight(count);
        }
    }

    export class debug {
        public printCurrentParameterHelp() {
            FourSlash.currentTestState.printCurrentParameterHelp();
        }

        public printCurrentFileState() {
            FourSlash.currentTestState.printCurrentFileState();
        }

        public printCurrentQuickInfo() {
            FourSlash.currentTestState.printCurrentQuickInfo();
        }
    }
}

module fs {
    export var goTo = new FourSlashInterface.goTo();
    export var verify = new FourSlashInterface.verify();
    export var edit = new FourSlashInterface.edit();
    export var debug = new FourSlashInterface.debug();
}

var goTo = new FourSlashInterface.goTo();
var verify = new FourSlashInterface.verify();
var edit = new FourSlashInterface.edit();
var debug = new FourSlashInterface.debug();