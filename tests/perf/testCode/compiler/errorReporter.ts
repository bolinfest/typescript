///<reference path='typescript.ts' />

module TypeScript {
    export interface ILineCol {
        line: number;
        col: number;
    }

    export class ErrorReporter {
        public parser: Parser = null;
        public checker: TypeChecker = null;
        public lineCol = { line: 0, col: 0 };
        public emitAsComments = true;
        public throwOnTypeError = false;
        public hasErrors = false;

        constructor (public outfile: ITextWriter) { }

        public setErrOut(outerr) {
            this.outfile = outerr;
            this.emitAsComments = false;
        }

        public emitPrefix() {
            if (this.emitAsComments) {
                this.outfile.Write("// ");
            }
            this.outfile.Write(this.checker.locationInfo.filename + "(" + this.lineCol.line + "," + this.lineCol.col + "): ");
        }

        public writePrefix(ast: AST): void {
            if (ast != null) {
                this.setError(ast);
            }
            else {
                this.lineCol.line = -1;
                this.lineCol.col = -1;
            }
            this.emitPrefix();
        }

        public writePrefixFromSym(symbol: Symbol): void {
            if ((symbol != null) && (this.checker.locationInfo.lineMap != null)) {
                getSourceLineColFromMap(this.lineCol, symbol.location,
                                        this.checker.locationInfo.lineMap);
            }
            else {
                this.lineCol.line = -1;
                this.lineCol.col = -1;
            }
            this.emitPrefix();
        }

        public setError(ast: AST) {
            if (ast != null) {
                ast.flags |= ASTFlags.Error;
                if (this.checker.locationInfo.lineMap != null) {
                    getSourceLineColFromMap(this.lineCol, ast.minChar, this.checker.locationInfo.lineMap);
                }
            }
        }

        public reportError(ast: AST, message: string) {
            if (this.throwOnTypeError) {
                throw new Error(message);
            }

            this.hasErrors = true;
            var len = (ast.limChar - ast.minChar);
            if (this.parser.errorRecovery && this.parser.errorCallback != null) {
                this.parser.errorCallback(ast.minChar, len, message, this.checker.locationInfo.unitIndex);
            }
            else {
                this.writePrefix(ast);
                this.outfile.WriteLine(message); // Right after the semi-colon
            }
        }

        public reportErrorFromSym(symbol: Symbol, message: string) {
            if (this.throwOnTypeError) {
                throw new Error(message);
            }

            this.hasErrors = true;
            if (this.parser.errorRecovery && this.parser.errorCallback != null) {
                this.parser.errorCallback(symbol.location, 1, message, this.checker.locationInfo.unitIndex);
            }
            else {
                this.writePrefixFromSym(symbol);
                this.outfile.WriteLine(message);
            }
        }

        public emitterError(ast: AST, message: string) {
            this.reportError(ast, message);
            // Emitter errors are not recoverable, stop immediately
            throw Error("EmitError");
        }

        public interfaceDeclNotImpl(t1: Type, t2: Type) {
            this.reportErrorFromSym(t2.symbol, "Class '" + t2.getTypeName() +
                              "' declares interface '" + t1.getTypeName() +
                              "' but does not implement it");
        }

        public duplicateIdentifier(ast: AST, name: string) {
            this.reportError(ast, "Duplicate identifier '" + name + "'");
        }

        public showRef(ast: AST, text: string, symbol: Symbol) {
            var defLineCol = { line: -1, col: -1 };
            // TODO: multiple def locations
            this.parser.getSourceLineCol(defLineCol, symbol.location);
            this.reportError(ast, "symbol " + text + " defined at (" + defLineCol.line + "," +
                              defLineCol.col + ")");
        }

        public unresolvedSymbol(ast: AST, name: string) {
            this.reportError(ast, "The name '" + name + "' does not exist in the current scope");
        }

        public symbolDoesNotReferToAValue(ast: AST, name: string): void {
            this.reportError(ast, "The name '" + name + "' does not refer to a value");
        }

        public styleError(ast: AST, msg: string): void {
            var bkThrow = this.throwOnTypeError;
            this.throwOnTypeError = false;
            this.reportError(ast, "STYLE: " + msg);
            this.throwOnTypeError = bkThrow;
        }

        public simpleError(ast: AST, msg: string): void {
            this.reportError(ast, msg);
        }

        public simpleErrorFromSym(sym: Symbol, msg: string): void {
            this.reportErrorFromSym(sym, msg);
        }

        public invalidSuperReference(ast: AST) {
            this.simpleError(ast, "Keyword 'super' can only be used inside a class instance method");
        }

        public valueCannotBeModified(ast: AST) {
            this.simpleError(ast, "The left-hand side of an assignment expression must be a variable, property or indexer");
        }

        public invalidCall(ast: CallExpression, nodeType: number, scope: SymbolScope): void {
            var targetType = ast.target.type;
            var typeName = targetType.getScopedTypeName(scope);
            if (targetType.construct && (nodeType == NodeType.Call)) {
                this.reportError(ast, "Value of type '" + typeName + "' is not callable.  Did you mean to include 'new'?");
            } else {
                var catString = (nodeType == NodeType.Call) ? "callable" : "newable";

                this.reportError(ast, "Value of type '" + typeName + "' is not " + catString);
            }
        }

        public indexLHS(ast: BinaryExpression, scope: SymbolScope): void {
            var targetType = ast.operand1.type.getScopedTypeName(scope);
            var indexType = ast.operand2.type.getScopedTypeName(scope);
            this.simpleError(ast, "Value of type '" + targetType + "' is not indexable by type '" + indexType + "'");
        }

        public incompatibleTypes(ast: AST, t1: Type, t2: Type, op: string, scope: SymbolScope) {
            if (!t1) {
                t1 = this.checker.anyType;
            }
            if (!t2) {
                t2 = this.checker.anyType;
            }
            // TODO: re-implement reason generation
            var reason = "";
            if (op) {
                this.reportError(ast, "Operator '" + op + "' cannot be applied to types '" + t1.getScopedTypeName(scope) +
                                  "' and '" + t2.getScopedTypeName(scope) + "'" + reason);
            }
            else {
                this.reportError(ast, "Cannot convert '" + t1.getScopedTypeName(scope) +
                                  "' to '" + t2.getScopedTypeName(scope) + "'" + reason);
            }
        }

        public expectedClassOrInterface(ast: AST): void {
            this.simpleError(ast, "Expected var, class, interface, or module");
        }

        public unaryOperatorTypeError(ast: AST, op: string, type: Type) {
            this.reportError(ast, "Operator '" + op + "' cannot be applied to type '" + type.getTypeName() + "'");
        }
    }
}