///<reference path='typescript.ts' />

module TypeScript {
    export class ArrayCache {
        public arrayType: Type;
        public arrayBase: Type = null;

        public specialize(arrInstType: Type, checker: TypeChecker): Type {
            if (this.arrayBase == null) {
                this.arrayBase = arrInstType.specializeType(checker.wildElm.type, this.arrayType.elementType,
                                                   checker, true);
            }
            return this.arrayBase;
        }
    }

    // ordered pair of types
    //export class TypePair {
    //    constructor (public a: Type, public b: Type) { }
    //}

    //export function hashTypePair(tp): number {
    //    var typePair = <TypePair>tp;
    //    var result = typePair.a.primitiveTypeClass ^ (typePair.b.primitiveTypeClass << 4);
    //    if (typePair.a.members != null) {
    //        result = result ^ ((typePair.a.members.allMembers.count()) << 7);
    //    }
    //    else if (typePair.a.construct != null) {
    //        result = (result + 3) << 2;
    //    }
    //    else if (typePair.a.call != null) {
    //        result = (result + 7) << 5;
    //    }
    //    else if (typePair.a.extendsList != null) {
    //        result = (result + 11) << 9;
    //    }
    //    if (typePair.b.members != null) {
    //        result = result ^ ((typePair.b.members.allMembers.count()) << 7);
    //    }
    //    else if (typePair.b.construct != null) {
    //        result = (result + 3) << 2;
    //    }
    //    else if (typePair.b.call != null) {
    //        result = (result + 7) << 5;
    //    }
    //    else if (typePair.b.extendsList != null) {
    //        result = (result + 11) << 9;
    //    }
    //    return result;
    //}

    //export function equalsTypePair(a, b): bool {
    //    var pairA = <TypePair>a;
    //    var pairB = <TypePair>b;
    //    return (pairA.a == pairB.a) && (pairA.b == pairB.b);
    //}

    export interface SignatureData {
        parameters: ParameterSymbol[];
        nonOptionalParameterCount: number;
    }

    export enum TypeCheckCollectionMode {
        Resident,
        Transient
    }

    export class PersistentGlobalTypeState {
        public importedGlobalsTable = new ScopedMembers(new DualStringHashTable(new StringHashTable(), new StringHashTable()));
        public importedGlobalsTypeTable = new ScopedMembers(new DualStringHashTable(new StringHashTable(), new StringHashTable()));

        public importedGlobals: SymbolScopeBuilder;

        // transient state
        public globals: IHashTable = null;
        public globalTypes: IHashTable = null;
        public ambientGlobals: IHashTable = null;
        public ambientGlobalTypes: IHashTable = null;

        // resident state
        public residentGlobalValues = new StringHashTable();
        public residentGlobalTypes = new StringHashTable();
        public residentGlobalAmbientValues = new StringHashTable();
        public residentGlobalAmbientTypes = new StringHashTable();

        // dual resident/transient state

        // REVIEW: We shouldn't need to allocate private hash tables for these, since there's no private global scope
        // REVIEW: In general, we should audit each instance of DualStringHashTable to ensure that both the primary
        // and secondary tables are necessary.  If it's not necessary, we should sub in a constant sentinel value.
        public dualGlobalValues: DualStringHashTable;
        public dualGlobalTypes: DualStringHashTable;
        public dualAmbientGlobalValues: DualStringHashTable;
        public dualAmbientGlobalTypes: DualStringHashTable;

        public globalScope: SymbolScope;

        public voidType: Type;
        public booleanType: Type;
        public doubleType: Type;

        // TODO: string base from core (set in type flow constructor)
        public stringType: Type;
        public anyType: Type;
        public nullType: Type;
        public undefinedType: Type;


        // Use this flag to turn resident checking on and off
        public residentTypeCheck: bool = true;

        // TODO: make this var when constructor locals entered in earlier pass
        public mod: ModuleType = null;
        public gloMod: TypeSymbol = null;

        public wildElm: TypeSymbol = null;

        constructor (public errorReporter: ErrorReporter) {
            this.importedGlobals = new SymbolScopeBuilder(null, this.importedGlobalsTable, null, this.importedGlobalsTypeTable, null, null);

            this.dualGlobalValues = new DualStringHashTable(this.residentGlobalValues, new StringHashTable());
            this.dualGlobalTypes = new DualStringHashTable(this.residentGlobalTypes, new StringHashTable());
            this.dualAmbientGlobalValues = new DualStringHashTable(this.residentGlobalAmbientValues, new StringHashTable());
            this.dualAmbientGlobalTypes = new DualStringHashTable(this.residentGlobalAmbientTypes, new StringHashTable());

            var dualGlobalScopedMembers = new ScopedMembers(new DualStringHashTable(this.dualGlobalValues, new StringHashTable()));
            var dualGlobalScopedAmbientMembers = new ScopedMembers(new DualStringHashTable(this.dualAmbientGlobalValues, new StringHashTable()));
            var dualGlobalScopedEnclosedTypes = new ScopedMembers(new DualStringHashTable(this.dualGlobalTypes, new StringHashTable()));
            var dualGlobalScopedAmbientEnclosedTypes = new ScopedMembers(new DualStringHashTable(this.dualAmbientGlobalTypes, new StringHashTable()));

            this.globalScope = new SymbolScopeBuilder(dualGlobalScopedMembers, dualGlobalScopedAmbientMembers, dualGlobalScopedEnclosedTypes, dualGlobalScopedAmbientEnclosedTypes, this.importedGlobals, null);

            this.voidType = this.enterPrimitive(Primitive.Void, "void");
            this.booleanType = this.enterPrimitive(Primitive.Boolean, "bool");
            this.doubleType = this.enterPrimitive(Primitive.Double, "number");
            // number is synonym for double
            this.importedGlobals.ambientEnclosedTypes.addPublicMember("number", this.doubleType.symbol);
            // TODO: string base from core (set in type flow constructor)
            this.stringType = this.enterPrimitive(Primitive.String, "string");
            this.anyType = this.enterPrimitive(Primitive.Any, "any");
            this.nullType = this.enterPrimitive(Primitive.Null, "null");
            this.undefinedType = this.enterPrimitive(Primitive.Undefined, "undefined");

            // shared global state is resident
            this.setCollectionMode(TypeCheckCollectionMode.Resident);

            this.wildElm = new TypeSymbol("_element", 0, -1, new Type());
            this.importedGlobalsTypeTable.addPublicMember(this.wildElm.name, this.wildElm);

            this.mod = new ModuleType(dualGlobalScopedEnclosedTypes, dualGlobalScopedAmbientEnclosedTypes);
            this.mod.members = dualGlobalScopedMembers;
            this.mod.ambientMembers = dualGlobalScopedAmbientMembers;
            this.mod.containedScope = this.globalScope;

            this.gloMod = new TypeSymbol(globalId, 0, -1, this.mod);
            this.mod.members.addPublicMember(this.gloMod.name, this.gloMod);

            this.defineGlobalValue("undefined", this.undefinedType);
        }


        public enterPrimitive(flags: number, name: string) {
            var primitive = new Type();
            primitive.primitiveTypeClass = flags;
            var symbol = new TypeSymbol(name, 0, -1, primitive);
            symbol.typeCheckStatus = TypeCheckStatus.Finished;
            primitive.symbol = symbol;
            this.importedGlobals.enter(null, null, symbol, this.errorReporter, true, true, true);
            return primitive;
        }

        public setCollectionMode(mode: TypeCheckCollectionMode) {
            this.residentTypeCheck =
                this.dualGlobalValues.insertPrimary =
                    this.dualGlobalTypes.insertPrimary =
                        this.dualAmbientGlobalValues.insertPrimary =
                            this.dualAmbientGlobalTypes.insertPrimary = mode == TypeCheckCollectionMode.Resident;
        }

        public refreshPersistentState() {
            this.globals = new StringHashTable();
            this.globalTypes = new StringHashTable();
            this.ambientGlobals = new StringHashTable();
            this.ambientGlobalTypes = new StringHashTable();

            this.dualGlobalValues.secondaryTable = this.globals;
            this.dualGlobalTypes.secondaryTable = this.globalTypes;
            this.dualAmbientGlobalValues.secondaryTable = this.ambientGlobals;
            this.dualAmbientGlobalTypes.secondaryTable = this.ambientGlobalTypes;
        }

        public defineGlobalValue(name: string, type: Type) {
            var valueLocation = new ValueLocation();
            valueLocation.typeLink = new TypeLink();
            var sym = new VariableSymbol(name, 0, -1, valueLocation);
            sym.setType(type);
            sym.typeCheckStatus = TypeCheckStatus.Finished;
            sym.container = this.gloMod;
            this.importedGlobalsTable.addPublicMember(name, sym);
        }
    }

    export class ContextualTypeContext {
        public targetSig: Signature = null;
        public targetThis: Type = null;
        public targetAccessorType: Type = null;

        constructor (public contextualType: Type,
            public provisional:bool, public contextID: number) { }
    }

    export class ContextualTypingContextStack {
        private contextStack: ContextualTypeContext[] = [];
        static contextID = TypeCheckStatus.Finished + 1;
        public pushContextualType(type: Type, provisional: bool) { this.contextStack.push(new ContextualTypeContext(type, provisional, ContextualTypingContextStack.contextID++)); this.checker.errorReporter.throwOnTypeError = provisional}
        public popContextualType() {
            var tc = this.contextStack.pop();
            this.checker.errorReporter.throwOnTypeError = this.isProvisional();
            return tc;
        }
        public getContextualType(): ContextualTypeContext { return (!this.contextStack.length ? null : this.contextStack[this.contextStack.length - 1]); }
        public getContextID() { return (!this.contextStack.length ? TypeCheckStatus.Finished: this.contextStack[this.contextStack.length - 1].contextID); }
        public isProvisional() { return (!this.contextStack.length ? false: this.contextStack[this.contextStack.length - 1].provisional); }

        constructor (public checker: TypeChecker) { }
    }

    export class TypeChecker {
        public errorReporter: ErrorReporter = null;
        public globalScope: SymbolScope;

        public checkControlFlow = false;
        public printControlFlowGraph = false;
        public checkControlFlowUseDef = false;
        public styleSettings: StyleSettings = null;

        public units: LocationInfo[] = null;

        public voidType: Type;
        public booleanType: Type;
        public numberType: Type;
        public stringType: Type;
        public anyType: Type;
        public nullType: Type;
        public undefinedType: Type;

        public anon = "_anonymous";

        // TODO: make this var when constructor locals entered in earlier pass
        public globals: DualStringHashTable;
        public globalTypes: DualStringHashTable;
        public ambientGlobals: DualStringHashTable;
        public ambientGlobalTypes: DualStringHashTable;
        public gloModType: ModuleType;
        public gloMod: TypeSymbol;
        public wildElm: TypeSymbol;

        public locationInfo: LocationInfo = null;
        public typeFlow: TypeFlow = null;

        public currentCompareA: Symbol = null;
        public currentCompareB: Symbol = null;

        public currentModDecl: ModuleDecl = null;

        public inBind = false;
        public inWith = false;
        public errorsOnWith = true;

        // Contextual typing
        public typingContextStack: ContextualTypingContextStack;
        public currentContextualTypeContext: ContextualTypeContext = null;

        public resolvingBases = false;

        public canCallDefinitionSignature = false;

        public assignableCache: any[] = <any>{};
        public subtypeCache: any[] = <any>{};
        public identicalCache: any[] = <any>{};

        constructor (public persistentState: PersistentGlobalTypeState) {
            this.voidType = this.persistentState.voidType;
            this.booleanType = this.persistentState.booleanType;
            this.numberType = this.persistentState.doubleType;
            this.stringType = this.persistentState.stringType;
            this.anyType = this.persistentState.anyType;
            this.nullType = this.persistentState.nullType;
            this.undefinedType = this.persistentState.undefinedType;

            this.globals = this.persistentState.dualGlobalValues;
            this.globalTypes = this.persistentState.dualGlobalTypes;
            this.ambientGlobals = this.persistentState.dualAmbientGlobalValues;
            this.ambientGlobalTypes = this.persistentState.dualAmbientGlobalTypes;
            this.gloModType = this.persistentState.mod;
            this.gloMod = this.persistentState.gloMod;
            this.wildElm = this.persistentState.wildElm;

            this.globalScope = this.persistentState.globalScope;

            this.typingContextStack = new ContextualTypingContextStack(this);
        }

        public setStyleOptions(style: StyleSettings) {
            this.styleSettings = style;
        }

        // Contextual typing
        public setContextualType(type: Type, provisional: bool) {
            this.typingContextStack.pushContextualType(type, provisional);
            this.currentContextualTypeContext = this.typingContextStack.getContextualType();
        }

        public unsetContextualType() {
            this.typingContextStack.popContextualType();
            this.currentContextualTypeContext = this.typingContextStack.getContextualType();
        }
        public unsetContextualTypeWithContext(cxt: ContextualTypeContext) {
            while (this.currentContextualTypeContext != cxt) {
                this.unsetContextualType();
            }
        }

        public typeCheckWithContextualType(contextType: Type, provisional: bool, condition: bool, ast: AST) {
            if (condition) {
                this.setContextualType(contextType, provisional);
            }
            this.typeFlow.typeCheck(ast);
            if (condition) {
                this.unsetContextualType();
            }
        }

        public resetTargetType() {
            this.currentContextualTypeContext = this.typingContextStack.getContextualType();
        }

        // Unset the current contextual type without disturbing the stack, effectively "killing" the contextual typing process
        public killTargetType() { this.currentContextualTypeContext = null; this.errorReporter.throwOnTypeError = false; }
        public hasTargetType() { return this.currentContextualTypeContext != null && this.currentContextualTypeContext.contextualType != null; }
        public getTargetTypeContext() { return this.currentContextualTypeContext; }

        public inProvisionalTypecheckMode() {
            return this.typingContextStack.isProvisional();
        }

        public getTypeCheckFinishedStatus() {
            if (this.inProvisionalTypecheckMode()) {
                return this.typingContextStack.getContextID();
            }
            return TypeCheckStatus.Finished;
        }

        public typeStatusIsFinished(status: TypeCheckStatus) {

            return status == TypeCheckStatus.Finished ||
                   (this.inProvisionalTypecheckMode() && status == this.typingContextStack.getContextID());
        }

        // type collection      
        public collectTypes(ast: AST): void {
            if (ast.nodeType == NodeType.Script) {
                var script = <Script>ast;
                this.locationInfo = script.locationInfo;
            }
            var globalChain = new ScopeChain(this.gloMod, null, this.globalScope);
            var context = new TypeCollectionContext(globalChain, this);
            getAstWalkerFactory().walk(ast, preCollectTypes, postCollectTypes, null, context);
        }
        
        public makeArrayType(type: Type): Type {
            if (type.arrayCache == null) {
                type.arrayCache = new ArrayCache();
                type.arrayCache.arrayType = new Type();
                type.arrayCache.arrayType.elementType = type;
                type.arrayCache.arrayType.symbol = type.symbol;
            }
            return type.arrayCache.arrayType;
        }

        public getParameterList(args: ASTList, container: Symbol): SignatureData {
            var parameterTable = null;
            var parameterBuilder = null;
            var len = args.members.length;
            var nonOptionalParams = 0;
            var result: ParameterSymbol[] = [];

            if (len > 0) {
                parameterTable = new ScopedMembers(new DualStringHashTable(new StringHashTable(), new StringHashTable()));
                parameterBuilder = new SymbolScopeBuilder(parameterTable, null, null, null, null, container);

                for (var i = 0; i < len; i++) {
                    var parameter = <ArgDecl>args.members[i];
                    var paramDef = new ValueLocation();
                    var parameterSymbol = new ParameterSymbol(parameter.id.text, parameter.minChar,
                                                            this.locationInfo.unitIndex, paramDef);
                    parameterSymbol.declAST = parameter;
                    parameter.id.sym = parameterSymbol;
                    parameter.sym = parameterSymbol;
                    paramDef.symbol = parameterSymbol;
                    paramDef.typeLink = getTypeLink(parameter.typeExpr, this, false);
                    parameterBuilder.enter(null, parameter, parameterSymbol, this.errorReporter, true, false, false); // REVIEW: Should this be entered into the private scope?
                    result[result.length] = parameterSymbol;
                    if (!parameter.isOptionalArg()) {
                        nonOptionalParams++;
                    }
                }
            }
            return { parameters: result, nonOptionalParameterCount: nonOptionalParams };
        }

        // Create a signature for a function definition
        //  (E.g., has a function body - function declarations, property declarations, lambdas)
        // TODO: Investigate adding support for accessors
        public createFunctionSignature(funcDecl: FuncDecl, container: Symbol, scope: SymbolScope, overloadGroupSym: Symbol, addToScope: bool): Signature {

            var isExported = hasFlag(funcDecl.fncFlags, FncFlags.Exported | FncFlags.ClassPropertyMethodExported) || container == this.gloMod;
            var isStatic = hasFlag(funcDecl.fncFlags, FncFlags.Static);
            var isPrivate = hasFlag(funcDecl.fncFlags, FncFlags.Private);
            var isDefinition = hasFlag(funcDecl.fncFlags, FncFlags.Definition);
            var isAmbient = hasFlag(funcDecl.fncFlags, FncFlags.Ambient);
            var isConstructor = funcDecl.isConstructMember() || funcDecl.isConstructor;
            var isGlobal = container == this.gloMod;

            var signature: Signature = new Signature();
            var isLambda = funcDecl.fncFlags & FncFlags.IsFunctionExpression;

            // If a return type has been declared for the signature, set the type link.
            // Otherwise:
            //  if it's a signature, its type will be 'any'
            //  if it's a definition, the return type will be inferred  
            if (funcDecl.returnTypeAnnotation != null || isDefinition) {
                signature.returnType = getTypeLink(funcDecl.returnTypeAnnotation, this, false);
            }
            else {
                signature.returnType = new TypeLink();
                signature.returnType.type = this.anyType;
            }

            signature.hasVariableArgList = funcDecl.variableArgList;

            var sigData = this.getParameterList(funcDecl.args, container);

            signature.parameters = sigData.parameters;
            signature.nonOptionalParameterCount = sigData.nonOptionalParameterCount;

            funcDecl.signature = signature;
            signature.declAST = funcDecl;

            var useOverloadGroupSym =
                overloadGroupSym != null &&
                overloadGroupSym.getType() != null &&
                !overloadGroupSym.isAccessor() &&
                (funcDecl.isSignature() || (isAmbient == hasFlag(overloadGroupSym.flags, SymbolFlags.Ambient)));

            if (useOverloadGroupSym && isPrivate != hasFlag(overloadGroupSym.flags, SymbolFlags.Private)) {
                this.errorReporter.simpleError(funcDecl, "Public/Private visibility of overloads does not agree");
            }

            var groupType = useOverloadGroupSym ? overloadGroupSym.getType() : new Type();

            if (isConstructor) {
                if (groupType.construct == null) {
                    groupType.construct = new SignatureGroup();
                }
                groupType.construct.addSignature(signature);
                groupType.construct.hasImplementation = !(funcDecl.isSignature());
                if (groupType.construct.hasImplementation) {
                    groupType.setHasImplementation();
                }
            }
            else if (funcDecl.isIndexerMember()) {
                if (groupType.index == null) {
                    groupType.index = new SignatureGroup();
                    groupType.index.flags |= SignatureFlags.IsIndexer;
                }

                groupType.index.addSignature(signature);
                groupType.index.hasImplementation = !(funcDecl.isSignature());
                if (groupType.index.hasImplementation) {
                    groupType.setHasImplementation();
                }
            }
            else {
                if (groupType.call == null) {
                    groupType.call = new SignatureGroup();
                }
                groupType.call.addSignature(signature);

                groupType.call.hasImplementation = !(funcDecl.isSignature());
                if (groupType.call.hasImplementation) {
                    groupType.setHasImplementation();
                }
            }

            var instanceType = groupType.instanceType;

            if (instanceType != null && !isStatic) {
                if (instanceType.call == null) {
                    instanceType.call = groupType.call;
                }
                else if (groupType.call != null) {
                    instanceType.call.signatures.concat(groupType.call.signatures);
                }
            }

            // Ensure that the function's symbol is properly configured
            // (If there were overloads, we'll already have a symbol, otherwise we need to create one)
            var funcName: string = null;

            // Set the function's name:
            //  In the case of anonymous or functions resulting from error
            //  correction in the parser (isMissing() == true), we do not
            //  want to set a function name, since they shouldn't be inserted
            //  into the enclosing scope

            // usedHint prevents functions bound to object literal fields from being added to the
            // enclosing scope
            var usedHint = false;
            if (funcDecl.name != null && !funcDecl.name.isMissing()) {
                funcName = funcDecl.name.text;
            }
            else if (funcDecl.hint != null) {
                funcName = funcDecl.hint;
                usedHint = true;
            }

            if (groupType.symbol == null) {
                groupType.symbol =
                    new TypeSymbol((funcName != null) ? funcName : this.anon,
                                    funcDecl.minChar, this.locationInfo.unitIndex,
                                    groupType);
                if (!useOverloadGroupSym) {
                    groupType.symbol.declAST = funcDecl;
                }
            }

            // REVIEW: Are we missing any other flags?
            if (isStatic) {
                groupType.symbol.flags |= SymbolFlags.Static;
            }

            if (isAmbient) {
                groupType.symbol.flags |= SymbolFlags.Ambient;
            }

            if (isPrivate) {
                groupType.symbol.flags |= SymbolFlags.Private;
            }

            groupType.symbol.isMethod = funcDecl.isMethod();
            if (groupType.symbol.isMethod) {
                groupType.symbol.flags |= SymbolFlags.Property;
            }

            funcDecl.type = groupType;

            // Add the function symbol to the appropriate scope
            // if the funcDecl is a constructor, it will be added to the enclosing scope as a class
            if (!isConstructor) {
                // Add the function's symbol to its enclosing scope
                if (funcName != null && !isLambda && !funcDecl.isAccessor() && !usedHint) {

                    // REVIEW: We're not setting the isDecl flags for fuctions bound to object literal properties
                    // so removing the isDefiniton clause would break object literals
                    if (addToScope) {  // REVIEW: If we combine this with createFunctionDeclarationSignature, we'll need to broaden this for both decls and defs                      
                        // if it's a static method, enter directly into the container's scope
                        if (funcDecl.isMethod() && isStatic) {

                            // REVIEW: What about private statics?
                            if (!(<TypeSymbol>container).type.members.publicMembers.add(funcName, groupType.symbol)) {
                                this.errorReporter.duplicateIdentifier(funcDecl, funcName);
                            }

                            groupType.symbol.container = container;
                        } // REVIEW: Another check for overloads...
                        else if (overloadGroupSym == null || (overloadGroupSym.declAST != null && !(<FuncDecl>overloadGroupSym.declAST).isOverload && (container.isType()))) {
                            scope.enter(container, funcDecl, groupType.symbol, this.errorReporter, !isPrivate && (isExported || isStatic || isGlobal), false, isAmbient);
                        }
                    }
                    else if (!funcDecl.isSpecialFn()) {
                        groupType.symbol.container = container; // REVIEW: Set container for overloads or anonymous?
                    }
                }
                else if (!funcDecl.isSpecialFn()) {
                    groupType.symbol.container = container; // REVIEW: Set container for lambdas and accessors?
                }
            }

            // If, say, a call signature overload was declared before the class type was, we want to reuse
            // the type that's already been instantiated for the class type, rather than allocate a new one
            if (useOverloadGroupSym) {
                var overloadGroupType = overloadGroupSym != null ? overloadGroupSym.getType() : null;
                var classType = groupType;

                if (classType != overloadGroupType) {
                    if (classType.construct == null) {
                        if (overloadGroupType != null && overloadGroupType.construct != null) {
                            classType.construct = overloadGroupType.construct;
                        }
                        else {
                            classType.construct = new SignatureGroup();
                        }
                    }
                    else if (overloadGroupType != null) {
                        if (overloadGroupType.construct != null) {
                            classType.construct.signatures.concat(overloadGroupType.construct.signatures);
                        }
                    }

                    // sync call and index signatures as well, but don't allocate should they not
                    // already exist
                    if (overloadGroupType != null) {
                        if (classType.call == null) {
                            classType.call = overloadGroupType.call;
                        }
                        else if (overloadGroupType.call != null) {
                            classType.call.signatures.concat(overloadGroupType.call.signatures);
                        }

                        // if the function is not static, we need to add any call overloads onto the
                        // instance type's call signature list
                        if (!isStatic) {

                            if (classType.instanceType == null) {
                                classType.instanceType = overloadGroupType.instanceType;
                            }

                            var instanceType = classType.instanceType;

                            if (instanceType != null) {
                                if (instanceType.call == null) {
                                    instanceType.call = overloadGroupType.call;
                                }
                                else if (overloadGroupType.call != null) {
                                    instanceType.call.signatures.concat(overloadGroupType.call.signatures);
                                }
                            }
                        }

                        if (classType.index == null) {
                            classType.index = overloadGroupType.index;
                        }
                        else if (overloadGroupType.index != null) {
                            classType.index.signatures.concat(overloadGroupType.index.signatures);
                        }
                    }
                }
            }

            return signature;
        }

        // Creates a new symbol for an accessor property
        // Note that funcDecl.type.symbol and fgSym may not be the same (E.g., in the case of type collection)
        public createAccessorSymbol(funcDecl: FuncDecl, fgSym: Symbol, enclosingClass: Type, addToMembers: bool, isClassProperty: bool, scope: SymbolScope, container: Symbol) {
            var accessorSym: FieldSymbol = null
            var sig = funcDecl.signature;
            var nameText = funcDecl.name.text;
            var isStatic = hasFlag(funcDecl.fncFlags, FncFlags.Static);
            var isPrivate = hasFlag(funcDecl.fncFlags, FncFlags.Private);

            if (fgSym == null) {
                var field = new ValueLocation();
                accessorSym = new FieldSymbol(nameText, funcDecl.minChar, this.locationInfo.unitIndex, false, field);
                field.symbol = accessorSym;
                accessorSym.declAST = funcDecl; // REVIEW: need to reset for getters and setters

                if (hasFlag(funcDecl.fncFlags, FncFlags.GetAccessor)) {
                    if (accessorSym.getter != null) {
                        this.errorReporter.simpleError(funcDecl, "Redeclaration of property getter");
                    }
                    accessorSym.getter = <TypeSymbol>sig.declAST.type.symbol;
                }
                else {
                    if (accessorSym.setter != null) {
                        this.errorReporter.simpleError(funcDecl, "Redeclaration of property setter");
                    }
                    accessorSym.setter = <TypeSymbol>sig.declAST.type.symbol;
                }

                field.typeLink = getTypeLink(null, this, false);

                // if it's static, enter it into the class's member list directly
                if (addToMembers) {
                    if (enclosingClass) {
                        if (!enclosingClass.members.publicMembers.add(nameText, accessorSym)) {
                            this.errorReporter.duplicateIdentifier(funcDecl, accessorSym.name);
                        }
                        accessorSym.container = enclosingClass.symbol;
                    }
                    else {
                        this.errorReporter.simpleError(funcDecl, "Accessor property may not be added in this context");
                    }
                }
                else {
                    scope.enter(container, funcDecl, accessorSym, this.errorReporter, !isPrivate || isStatic, false, false);
                }

                // We set the flags here, instead of below, because the accessor symbol does not yet have a type
                if (isClassProperty) {
                    accessorSym.flags |= SymbolFlags.Property;
                }
                if (isStatic) {
                    accessorSym.flags |= SymbolFlags.Static;
                }

                if (isPrivate) {
                    accessorSym.flags |= SymbolFlags.Private;
                }
                else {
                    accessorSym.flags |= SymbolFlags.Public;
                }
            }
            else {
                accessorSym = <FieldSymbol>(<any>fgSym);

                if (isPrivate != hasFlag(accessorSym.flags, SymbolFlags.Private)) {
                    this.errorReporter.simpleError(funcDecl, "Getter and setter accessors do not agree in visibility");
                }

                if (hasFlag(funcDecl.fncFlags, FncFlags.GetAccessor)) {
                    if (accessorSym.getter != null) {
                        this.errorReporter.simpleError(funcDecl, "Redeclaration of property getter");
                    }
                    accessorSym.getter = <TypeSymbol>funcDecl.type.symbol;
                }
                else {
                    if (accessorSym.setter != null) {
                        this.errorReporter.simpleError(funcDecl, "Redeclaration of property setter");
                    }
                    accessorSym.setter = <TypeSymbol>funcDecl.type.symbol;
                }
            }

            return accessorSym;
        }

        public addBases(resultScope: SymbolAggregateScope, type: Type, baseContext: {base: string; baseId: number;}): void {
            resultScope.addParentScope(new SymbolTableScope(type.members, type.ambientMembers, type.getAllEnclosedTypes(), type.getAllAmbientEnclosedTypes(), type.symbol));
            var i = 0;
            var parent: Type;
            if (type.extendsList != null) {
                for (var len = type.extendsList.length; i < len; i++) {
                    parent = type.extendsList[i];
                    if (baseContext.baseId == parent.typeID) {
                        this.errorReporter.reportErrorFromSym(parent.symbol, "Type '" + baseContext.base + "' is recursively referenced as a base class of itself");
                        parent.symbol.flags |= SymbolFlags.RecursivelyReferenced;
                        break;
                    }
                    this.addBases(resultScope, parent, baseContext);
                }
            }
        }

        public scopeOf(type: Type): SymbolScope {
            var resultScope = new SymbolAggregateScope(type.symbol);
            var baseContext = { base: type.symbol && type.symbol.name ? type.symbol.name : "{}", baseId: type.typeID };
            this.addBases(resultScope, type, baseContext);
            return resultScope;
        }
        
        public lookupMemberType(containingType: Type, name: string): Type {
            var symbol: Symbol = null;
            if (containingType.containedScope != null) {
                symbol = containingType.containedScope.find(name, false, true);
            }
            else if (containingType.members != null) {
                symbol = containingType.members.allMembers.lookup(name);

                if (symbol == null && containingType.ambientMembers != null) {
                    symbol = containingType.ambientMembers.allMembers.lookup(name);
                }
            }
            if (symbol == null) {
                var typeMembers = containingType.getAllEnclosedTypes();
                var ambientTypeMembers = containingType.getAllAmbientEnclosedTypes();
                if (typeMembers != null) {
                    symbol = typeMembers.allMembers.lookup(name);

                    if (symbol == null && ambientTypeMembers != null) {
                        symbol = ambientTypeMembers.allMembers.lookup(name);
                    }

                }
            }
            if ((symbol != null) && (symbol.isType())) {
                return symbol.getType();
            }
            else {
                return null;
            }
        }

        public findSymbolForDynamicModule(idText: string, currentFileName: string, search:(id:string)=>Symbol): Symbol {
            var originalIdText = idText;
            var symbol = search(idText);

            // REVIEW: In the IDE case, we won't have a mod map to fall back on, so we need to assemble
            // the mod name by hand                
            if (symbol == null) {
                // perhaps it's a dynamic module?
                if (!symbol) {
                    idText = swapQuotes(originalIdText);
                    symbol = search(idText);
                }

                // Check the literal path first
                if (!symbol) {
                    idText = stripQuotes(originalIdText) + ".ts";
                    symbol = search(idText);
                }

                if (!symbol) {
                    idText = stripQuotes(originalIdText) + ".str";
                    symbol = search(idText);
                }

                // Check check for .d.str
                if (!symbol) {
                    idText = stripQuotes(originalIdText) + ".d.ts";
                    symbol = search(idText);
                }

                if (!symbol) {
                    idText = stripQuotes(originalIdText) + ".d.str";
                    symbol = search(idText);
                }

                // If the literal path doesn't work, begin the search
                if (!symbol && !isRelative(originalIdText)) {
                    // check the full path first, as this is the most likely scenario
                    idText = originalIdText;

                    var strippedIdText = stripQuotes(idText);

                    // REVIEW: Technically, we shouldn't have to normalize here - we should normalize in addUnit.
                    // Still, normalizing here alows any language services to be free of assumptions
                    var path = getRootFilePath(switchToForwardSlashes(currentFileName));

                    while (symbol == null && path != "" && path != "/") {
                        idText = normalizePath(path + strippedIdText + ".ts");
                        symbol = search(idText);

                        // check for .ts
                        if (symbol == null) {
                            idText = changePathToSTR(idText);
                            symbol = search(idText);
                        }

                        // check for .d.str
                        if (symbol == null) {
                            idText = changePathToDTS(idText);
                            symbol = search(idText);
                        }

                        // check for .dstsc
                        if (symbol == null) {
                            idText = changePathToDSTR(idText);
                            symbol = search(idText);
                        }

                        if (symbol == null) {
                            path = normalizePath(path + "..");
                            path = path && path != '/' ? path + '/' : path;
                        }
                    }
                }
            }

            return symbol;
        }

        public resolveTypeMember(scope: SymbolScope, dotNode: BinaryExpression): Type {
            var lhs = dotNode.operand1;
            var rhs = dotNode.operand2;
            var resultType = this.anyType;
            var lhsType = this.anyType;

            if ((lhs != null) && (rhs != null) && (rhs.nodeType == NodeType.Name)) {
                if (lhs.nodeType == NodeType.Dot) {
                    lhsType = this.resolveTypeMember(scope, <BinaryExpression>lhs);
                }
                else if (lhs.nodeType == NodeType.Name) {
                    var identifier = <Identifier>lhs;
                    var symbol = scope.find(identifier.text, false, true);
                    if (symbol == null) {
                        this.errorReporter.unresolvedSymbol(identifier, identifier.text);
                    }
                    else if (symbol.isType()) {

                        var typeSymbol = <TypeSymbol> symbol;

                        if (typeSymbol.aliasLink && !typeSymbol.type && typeSymbol.aliasLink.alias.nodeType == NodeType.Name) {
                            var modPath = (<Identifier>typeSymbol.aliasLink.alias).text;
                            var modSym = this.findSymbolForDynamicModule(modPath, this.locationInfo.filename, (id) => scope.find(id, false, true));
                            if (modSym) {
                                typeSymbol.type = modSym.getType();
                            }
                        }

                        if (optimizeModuleCodeGen && symbol != null) {
                            var symType = symbol.getType();
                            // Once the type has been referenced outside of a type ref position, there's
                            // no going back                        
                            if (symType != null && typeSymbol.aliasLink && typeSymbol.onlyReferencedAsTypeRef) {

                                var modDecl = <ModuleDecl>symType.symbol.declAST;
                                if (modDecl != null && hasFlag(modDecl.modFlags, ModuleFlags.IsDynamic)) {
                                    typeSymbol.onlyReferencedAsTypeRef = !this.resolvingBases;
                                }
                            }
                        }
                        if (!symbol.visible(scope, this)) {
                            this.errorReporter.simpleError(lhs, "The symbol '" + identifier.text + "' is not visible at this point");
                        }
                        lhsType = symbol.getType();

                        identifier.sym = symbol;
                    }
                    else {
                        this.errorReporter.simpleError(lhs, "Expected type");
                    }

                }

                // if the LHS type is a module alias, we won't be able to resolve it until
                // typecheck type.  If this is called during binding, lhsType will be null
                if (!lhsType) {
                    lhsType = this.anyType;
                }

                if (lhsType != this.anyType) {
                    var rhsIdentifier = <Identifier>rhs;
                    resultType = this.lookupMemberType(lhsType, rhsIdentifier.text);
                    if (resultType == null) {
                        resultType = this.anyType;
                        this.errorReporter.simpleError(dotNode, "Expected type");
                    }
                    else {
                        if (!resultType.symbol.visible(scope, this)) {
                            this.errorReporter.simpleError(lhs, "The symbol '" + (<Identifier>rhs).text + "' is not visible at this point");
                        }
                    }
                    rhsIdentifier.sym = resultType.symbol;
                }
            }
            if (resultType.isClass()) {
                resultType = resultType.instanceType;
            }
            return resultType;
        }

        public resolveFuncDecl(funcDecl: FuncDecl, scope: SymbolScope,
            fgSym: TypeSymbol): Symbol {
            var functionGroupSymbol = this.createFunctionSignature(funcDecl, scope.container, scope, fgSym, false).declAST.type.symbol;
            var signatures: Signature[];
            if (funcDecl.isConstructMember()) {
                signatures = functionGroupSymbol.type.construct.signatures;
            }
            else if (funcDecl.isIndexerMember()) {
                signatures = functionGroupSymbol.type.getInstanceType().index.signatures;
            }
            else {
                signatures = functionGroupSymbol.type.call.signatures;
            }
            // TODO: indexer
            var signature = signatures[signatures.length - 1];
            var len = signature.parameters.length;
            for (var i = 0; i < len; i++) {
                var paramSym: ParameterSymbol = signature.parameters[i];
                this.resolveTypeLink(scope, paramSym.parameter.typeLink, true);
            }
            this.resolveTypeLink(scope, signature.returnType,
                            funcDecl.isSignature());
            return functionGroupSymbol;
        }

        public resolveVarDecl(varDecl: VarDecl, scope: SymbolScope): Symbol {
            var field = new ValueLocation();
            var fieldSymbol =
                new FieldSymbol(varDecl.id.text, varDecl.minChar, this.locationInfo.unitIndex,
                                (varDecl.varFlags & VarFlags.Readonly) == VarFlags.None,
                                field);
            fieldSymbol.transferVarFlags(varDecl.varFlags);
            field.symbol = fieldSymbol;
            fieldSymbol.declAST = varDecl;
            field.typeLink = getTypeLink(varDecl.typeExpr, this, varDecl.init == null);
            this.resolveTypeLink(scope, field.typeLink, true);
            varDecl.sym = fieldSymbol;
            varDecl.type = field.typeLink.type;
            return fieldSymbol;
        }

        public resolveTypeLink(scope: SymbolScope, typeLink: TypeLink, supplyVar: bool): void {
            var arrayCount = 0;
            if (typeLink.type == null) {
                var ast: AST = typeLink.ast;
                if (ast != null) {
                    while (typeLink.type == null) {
                        switch (ast.nodeType) {
                            case NodeType.Name:
                                var identifier = <Identifier>ast;
                                var symbol = scope.find(identifier.text, false, true);
                                if (symbol == null) {
                                    typeLink.type = this.anyType;
                                    this.errorReporter.unresolvedSymbol(identifier, identifier.text);
                                }
                                else if (symbol.isType()) {
                                    if (!symbol.visible(scope, this)) {
                                        this.errorReporter.simpleError(ast, "The symbol '" + identifier.text + "' is not visible at this point");
                                    }
                                    identifier.sym = symbol;
                                    typeLink.type = symbol.getType();
                                    if (typeLink.type) {
                                        if (typeLink.type.isClass()) {
                                            typeLink.type = typeLink.type.instanceType;
                                        }
                                    }
                                    else {
                                        typeLink.type = this.anyType;
                                    }
                                }
                                else {
                                    typeLink.type = this.anyType;
                                    this.errorReporter.simpleError(ast, "Expected type");
                                }
                                break;
                            case NodeType.Dot:
                                typeLink.type = this.resolveTypeMember(scope, <BinaryExpression>ast);
                                break;
                            case NodeType.TypeRef:
                                var typeRef = <TypeReference>ast;
                                arrayCount = typeRef.arrayCount;
                                ast = typeRef.term;
                                if (ast == null) {
                                    typeLink.type = this.anyType;
                                }
                                break;
                            case NodeType.Interface:
                                var interfaceDecl = <TypeDecl>ast;
                                var interfaceType = new Type();
                                var interfaceSymbol = new TypeSymbol((<Identifier>interfaceDecl.name).text,
                                                                   ast.minChar,
                                                                   this.locationInfo.unitIndex,
                                                                   interfaceType);
                                interfaceType.symbol = interfaceSymbol;
                                interfaceType.members = new ScopedMembers(new DualStringHashTable(new StringHashTable(), new StringHashTable()));

                                interfaceType.containedScope =
                                    new SymbolTableScope(interfaceType.members, null, null, null,
                                                         interfaceSymbol);
                                
                                interfaceType.containedScope.container = interfaceSymbol;
                                interfaceType.memberScope = interfaceType.containedScope;

                                var memberList = <ASTList>interfaceDecl.members;
                                var props: AST[] = memberList.members;
                                var propsLen = props.length;

                                for (var j = 0; j < propsLen; j++) {
                                    var propDecl = props[j];
                                    var propSym: Symbol = null;
                                    var addMember = true;
                                    var id: AST = null;
                                    if (propDecl.nodeType == NodeType.FuncDecl) {
                                        var funcDecl = <FuncDecl>propDecl;
                                        id = funcDecl.name;
                                        propSym = interfaceType.members.allMembers.lookup(funcDecl.getNameText());
                                        addMember = (propSym == null);
                                        if (funcDecl.isSpecialFn()) {
                                            addMember = false;
                                            propSym = this.resolveFuncDecl(funcDecl, scope, interfaceSymbol);
                                        }
                                        else {
                                            propSym = this.resolveFuncDecl(funcDecl, scope, <TypeSymbol>propSym);
                                        }
                                        funcDecl.type = (<TypeSymbol>propSym).type;
                                    }
                                    else {
                                        id = (<VarDecl>propDecl).id;
                                        propSym = this.resolveVarDecl(<VarDecl>propDecl, scope);
                                    }
                                    if (addMember) {
                                        if (id && hasFlag(id.flags, ASTFlags.OptionalName)) {
                                            propSym.flags |= SymbolFlags.Optional;
                                        }
                                        if (!interfaceType.members.allMembers.add(propSym.name, propSym)) {
                                            this.errorReporter.duplicateIdentifier(ast, propSym.name);
                                        }
                                    }
                                }
                                                                
                                ast.type = interfaceType;
                                typeLink.type = interfaceType;
                                
                                break;
                            case NodeType.FuncDecl:
                                var tsym = <TypeSymbol>this.resolveFuncDecl(<FuncDecl>ast, scope, null);
                                typeLink.type = tsym.type;
                                break;
                            default:
                                typeLink.type = this.anyType;
                                this.errorReporter.simpleError(ast, "Expected type");
                                break;
                        }
                    }
                }
                for (var count = arrayCount; count > 0; count--) {
                    typeLink.type = this.makeArrayType(typeLink.type);
                }
                if (supplyVar && (typeLink.type == null)) {
                    typeLink.type = this.anyType;
                }
                if (typeLink.ast != null) {
                    typeLink.ast.type = typeLink.type;
                }
            }
            // else wait for type inference
        }

        public currentSymbolCompareError(msg: string, left: bool) {
            if ((this.currentCompareA != null) && (this.currentCompareB != null)) {
                var builder = "Comparing " + this.currentCompareA.fullName() + " and " + this.currentCompareB.fullName() + ", ";
                var offendingSym = this.currentCompareA;
                if (left) {
                    builder += this.currentCompareA.fullName();
                }
                else {
                    offendingSym = this.currentCompareB;
                    builder += this.currentCompareB.fullName();
                }
                builder += " ";
                builder += msg;
                this.errorReporter.simpleErrorFromSym(offendingSym, builder);
            }
        }

        public findMostApplicableSignature(signatures: Signature[], args: ASTList): { sig: Signature; ambiguous: bool; } {

            if (signatures.length == 1) {
                return { sig: signatures[0], ambiguous: false };
            }

            var best: Signature = signatures[0];
            var Q: Signature = null;
            var AType: Type = null;
            var PType: Type = null;
            var QType: Type = null;
            var ambiguous = false;

            for (var qSig = 1; qSig < signatures.length; qSig++) {
                Q = signatures[qSig];
                var i = 0;
                // find the better conversion
                for (i = 0; i < args.members.length; i++) {
                    AType = args.members[i].type;
                    PType = i < best.parameters.length ? best.parameters[i].getType() : best.parameters[best.parameters.length - 1].getType().elementType;
                    QType = i < Q.parameters.length ?  Q.parameters[i].getType() : Q.parameters[Q.parameters.length - 1].getType().elementType;

                    if (this.typesAreIdentical(PType, QType)) {
                        break;
                    }
                    else if (this.typesAreIdentical(AType, PType)) {
                        break;
                    }
                    else if (this.typesAreIdentical(AType, QType)) {
                        best = Q;
                        break;
                    }
                    else if (this.sourceIsSubtypeOfTarget(PType, QType)) {
                        break;
                    }
                    else if (this.sourceIsSubtypeOfTarget(QType, PType)) {
                        best = Q;
                        break;
                    }
                }

                if (i == args.members.length  && !this.typesAreIdentical(best.returnType.type, Q.returnType.type)) { // neither conversion was better
                    ambiguous = true;
                }
                else {
                    ambiguous = false;
                }
            }

            return { sig: best, ambiguous: ambiguous };
        }

        public getApplicableSignatures(signatures: Signature[], args: ASTList): Signature[] {

            var applicableSigs: Signature[] = [];
            var memberType: Type = null;
            var miss = false;
            var cxt: ContextualTypeContext = null;

            for (var i = 0; i < signatures.length; i++) {
                miss = false;

                for (var j = 0; j < args.members.length; j++) {
                    
                    if (j >= signatures[i].parameters.length) {
                        continue;
                    }
                    memberType = signatures[i].parameters[j].getType();

                    // account for varargs
                    if (signatures[i].declAST.variableArgList && (j >= signatures[i].nonOptionalParameterCount - 1) && memberType.isArray()) {
                        memberType = memberType.elementType;
                    }

                    if (memberType == this.anyType) {
                        continue;
                    }
                    else if (args.members[j].nodeType == NodeType.FuncDecl) {
                        if (!this.canContextuallyTypeFunction(memberType, <FuncDecl>args.members[j], true)) {
                            // if it's just annotations that are blocking us, typecheck the function and add it to the list
                            if (this.canContextuallyTypeFunction(memberType, <FuncDecl>args.members[j], false)) {
                                this.typeFlow.typeCheck(args.members[j]);
                                if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                        else { // if it can be contextually typed, try it out...
                            try {
                                cxt = this.currentContextualTypeContext;
                                this.typeCheckWithContextualType(memberType, true, true, args.members[j]);
                                if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                    miss = true;
                                }
                            }
                            catch (e) {
                                this.unsetContextualTypeWithContext(cxt);
                                miss = true;
                            }
                            // clean the type
                            try {
                                cxt = this.currentContextualTypeContext;
                                this.typeCheckWithContextualType(null, true, true, args.members[j]);
                                if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                    miss = true;
                                }
                            }
                            catch (e) { this.unsetContextualTypeWithContext(cxt); }

                            if (miss) {
                                break;
                            }
                        }
                    }
                    else if (args.members[j].nodeType == NodeType.ObjectLit) {
                        // now actually attempt to typecheck as the contextual type
                        try {
                            cxt = this.currentContextualTypeContext;
                            this.typeCheckWithContextualType(memberType, true, true, args.members[j]);
                            if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                miss = true;
                            }
                        }
                        catch (e) {
                            this.unsetContextualTypeWithContext(cxt);
                            miss = true;
                        }
                        // clean the type
                        try {
                            this.typeCheckWithContextualType(null, true, true, args.members[j]);

                            // is the "cleaned" type even assignable?
                            if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                miss = true;
                            }
                        }
                        catch (e) { this.unsetContextualTypeWithContext(cxt); }

                        if (miss) {
                            break;
                        }
                    }
                    else if (args.members[j].nodeType == NodeType.ArrayLit) {
                        // attempt to contextually type the array literal
                        try {
                            cxt = this.currentContextualTypeContext;
                            this.typeCheckWithContextualType(memberType, true, true, args.members[j]);
                            if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                break;
                            }
                        }
                        catch (e) {
                            this.unsetContextualTypeWithContext(cxt);
                            miss = true;
                        }
                        // clean the type
                        try {
                            var cxt = this.currentContextualTypeContext;
                            this.typeCheckWithContextualType(null, true, true, args.members[j]);
                            if (!this.sourceIsAssignableToTarget(args.members[j].type, memberType)) {
                                miss = true;
                            }
                        }
                        catch (e) { this.unsetContextualTypeWithContext(cxt); }

                        if (miss) {
                            break;
                        }
                    }
                }

                if (j == args.members.length) {
                    applicableSigs[applicableSigs.length] = signatures[i];
                }

            }

            return applicableSigs;
        }

        public canContextuallyTypeFunction(candidateType: Type, funcDecl: FuncDecl, beStringent: bool): bool {

            // in these cases, we do not attempt to apply a contextual type
            //  RE: isInlineCallLiteral - if the call target is a function literal, we don't want to apply the target type
            //  to its body - instead, it should be applied to its return type
            if (funcDecl.isParenthesized ||
                funcDecl.isMethod() ||
                (beStringent && funcDecl.returnTypeAnnotation != null) ||
                funcDecl.isInlineCallLiteral) {
                return false;
            }

            beStringent = beStringent || (this.typeFlow.functionInterfaceType == candidateType);

            // At this point, if we're not being stringent, there's no need to check for multiple call sigs
            // or count parameters - we just want to unblock typecheck
            if (!beStringent) {
                return true;
            }

            // If we're coming from an in-scope typecheck, lambdas may not have had function signatures created for them
            // REVIEW: Should we search out the overload group here?
            if (!funcDecl.signature) {
                this.createFunctionSignature(funcDecl, this.typeFlow.scope.container, this.typeFlow.scope, null, null);
                this.typeFlow.typeCheck(funcDecl);
            }

            var signature = funcDecl.signature;
            var paramLen = signature.parameters.length;

            // Check that the argument declarations have no type annotations
            for (var i = 0; i < paramLen; i++) {
                var param = signature.parameters[i];
                var symbol = <ParameterSymbol>param;
                var argDecl = <ArgDecl>symbol.declAST;

                // REVIEW: a valid typeExpr is a requirement for varargs,
                // so we may want to revise our invariant
                if (beStringent && argDecl.typeExpr) {
                    return false;
                }
            }

            if (candidateType.construct != null && candidateType.call != null) {
                return false;
            }

            var candidateSigs = candidateType.construct != null ? candidateType.construct : candidateType.call;

            if (!candidateSigs || candidateSigs.signatures.length > 1) {
                return false;
            }

            // if we're here, the contextual type can be applied to the function
            return true;
        }

        public canContextuallyTypeObjectLiteral(targetType: Type, objectLit: UnaryExpression): bool {

            if (targetType == this.typeFlow.objectInterfaceType) {
                return true;
            }

            var memberDecls = <ASTList>objectLit.operand;

            if (!(memberDecls && targetType.memberScope)) {
                return false;
            }

            var id: AST = null;
            var targetMember: Symbol = null;
            var text = "";
            var foundSyms = {};

            // Check that each property in the object literal is present in the target
            // type
            for (var i = 0; i < memberDecls.members.length; i++) {
                id = (<BinaryExpression>memberDecls.members[i]).operand1;

                if (id.nodeType == NodeType.Name) {
                    text = (<Identifier>id).text;
                }
                else if (id.nodeType == NodeType.QString) {
                    // TODO: set text to unescaped string
                    var idText = (<StringLiteral>id).text;
                    text = idText.substring(1, idText.length - 1);
                }
                else {
                    return false;
                }

                targetMember = targetType.memberScope.find(text, true, false);

                if (!targetMember) {
                    return false;
                }

                foundSyms[text] = true;
            }

            // Check that all members in the target type are present in the object literal
            var targetMembers = targetType.memberScope.getAllValueSymbolNames(true);

            for (var i = 0; i < targetMembers.length; i++) {
                var memberName = targetMembers[i];
                var memberSym = targetType.memberScope.find(memberName, true, false);

                if (!foundSyms[targetMembers[i]] &&
                    !hasFlag(memberSym.flags, SymbolFlags.Optional)) {
                    return false;
                }
            }

            return true;
        }

        public objectLiteralIsSupersetOfContextualType(targetType: Type, objectLit: UnaryExpression): bool {

            var memberDecls = <ASTList>objectLit.operand;

            if (!(memberDecls && targetType.memberScope)) {
                return false;
            }

            var id: AST = null;
            var targetMember: Symbol = null;
            var text = "";
            var members = targetType.members.publicMembers.getAllKeys();

            for (var i = 0; i < members.length; i++) {

                for (var j = 0; j < memberDecls.members.length; j++) {
                    id = (<BinaryExpression>memberDecls.members[j]).operand1;

                    if (id.nodeType == NodeType.Name) {
                        text = (<Identifier>id).text;
                    }
                    else if (id.nodeType == NodeType.QString) {
                        // TODO: set text to unescaped string
                        var idText = (<StringLiteral>id).text;
                        text = idText.substring(1, idText.length - 1);
                    }
                    else {
                        return false;
                    }

                    if (text == members[i]) {
                        break;
                    }
                }

                if (j == memberDecls.members.length) {
                    return false;
                }
            }

            return true;
        }

        public widenType(t: Type) {
            if (t == this.undefinedType || t == this.nullType) {
                return this.anyType;
            }

            return t;
        }

        public isNullOrUndefinedType(t: Type) {
            return t == this.undefinedType || t == this.nullType;
        }

        public findBestCommonType(initialType: Type, targetType: Type, collection: ITypeCollection) {
            var i = 0;
            var len = collection.getLength();
            var nlastChecked = 0;
            var bestCommonType = initialType;

            if (targetType) {
                bestCommonType = bestCommonType ? bestCommonType.mergeOrdered(targetType, this) : targetType;
            }

            // it's important that we set the convergence type here, and not in the loop,
            // since the first element considered may be the contextual type
            var convergenceType: Type = bestCommonType;

            while (nlastChecked < len) {

                for (i = 0; i < len; i++) {

                    // no use in comparing a type against itself
                    if (i == nlastChecked) {
                        continue;
                    }

                    if (convergenceType && (bestCommonType = convergenceType.mergeOrdered(collection.getTypeAtIndex(i), this))) {
                        convergenceType = bestCommonType;
                    }

                    if (bestCommonType == this.anyType || bestCommonType == null) {
                        break;
                    }
                    else if (targetType != null) { // set the element type to the target type
                        collection.setTypeAtIndex(i, targetType);
                    }
                }

                // use the type if we've agreed upon it
                if (convergenceType != null && bestCommonType != null) {
                    break;
                }

                nlastChecked++;
                if (nlastChecked < len) {
                    convergenceType = collection.getTypeAtIndex(nlastChecked);
                }
            }

            return bestCommonType;
        }

        // Type Identity

        // Two types are considered identical when they are both one and the same of the Any, Number, String, 
        // Boolean, Undefined, Null, or Void types, when they are both array types with identical element types, 
        // or when they are both object types with identical sets of members. Member sets of object types are 
        // identical when, one for one,
        // •	properties are identical in name, optionality, and type,
        // •	call signatures are identical in return types and parameter count, kinds, and types,
        // •	construct signatures are identical in return types and parameter count, kinds, and types,
        // •	index signatures are identical in return and parameter types, and
        // •	brands are identical.
        public typesAreIdentical(t1: Type, t2: Type) {

            // This clause will cover both primitive types (since the type objects are shared),
            // as well as shared brands
            if (t1 == t2) {
                return true;
            }

            if (!t1 || !t2) {
                return false;
            }

            var comboId = (t2.typeID << 16) | t1.typeID;

            if (this.identicalCache[comboId]) {
                return true;
            }

            // If one is an enum, and they're not the same type, they're not identical
            if ((t1.typeFlags & TypeFlags.IsEnum) || (t2.typeFlags & TypeFlags.IsEnum)) {
                return false;
            }

            if (t1.isArray() || t2.isArray()) {
                if (!(t1.isArray() && t2.isArray())) {
                    return false;
                }
                this.identicalCache[comboId] = false;
                var ret =  this.typesAreIdentical(t1.elementType, t2.elementType);
                if (ret) {
                    this.subtypeCache[comboId] = true;
                }
                else {
                    this.subtypeCache[comboId] = undefined;
                }

                return ret;
            }

            if (t1.primitiveTypeClass != t2.primitiveTypeClass) {
                return false;
            }

            this.identicalCache[comboId] = false;

            // properties are identical in name, optionality, and type
            // REVIEW: TypeChanges - The compiler does not currently check against the members of parent types!
            // REVIEW: TypeChanges - What about ambientMembers?
            if (t1.memberScope && t2.memberScope) {
                var t1MemberKeys = t1.memberScope.getAllValueSymbolNames(true).sort();
                var t2MemberKeys = t2.memberScope.getAllValueSymbolNames(true).sort();

                if (t1MemberKeys.length != t2MemberKeys.length) {
                    this.identicalCache[comboId] = undefined;
                    return false;
                }

                var t1MemberSymbol: Symbol = null;
                var t2MemberSymbol: Symbol = null;

                var t1MemberType: Type = null;
                var t2MemberType: Type = null;

                for (var iMember = 0; iMember < t1MemberKeys.length; iMember++) {
                    if (t1MemberKeys[iMember] != t2MemberKeys[iMember]) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }

                    t1MemberSymbol = <Symbol>t1.memberScope.find(t1MemberKeys[iMember], false, false);
                    t2MemberSymbol = <Symbol>t2.memberScope.find(t2MemberKeys[iMember], false, false);

                    if ((t1MemberSymbol.flags & SymbolFlags.Optional) != (t2MemberSymbol.flags & SymbolFlags.Optional)) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }

                    t1MemberType = t1MemberSymbol.getType();
                    t2MemberType = t2MemberSymbol.getType();

                    // catch the mutually recursive or cached cases
                    if (t1MemberType && t2MemberType && (this.identicalCache[(t2MemberType.typeID << 16) | t1MemberType.typeID ] != undefined)) {
                        continue;
                    }

                    if (!this.typesAreIdentical(t1MemberType, t2MemberType)) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }
                }
            }
            else if (t1.memberScope || t2.memberScope) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1.call, t2.call)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1.construct, t2.construct)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1.index, t2.index)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            this.identicalCache[comboId] = true;
            return true;
        }

        public signatureGroupsAreIdentical(sg1: SignatureGroup, sg2: SignatureGroup) {

            // covers the null case
            if (sg1 == sg2) {
                return true;
            }

            // covers the mixed-null case
            if (!sg1 || !sg2) {
                return false;
            }

            if (sg1.signatures.length != sg2.signatures.length) {
                return false;
            }

            var sig1: Signature = null;
            var sig2: Signature = null;
            var sigsMatch = false;

            // The signatures in the signature group may not be ordered...
            // REVIEW: Should definition signatures be required to be identical as well?
            for (var iSig1 = 0; iSig1 < sg1.signatures.length; iSig1++) {
                sig1 = sg1.signatures[iSig1];

                for (var iSig2 = 0; iSig2 < sg2.signatures.length; iSig2++) {
                    sig2 = sg2.signatures[iSig2];

                    if (this.signaturesAreIdentical(sig1, sig2)) {
                        sigsMatch = true;
                        break;
                    }
                }

                if (sigsMatch) {
                    sigsMatch = false;
                    continue;
                }
                
                // no match found for a specific signature
                return false;
            }

            return true;
        }

        public signaturesAreIdentical(s1: Signature, s2: Signature) {

            if (s1.hasVariableArgList != s2.hasVariableArgList) {
                return false;
            }

            if (s1.nonOptionalParameterCount != s2.nonOptionalParameterCount) {
                return false;
            }

            if (s1.parameters.length != s2.parameters.length) {
                return false;
            }

            if (!this.typesAreIdentical(s1.returnType.type, s2.returnType.type)) {
                return false;
            }

            for (var iParam = 0; iParam < s1.parameters.length; iParam++) {
                if (!this.typesAreIdentical(s1.parameters[iParam].parameter.typeLink.type, s2.parameters[iParam].parameter.typeLink.type)) {
                    return false;
                }
            }

            return true;
        }

        // Subtypes and Supertypes

        // A type S is a subtype of a type T, and T is a supertype of S, if one of the following is true:
        //  •	S and T are identical types.
        //  •	S is not the Void type and T is the Any type.
        //  •	S is the Undefined type and T is not the Void type.
        //  •	S is the Null type and T is not the Undefined or Void type.
        //  •	S and T are array types with element types SE and TE, and SE is a subtype of TE.
        //  •	S and T are object types and, for each member M in T, one of the following is true:
        //      o	M is a property and S contains a property of the same name as M and a type that is a subtype of that of M.
        //      o	M is an optional property and S contains no property of the same name as M.
        //      o	M is a call, construct or index signature and S contains a call, construct or index signature N where
        //          •	the signatures are of the same kind (call, construct or index),
        //          •	the number of non-optional parameters in N is less than or equal to that of M,
        //          •	for parameter positions that are present in both signatures, each parameter type in N is a subtype or supertype of the corresponding parameter type in M,
        //          •	the result type of M is Void, or the result type of N is a subtype of that of M. 
        //      o	M is a brand and S contains the same brand.
        //  When comparing call, construct, or index signatures, parameter names are ignored and rest parameters correspond to an unbounded expansion of optional parameters of the rest parameter element type.
        public sourceIsSubtypeOfTarget(source: Type, target: Type) {

            // REVIEW: Does this check even matter?
            //if (this.typesAreIdentical(source, target)) {
            //    return true;
            //}
            if (source == target) {
                return true;
            }

            // An error has already been reported in this case
            if (!(source && target)) { 
                return true; 
            }

            var comboId = (source.typeID << 16) | target.typeID;

            if (this.subtypeCache[comboId]) {
                return true;
            }

            // This is one difference between assignment compatibility and subtyping
            if (target == this.anyType) {
                return true;
            }

            if (source == this.undefinedType) {
                return true;
            }

            if ((source == this.nullType) && (target != this.undefinedType && target != this.voidType)) {
                return true;
            }

            // REVIEW: enum types aren't explicitly covered in the spec
            if (target == this.numberType && (source.typeFlags & TypeFlags.IsEnum)) {
                return true;
            }
            if (source == this.numberType && (target.typeFlags & TypeFlags.IsEnum)) {
                return true;
            }
            if ((source.typeFlags & TypeFlags.IsEnum) || (target.typeFlags & TypeFlags.IsEnum)) {
                return false;
            }

            if (source.isArray() || target.isArray()) {
                if (!(source.isArray() && target.isArray())) {
                    return false;
                }
                this.subtypeCache[comboId] = false;
                var ret =  this.sourceIsSubtypeOfTarget(source.elementType, target.elementType);
                if (ret) {
                    this.subtypeCache[comboId] = true;
                }
                else {
                    this.subtypeCache[comboId] = undefined;
                }

                return ret;
            }

            // this check ensures that we only operate on object types from this point forward,
            // since the checks involving primitives occurred above
            if (source.primitiveTypeClass != target.primitiveTypeClass) {

                if (target.primitiveTypeClass == Primitive.None) {
                    if (source == this.numberType && this.typeFlow.numberInterfaceType) {
                        source = this.typeFlow.numberInterfaceType;
                    }
                    else if (source == this.stringType && this.typeFlow.stringInterfaceType) {
                        source = this.typeFlow.stringInterfaceType;
                    }
                    else if (source == this.booleanType && this.typeFlow.booleanInterfaceType) {
                        source = this.typeFlow.booleanInterfaceType;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }

            this.subtypeCache[comboId] = false;

            if (source.hasBase(target)) {
                this.subtypeCache[comboId] = false;
                return true;
            }

            if (this.typeFlow.objectInterfaceType && target == this.typeFlow.objectInterfaceType) {
                return true;
            }

            if (this.typeFlow.functionInterfaceType && (source.call || source.construct) && target == this.typeFlow.functionInterfaceType) {
                return true;
            }

            // At this point, if the target is a class, but not the source or a parent of the source, bail
            if (target.isClass() || target.isClassInstance()) {
                this.assignableCache[comboId] = undefined;
                return false;
            }

            if (target.memberScope && source.memberScope) {
                var mPropKeys = target.memberScope.getAllValueSymbolNames(true);
                var mProp: Symbol = null;
                var nProp: Symbol = null;
                var mPropType: Type = null;
                var nPropType: Type = null;
                var inferenceSymbol: InferenceSymbol = null;

                for (var iMProp = 0; iMProp < mPropKeys.length; iMProp++) {
                    mProp = target.memberScope.find(mPropKeys[iMProp], false, false);
                    nProp = source.memberScope.find(mPropKeys[iMProp], false, false);

                    // methods do not have the "arguments" field
                    if (mProp.kind() == SymbolKind.Variable && (<VariableSymbol>mProp).variable.typeLink.ast &&
                        (<VariableSymbol>mProp).variable.typeLink.ast.nodeType == NodeType.Name &&
                        (<Identifier>(<VariableSymbol>mProp).variable.typeLink.ast).text == "IArguments") {
                        continue;
                    }

                    if (mProp.isInferenceSymbol()) {
                        inferenceSymbol = <InferenceSymbol>mProp;
                        if (inferenceSymbol.typeCheckStatus == TypeCheckStatus.NotStarted) {
                            // REVIEW: TypeChanges: Does this ever really happen?  Maybe for out-of-order typecheck?
                            this.typeFlow.typeCheck(mProp.declAST);
                        }
                    }
                    mPropType = mProp.getType();

                    if (!nProp) {
                        // If it's not present on the type in question, look for the property on 'Object'
                        if (this.typeFlow.objectInterfaceType) {
                            nProp = this.typeFlow.objectInterfaceType.memberScope.find(mPropKeys[iMProp], false, false);
                        }

                        if (!nProp) {
                            // Now, the property was not found on Object, but the type in question is a function, look
                            // for it on function
                            if (this.typeFlow.functionInterfaceType && (mPropType.call || mPropType.construct)) {
                                nProp = this.typeFlow.functionInterfaceType.memberScope.find(mPropKeys[iMProp], false, false);
                            }

                            // finally, check to see if the property is optional
                            if (!nProp) {
                                if (!(mProp.flags & SymbolFlags.Optional)) {
                                    this.subtypeCache[comboId] = undefined;
                                    return false;
                                }
                                else {
                                    continue;
                                }
                            }
                        }
                    }

                    if (nProp.isInferenceSymbol()) {
                        inferenceSymbol = <InferenceSymbol>nProp;
                        if (inferenceSymbol.typeCheckStatus == TypeCheckStatus.NotStarted) {
                            this.typeFlow.typeCheck(nProp.declAST);
                        }
                    }

                    nPropType = nProp.getType();

                    // catch the mutually recursive or cached cases
                    if (mPropType && nPropType && (this.subtypeCache[(nPropType.typeID << 16) | mPropType.typeID ] != undefined)) {
                        continue;
                    }

                    if (!this.sourceIsSubtypeOfTarget(nPropType, mPropType)) {
                        this.subtypeCache[comboId] = undefined;
                        return false;
                    }
                }
            }

            // check signature groups
            if (source.call || target.call) {
                if (!this.signatureGroupIsSubtypeOfTarget(source.call, target.call)) {
                    this.subtypeCache[comboId] = undefined;
                    return false;
                }
            }

            if (source.construct || target.construct) {
                if (!this.signatureGroupIsSubtypeOfTarget(source.construct, target.construct)) {
                    this.subtypeCache[comboId] = undefined;
                    return false;
                }
            }

            if (target.index) {
                if (!this.signatureGroupIsSubtypeOfTarget(source.index, target.index)) {
                    this.subtypeCache[comboId] = undefined;
                    return false;
                }
            }

            this.subtypeCache[comboId] = true;
            return true;
        }

        // REVIEW: TypeChanges: Return an error context object so the user can get better diagnostic info
        public signatureGroupIsSubtypeOfTarget(sourceSG: SignatureGroup, targetSG: SignatureGroup) {

            if (sourceSG == targetSG) {
                return true;
            }

            if (!sourceSG || !targetSG) {
                return false;
            }

            var mSig: Signature = null;
            var nSig: Signature = null;
            var foundMatch = false;

            for (var iMSig = 0; iMSig < targetSG.signatures.length; iMSig++) {
                mSig = targetSG.signatures[iMSig];

                for (var iNSig = 0; iNSig < sourceSG.signatures.length; iNSig++) {
                    nSig = sourceSG.signatures[iNSig];
                    if (this.signatureIsSubtypeOfTarget(nSig, mSig)) {
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    foundMatch = false;
                    continue;
                }
                return false;
            }

            return true;
        }

        public signatureIsSubtypeOfTarget(sourceSig: Signature, targetSig: Signature) {

            if (!(sourceSig.parameters && targetSig.parameters)) {
                return false;
            }

            var targetVarArgCount = targetSig.hasVariableArgList ? targetSig.nonOptionalParameterCount - 1 : targetSig.nonOptionalParameterCount;
            var sourceVarArgCount = sourceSig.hasVariableArgList ? sourceSig.nonOptionalParameterCount - 1 : sourceSig.nonOptionalParameterCount;

            if (sourceVarArgCount > targetVarArgCount && !targetSig.hasVariableArgList) {
                return false;
            }

            var sourceReturnType = sourceSig.returnType.type;
            var targetReturnType = targetSig.returnType.type;

            if (targetReturnType != this.voidType) {
                if (!this.sourceIsSubtypeOfTarget(sourceReturnType, targetReturnType)) {
                    return false;
                }
            }

            var len = (sourceVarArgCount < targetVarArgCount && sourceSig.hasVariableArgList) ? targetVarArgCount : sourceVarArgCount;
            var sourceParamType: Type = null;
            var targetParamType: Type = null;

            for (var iSource = 0, iTarget = 0; iSource < len; iSource++, iTarget++) {

                if (!sourceSig.hasVariableArgList || iSource < sourceVarArgCount) {
                    sourceParamType = (<ParameterSymbol>sourceSig.parameters[iSource]).parameter.typeLink.type;
                }
                else if (iSource == sourceVarArgCount) {
                    sourceParamType = (<ParameterSymbol>sourceSig.parameters[iSource]).parameter.typeLink.type;
                    if (sourceParamType.elementType) {
                        sourceParamType = sourceParamType.elementType;
                    }
                }

                //if (!targetSig.hasVariableArgList && iTarget < targetVarArgCount) {
                if (iTarget < targetSig.parameters.length && iTarget < targetVarArgCount) {
                    targetParamType = (<ParameterSymbol>targetSig.parameters[iTarget]).parameter.typeLink.type;
                }
                else if (targetSig.hasVariableArgList && iTarget == targetVarArgCount) {
                    targetParamType = (<ParameterSymbol>targetSig.parameters[iTarget]).parameter.typeLink.type;
                    if (targetParamType.elementType) {
                        targetParamType = targetParamType.elementType;
                    }
                }

                if (!(this.sourceIsSubtypeOfTarget(sourceParamType, targetParamType) || this.sourceIsSubtypeOfTarget(targetParamType, sourceParamType))) {
                    return false;
                }
            }
            return true;
        }

        // Assignment compatibility

        // A type S is assignable to a type T, and T is assignable from S, if one of the following is true:
        //  •	S and T are identical types.
        //  •	S is not the Void type and T is the Any type.
        //  •	S is the Any type and T is not the Void type
        //  •	S is the Undefined type and T is not the Void type.
        //  •	S is the Null type and T is not the Undefined or Void type.
        //  •	S and T are array types with element types SE and TE, and SE is assignable to TE.
        //  •	S and T are object types and, for each member M in T, one of the following is true:
        //      o	M is a property and S contains a property of the same name as M and a type that is assignable to that of M.
        //      o	M is an optional property and S contains no property of the same name as M.
        //      o	M is a call, construct or index signature and S contains a call, construct or index signature N where
        //          •	the signatures are of the same kind (call, construct or index),
        //          •	the number of non-optional parameters in N is less than or equal to that of M,
        //          •	for parameter positions that are present in both signatures, each parameter type in N is assignable to or from the corresponding parameter type in M,
        //          •	the result type of M is Void, or the result type of N is assignable to that of M. 
        //      o	M is a brand and S contains the same brand.
        // When comparing call, construct, or index signatures, parameter names are ignored and rest parameters correspond to an unbounded expansion of optional parameters of the rest parameter element type.

        public sourceIsAssignableToTarget(source: Type, target: Type) {

            // REVIEW: Does this check even matter?
            //if (this.typesAreIdentical(source, target)) {
            //    return true;
            //}
            if (source == target) {
                return true;
            }

            // An error has already been reported in this case
            if (!(source && target)) { 
                return true; 
            }

            var comboId = (source.typeID << 16) | target.typeID;

            if (this.assignableCache[comboId]) {
                return true;
            }

            // this is one difference between subtyping and assignment compatibility
            if (source == this.anyType || target == this.anyType) {
                return true;
            }

            if (source == this.undefinedType) {
                return true;
            }

            if ((source == this.nullType) && (target != this.undefinedType && target != this.voidType)) {
                return true;
            }

            // REVIEW: enum types aren't explicitly covered in the spec
            if (target == this.numberType && (source.typeFlags & TypeFlags.IsEnum)) {
                return true;
            }
            if (source == this.numberType && (target.typeFlags & TypeFlags.IsEnum)) {
                return true;
            }
            if ((source.typeFlags & TypeFlags.IsEnum) || (target.typeFlags & TypeFlags.IsEnum)) {
                return false;
            }

            if (source.isArray() || target.isArray()) {
                if (!(source.isArray() && target.isArray())) {
                    return false;
                }
                this.assignableCache[comboId] = false;
                var ret =  this.sourceIsAssignableToTarget(source.elementType, target.elementType);
                if (ret) {
                    this.assignableCache[comboId] = true;
                }
                else {
                    this.assignableCache[comboId] = undefined;
                }

                return ret;
            }

            // this check ensures that we only operate on object types from this point forward,
            // since the checks involving primitives occurred above
            if (source.primitiveTypeClass != target.primitiveTypeClass) {

                if (target.primitiveTypeClass == Primitive.None) {
                    if (source == this.numberType && this.typeFlow.numberInterfaceType) {
                        source = this.typeFlow.numberInterfaceType;
                    }
                    else if (source == this.stringType && this.typeFlow.stringInterfaceType) {
                        source = this.typeFlow.stringInterfaceType;
                    }
                    else if (source == this.booleanType && this.typeFlow.booleanInterfaceType) {
                        source = this.typeFlow.booleanInterfaceType;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }

            this.assignableCache[comboId] = false;

            if (source.hasBase(target)) {
                this.assignableCache[comboId] = true;
                return true;
            }

            if (this.typeFlow.objectInterfaceType && target == this.typeFlow.objectInterfaceType) {
                return true;
            }

            if (this.typeFlow.functionInterfaceType && (source.call || source.construct) && target == this.typeFlow.functionInterfaceType) {
                return true;
            }

            // At this point, if the target is a class, but not the source or a parent of the source, bail
            if (target.isClass() || target.isClassInstance()) {
                this.assignableCache[comboId] = undefined;
                return false;
            }

            if (target.memberScope && source.memberScope) {
                var mPropKeys = target.memberScope.getAllValueSymbolNames(true);
                var mProp: Symbol = null;
                var nProp: Symbol = null;
                var mPropType: Type = null;
                var nPropType: Type = null;
                var inferenceSymbol: InferenceSymbol = null;

                for (var iMProp = 0; iMProp < mPropKeys.length; iMProp++) {
                    mProp = target.memberScope.find(mPropKeys[iMProp], false, false);
                    nProp = source.memberScope.find(mPropKeys[iMProp], false, false);

                    // methods do not have the "arguments" field
                    if (mProp.kind() == SymbolKind.Variable && (<VariableSymbol>mProp).variable.typeLink.ast &&
                        (<VariableSymbol>mProp).variable.typeLink.ast.nodeType == NodeType.Name &&
                        (<Identifier>(<VariableSymbol>mProp).variable.typeLink.ast).text == "IArguments") {
                        continue;
                    }

                    if (mProp.isInferenceSymbol()) {
                        inferenceSymbol = <InferenceSymbol>mProp;
                        if (inferenceSymbol.typeCheckStatus == TypeCheckStatus.NotStarted) {
                            // REVIEW: TypeChanges: Does this ever really happen?  Maybe for out-of-order typecheck?
                            this.typeFlow.typeCheck(mProp.declAST);
                        }
                    }
                    mPropType = mProp.getType();

                    if (!nProp) {
                        // If it's not present on the type in question, look for the property on 'Object'
                        if (this.typeFlow.objectInterfaceType) {
                            nProp = this.typeFlow.objectInterfaceType.memberScope.find(mPropKeys[iMProp], false, false);
                        }

                        if (!nProp) {
                            // Now, the property was not found on Object, but the type in question is a function, look
                            // for it on function
                            if (this.typeFlow.functionInterfaceType && (mPropType.call || mPropType.construct)) {
                                nProp = this.typeFlow.functionInterfaceType.memberScope.find(mPropKeys[iMProp], false, false);
                            }

                            // finally, check to see if the property is optional
                            if (!nProp) {
                                if (!(mProp.flags & SymbolFlags.Optional)) {
                                    this.assignableCache[comboId] = undefined;
                                    return false;
                                }
                                else {
                                    continue;
                                }
                            }
                        }
                    }

                    if (nProp.isInferenceSymbol()) {
                        inferenceSymbol = <InferenceSymbol>nProp;
                        if (inferenceSymbol.typeCheckStatus == TypeCheckStatus.NotStarted) {
                            this.typeFlow.typeCheck(nProp.declAST);
                        }
                    }

                    
                    nPropType = nProp.getType();

                    // catch the mutually recursive or cached cases
                    if (mPropType && nPropType && (this.assignableCache[(nPropType.typeID << 16) | mPropType.typeID ] != undefined)) {
                        continue;
                    }

                    if (!this.sourceIsAssignableToTarget(nPropType, mPropType)) {
                        this.assignableCache[comboId] = undefined;
                        return false;
                    }
                }
            }

            // check signature groups
            if (source.call || target.call) {
                if (!this.signatureGroupIsAssignableToTarget(source.call, target.call)) {
                    this.assignableCache[comboId] = undefined;
                    return false;
                }
            }

            if (source.construct || target.construct) {
                if (!this.signatureGroupIsAssignableToTarget(source.construct, target.construct)) {
                    this.assignableCache[comboId] = undefined;
                    return false;
                }
            }

            if (target.index) {
                if (!this.signatureGroupIsAssignableToTarget(source.index, target.index)) {
                    this.assignableCache[comboId] = undefined;
                    return false;
                }
            }

            this.assignableCache[comboId] = true;
            return true;
        }

        // REVIEW: TypeChanges: Return an error context object so the user can get better diagnostic info
        public signatureGroupIsAssignableToTarget(sourceSG: SignatureGroup, targetSG: SignatureGroup) {
            if (sourceSG == targetSG) {
                return true;
            }

            if (!(sourceSG && targetSG)) {
                return false;
            }

            var mSig: Signature = null;
            var nSig: Signature = null;
            var foundMatch = false;

            for (var iMSig = 0; iMSig < targetSG.signatures.length; iMSig++) {
                mSig = targetSG.signatures[iMSig];

                for (var iNSig = 0; iNSig < sourceSG.signatures.length; iNSig++) {
                    nSig = sourceSG.signatures[iNSig];
                    if (this.signatureIsAssignableToTarget(nSig, mSig)) {
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    foundMatch = false;
                    continue;
                }
                return false;
            }

            return true;
        }

        public signatureIsAssignableToTarget(sourceSig: Signature, targetSig: Signature) {

            if (!sourceSig.parameters || !targetSig.parameters) {
                return false;
            }

            var targetVarArgCount = targetSig.hasVariableArgList ? targetSig.nonOptionalParameterCount - 1 : targetSig.nonOptionalParameterCount;
            var sourceVarArgCount = sourceSig.hasVariableArgList ? sourceSig.nonOptionalParameterCount - 1 : sourceSig.nonOptionalParameterCount;

            if (sourceVarArgCount > targetVarArgCount && !targetSig.hasVariableArgList) {
                return false;
            }

            var sourceReturnType = sourceSig.returnType.type;
            var targetReturnType = targetSig.returnType.type;

            if (targetReturnType != this.voidType) {
                if (!this.sourceIsAssignableToTarget(sourceReturnType, targetReturnType)) {
                    return false;
                }
            }

            var len = (sourceVarArgCount < targetVarArgCount && sourceSig.hasVariableArgList) ? targetVarArgCount : sourceVarArgCount;
            var sourceParamType: Type = null;
            var targetParamType: Type = null;

            for (var iSource = 0, iTarget = 0; iSource < len; iSource++, iTarget++) {

                if (!sourceSig.hasVariableArgList || iSource < sourceVarArgCount) {
                    sourceParamType = (<ParameterSymbol>sourceSig.parameters[iSource]).parameter.typeLink.type;
                }
                else if (iSource == sourceVarArgCount) {
                    sourceParamType = (<ParameterSymbol>sourceSig.parameters[iSource]).parameter.typeLink.type;
                    if (sourceParamType.elementType) {
                        sourceParamType = sourceParamType.elementType;
                    }
                }

                //if (!targetSig.hasVariableArgList || iTarget < targetVarArgCount) {
                if (iTarget < targetSig.parameters.length && iTarget < targetVarArgCount) {
                    targetParamType = (<ParameterSymbol>targetSig.parameters[iTarget]).parameter.typeLink.type;
                }
                else if (targetSig.hasVariableArgList && iTarget == targetVarArgCount) {
                    targetParamType = (<ParameterSymbol>targetSig.parameters[iTarget]).parameter.typeLink.type;
                    if (targetParamType.elementType) {
                        targetParamType = targetParamType.elementType;
                    }
                }

                if (!(this.sourceIsAssignableToTarget(sourceParamType, targetParamType) || this.sourceIsAssignableToTarget(targetParamType, sourceParamType))) {
                    return false;
                }
            }
            return true;
        }
    }
}