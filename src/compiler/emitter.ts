// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export enum EmitContainer {
        Prog,
        Module,
        DynamicModule,
        Class,
        Constructor,
        Function,
        Args,
        Interface,
    }

    export class EmitState {
        public indentAmt: number;
        public column: number;
        public line: number;
        public pretty: bool;
        public inObjectLiteral: bool;
        public container: EmitContainer;

        constructor () {
            this.indentAmt = 0;
            this.column = 0;
            this.line = 0;
            this.pretty = false;
            this.inObjectLiteral = false;
            this.container = EmitContainer.Prog;
        }
    }

    export interface IEmitOptions {
        minWhitespace: bool;
        propagateConstants: bool;
        emitComments: bool;
        path: string;
        createFile: (path: string) =>ITextWriter;
        outputMany: bool;
    }

    export class Indenter {
        public indentStep = 4;
        public indentStrings: string[] = [];

        public getIndent(indentAmt: number) {
            var indentString = this.indentStrings[indentAmt];
            if (indentString === undefined) {
                indentString = "";
                for (var i = 0; i < indentAmt; i++) {
                    indentString += " ";
                }
                this.indentStrings[indentAmt] = indentString;
            }
            return indentString;
        }
    }

    var globalIndenter : Indenter = null;
    export function GetGlobalIndenter() {
        if (globalIndenter == null) {
            globalIndenter = new Indenter();
        }
        return globalIndenter;
    }

    export class Emitter {
        public prologueEmitted = false;
        public thisClassNode: NamedType = null;
        public thisFnc: FuncDecl = null;
        public moduleDeclList: ModuleDecl[] = [];
        public moduleName = "";
        public emitState = new EmitState();
        public indenter: Indenter;
        public ambientModule = false;
        public modAliasId: string = null;
        public firstModAlias: string = null;
        public allSourceMappers: SourceMapper[] = [];
        public sourceMapper: SourceMapper = null;
        public declDottedModuleName = false;
        public declIndentDelta = 0;
        public captureThisStmtString = "var _this = this;";

        constructor (public checker: TypeChecker, public outfile: ITextWriter, public emitOptions: IEmitOptions) { 
            this.indenter = GetGlobalIndenter();
        }

        public setSourceMappings(mapper: SourceMapper) {
            this.allSourceMappers.push(mapper);
            this.sourceMapper = mapper;
        }

        public increaseIndent() {
            this.emitState.indentAmt += this.indenter.indentStep;
            if (this.declDottedModuleName) {
                this.addDeclIndentDelta();
            }
        }
        public decreaseIndent() { this.emitState.indentAmt -= this.indenter.indentStep; }

        public addDeclIndentDelta() {
            this.declIndentDelta += this.indenter.indentStep;
        }

        public reduceDeclIndentDelta() {
            this.declIndentDelta -= this.indenter.indentStep;
        }

        public writeToOutput(s: string) {
            this.outfile.Write(s);
            // TODO: check s for newline
            this.emitState.column += s.length;
        }

        public writeToOutputTrimmable(s: string) {
            if (this.emitOptions.minWhitespace) {
                s = s.replace(/[\s]*/g, '');
            }
            this.writeToOutput(s);
        }

        public writeLineToOutput(s: string) {
            if (this.emitOptions.minWhitespace) {
                this.writeToOutput(s);
                var c = s.charCodeAt(s.length - 1);
                if (!((c == LexCodeSpace) || (c == LexCodeSMC) || (c == LexCodeLBR))) {
                    this.writeToOutput(' ');
                }
            }
            else {
                this.outfile.WriteLine(s);
                this.emitState.column = 0
                this.emitState.line++;
            }
        }

        public setInObjectLiteral(val: bool): bool {
            var temp = this.emitState.inObjectLiteral;
            this.emitState.inObjectLiteral = val;
            return temp;
        }

        public setContainer(c: number): number {
            var temp = this.emitState.container;
            this.emitState.container = c;
            return temp;
        }

        private getIndentString(declIndent? = false) {
            if (this.emitOptions.minWhitespace) {
                return "";
            }
            else {
                var indentAmt = this.emitState.indentAmt - (declIndent ? this.declIndentDelta : 0);
                return this.indenter.getIndent(indentAmt);
            }
        }

        public emitIndent() {
            this.writeToOutput(this.getIndentString());
        }

        public emitCommentInPlace(comment: Comment) {
            this.recordSourceMappingStart(comment);
            var text = comment.getText();
            var hadNewLine = false;

            if (comment.isBlockComment) {
                if (this.emitState.column == 0) {
                    this.emitIndent();
                }
                this.writeToOutput(text[0]);

                if (text.length > 1 || comment.endsLine) {
                    this.writeLineToOutput("");
                    for (var i = 1; i < text.length; i++) {
                        this.emitIndent();
                        this.writeLineToOutput(text[i]);
                    }
                    hadNewLine = true;
                }
            }
            else {
                if (this.emitState.column == 0) {
                    this.emitIndent();
                }
                this.writeLineToOutput(text[0]);
                hadNewLine = true;
            }

            if (hadNewLine) {
                this.emitIndent();
            }
            else {
                this.writeToOutput(" ");
            }
            this.recordSourceMappingEnd(comment);
        }

        public emitParensAndCommentsInPlace(ast: AST, pre: bool) {
            var comments = pre ? ast.preComments : ast.postComments;

            // comments should be printed before the LParen, but after the RParen
            if (ast.isParenthesized && !pre) {
                this.writeToOutput(")");
            }
            if (this.emitOptions.emitComments && comments && comments.length != 0) {
                for (var i = 0; i < comments.length; i++) {
                    this.emitCommentInPlace(comments[i]);
                }
            }
            if (ast.isParenthesized && pre) {
                this.writeToOutput("(");
            }
        }

        // TODO: emit accessor pattern
        public emitObjectLiteral(content: ASTList) {
            this.writeLineToOutput("{");
            this.increaseIndent();
            var inObjectLiteral = this.setInObjectLiteral(true);
            this.emitJavascriptList(content, ",", TokenID.Comma, true, false, false);
            this.setInObjectLiteral(inObjectLiteral);
            this.decreaseIndent();
            this.emitIndent();
            this.writeToOutput("}");
        }

        public emitArrayLiteral(content: ASTList) {
            this.writeToOutput("[");
            if (content) {
                this.writeLineToOutput("");
                this.increaseIndent();
                this.emitJavascriptList(content, ", ", TokenID.Comma, true, false, false);
                this.decreaseIndent();
                this.emitIndent();
            }
            this.writeToOutput("]");
        }

        public emitNew(target: AST, args: ASTList) {
            this.recordSourceMappingStart(target);
            this.writeToOutput("new ");
            if (target.nodeType == NodeType.TypeRef) {
                this.writeToOutput("Array()");
            }
            else {
                this.emitJavascript(target, TokenID.Tilde, false);
                this.writeToOutput("(");
                this.emitJavascriptList(args, ", ", TokenID.Comma, false, false, false);
                this.writeToOutput(")");
            }
            this.recordSourceMappingEnd(target);
        }

        public tryEmitConstant(dotExpr: BinaryExpression) {
            if (!this.emitOptions.propagateConstants) {
                return false;
            }
            var propertyName = <Identifier>dotExpr.operand2;
            if (propertyName && propertyName.sym && propertyName.sym.isVariable()) {
                if (hasFlag(propertyName.sym.flags, SymbolFlags.Constant)) {
                    if (propertyName.sym.declAST) {
                        var boundDecl = <BoundDecl>propertyName.sym.declAST;
                        if (boundDecl.init && (boundDecl.init.nodeType == NodeType.NumberLit)) {
                            var numLit = <NumberLiteral>boundDecl.init;
                            this.writeToOutput(numLit.value.toString());
                            var comment = " /* ";
                            comment += propertyName.text;
                            comment += " */ ";
                            this.writeToOutput(comment);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        public emitCall(callNode: CallExpression, target: AST, args: ASTList) {
            if (!this.emitSuperCall(callNode)) {
                if (!hasFlag(callNode.flags, ASTFlags.ClassBaseConstructorCall)) {
                    if (target.nodeType == NodeType.FuncDecl && !target.isParenthesized) {
                        this.writeToOutput("(");
                    }
                    this.emitJavascript(target, TokenID.LParen, false);
                    if (target.nodeType == NodeType.FuncDecl && !target.isParenthesized) {
                        this.writeToOutput(")");
                    }
                    this.writeToOutput("(");
                    this.emitJavascriptList(args, ", ", TokenID.Comma, false, false, false);
                    this.writeToOutput(")");
                }
                else {
                    this.decreaseIndent();
                    this.decreaseIndent();
                    var constructorCall = new ASTList();
                    constructorCall.members[0] = callNode;
                    this.emitConstructorCalls(constructorCall, this.thisClassNode);
                    this.increaseIndent();
                    this.increaseIndent();
                }
            }
        }

        public defaultValue(type: Type): string {
            if (type == this.checker.anyType) {
                return "undefined";
            }
            else if (type == this.checker.numberType) {
                return "0";
            }
            else if (type == this.checker.stringType) {
                return '""';
            }
            else if (type == this.checker.booleanType) {
                return "false";
            }
            else {
                return "null";
            }
        }

        public emitConstructorCalls(bases: ASTList, classDecl: NamedType) {
            if (bases == null) {
                return;
            }
            var basesLen = bases.members.length;
            this.recordSourceMappingStart(classDecl);
            for (var i = 0; i < basesLen; i++) {
                var baseExpr = bases.members[i];
                var baseSymbol: Symbol = null;
                if (baseExpr.nodeType == NodeType.Call) {
                    baseSymbol = (<CallExpression>baseExpr).target.type.symbol;
                }
                else {
                    baseSymbol = baseExpr.type.symbol;
                }
                var baseName = baseSymbol.name;
                if (baseSymbol.declModule != classDecl.type.symbol.declModule) {
                    baseName = baseSymbol.fullName();
                }
                if (baseExpr.nodeType == NodeType.Call) {
                    this.emitIndent();
                    this.writeToOutput("_super.call(this");
                    var args = (<CallExpression>baseExpr).args;
                    if (args && (args.members.length > 0)) {
                        this.writeToOutput(", ");
                        this.emitJavascriptList(args, ", ", TokenID.Comma, false, false, false);
                    }
                    this.writeToOutput(")");
                }
                else {
                    if (baseExpr.type && (baseExpr.type.isClassInstance())) {
                        // parameterless constructor call;
                        this.emitIndent();
                        this.writeToOutput(classDecl.name.text + "._super.constructor");
                        //emitJavascript(baseExpr,TokenID.LParen,false);
                        this.writeToOutput(".call(this)");
                    }
                }
            }
            this.recordSourceMappingEnd(classDecl);
        }

        public emitInnerFunction(funcDecl: FuncDecl, printName: bool, isProtoMember: bool,
            bases: ASTList, hasSelfRef: bool, classDecl: NamedType) {
            /// REVIEW: The code below causes functions to get pushed to a newline in cases where they shouldn't
            /// such as: 
            ///     Foo.prototype.bar = 
            ///         function() {
            ///         };
            /// Once we start emitting comments, we should pull this code out to place on the outer context where the function
            /// is used.
            //if (funcDecl.preComments!=null && funcDecl.preComments.length>0) {
            //    this.writeLineToOutput("");
            //    this.increaseIndent();
            //    emitIndent();
            //}

            var isClassConstructor = funcDecl.isConstructor && hasFlag(funcDecl.fncFlags, FncFlags.ClassMethod);
            var hasNonObjectBaseType = isClassConstructor && hasFlag(this.thisClassNode.type.instanceType.typeFlags, TypeFlags.HasBaseType) && !hasFlag(this.thisClassNode.type.instanceType.typeFlags, TypeFlags.HasBaseTypeOfObject);
            var classPropertiesMustComeAfterSuperCall = hasNonObjectBaseType && hasFlag((<ClassDecl>this.thisClassNode).varFlags, VarFlags.ClassSuperMustBeFirstCallInConstructor);

            this.emitParensAndCommentsInPlace(funcDecl, true);
            this.recordSourceMappingStart(funcDecl);
            if (!(funcDecl.isAccessor() && (<FieldSymbol>funcDecl.accessorSymbol).isObjectLitField)) {
                this.writeToOutput("function ");
            }
            if (printName) {
                var id = funcDecl.getNameText();
                if (id && !funcDecl.isAccessor()) {
                    this.writeToOutput(id);
                }
            }

            this.writeToOutput("(");
            var argsLen = 0;
            var i = 0;
            var arg: ArgDecl;
            var defaultArgs: ArgDecl[] = [];
            if (funcDecl.args) {
                var tempContainer = this.setContainer(EmitContainer.Args);
                argsLen = funcDecl.args.members.length;
                var printLen = argsLen;
                if (funcDecl.variableArgList) {
                    printLen--;
                }
                for (i = 0; i < printLen; i++) {
                    arg = <ArgDecl>funcDecl.args.members[i];
                    if (arg.init) {
                        defaultArgs.push(arg);
                    }
                    this.emitJavascript(arg, TokenID.LParen, false);
                    if (i < (printLen - 1)) {
                        this.writeToOutput(", ");
                    }
                }
                this.setContainer(tempContainer);
            }
            this.writeLineToOutput(") {");

            this.increaseIndent();

            // set default args first
            for (i = 0; i < defaultArgs.length; i++) {
                var arg = defaultArgs[i];
                this.emitIndent();
                this.recordSourceMappingStart(arg);
                this.writeToOutput("if (typeof " + arg.id.text + " === \"undefined\") { ");//
                this.recordSourceMappingStart(arg.id);
                this.writeToOutput(arg.id.text);
                this.recordSourceMappingEnd(arg.id);
                this.writeToOutput(" = ");
                this.emitJavascript(arg.init, TokenID.LParen, false);
                this.writeLineToOutput("; }")
                this.recordSourceMappingEnd(arg);
            }

            if (funcDecl.isConstructor && ((<ClassDecl>funcDecl.classDecl).varFlags & VarFlags.MustCaptureThis)) {
                this.emitIndent();
                this.writeLineToOutput(this.captureThisStmtString);
            }

            if (funcDecl.isConstructor && !classPropertiesMustComeAfterSuperCall) {
                if (funcDecl.args) {
                    argsLen = funcDecl.args.members.length;
                    for (i = 0; i < argsLen; i++) {
                        arg = <ArgDecl>funcDecl.args.members[i];
                        if ((arg.varFlags & VarFlags.Property) != VarFlags.None) {
                            this.emitIndent();
                            this.recordSourceMappingStart(arg);
                            this.recordSourceMappingStart(arg.id);
                            this.writeToOutput("this." + arg.id.text);
                            this.recordSourceMappingEnd(arg.id);
                            this.writeToOutput(" = ");
                            this.recordSourceMappingStart(arg.id);
                            this.writeToOutput(arg.id.text);
                            this.recordSourceMappingEnd(arg.id);
                            this.writeLineToOutput(";");
                            this.recordSourceMappingEnd(arg);
                        }
                    }
                }

                // For classes, the constructor needs to be explicitly called
                if (!hasFlag(funcDecl.fncFlags, FncFlags.ClassMethod)) {
                    this.emitConstructorCalls(bases, classDecl);
                }
            }
            if (hasSelfRef) {
                this.emitIndent();
                this.writeLineToOutput(this.captureThisStmtString);
            }
            if (funcDecl.variableArgList) {
                argsLen = funcDecl.args.members.length;
                var lastArg = <ArgDecl>funcDecl.args.members[argsLen - 1];
                this.emitIndent();
                this.recordSourceMappingStart(lastArg);
                this.writeToOutput("var ");
                this.recordSourceMappingStart(lastArg.id);
                this.writeToOutput(lastArg.id.text);
                this.recordSourceMappingEnd(lastArg.id);
                this.writeLineToOutput(" = [];");
                this.recordSourceMappingEnd(lastArg);
                this.emitIndent();
                this.writeLineToOutput("for (var _i = 0; _i < (arguments.length - " + (argsLen - 1) +
                                  "); _i++) {");
                this.increaseIndent();
                this.emitIndent();
                this.writeLineToOutput(lastArg.id.text + "[_i] = arguments[_i + " + (argsLen - 1) + "];");
                this.decreaseIndent();
                this.emitIndent();
                this.writeLineToOutput("}");
            }

            // if it's a class, emit the uninitializedMembers, first emit the non-proto class body members
            if (funcDecl.isConstructor && hasFlag(funcDecl.fncFlags, FncFlags.ClassMethod) && !classPropertiesMustComeAfterSuperCall) {

                var nProps = (<ASTList>this.thisClassNode.members).members.length;

                for (var i = 0; i < nProps; i++) {
                    if ((<ASTList>this.thisClassNode.members).members[i].nodeType == NodeType.VarDecl) {
                        var varDecl = <VarDecl>(<ASTList>this.thisClassNode.members).members[i];
                        if (!hasFlag(varDecl.varFlags, VarFlags.Static) && varDecl.init) {
                            this.emitIndent();
                            this.emitJavascriptVarDecl(varDecl, TokenID.Tilde);
                            this.writeLineToOutput("");
                        }
                    }
                }
                //this.writeLineToOutput("");
            }

            this.emitBareJavascriptStatements(funcDecl.bod, classPropertiesMustComeAfterSuperCall);

            this.decreaseIndent();
            this.emitIndent();
            this.writeToOutput("}");
            if (!isProtoMember &&
                //funcDecl.name != null &&
                !hasFlag(funcDecl.fncFlags, FncFlags.IsFunctionExpression) &&
                (hasFlag(funcDecl.fncFlags, FncFlags.Definition) || funcDecl.isConstructor)) {
                this.writeLineToOutput("");
            }

            // Emit the function's statics
            if (funcDecl.hasStaticDeclarations()) {
                this.writeLineToOutput("");
                this.emitIndent();
                var funcName = funcDecl.getNameText();
                this.writeLineToOutput("(function (" + funcName + ") {");
                this.increaseIndent();

                var len = 0;
                var i = 0;

                // Emit the function's local inner static functions
                len = funcDecl.innerStaticFuncs.length;
                for (i = 0; i < len; i++) {
                    var innerFunc = funcDecl.innerStaticFuncs[i];
                    if (innerFunc.isOverload) {
                        continue;
                    }
                    this.emitIndent();
                    if (innerFunc.isAccessor()) {
                        this.emitPropertyAccessor(innerFunc, funcDecl.name.text, false);
                    }
                    else {
                        this.writeToOutput(funcName + "." + innerFunc.name.text + " = ");
                        this.emitInnerFunction(innerFunc, (innerFunc.name && !innerFunc.name.isMissing()), false,
                                         null, innerFunc.hasSelfReference(), null);
                    }
                }

                // Emit the function's local static values
                if (funcDecl.statics) {
                    this.recordSourceMappingStart(funcDecl.statics);
                    len = funcDecl.statics.members.length;
                    for (i = 0; i < len; i++) {
                        this.emitIndent();
                        this.writeToOutput(funcName);
                        this.emitJavascript(funcDecl.statics.members[i], TokenID.Tilde, false);
                        this.writeLineToOutput("");
                    }
                    this.recordSourceMappingEnd(funcDecl.statics);
                }

                this.decreaseIndent();
                this.emitIndent();
                var printProto = isProtoMember && this.thisClassNode;
                var prefix = printProto ? this.thisClassNode.name.text + ".prototype." : "";
                this.writeLineToOutput("})(" + prefix + funcName + ");")
            }
            this.recordSourceMappingEnd(funcDecl);
            this.emitParensAndCommentsInPlace(funcDecl, false);
            /// TODO: See the other part of this at the beginning of function
            //if (funcDecl.preComments!=null && funcDecl.preComments.length>0) {
            //    this.decreaseIndent();
            //}           
        }

        public emitJavascriptModule(moduleDecl: ModuleDecl) {
            var modName = moduleDecl.name.text;
            if (isTSFile(modName)) {
                moduleDecl.name.text = modName.substring(0, modName.length - 3);
            }
            else if (isSTRFile(modName)) {
                moduleDecl.name.text = modName.substring(0, modName.length - 4);
            }

            if (!hasFlag(moduleDecl.modFlags, ModuleFlags.Ambient)) {
                var isDynamicMod = hasFlag(moduleDecl.modFlags, ModuleFlags.IsDynamic);
                var oldDeclIndentDelta = this.declIndentDelta;
                var wasDottedModuleDecl = this.declDottedModuleName;
                var oldDeclContainingAST: AST = null;
                var prevOutFile = this.outfile;
                var temp = this.setContainer(EmitContainer.Module);
                var svModuleName = this.moduleName;
                var isExported = hasFlag(moduleDecl.modFlags, ModuleFlags.Exported);
                this.moduleDeclList[this.moduleDeclList.length] = moduleDecl;

                this.moduleName = moduleDecl.name.text;

                this.recordSourceMappingStart(moduleDecl);
                // prologue
                if (isDynamicMod) {
                    // create the new outfile for this module
                    var modFilePath = stripQuotes(trimModName(moduleDecl.name.text)) + ".js";

                    if (this.emitOptions.createFile) {
                        if (modFilePath != this.emitOptions.path) {
                            this.outfile = this.emitOptions.createFile(modFilePath);
                        } else if (!this.emitOptions.outputMany) {
                            // If we are emitting single file then its path cannot collide with module output
                            this.checker.errorReporter.emitterError(moduleDecl, "Module emit collides with emitted script: " + modFilePath);
                        }
                    }

                    this.setContainer(EmitContainer.DynamicModule); // discard the previous 'Module' container

                    if (moduleGenTarget == ModuleGenTarget.Asynchronous) { // AMD
                        var dependencyList = "[\"require\", \"exports\"";
                        var importList = "require, exports";
                        var importStatement: ImportDecl = null;

                        // all dependencies are quoted
                        for (var i = 0; i < (<ModuleType>moduleDecl.mod).importedModules.length; i++) {
                            importStatement = (<ModuleType>moduleDecl.mod).importedModules[i]

                            // if the imported module is only used in a type position, do not add it as a requirement
                            if (importStatement.id.sym &&
                                !(<TypeSymbol>importStatement.id.sym).onlyReferencedAsTypeRef) {
                                if (i <= (<ModuleType>moduleDecl.mod).importedModules.length - 1) {
                                    dependencyList += ", ";
                                    importList += ", ";
                                }

                                importList += "__" + importStatement.id.text + "__";
                                dependencyList += importStatement.firstAliasedModToString();
                            }
                        }

                        // emit any potential amd dependencies
                        for (var i = 0; i < moduleDecl.amdDependencies.length; i++) {
                            dependencyList += ", \"" + moduleDecl.amdDependencies[i] + "\"";
                        }

                        dependencyList += "]";

                        this.writeLineToOutput("define(" + dependencyList + "," + " function(" + importList + ") {");
                    }
                    else { // Node

                    }
                }
                else {

                    if (!isExported) {
                        this.writeLineToOutput("var " + this.moduleName + ";");
                        this.emitIndent();
                    }

                    this.writeLineToOutput("(function (" + this.moduleName + ") {");
                }

                // body - don't indent for Node
                if (!isDynamicMod || moduleGenTarget == ModuleGenTarget.Asynchronous) {
                    this.increaseIndent();
                    if (isDynamicMod) {
                        // We dont emit declares for these so add the delta
                        this.addDeclIndentDelta();
                    }
                }

                if (moduleDecl.modFlags & ModuleFlags.MustCaptureThis) {
                    this.emitIndent();
                    this.writeLineToOutput(this.captureThisStmtString);
                }

                this.emitJavascriptList(moduleDecl.members, null, TokenID.SColon, true, false, false);
                if (!isDynamicMod || moduleGenTarget == ModuleGenTarget.Asynchronous) {
                    this.decreaseIndent();
                    if (isDynamicMod) {
                        // We dont emit declares for these so add the delta
                        this.reduceDeclIndentDelta();
                    }
                }
                this.emitIndent();

                // epilogue
                if (isDynamicMod) {
                    if (moduleGenTarget == ModuleGenTarget.Asynchronous) { // AMD
                        this.writeLineToOutput("})");
                    }
                    else { // Node
                    }

                    // close the module outfile, and restore the old one
                    if (this.outfile != prevOutFile) {
                        this.outfile.Close();
                        this.outfile = prevOutFile;
                    }
                }
                else {
                    var containingMod: ModuleDecl = null;
                    if (moduleDecl.type && moduleDecl.type.symbol.container && moduleDecl.type.symbol.container.declAST) {
                        containingMod = <ModuleDecl>moduleDecl.type.symbol.container.declAST;
                    }
                    var parentIsDynamic = containingMod && hasFlag(containingMod.modFlags, ModuleFlags.IsDynamic);

                    if (temp == EmitContainer.Prog && isExported) {
                        this.writeLineToOutput("})(this." + this.moduleName + " || (this." + this.moduleName + " = {}));");
                    }
                    else if (isExported || temp == EmitContainer.Prog) {
                        var dotMod = svModuleName != "" ? (parentIsDynamic ? "exports" : svModuleName) + "." : svModuleName;
                        this.writeLineToOutput("})(" + dotMod + this.moduleName + " || (" + dotMod + this.moduleName + " = {}));");
                    }
                    else if (!isExported && temp != EmitContainer.Prog) {
                        this.writeLineToOutput("})(" + this.moduleName + " || (" + this.moduleName + " = {}));");
                    }
                    else {
                        this.writeLineToOutput("})();");
                    }
                    if (temp != EmitContainer.Prog && !parentIsDynamic && isExported) {
                        this.emitIndent();
                        this.writeLineToOutput("var " + this.moduleName + " = " + svModuleName + "." + this.moduleName + ";");
                    }
                }

                this.recordSourceMappingEnd(moduleDecl);
                this.setContainer(temp);
                this.moduleName = svModuleName;
                this.moduleDeclList.length--;
            }
        }

        public emitIndex(operand1: AST, operand2: AST) {
            var temp = this.setInObjectLiteral(false);
            this.emitJavascript(operand1, TokenID.Tilde, false);
            this.writeToOutput("[");
            this.emitJavascriptList(operand2, ", ", TokenID.Comma, false, false, false);
            this.writeToOutput("]");
            this.setInObjectLiteral(temp);
        }

        public emitStringLiteral(text: string) {
            // should preserve escape etc.
            // TODO: simplify object literal simple name
            this.writeToOutput(text);
        }

        public emitJavascriptFunction(funcDecl: FuncDecl) {
            if (hasFlag(funcDecl.fncFlags, FncFlags.Signature) || funcDecl.isOverload) {
                return;
            }
            var temp: number;
            var tempFnc = this.thisFnc;
            this.thisFnc = funcDecl;

            if (funcDecl.isConstructor) {
                temp = this.setContainer(EmitContainer.Constructor);
            }
            else {
                temp = this.setContainer(EmitContainer.Function);
            }

            var bases: ASTList = null;
            var hasSelfRef = false;
            var funcName = funcDecl.getNameText();

            if ((this.emitState.inObjectLiteral || !funcDecl.isAccessor()) &&
                ((temp != EmitContainer.Constructor) ||
                ((funcDecl.fncFlags & FncFlags.Method) == FncFlags.None))) {
                var tempLit = this.setInObjectLiteral(false);
                if (this.thisClassNode) {
                    bases = this.thisClassNode.extendsList;
                }
                hasSelfRef = funcDecl.hasSelfReference();
                this.recordSourceMappingStart(funcDecl);
                if (hasFlag(funcDecl.fncFlags, FncFlags.Exported | FncFlags.ClassPropertyMethodExported) && funcDecl.type.symbol.container == this.checker.gloMod && !funcDecl.isConstructor) {
                    this.writeToOutput("this." + funcName + " = ");
                    this.emitInnerFunction(funcDecl, false, false, bases, hasSelfRef, this.thisClassNode);
                }
                else {
                    this.emitInnerFunction(funcDecl, (funcDecl.name && !funcDecl.name.isMissing()), false, bases, hasSelfRef, this.thisClassNode);
                }
                this.recordSourceMappingEnd(funcDecl);
                this.setInObjectLiteral(tempLit);
            }
            this.setContainer(temp);
            this.thisFnc = tempFnc;

            if (hasFlag(funcDecl.fncFlags, FncFlags.Definition)) {
                if (hasFlag(funcDecl.fncFlags, FncFlags.Static)) {
                    if (this.thisClassNode) {
                        if (funcDecl.isAccessor()) {
                            this.emitPropertyAccessor(funcDecl, this.thisClassNode.name.text, false);
                        }
                        else {
                            this.emitIndent();
                            this.recordSourceMappingStart(funcDecl);
                            this.writeLineToOutput(this.thisClassNode.name.text + "." + funcName +
                                          " = " + funcName + ";");
                            this.recordSourceMappingEnd(funcDecl);
                        }
                    }
                }
                else if ((this.emitState.container == EmitContainer.Module || this.emitState.container == EmitContainer.DynamicModule) && hasFlag(funcDecl.fncFlags, FncFlags.Exported | FncFlags.ClassPropertyMethodExported)) {
                    this.emitIndent();
                    var modName = this.emitState.container == EmitContainer.Module ? this.moduleName : "exports";
                    this.recordSourceMappingStart(funcDecl);
                    this.writeLineToOutput(modName + "." + funcName +
                                      " = " + funcName + ";");
                    this.recordSourceMappingEnd(funcDecl);
                }
            }
        }

        public emitAmbientVarDecl(varDecl: VarDecl) {
            if (varDecl.init) {
                this.emitParensAndCommentsInPlace(varDecl, true);
                this.recordSourceMappingStart(varDecl);
                this.recordSourceMappingStart(varDecl.id);
                this.writeToOutput(varDecl.id.text);
                this.recordSourceMappingEnd(varDecl.id);
                this.writeToOutput(" = ");
                this.emitJavascript(varDecl.init, TokenID.Comma, false);
                this.recordSourceMappingEnd(varDecl);
                this.writeToOutput(";");
                this.emitParensAndCommentsInPlace(varDecl, false);
            }
        }

        public emitForVarList(varDeclList: ASTList) {
            if (varDeclList) {
                this.recordSourceMappingStart(varDeclList);
                var len = varDeclList.members.length;
                for (var i = 0; i < len; i++) {
                    var varDecl = <VarDecl>varDeclList.members[i];
                    this.emitJavascriptVarDecl(varDecl, (i == 0) ? TokenID.FOR : TokenID.LParen);
                    if (i < (len - 1)) {
                        this.writeToOutput(", ");
                    }
                }
                this.recordSourceMappingEnd(varDeclList);
            }
        }

        public emitJavascriptVarDecl(varDecl: VarDecl, tokenId: TokenID) {
            if ((varDecl.varFlags & VarFlags.Ambient) == VarFlags.Ambient) {
                this.emitAmbientVarDecl(varDecl);
            }
            else {
                var sym = varDecl.sym;
                var hasInitializer = (varDecl.init != null);
                this.emitParensAndCommentsInPlace(varDecl, true);
                this.recordSourceMappingStart(varDecl);
                if (sym && sym.isMember() && sym.container &&
                    (sym.container.kind() == SymbolKind.Type)) {
                    var type = (<TypeSymbol>sym.container).type;
                    if (type.isClass() && (!hasFlag(sym.flags, SymbolFlags.ModuleMember))) {
                        // class
                        if (this.emitState.container != EmitContainer.Args) {
                            if (hasFlag(sym.flags, SymbolFlags.Static)) {
                                this.writeToOutput(sym.container.name + ".");
                            }
                            else {
                                this.writeToOutput("this.");
                            }
                        }
                    }
                    else if (type.hasImplementation()) {
                        // module
                        if (!hasFlag(sym.flags, SymbolFlags.Exported) && (sym.container == this.checker.gloMod || !hasFlag(sym.flags, SymbolFlags.Property))) {
                            this.writeToOutput("var ");
                        }
                        else if (hasFlag(varDecl.varFlags, VarFlags.LocalStatic)) {
                            this.writeToOutput(".");
                        }
                        else {
                            if (this.emitState.container == EmitContainer.DynamicModule) {
                                this.writeToOutput("exports.");
                            }
                            else {
                                this.writeToOutput(this.moduleName + ".");
                            }
                        }
                    }
                    else {
                        // function, constructor, method etc.
                        if (tokenId != TokenID.LParen) {
                            if (hasFlag(sym.flags, SymbolFlags.Exported) && sym.container == this.checker.gloMod) {
                                this.writeToOutput("this.");
                            }
                            else {
                                this.writeToOutput("var ");
                            }
                        }
                    }
                }
                else {
                    if (tokenId != TokenID.LParen) {
                        this.writeToOutput("var ");
                    }
                }
                this.recordSourceMappingStart(varDecl.id);
                this.writeToOutput(varDecl.id.text);
                this.recordSourceMappingEnd(varDecl.id);
                if (hasInitializer) {
                    this.writeToOutputTrimmable(" = ");
                    this.emitJavascript(varDecl.init, TokenID.Comma, false);
                }
                else if (sym && sym.isMember() &&
                         (this.emitState.container == EmitContainer.Constructor)) {
                    this.writeToOutputTrimmable(" = ");
                    this.writeToOutput(this.defaultValue(varDecl.type));
                }
                if ((tokenId != TokenID.FOR) && (tokenId != TokenID.LParen)) {
                    this.writeToOutputTrimmable(";");
                }
                this.recordSourceMappingEnd(varDecl);
                this.emitParensAndCommentsInPlace(varDecl, false);
            }
        }

        public declEnclosed(moduleDecl: ModuleDecl): bool {
            if (moduleDecl == null) {
                return true;
            }
            for (var i = 0, len = this.moduleDeclList.length; i < len; i++) {
                if (this.moduleDeclList[i] == moduleDecl) {
                    return true;
                }
            }
            return false;
        }

        public emitJavascriptName(name: Identifier, addThis: bool) {
            var sym = name.sym;
            this.emitParensAndCommentsInPlace(name, true);
            this.recordSourceMappingStart(name);
            if (!name.isMissing()) {
                if (addThis && (this.emitState.container != EmitContainer.Args) && sym) {
                    // TODO: flag global module with marker other than string name
                    if (sym.container && (sym.container.name != globalId)) {
                        if (hasFlag(sym.flags, SymbolFlags.Static) && (hasFlag(sym.flags, SymbolFlags.Property))) {
                            if (sym.declModule && hasFlag(sym.declModule.modFlags, ModuleFlags.IsDynamic)) {
                                this.writeToOutput("exports.");
                            }
                            else {
                                this.writeToOutput(sym.container.name + ".");
                            }
                        }
                        else if (sym.kind() == SymbolKind.Field) {
                            var fieldSym = <FieldSymbol>sym;
                            if (hasFlag(fieldSym.flags, SymbolFlags.ModuleMember)) {
                                if ((sym.container != this.checker.gloMod) && ((hasFlag(sym.flags, SymbolFlags.Property)) || hasFlag(sym.flags, SymbolFlags.Exported))) {
                                    if (hasFlag(sym.declModule.modFlags, ModuleFlags.IsDynamic)) {
                                        this.writeToOutput("exports.");
                                    }
                                    else {
                                        this.writeToOutput(sym.container.name + ".");
                                    }
                                }
                            }
                            else {
                                if (sym.isInstanceProperty()) {
                                    if (this.thisFnc && !this.thisFnc.isMethod() &&
                                        (!this.thisFnc.isConstructor)) {
                                        this.writeToOutput("_this.");
                                    }
                                    else {
                                        this.writeToOutput("this.");
                                    }
                                }
                            }
                        }
                        else if (sym.kind() == SymbolKind.Type) {
                            if (sym.isInstanceProperty()) {
                                var typeSym = <TypeSymbol>sym;
                                var type = typeSym.type;
                                if (type.call && !hasFlag(sym.flags, SymbolFlags.ModuleMember)) {
                                    if (this.thisFnc && !this.thisFnc.isMethod() &&
                                        !this.thisFnc.isConstructor) {
                                        this.writeToOutput("_this.");
                                    }
                                    else {
                                        this.writeToOutput("this.");
                                    }
                                }
                            }
                            else if ((sym.unitIndex != this.checker.locationInfo.unitIndex) || (!this.declEnclosed(sym.declModule))) {
                                this.writeToOutput(sym.container.name + ".")
                            }
                        }
                    }
                    else if (sym.container == this.checker.gloMod &&
                                hasFlag(sym.flags, SymbolFlags.Exported) &&
                                !hasFlag(sym.flags, SymbolFlags.Ambient) &&
                                // check that it's a not a member of an ambient module...
                                !((sym.isType() || sym.isMember()) &&
                                    sym.declModule &&
                                    hasFlag(sym.declModule.modFlags, ModuleFlags.Ambient)) &&
                                this.emitState.container == EmitContainer.Prog &&
                                sym.declAST.nodeType != NodeType.FuncDecl) {
                        this.writeToOutput("this.");
                    }
                }

                // If it's a dynamic module, we need to print the "require" invocation
                if (sym &&
                    sym.declAST &&
                    sym.declAST.nodeType == NodeType.Module &&
                    (hasFlag((<ModuleDecl>sym.declAST).modFlags, ModuleFlags.IsDynamic))) {
                    var moduleDecl: ModuleDecl = <ModuleDecl>sym.declAST;

                    if (moduleGenTarget == ModuleGenTarget.Asynchronous) {
                        this.writeLineToOutput("__" + this.modAliasId + "__;");
                    }
                    else {
                        var modPath = name.text;//(<ModuleDecl>moduleDecl.mod.symbol.declAST).name.text;
                        var isAmbient = moduleDecl.mod.symbol.declAST && hasFlag((<ModuleDecl>moduleDecl.mod.symbol.declAST).modFlags, ModuleFlags.Ambient);
                        modPath = isAmbient ? modPath : this.firstModAlias ? this.firstModAlias : quoteBaseName(modPath);
                        modPath = isAmbient ? modPath : (!isRelative(stripQuotes(modPath)) ? quoteStr("./" + stripQuotes(modPath)) : modPath);
                        this.writeToOutput("require(" + modPath + ")");
                    }
                }
                else {
                    this.writeToOutput(name.text);
                }
            }
            this.recordSourceMappingEnd(name);
            this.emitParensAndCommentsInPlace(name, false);
        }

        public emitJavascriptStatements(stmts: AST, emitEmptyBod: bool, newlineAfterBlock: bool) {
            if (stmts) {
                if (stmts.nodeType != NodeType.Block) {
                    var hasContents = (stmts && (stmts.nodeType != NodeType.List || ((<ASTList>stmts).members.length > 0)));
                    if (emitEmptyBod || hasContents) {
                        var hasOnlyBlockStatement = ((stmts.nodeType == NodeType.Block) ||
                            ((stmts.nodeType == NodeType.List) && ((<ASTList>stmts).members.length == 1) && ((<ASTList>stmts).members[0].nodeType == NodeType.Block)));

                        this.recordSourceMappingStart(stmts);
                        if (!hasOnlyBlockStatement) {
                            this.writeLineToOutput(" {");
                            this.increaseIndent();
                        }
                        this.emitJavascriptList(stmts, null, TokenID.SColon, true, false, false);
                        if (!hasOnlyBlockStatement) {
                            this.writeLineToOutput("");
                            this.decreaseIndent();
                            this.emitIndent();
                            this.writeToOutput("}");
                        }
                        this.recordSourceMappingEnd(stmts);
                    }
                }
                else {
                    this.emitJavascript(stmts, TokenID.SColon, true);
                }
            }
            else if (emitEmptyBod) {
                this.writeToOutput("{ }");
            }
        }

        public emitBareJavascriptStatements(stmts: AST, emitClassPropertiesAfterSuperCall: bool) {
            // just the statements without enclosing curly braces
            if (stmts.nodeType != NodeType.Block) {
                if (stmts.nodeType == NodeType.List) {
                    var stmtList = <ASTList>stmts;
                    if ((stmtList.members.length == 2) &&
                        (stmtList.members[0].nodeType == NodeType.Block) &&
                        (stmtList.members[1].nodeType == NodeType.EndCode)) {
                        this.emitJavascript(stmtList.members[0], TokenID.SColon, true);
                        this.writeLineToOutput("");
                    }
                    else {
                        this.emitJavascriptList(stmts, null, TokenID.SColon, true, false, emitClassPropertiesAfterSuperCall);
                    }
                }
                else {
                    this.emitJavascript(stmts, TokenID.SColon, true);
                }
            }
            else {
                this.emitJavascript(stmts, TokenID.SColon, true);
            }
        }

        public recordSourceMappingStart(ast: AST) {
            if (this.sourceMapper && ast) {
                var lineCol = { line: -1, col: -1 };
                var sourceMapping = new SourceMapping(ast);
                sourceMapping.emittedStartColumn = this.emitState.column;
                sourceMapping.emittedStartLine = this.emitState.line;
                // REVIEW: check time consumed by this binary search (about two per leaf statement)
                getSourceLineColFromMap(lineCol, ast.minChar, this.checker.locationInfo.lineMap);
                sourceMapping.sourceStartColumn = lineCol.col;
                sourceMapping.sourceStartLine = lineCol.line;
                getSourceLineColFromMap(lineCol, ast.limChar, this.checker.locationInfo.lineMap);
                sourceMapping.sourceEndColumn = lineCol.col;
                sourceMapping.sourceEndLine = lineCol.line;
                sourceMapping.parent = this.sourceMapper.currentMapping;
                this.sourceMapper.currentMapping = this.sourceMapper.sourceMappings.length;
                this.sourceMapper.sourceMappings.push(sourceMapping);
                if (sourceMapping.parent >= 0) {
                    var parentMapping = this.sourceMapper.sourceMappings[sourceMapping.parent];
                    if (parentMapping.firstChild == -1) {
                        parentMapping.firstChild = this.sourceMapper.currentMapping;
                    }
                }
            }
        }

        public recordSourceMappingEnd(ast: AST) {
            if (this.sourceMapper && ast) {
                var currentMappingIndex = this.sourceMapper.currentMapping;
                var sourceMapping = this.sourceMapper.sourceMappings[currentMappingIndex];
                //if (sourceMapping.__debugAST !== ast) {
                //    throw Error("Unbalanced AST start and stop record found");
                //}
                sourceMapping.emittedEndColumn = this.emitState.column;
                sourceMapping.emittedEndLine = this.emitState.line;
                this.sourceMapper.currentMapping = sourceMapping.parent;
            }
        }

        public emitSourceMappings() {
            SourceMapper.EmitSourceMapping(this.allSourceMappers);
        }

        public emitJavascriptList(ast: AST, delimiter: string, tokenId: TokenID, startLine: bool, onlyStatics: bool, emitClassPropertiesAfterSuperCall: bool) {
            if (ast == null) {
                return;
            }
            else if (ast.nodeType != NodeType.List) {
                this.emitJavascript(ast, tokenId, startLine);
            }
            else {
                var list = <ASTList>ast;
                if (list.members.length == 0)
                    return;

                this.emitParensAndCommentsInPlace(ast, true);
                var len = list.members.length;
                for (var i = 0; i < len; i++) {

                    // In some circumstances, class property initializers must be emitted immediately after the 'super' constructor
                    // call which, in these cases, must be the first statement in the constructor body
                    if (i == 1 && emitClassPropertiesAfterSuperCall) {

                        // emit any parameter properties first
                        var constructorDecl = (<ClassDecl>this.thisClassNode).constructorDecl;

                        if (constructorDecl && constructorDecl.args) {
                            var argsLen = constructorDecl.args.members.length;
                            for (var iArg = 0; iArg < argsLen; iArg++) {
                                var arg = <BoundDecl>constructorDecl.args.members[iArg];
                                if ((arg.varFlags & VarFlags.Property) != VarFlags.None) {
                                    this.emitIndent();
                                    this.recordSourceMappingStart(arg);
                                    this.recordSourceMappingStart(arg.id);
                                    this.writeToOutput("this." + arg.id.text);
                                    this.recordSourceMappingEnd(arg.id);
                                    this.writeToOutput(" = ");
                                    this.recordSourceMappingStart(arg.id);
                                    this.writeToOutput(arg.id.text);
                                    this.recordSourceMappingEnd(arg.id);
                                    this.writeLineToOutput(";");
                                    this.recordSourceMappingEnd(arg);
                                }
                            }
                        }

                        var nProps = (<ASTList>this.thisClassNode.members).members.length;

                        for (var iMember = 0; iMember < nProps; iMember++) {
                            if ((<ASTList>this.thisClassNode.members).members[iMember].nodeType == NodeType.VarDecl) {
                                var varDecl = <VarDecl>(<ASTList>this.thisClassNode.members).members[iMember];
                                if (!hasFlag(varDecl.varFlags, VarFlags.Static) && varDecl.init) {
                                    this.emitIndent();
                                    this.emitJavascriptVarDecl(varDecl, TokenID.Tilde);
                                    this.writeLineToOutput("");
                                }
                            }
                        }
                    }

                    var emitNode = list.members[i];

                    var isStaticDecl =
                                (emitNode.nodeType == NodeType.FuncDecl && hasFlag((<FuncDecl>emitNode).fncFlags, FncFlags.Static)) ||
                                (emitNode.nodeType == NodeType.VarDecl && hasFlag((<VarDecl>emitNode).varFlags, VarFlags.Static))

                    if (onlyStatics ? !isStaticDecl : isStaticDecl) {
                        continue;
                    }
                    this.emitJavascript(emitNode, tokenId, startLine);

                    if (delimiter && (i < (len - 1))) {
                        if (startLine) {
                            this.writeLineToOutput(delimiter);
                        }
                        else {
                            this.writeToOutput(delimiter);
                        }
                    }
                    else if (startLine &&
                             (emitNode.nodeType != NodeType.Module) &&
                             (emitNode.nodeType != NodeType.Interface) &&
                             (!((emitNode.nodeType == NodeType.VarDecl) &&
                                ((((<VarDecl>emitNode).varFlags) & VarFlags.Ambient) == VarFlags.Ambient) &&
                                (((<VarDecl>emitNode).init) == null))) &&
                             (emitNode.nodeType != NodeType.EndCode) &&
                             (emitNode.nodeType != NodeType.FuncDecl)) {
                        this.writeLineToOutput("");
                    }
                }
                this.emitParensAndCommentsInPlace(ast, false);
            }
        }

        // tokenId is the id the preceding token
        public emitJavascript(ast: AST, tokenId: TokenID, startLine: bool) {
            if (ast == null) {
                return;
            }

            var parenthesize = false;
            // REVIEW: simplify rules for indenting
            if (startLine && (this.emitState.indentAmt > 0) && (ast.nodeType != NodeType.List) &&
                (ast.nodeType != NodeType.Block)) {
                if ((ast.nodeType != NodeType.Interface) &&
                    (!((ast.nodeType == NodeType.VarDecl) &&
                       ((((<VarDecl>ast).varFlags) & VarFlags.Ambient) == VarFlags.Ambient) &&
                       (((<VarDecl>ast).init) == null))) &&
                    (ast.nodeType != NodeType.EndCode) &&
                    ((ast.nodeType != NodeType.FuncDecl) ||
                     (this.emitState.container != EmitContainer.Constructor))) {
                    this.emitIndent();
                }
            }

            if (parenthesize) {
                this.writeToOutput("(");
            }

            ast.emit(this, tokenId, startLine);

            if (parenthesize) {
                this.writeToOutput(")");
            }

            if ((tokenId == TokenID.SColon) && (ast.nodeType < NodeType.GeneralNode)) {
                this.writeToOutput(";");
            }
        }

        public emitPropertyAccessor(funcDecl: FuncDecl, className: string, isProto: bool) {
            if (!(<FieldSymbol>funcDecl.accessorSymbol).hasBeenEmitted) {
                var accessorSymbol = <FieldSymbol>funcDecl.accessorSymbol;
                this.emitIndent();
                this.recordSourceMappingStart(funcDecl);
                this.writeLineToOutput("Object.defineProperty(" + className + (isProto ? ".prototype, \"" : ", \"") + funcDecl.name.text + "\"" + ", {");
                this.increaseIndent();

                if (accessorSymbol.getter) {
                    var getter: FuncDecl = <FuncDecl>accessorSymbol.getter.declAST;

                    this.emitIndent();
                    this.writeToOutput("get: ");
                    this.emitInnerFunction(getter, false, isProto, null, funcDecl.hasSelfReference(), null);
                    this.writeLineToOutput(",");
                }

                if (accessorSymbol.setter) {
                    var setter: FuncDecl = <FuncDecl>accessorSymbol.setter.declAST;

                    this.emitIndent();
                    this.writeToOutput("set: ");
                    this.emitInnerFunction(setter, false, isProto, null, funcDecl.hasSelfReference(), null);
                    this.writeLineToOutput(",");
                }

                this.emitIndent();
                this.writeLineToOutput("enumerable: true,");
                this.emitIndent();
                this.writeLineToOutput("configurable: true");
                this.decreaseIndent();
                this.emitIndent();
                this.writeLineToOutput("});");
                this.recordSourceMappingEnd(funcDecl);

                accessorSymbol.hasBeenEmitted = true;
            }
        }

        public emitPrototypeMember(member: AST, className: string) {
            if (member.nodeType == NodeType.FuncDecl) {
                var funcDecl = <FuncDecl>member;
                if (funcDecl.isAccessor()) {
                    this.emitPropertyAccessor(funcDecl, className, true);
                }
                else {
                    this.emitIndent();
                    this.recordSourceMappingStart(funcDecl);
                    this.writeToOutput(className + ".prototype." + funcDecl.getNameText() + " = ");
                    this.emitInnerFunction(funcDecl, false, true, null, funcDecl.hasSelfReference(), null);
                    this.recordSourceMappingEnd(funcDecl);
                    this.writeLineToOutput(";");
                }
            }
            else if (member.nodeType == NodeType.VarDecl) {
                var varDecl = <VarDecl>member;

                if (varDecl.init) {
                    this.emitIndent();
                    this.recordSourceMappingStart(varDecl);
                    this.recordSourceMappingStart(varDecl.id);
                    this.writeToOutput(className + ".prototype." + varDecl.id.text);
                    this.recordSourceMappingEnd(varDecl.id);
                    this.writeToOutput(" = ");
                    this.emitJavascript(varDecl.init, TokenID.Asg, false);
                    this.recordSourceMappingEnd(varDecl);
                    this.writeLineToOutput(";");
                }
            }
        }

        public emitAddBaseMethods(className: string, base: Type, classDecl: NamedType): void {
            if (base.members) {
                var baseSymbol = base.symbol;
                var baseName = baseSymbol.name;
                if (baseSymbol.declModule != classDecl.type.symbol.declModule) {
                    baseName = baseSymbol.fullName();
                }
                base.members.allMembers.map(function (key, s, c) {
                    var sym = <Symbol>s;
                    if ((sym.kind() == SymbolKind.Type) && (<TypeSymbol>sym).type.call) {
                        this.recordSourceMappingStart(sym.declAST);
                        this.writeLineToOutput(className + ".prototype." + sym.name + " = " +
                                          baseName + ".prototype." + sym.name + ";");
                        this.recordSourceMappingEnd(sym.declAST);
                    }
                }, null);
            }
            if (base.extendsList) {
                for (var i = 0, len = base.extendsList.length; i < len; i++) {
                    this.emitAddBaseMethods(className, base.extendsList[i], classDecl);
                }
            }
        }

        public emitJavascriptClass(classDecl: ClassDecl) {
            if (!hasFlag(classDecl.varFlags, VarFlags.Ambient)) {
                var svClassNode = this.thisClassNode;
                var i = 0;
                this.thisClassNode = classDecl;
                var className = classDecl.name.text;
                this.emitParensAndCommentsInPlace(classDecl, true);
                var temp = this.setContainer(EmitContainer.Class);

                this.recordSourceMappingStart(classDecl);
                if (hasFlag(classDecl.varFlags, VarFlags.Exported) && classDecl.type.symbol.container == this.checker.gloMod) {
                    this.writeToOutput("this." + className);
                }
                else {
                    this.writeToOutput("var " + className);
                }

                //if (hasFlag(classDecl.varFlags, VarFlags.Exported) && (temp == EmitContainer.Module || temp == EmitContainer.DynamicModule)) {
                //    var modName = temp == EmitContainer.Module ? this.moduleName : "exports";
                //    this.writeToOutput(" = " + modName + "." + className);
                //}

                var _class: Type = classDecl.type;
                var instanceType = _class.instanceType;
                var baseClass = instanceType ? instanceType.baseClass() : null;
                var baseNameDecl: AST = null;
                var baseName: AST = null;

                if (baseClass) {
                    this.writeLineToOutput(" = (function (_super) {");
                } else {
                    this.writeLineToOutput(" = (function () {");
                }

                this.increaseIndent();

                if (baseClass) {
                    baseNameDecl = classDecl.extendsList.members[0];
                    baseName = baseNameDecl.nodeType == NodeType.Call ? (<CallExpression>baseNameDecl).target : baseNameDecl;
                    this.emitIndent();
                    this.writeLineToOutput("__extends(" + className + ", _super);");
                    // REVIEW: mixins
                    var elen = instanceType.extendsList.length;
                    if (elen > 1) {
                        for (var i = 1; i < elen; i++) {
                            var base = instanceType.extendsList[i];
                            this.emitAddBaseMethods(className, base, classDecl);
                        }
                    }
                }

                this.emitIndent();

                var constrDecl = classDecl.constructorDecl;

                // output constructor
                if (constrDecl) {
                    // declared constructor
                    this.emitJavascript(classDecl.constructorDecl, TokenID.LParen, false);

                }
                else {
                    var wroteProps = 0;

                    this.recordSourceMappingStart(classDecl);
                    // default constructor
                    this.increaseIndent();
                    this.writeToOutput("function " + classDecl.name.text + "() {");
                    if (baseClass) {
                        this.writeLineToOutput("");
                        this.emitIndent();
                        this.writeLineToOutput("_super.apply(this, arguments);");
                        wroteProps++;
                    }

                    if (classDecl.varFlags & VarFlags.MustCaptureThis) {
                        this.emitIndent();
                        this.writeLineToOutput(this.captureThisStmtString);
                    }

                    var members = (<ASTList>this.thisClassNode.members).members

                    // output initialized properties
                    for (var i = 0; i < members.length; i++) {
                        if (members[i].nodeType == NodeType.VarDecl) {
                            var varDecl = <VarDecl>members[i];
                            if (!hasFlag(varDecl.varFlags, VarFlags.Static) && varDecl.init) {
                                this.writeLineToOutput("");
                                this.emitIndent();
                                this.emitJavascriptVarDecl(varDecl, TokenID.Tilde);
                                wroteProps++;
                            }
                        }
                    }
                    if (wroteProps) {
                        this.writeLineToOutput("");
                        this.decreaseIndent();
                        this.emitIndent();
                        this.writeLineToOutput("}");
                    }
                    else {
                        this.writeLineToOutput(" }");
                        this.decreaseIndent();
                    }
                    this.recordSourceMappingEnd(classDecl);
                }

                var membersLen = classDecl.definitionMembers.members.length;
                for (var j = 0; j < membersLen; j++) {

                    var memberDecl: AST = classDecl.definitionMembers.members[j];

                    if (memberDecl.nodeType == NodeType.FuncDecl) {
                        var fn = <FuncDecl>memberDecl;

                        if (hasFlag(fn.fncFlags, FncFlags.Method) && !fn.isSignature()) {
                            if (!hasFlag(fn.fncFlags, FncFlags.Static)) {
                                this.emitPrototypeMember(fn, className);
                            }
                            else { // static functions
                                if (fn.isAccessor()) {
                                    this.emitPropertyAccessor(fn, this.thisClassNode.name.text, false);
                                }
                                else {
                                    this.emitIndent();
                                    this.recordSourceMappingStart(fn)
                                    this.writeToOutput(classDecl.name.text + "." + fn.name.text + " = ");
                                    this.emitInnerFunction(fn, (fn.name && !fn.name.isMissing()), false,
                                            null, fn.hasSelfReference(), null);
                                    this.recordSourceMappingEnd(fn)
                                }
                            }
                        }
                    }
                    else if (memberDecl.nodeType == NodeType.VarDecl) {
                        var varDecl = <VarDecl>memberDecl;
                        if (hasFlag(varDecl.varFlags, VarFlags.Static)) {
                            this.emitIndent();
                            this.recordSourceMappingStart(varDecl);
                            this.writeToOutput(classDecl.name.text + "." + varDecl.id.text + " = ");
                            if (varDecl.init) {
                                this.emitJavascript(varDecl.init, TokenID.Asg, false);
                                this.writeLineToOutput(";");
                            }
                            else {
                                // REVIEW: We should not be initializing uninitialized member declarations, here and elsewhere
                                this.writeLineToOutput(this.defaultValue(varDecl.type) + ";");
                            }
                            this.recordSourceMappingEnd(varDecl);
                        }
                    }
                    else {
                        throw Error("We want to catch this");
                    }
                }

                this.emitIndent();
                this.recordSourceMappingStart(classDecl);
                this.writeLineToOutput("return " + className + ";");
                this.recordSourceMappingEnd(classDecl);
                this.decreaseIndent();
                this.emitIndent();
                this.writeToOutput("})(");
                if (baseClass)
                    this.emitJavascript(baseName, TokenID.Tilde, false);
                this.writeToOutput(");");

                if ((temp == EmitContainer.Module || temp == EmitContainer.DynamicModule) && hasFlag(classDecl.varFlags, VarFlags.Exported)) {
                    this.writeLineToOutput("");
                    this.emitIndent();
                    var modName = temp == EmitContainer.Module ? this.moduleName : "exports";
                    this.recordSourceMappingStart(classDecl);
                    this.writeToOutput(modName + "." + className + " = " + className + ";");
                    this.recordSourceMappingEnd(classDecl);
                }

                this.emitIndent();
                this.recordSourceMappingEnd(classDecl);
                this.emitParensAndCommentsInPlace(classDecl, false);
                this.setContainer(temp);
                this.thisClassNode = svClassNode;
            }
        }

        public emitPrologue(reqInherits: bool) {
            // TODO: emit only if inheritence used in unit
            if (!this.prologueEmitted) {
                if (reqInherits) {
                    this.prologueEmitted = true;
                    this.writeLineToOutput("var __extends = this.__extends || function (d, b) {");
                    //this.writeLineToOutput("    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];");
                    this.writeLineToOutput("    function __() { this.constructor = d; }");
                    this.writeLineToOutput("    __.prototype = b.prototype;");
                    this.writeLineToOutput("    d.prototype = new __();");
                    this.writeLineToOutput("}");
                }
                if (this.checker.mustCaptureGlobalThis) {
                    this.writeLineToOutput(this.captureThisStmtString);
                }
            }
        }

        public emitSuperReference() {
            this.writeToOutput("_super.prototype");
        }

        public emitSuperCall(callEx: CallExpression): bool {
            if (callEx.target.nodeType == NodeType.Dot) {
                var dotNode = <BinaryExpression>callEx.target;
                if (dotNode.operand1.nodeType == NodeType.Super) {
                    this.emitJavascript(dotNode, TokenID.LParen, false);
                    this.writeToOutput(".call(this");
                    if (callEx.args && callEx.args.members.length > 0) {
                        this.writeToOutput(", ");
                        this.emitJavascriptList(callEx.args, ", ", TokenID.Comma, false, false, false);
                    }
                    this.writeToOutput(")");
                    return true;
                }
            }
            return false;
        }
    }

}
