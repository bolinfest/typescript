///<reference path='typescript.ts' />

module TypeScript {

    export enum Primitive {
        None = 0,
        Void = 1,
        Double = 2,
        String = 4,
        Boolean = 8,
        Any = 16,
        Null = 32,
        Undefined = 64,
    }

    export class MemberName {
        public prefix: string = "";
        public suffix: string = "";

        public isString() { return false; }
        public isArray() { return false; }

        public toString(): string {
            return MemberName.memberNameToString(this);
        }

        static memberNameToString(memberName: MemberName): string {
            var result = memberName.prefix;

            if (memberName.isString()) {
                result += (<MemberNameString>memberName).text;
            }
            else {
                var ar = <MemberNameArray>memberName;
                for (var index = 0; index < ar.entries.length; index++) {
                    result += memberNameToString(ar.entries[index]);
                    result += ar.delim;
                }
            }

            result += memberName.suffix;
            return result;
        }


        static create(text: string): MemberName;
        static create(entry: MemberName, prefix: string, suffix: string): MemberName;
        static create(arg1: any, arg2?: any, arg3?: any): MemberName {
            if (typeof arg1 == "string") {
                return new MemberNameString(arg1);
            }
            else {
                var result = new MemberNameArray();
                if (arg2)
                    result.prefix = arg2;
                if (arg3)
                    result.suffix = arg3;
                result.entries.push(arg1);
                return result;
            }
        }
    }

    export class MemberNameString extends MemberName {
        constructor (public text: string) {
            super()
        }

        public isString() { return true; }
    }

    export class MemberNameArray extends MemberName {
        public delim: string = "";
        public entries: MemberName[] = [];

        public isArray() { return true; }

        public add(entry: MemberName) {
            this.entries.push(entry);
        }

        public addAll(entries: MemberName[]) {
            for (var i = 0 ; i < entries.length; i++) {
                this.entries.push(entries[i]);
            }
        }
    }

    //export function hasNominalSubtypeRelationship(a: Type, b: Type, depth: number): bool {
    //    if (depth > 0) {
    //        var impls: Type[] = a.implementsList;
    //        var exnds: Type[] = a.extendsList;
    //        var candidates: Type[] = null;
    //        if (impls == null && exnds == null) {
    //            return false;
    //        }
    //        else if (impls != null && exnds != null) {
    //            candidates = impls.concat(exnds);
    //        }
    //        else {
    //            candidates = exnds != null ? exnds : impls;
    //        }

    //        var imp: Type = null;
    //        var bbase: Type = null;
    //        var impbase: Type = null;
    //        for (var i = 0; i < candidates.length; i++) {
    //            imp = candidates[i];

    //            if (b == imp) {
    //                //WScript.Echo("Clause 1, depth: " + depth + ", b: " + b.getTypeName() + ", imp: " + imp.getTypeName());
    //                return true;
    //            }

    //            impbase = imp.baseClass();
    //            bbase = b.baseClass();

    //            // quickly check for a shallow parent relationship
    //            if ((b == impbase || bbase == imp) || (bbase != null && impbase != null && bbase == impbase)) {
    //                return true;
    //            }

    //            if (hasNominalSubtypeRelationship(imp, b, depth - 1)) {
    //                //WScript.Echo("Clause 3, depth: " + depth + ", b: " + b.getTypeName() + ", imp: " + imp.getTypeName());
    //                return true;
    //            }
    //        }
    //    }
    //    return false;
    //}

    var currentTypeID = -1;

    export class Type {
        public typeID = currentTypeID++;

        public members: ScopedMembers;
        public ambientMembers: ScopedMembers;

        public construct: SignatureGroup = null;
        public call: SignatureGroup = null;
        public index: SignatureGroup = null;

        // REVIEW: for either of the below, why do we have lists of types and lists of type links?
        // interface can only extend
        public extendsList: Type[];
        public extendsTypeLinks: TypeLink[];

        // class can also implement
        public implementsList: Type[];
        public implementsTypeLinks: TypeLink[];

        // REVIEW: For diagnostic purposes
        public passTypeCreated: number = CompilerDiagnostics.analysisPass;

        public baseClass(): Type {
            if ((this.extendsList != null) && (this.extendsList.length > 0)) {
                return this.extendsList[0];
            }
            else {
                return null;
            }
        }

        // array type
        public elementType: Type;

        public getArrayBase(arrInstType: Type, checker: TypeChecker): Type {
            return this.arrayCache.specialize(arrInstType, checker);
        }

        public primitiveTypeClass: number = Primitive.None;

        // REVIEW: Prune constructorScope
        public constructorScope: SymbolScope;
        public containedScope: SymbolScope;
        public memberScope: SymbolScope;

        public arrayCache: ArrayCache;

        public typeFlags = TypeFlags.None;

        public symbol: TypeSymbol;

        public enclosingType: Type;
        public instanceType: Type;

        // REVIEW: Prune
        public isClass() { return this.instanceType != null; }
        public isArray() { return this.elementType != null; }
        public isClassInstance(): bool {
            return ((this.symbol != null) && (this.elementType == null) && ((<TypeSymbol>this.symbol).type.isClass()));
        }

        public getInstanceType() {
            if (this.isClass()) {
                return this.instanceType;
            }
            else {
                return this;
            }
        }

        public hasImplementation() { return hasFlag(this.typeFlags, TypeFlags.HasImplementation); }
        public setHasImplementation() { this.typeFlags |= TypeFlags.HasImplementation; }

        public isDouble() { return hasFlag(this.primitiveTypeClass, Primitive.Double); }
        public isString() { return hasFlag(this.primitiveTypeClass, Primitive.String); }
        public isBoolean() { return hasFlag(this.primitiveTypeClass, Primitive.Boolean); }
        public isNull() { return hasFlag(this.primitiveTypeClass, Primitive.Null); }

        // REVIEW: No need for this to be a method
        public getTypeName(): string {
            return this.getMemberTypeName("", true, false, null);
        }

        public getScopedTypeName(scope: SymbolScope) {
            return this.getMemberTypeName("", true, false, scope);
        }

        public getScopedTypeNameEx(scope: SymbolScope) {
            return this.getMemberTypeNameEx("", true, false, scope);
        }

        // REVIEW: No need for this to be a method
        public callCount() {
            var total = 0;
            if (this.call != null) {
                total += this.call.signatures.length;
            }
            if (this.construct != null) {
                total += this.construct.signatures.length;
            }
            if (this.index != null) {
                total += this.index.signatures.length;
            }
            return total;
        }


        // REVIEW: No need for this to be a method
        public getMemberTypeName(prefix: string, topLevel: bool, isElementType: bool, scope: SymbolScope): string {
            var memberName = this.getMemberTypeNameEx(prefix, topLevel, isElementType, scope);
            return memberName.toString();
        }

        // REVIEW: No need for this to be a method
        public getMemberTypeNameEx(prefix: string, topLevel: bool, isElementType: bool, scope: SymbolScope): MemberName {
            if (this.elementType != null) {
                return MemberName.create(this.elementType.getMemberTypeNameEx(prefix, false, true, scope), "", "[]");
            }
            else if ((this.symbol != null) && (this.symbol.name != null) && (this.symbol.name != "_anonymous") &&
                     (((this.call == null) && (this.construct == null) && (this.index == null)) ||
                      (hasFlag(this.typeFlags, TypeFlags.BuildingName)) ||
                      ((this.members != null) && (!this.isClass())))) {
                var tn = this.symbol.scopeRelativeName(scope);
                return MemberName.create(tn == "null" ? "any" : tn); // REVIEW: GROSS!!!
            }
            else {
                if ((this.members != null) || (this.call != null) || (this.construct != null)) {
                    if (hasFlag(this.typeFlags, TypeFlags.BuildingName)) {
                        return MemberName.create("this");
                    }
                    this.typeFlags |= TypeFlags.BuildingName;
                    var builder = "";
                    var allMemberNames = new MemberNameArray();
                    var curlies = isElementType;
                    var signatureCount = 0;
                    var memCount = 0;
                    var delim = "; ";
                    if (this.members != null) {
                        this.members.allMembers.map((key, s, unused) => {
                            var sym = <Symbol>s;
                            if (!hasFlag(sym.flags, SymbolFlags.BuiltIn)) {
                                // Remove the delimiter character from the generated type name, since
                                // our "allMemberNames" array takes care of storing delimiters
                                var typeName = sym.getTypeName(scope);
                                if (typeName.length >= delim.length && typeName.substring(typeName.length - delim.length) == delim) {
                                    typeName = typeName.substring(0, typeName.length - delim.length);
                                }
                                allMemberNames.add(MemberName.create(typeName));
                                memCount++;
                                if (sym.kind() == SymbolKind.Type) {
                                    var memberType = (<TypeSymbol>sym).type;
                                    if (memberType.callCount() > 1) {
                                        curlies = true;
                                    }
                                }
                                else {
                                    curlies = true;
                                }
                            }
                        }, null);
                    }

                    var signatures: string[];
                    var j: number;
                    var len = 0;
                    var shortform = (memCount == 0) && (this.callCount() == 1) && topLevel;
                    if (!shortform) {
                        allMemberNames.delim = delim;
                    }
                    if (this.call != null) {
                        signatures = this.call.toStrings(prefix, shortform, scope);
                        for (j = 0, len = signatures.length; j < len; j++) {
                            allMemberNames.add(MemberName.create(signatures[j]));
                            signatureCount++;
                        }
                    }

                    if (this.construct != null) {
                        signatures = this.construct.toStrings("new", shortform, scope);
                        for (j = 0, len = signatures.length; j < len; j++) {
                            allMemberNames.add(MemberName.create(signatures[j]));
                            signatureCount++;
                        }
                    }

                    if (this.index != null) {
                        signatures = this.index.toStrings("", shortform, scope);
                        for (j = 0, len = signatures.length; j < len; j++) {
                            allMemberNames.add(MemberName.create(signatures[j]));
                            signatureCount++;
                        }
                    }

                    // TODO: bases
                    if ((curlies) || ((signatureCount > 1) && topLevel)) {
                        allMemberNames.prefix = "{ ";
                        allMemberNames.suffix = "}";
                    }

                    this.typeFlags &= (~TypeFlags.BuildingName);
                    if ((signatureCount == 0) && (memCount == 0)) {
                        return MemberName.create("{}");
                    }
                    else {
                        return allMemberNames;
                    }
                }
                else {
                    return MemberName.create("{}");
                }
            }
        }

        public checkDecl(checker: TypeChecker) {
            if (this.isClassInstance() || this.isClass()) {
                if (this.symbol.declAST != null) {
                    checker.typeFlow.inScopeTypeCheckDecl(this.symbol.declAST);
                }
            }
        }

        public getMemberScope(flow: TypeFlow) {
            if (this == flow.anyType) {
                return null;
            }
            else if (this.isDouble()) {
                if (flow.numberInterfaceType != null) {
                    return flow.numberInterfaceType.memberScope;
                }
                else {
                    return null;
                }
            }
            else if (this.isBoolean()) {
                if (flow.booleanInterfaceType != null) {
                    return flow.booleanInterfaceType.memberScope;
                }
                else {
                    return null;
                }
            }
            else if (this == flow.stringType) {
                if (flow.stringInterfaceType != null) {
                    return flow.stringInterfaceType.memberScope;
                }
                else {
                    return null;
                }
            }
            else if (this.elementType != null) {
                if (flow.arrayInterfaceType != null) {
                    var arrInstType = this.elementType.getArrayBase(flow.arrayInterfaceType, flow.checker);
                    return arrInstType.memberScope;
                }
                else {
                    return null;
                }
            }
            else {
                return this.memberScope;
            }
        }

        public isReferenceType() {
            return (this.members != null) || (this.extendsList != null) ||
                (this.construct != null) || (this.call != null) || (this.index != null) ||
                (this.elementType != null);
        }

        // this routine is narrowly focused; it is currently used only
        // for array type specialization and is not a general substitution mechanism
        // TODO: implement generics!
        public specializeType(pattern: Type, replacement: Type, checker: TypeChecker, membersOnly: bool): Type {
            if (pattern == this) {
                return replacement;
            }
            var result = this;
            if (membersOnly) {
                // assume interface type without bases
                if (this.isReferenceType()) {
                    result = new Type();
                    if (this.members != null) {
                        result.members = new ScopedMembers(new DualStringHashTable(new StringHashTable(), new StringHashTable()));

                        this.members.publicMembers.map((key, s, unused) => {
                            var sym = <Symbol>s;
                            var bSym = sym.specializeType(pattern, replacement, checker);
                            result.members.addPublicMember(bSym.name, bSym);
                        }, null);

                        this.members.privateMembers.map((key, s, unused) => {
                            var sym = <Symbol>s;
                            var bSym = sym.specializeType(pattern, replacement, checker);
                            result.members.addPrivateMember(bSym.name, bSym);
                        }, null);
                    }
                    if (this.ambientMembers != null) {
                        result.ambientMembers = new ScopedMembers(new DualStringHashTable(new StringHashTable(), new StringHashTable()));
                        this.ambientMembers.publicMembers.map((key, s, unused) => {
                            var sym = <Symbol>s;
                            var bSym = sym.specializeType(pattern, replacement, checker);
                            result.ambientMembers.addPublicMember(bSym.name, bSym);
                        }, null);

                        this.ambientMembers.privateMembers.map((key, s, unused) => {
                            var sym = <Symbol>s;
                            var bSym = sym.specializeType(pattern, replacement, checker);
                            result.ambientMembers.addPrivateMember(bSym.name, bSym);
                        }, null);
                    }
                    result.containedScope = checker.scopeOf(result);
                    result.memberScope = result.containedScope;
                }
            }
            else {
                if (this.elementType != null) {
                    if (this.elementType == pattern) {
                        // pattern[]
                        result = checker.makeArrayType(replacement);
                    }
                    else {
                        if (this.elementType.elementType == pattern) {
                            // pattern[][]
                            result =
                                checker.makeArrayType(checker.makeArrayType(replacement));
                        }
                    }
                }
                else if (this.call != null) {
                    // call with pattern, pattern[], or pattern[][] as parameter
                    result = new Type();
                    result.call = this.call.specializeType(pattern, replacement, checker);
                }
            }
            return result;
        }

        public hasBase(baseType: Type): bool {
            if (baseType == this) {
                return true;
            }
            else {
                if (this.extendsList != null) {
                    for (var i = 0, len = this.extendsList.length; i < len; i++) {
                        if (this.extendsList[i].hasBase(baseType)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        public mergeOrdered(b: Type, checker: TypeChecker): Type {
            // only one any type
            if ((this == checker.anyType) || (b == checker.anyType)) {
                return checker.anyType;
            }
            else if (this == b) {
                return this;
            }
            else if ((b == checker.nullType) && this != checker.nullType) {
                return this;
            }
            else if ((this == checker.nullType) && (b != checker.nullType)) {
                return b;
            }
            else if ((b == checker.voidType) && this != checker.voidType) {
                return this;
            }
            else if ((this == checker.voidType) && (b != checker.voidType)) {
                return b;
            }
            else if ((b == checker.undefinedType) && this != checker.undefinedType) {
                return this;
            }
            else if ((this == checker.undefinedType) && (b != checker.undefinedType)) {
                return b;
            }
            else if ((this.elementType != null) && (b.elementType != null)) {
                if (this.elementType == b.elementType) {
                    return this;
                }
                else {
                    var mergedET = this.elementType.mergeOrdered(b.elementType, checker);
                    if (mergedET == null) {
                        return checker.makeArrayType(checker.anyType);
                    }
                    else {
                        return checker.makeArrayType(mergedET);
                    }
                }
            }
            else if (checker.sourceIsSubtypeOfTarget(this, b)) {
                return b;
            }
            else if (checker.sourceIsSubtypeOfTarget(b, this)) {
                return this;
            }
            else {
                return null;
            }
        }

        public isModuleType() { return false; }
        public hasMembers() { return this.members != null; }
        public getAllEnclosedTypes(): ScopedMembers { return null; }
        public getAllAmbientEnclosedTypes(): ScopedMembers { return null; }
        public getPublicEnclosedTypes(): ScopedMembers { return null; }
        public getpublicAmbientEnclosedTypes(): ScopedMembers { return null; }
    }

    export interface ITypeCollection {
        // returns null when types are exhausted
        getLength(): number;
        setTypeAtIndex(index: number, type: Type): void;
        getTypeAtIndex(index: number): Type;
    }

    export class ModuleType extends Type {

        constructor (public enclosedTypes: ScopedMembers, public ambientEnclosedTypes: ScopedMembers) {
            super();
        }

        public isModuleType() { return true; }
        public hasMembers() { return (this.members != null) || (this.enclosedTypes != null); }
        public getAllEnclosedTypes() { return this.enclosedTypes; }
        public getAllAmbientEnclosedTypes() { return this.ambientEnclosedTypes; }
        public getPublicEnclosedTypes(): ScopedMembers { return null; }
        public getpublicAmbientEnclosedTypes(): ScopedMembers { return null; }
        public importedModules: ImportDecl[] = [];
    }

    export class TypeLink {
        public type: Type = null;
        public ast: AST = null;
    }

    export function getTypeLink(ast: AST, checker: TypeChecker, autoVar: bool): TypeLink {
        var result = new TypeLink();

        result.ast = ast;

        if ((ast == null) && (autoVar)) {
            result.type = checker.anyType;
        }
        else {
            result.type = null;
        }

        return result;
    }

}