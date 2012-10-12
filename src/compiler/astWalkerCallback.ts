// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript.AstWalkerWithDetailCallback {
    export interface AstWalkerDetailCallback {
        EmptyCallback? (pre, ast: AST): bool;
        EmptyExprCallback? (pre, ast: AST): bool;
        TrueCallback? (pre, ast: AST): bool;
        FalseCallback? (pre, ast: AST): bool;
        ThisCallback? (pre, ast: AST): bool;
        SuperCallback? (pre, ast: AST): bool;
        QStringCallback? (pre, ast: AST): bool;
        RegexCallback? (pre, ast: AST): bool;
        NullCallback? (pre, ast: AST): bool;
        ArrayLitCallback? (pre, ast: AST): bool;
        ObjectLitCallback? (pre, ast: AST): bool;
        VoidCallback? (pre, ast: AST): bool;
        CommaCallback? (pre, ast: AST): bool;
        PosCallback? (pre, ast: AST): bool;
        NegCallback? (pre, ast: AST): bool;
        DeleteCallback? (pre, ast: AST): bool;
        AwaitCallback? (pre, ast: AST): bool;
        InCallback? (pre, ast: AST): bool;
        DotCallback? (pre, ast: AST): bool;
        FromCallback? (pre, ast: AST): bool;
        IsCallback? (pre, ast: AST): bool;
        InstOfCallback? (pre, ast: AST): bool;
        TypeofCallback? (pre, ast: AST): bool;
        NumberLitCallback? (pre, ast: AST): bool;
        NameCallback? (pre, identifierAst: Identifier): bool;
        TypeRefCallback? (pre, ast: AST): bool;
        IndexCallback? (pre, ast: AST): bool;
        CallCallback? (pre, ast: AST): bool;
        NewCallback? (pre, ast: AST): bool;
        AsgCallback? (pre, ast: AST): bool;
        AsgAddCallback? (pre, ast: AST): bool;
        AsgSubCallback? (pre, ast: AST): bool;
        AsgDivCallback? (pre, ast: AST): bool;
        AsgMulCallback? (pre, ast: AST): bool;
        AsgModCallback? (pre, ast: AST): bool;
        AsgAndCallback? (pre, ast: AST): bool;
        AsgXorCallback? (pre, ast: AST): bool;
        AsgOrCallback? (pre, ast: AST): bool;
        AsgLshCallback? (pre, ast: AST): bool;
        AsgRshCallback? (pre, ast: AST): bool;
        AsgRs2Callback? (pre, ast: AST): bool;
        QMarkCallback? (pre, ast: AST): bool;
        LogOrCallback? (pre, ast: AST): bool;
        LogAndCallback? (pre, ast: AST): bool;
        OrCallback? (pre, ast: AST): bool;
        XorCallback? (pre, ast: AST): bool;
        AndCallback? (pre, ast: AST): bool;
        EqCallback? (pre, ast: AST): bool;
        NeCallback? (pre, ast: AST): bool;
        EqvCallback? (pre, ast: AST): bool;
        NEqvCallback? (pre, ast: AST): bool;
        LtCallback? (pre, ast: AST): bool;
        LeCallback? (pre, ast: AST): bool;
        GtCallback? (pre, ast: AST): bool;
        GeCallback? (pre, ast: AST): bool;
        AddCallback? (pre, ast: AST): bool;
        SubCallback? (pre, ast: AST): bool;
        MulCallback? (pre, ast: AST): bool;
        DivCallback? (pre, ast: AST): bool;
        ModCallback? (pre, ast: AST): bool;
        LshCallback? (pre, ast: AST): bool;
        RshCallback? (pre, ast: AST): bool;
        Rs2Callback? (pre, ast: AST): bool;
        NotCallback? (pre, ast: AST): bool;
        LogNotCallback? (pre, ast: AST): bool;
        IncPreCallback? (pre, ast: AST): bool;
        DecPreCallback? (pre, ast: AST): bool;
        IncPostCallback? (pre, ast: AST): bool;
        DecPostCallback? (pre, ast: AST): bool;
        TypeAssertionCallback? (pre, ast: AST): bool;
        FuncDeclCallback? (pre, funcDecl: FuncDecl): bool;
        MemberCallback? (pre, ast: AST): bool;
        VarDeclCallback? (pre, varDecl: VarDecl): bool;
        ArgDeclCallback? (pre, ast: AST): bool;
        ReturnCallback? (pre, ast: AST): bool;
        BreakCallback? (pre, ast: AST): bool;
        ContinueCallback? (pre, ast: AST): bool;
        ThrowCallback? (pre, ast: AST): bool;
        ForCallback? (pre, ast: AST): bool;
        ForInCallback? (pre, ast: AST): bool;
        IfCallback? (pre, ast: AST): bool;
        WhileCallback? (pre, ast: AST): bool;
        DoWhileCallback? (pre, ast: AST): bool;
        BlockCallback? (pre, block: Block): bool;
        CaseCallback? (pre, ast: AST): bool;
        SwitchCallback? (pre, ast: AST): bool;
        TryCallback? (pre, ast: AST): bool;
        TryCatchCallback? (pre, ast: AST): bool;
        TryFinallyCallback? (pre, ast: AST): bool;
        FinallyCallback? (pre, ast: AST): bool;
        CatchCallback? (pre, ast: AST): bool;
        ListCallback? (pre, astList: ASTList): bool;
        ScriptCallback? (pre, script: Script): bool;
        ClassCallback? (pre, ast: AST): bool;
        InterfaceCallback? (pre, interfaceDecl: TypeDecl): bool;
        ModuleCallback? (pre, moduleDecl: ModuleDecl): bool;
        ImportCallback? (pre, ast: AST): bool;
        WithCallback? (pre, ast: AST): bool;
        LabelCallback? (pre, labelAST: AST): bool;
        LabeledStatementCallback? (pre, ast: AST): bool;
        EBStartCallback? (pre, ast: AST): bool;
        GotoEBCallback? (pre, ast: AST): bool;
        EndCodeCallback? (pre, ast: AST): bool;
        ErrorCallback? (pre, ast: AST): bool;
        CommentCallback? (pre, ast: AST): bool;
        DebuggerCallback? (pre, ast: AST): bool;
        DefaultCallback? (pre, ast: AST): bool;
    }

    export function walk(script: Script, callback: AstWalkerDetailCallback): void {
        var pre = (cur: AST, parent: AST) => {
            walker.options.goChildren = AstWalkerCallback(true, cur, callback);
            return cur;
        }

        var post = (cur: AST, parent: AST) => {
            AstWalkerCallback(false, cur, callback);
            return cur;
        }

        var walker = TypeScript.getAstWalkerFactory().getWalker(pre, post);
        walker.walk(script, null);
    }

    function AstWalkerCallback(pre: bool, ast: AST, callback: AstWalkerDetailCallback): bool {
        switch (ast.nodeType) {
            case NodeType.Empty:
                if (callback.EmptyCallback) {
                    return callback.EmptyCallback(pre, ast);
                }
                break;

            case NodeType.EmptyExpr:
                if (callback.EmptyExprCallback) {
                    return callback.EmptyExprCallback(pre, ast);
                }
                break;

            case NodeType.True:
                if (callback.TrueCallback) {
                    return callback.TrueCallback(pre, ast);
                }
                break;

            case NodeType.False:
                if (callback.FalseCallback) {
                    return callback.FalseCallback(pre, ast);
                }
                break;

            case NodeType.This:
                if (callback.ThisCallback) {
                    return callback.ThisCallback(pre, ast);
                }
                break;

            case NodeType.Super:
                if (callback.SuperCallback) {
                    return callback.SuperCallback(pre, ast);
                }
                break;

            case NodeType.QString:
                if (callback.QStringCallback) {
                    return callback.QStringCallback(pre, ast);
                }
                break;

            case NodeType.Regex:
                if (callback.RegexCallback) {
                    return callback.RegexCallback(pre, ast);
                }
                break;

            case NodeType.Null:
                if (callback.NullCallback) {
                    return callback.NullCallback(pre, ast);
                }
                break;

            case NodeType.ArrayLit:
                if (callback.ArrayLitCallback) {
                    return callback.ArrayLitCallback(pre, ast);
                }
                break;

            case NodeType.ObjectLit:
                if (callback.ObjectLitCallback) {
                    return callback.ObjectLitCallback(pre, ast);
                }
                break;

            case NodeType.Void:
                if (callback.VoidCallback) {
                    return callback.VoidCallback(pre, ast);
                }
                break;

            case NodeType.Comma:
                if (callback.CommaCallback) {
                    return callback.CommaCallback(pre, ast);
                }
                break;

            case NodeType.Pos:
                if (callback.PosCallback) {
                    return callback.PosCallback(pre, ast);
                }
                break;

            case NodeType.Neg:
                if (callback.NegCallback) {
                    return callback.NegCallback(pre, ast);
                }
                break;

            case NodeType.Delete:
                if (callback.DeleteCallback) {
                    return callback.DeleteCallback(pre, ast);
                }
                break;

            case NodeType.Await:
                if (callback.AwaitCallback) {
                    return callback.AwaitCallback(pre, ast);
                }
                break;

            case NodeType.In:
                if (callback.InCallback) {
                    return callback.InCallback(pre, ast);
                }
                break;

            case NodeType.Dot:
                if (callback.DotCallback) {
                    return callback.DotCallback(pre, ast);
                }
                break;

            case NodeType.From:
                if (callback.FromCallback) {
                    return callback.FromCallback(pre, ast);
                }
                break;

            case NodeType.Is:
                if (callback.IsCallback) {
                    return callback.IsCallback(pre, ast);
                }
                break;

            case NodeType.InstOf:
                if (callback.InstOfCallback) {
                    return callback.InstOfCallback(pre, ast);
                }
                break;

            case NodeType.Typeof:
                if (callback.TypeofCallback) {
                    return callback.TypeofCallback(pre, ast);
                }
                break;

            case NodeType.NumberLit:
                if (callback.NumberLitCallback) {
                    return callback.NumberLitCallback(pre, ast);
                }
                break;

            case NodeType.Name:
                if (callback.NameCallback) {
                    return callback.NameCallback(pre, <Identifier>ast);
                }
                break;

            case NodeType.TypeRef:
                if (callback.TypeRefCallback) {
                    return callback.TypeRefCallback(pre, ast);
                }
                break;

            case NodeType.Index:
                if (callback.IndexCallback) {
                    return callback.IndexCallback(pre, ast);
                }
                break;

            case NodeType.Call:
                if (callback.CallCallback) {
                    return callback.CallCallback(pre, ast);
                }
                break;

            case NodeType.New:
                if (callback.NewCallback) {
                    return callback.NewCallback(pre, ast);
                }
                break;

            case NodeType.Asg:
                if (callback.AsgCallback) {
                    return callback.AsgCallback(pre, ast);
                }
                break;

            case NodeType.AsgAdd:
                if (callback.AsgAddCallback) {
                    return callback.AsgAddCallback(pre, ast);
                }
                break;

            case NodeType.AsgSub:
                if (callback.AsgSubCallback) {
                    return callback.AsgSubCallback(pre, ast);
                }
                break;

            case NodeType.AsgDiv:
                if (callback.AsgDivCallback) {
                    return callback.AsgDivCallback(pre, ast);
                }
                break;

            case NodeType.AsgMul:
                if (callback.AsgMulCallback) {
                    return callback.AsgMulCallback(pre, ast);
                }
                break;

            case NodeType.AsgMul:
                if (callback.AsgMulCallback) {
                    return callback.AsgMulCallback(pre, ast);
                }
                break;

            case NodeType.AsgAnd:
                if (callback.AsgAndCallback) {
                    return callback.AsgAndCallback(pre, ast);
                }
                break;

            case NodeType.AsgXor:
                if (callback.AsgXorCallback) {
                    return callback.AsgXorCallback(pre, ast);
                }
                break;

            case NodeType.AsgOr:
                if (callback.AsgOrCallback) {
                    return callback.AsgOrCallback(pre, ast);
                }
                break;

            case NodeType.AsgLsh:
                if (callback.AsgLshCallback) {
                    return callback.AsgLshCallback(pre, ast);
                }
                break;

            case NodeType.AsgRsh:
                if (callback.AsgRshCallback) {
                    return callback.AsgRshCallback(pre, ast);
                }
                break;

            case NodeType.AsgRs2:
                if (callback.AsgRs2Callback) {
                    return callback.AsgRs2Callback(pre, ast);
                }
                break;

            case NodeType.QMark:
                if (callback.QMarkCallback) {
                    return callback.QMarkCallback(pre, ast);
                }
                break;

            case NodeType.LogOr:
                if (callback.LogOrCallback) {
                    return callback.LogOrCallback(pre, ast);
                }
                break;

            case NodeType.LogAnd:
                if (callback.LogAndCallback) {
                    return callback.LogAndCallback(pre, ast);
                }
                break;

            case NodeType.Or:
                if (callback.OrCallback) {
                    return callback.OrCallback(pre, ast);
                }
                break;

            case NodeType.Xor:
                if (callback.XorCallback) {
                    return callback.XorCallback(pre, ast);
                }
                break;

            case NodeType.And:
                if (callback.AndCallback) {
                    return callback.AndCallback(pre, ast);
                }
                break;

            case NodeType.Eq:
                if (callback.EqCallback) {
                    return callback.EqCallback(pre, ast);
                }
                break;

            case NodeType.Ne:
                if (callback.NeCallback) {
                    return callback.NeCallback(pre, ast);
                }
                break;

            case NodeType.Eqv:
                if (callback.EqvCallback) {
                    return callback.EqvCallback(pre, ast);
                }
                break;

            case NodeType.NEqv:
                if (callback.NEqvCallback) {
                    return callback.NEqvCallback(pre, ast);
                }
                break;

            case NodeType.Lt:
                if (callback.LtCallback) {
                    return callback.LtCallback(pre, ast);
                }
                break;

            case NodeType.Le:
                if (callback.LeCallback) {
                    return callback.LeCallback(pre, ast);
                }
                break;

            case NodeType.Gt:
                if (callback.GtCallback) {
                    return callback.GtCallback(pre, ast);
                }
                break;

            case NodeType.Ge:
                if (callback.GeCallback) {
                    return callback.GeCallback(pre, ast);
                }
                break;

            case NodeType.Add:
                if (callback.AddCallback) {
                    return callback.AddCallback(pre, ast);
                }
                break;

            case NodeType.Sub:
                if (callback.SubCallback) {
                    return callback.SubCallback(pre, ast);
                }
                break;

            case NodeType.Mul:
                if (callback.MulCallback) {
                    return callback.MulCallback(pre, ast);
                }
                break;

            case NodeType.Div:
                if (callback.DivCallback) {
                    return callback.DivCallback(pre, ast);
                }
                break;

            case NodeType.Mod:
                if (callback.ModCallback) {
                    return callback.ModCallback(pre, ast);
                }
                break;

            case NodeType.Lsh:
                if (callback.LshCallback) {
                    return callback.LshCallback(pre, ast);
                }
                break;

            case NodeType.Rsh:
                if (callback.RshCallback) {
                    return callback.RshCallback(pre, ast);
                }
                break;

            case NodeType.Rs2:
                if (callback.Rs2Callback) {
                    return callback.Rs2Callback(pre, ast);
                }
                break;

            case NodeType.Not:
                if (callback.NotCallback) {
                    return callback.NotCallback(pre, ast);
                }
                break;

            case NodeType.LogNot:
                if (callback.LogNotCallback) {
                    return callback.LogNotCallback(pre, ast);
                }
                break;

            case NodeType.IncPre:
                if (callback.IncPreCallback) {
                    return callback.IncPreCallback(pre, ast);
                }
                break;

            case NodeType.DecPre:
                if (callback.DecPreCallback) {
                    return callback.DecPreCallback(pre, ast);
                }
                break;

            case NodeType.IncPost:
                if (callback.IncPostCallback) {
                    return callback.IncPostCallback(pre, ast);
                }
                break;

            case NodeType.DecPost:
                if (callback.DecPostCallback) {
                    return callback.DecPostCallback(pre, ast);
                }
                break;

            case NodeType.TypeAssertion:
                if (callback.TypeAssertionCallback) {
                    return callback.TypeAssertionCallback(pre, ast);
                }
                break;

            case NodeType.FuncDecl:
                if (callback.FuncDeclCallback) {
                    return callback.FuncDeclCallback(pre, <FuncDecl>ast);
                }
                break;

            case NodeType.Member:
                if (callback.MemberCallback) {
                    return callback.MemberCallback(pre, ast);
                }
                break;

            case NodeType.VarDecl:
                if (callback.VarDeclCallback) {
                    return callback.VarDeclCallback(pre, <VarDecl>ast);
                }
                break;

            case NodeType.ArgDecl:
                if (callback.ArgDeclCallback) {
                    return callback.ArgDeclCallback(pre, ast);
                }
                break;

            case NodeType.Return:
                if (callback.ReturnCallback) {
                    return callback.ReturnCallback(pre, ast);
                }
                break;

            case NodeType.Break:
                if (callback.BreakCallback) {
                    return callback.BreakCallback(pre, ast);
                }
                break;

            case NodeType.Continue:
                if (callback.ContinueCallback) {
                    return callback.ContinueCallback(pre, ast);
                }
                break;

            case NodeType.Throw:
                if (callback.ThrowCallback) {
                    return callback.ThrowCallback(pre, ast);
                }
                break;

            case NodeType.For:
                if (callback.ForCallback) {
                    return callback.ForCallback(pre, ast);
                }
                break;

            case NodeType.ForIn:
                if (callback.ForInCallback) {
                    return callback.ForInCallback(pre, ast);
                }
                break;

            case NodeType.If:
                if (callback.IfCallback) {
                    return callback.IfCallback(pre, ast);
                }
                break;

            case NodeType.While:
                if (callback.WhileCallback) {
                    return callback.WhileCallback(pre, ast);
                }
                break;

            case NodeType.DoWhile:
                if (callback.DoWhileCallback) {
                    return callback.DoWhileCallback(pre, ast);
                }
                break;

            case NodeType.Block:
                if (callback.BlockCallback) {
                    return callback.BlockCallback(pre, <Block>ast);
                }
                break;

            case NodeType.Case:
                if (callback.CaseCallback) {
                    return callback.CaseCallback(pre, ast);
                }
                break;

            case NodeType.Switch:
                if (callback.SwitchCallback) {
                    return callback.SwitchCallback(pre, ast);
                }
                break;

            case NodeType.Try:
                if (callback.TryCallback) {
                    return callback.TryCallback(pre, ast);
                }
                break;

            case NodeType.TryCatch:
                if (callback.TryCatchCallback) {
                    return callback.TryCatchCallback(pre, ast);
                }
                break;

            case NodeType.TryFinally:
                if (callback.TryFinallyCallback) {
                    return callback.TryFinallyCallback(pre, ast);
                }
                break;

            case NodeType.Finally:
                if (callback.FinallyCallback) {
                    return callback.FinallyCallback(pre, ast);
                }
                break;

            case NodeType.Catch:
                if (callback.CatchCallback) {
                    return callback.CatchCallback(pre, ast);
                }
                break;

            case NodeType.List:
                if (callback.ListCallback) {
                    return callback.ListCallback(pre, <ASTList>ast);
                }
                break;

            case NodeType.Script:
                if (callback.ScriptCallback) {
                    return callback.ScriptCallback(pre, <Script>ast);
                }
                break;

            case NodeType.Class:
                if (callback.ClassCallback) {
                    return callback.ClassCallback(pre, ast);
                }
                break;

            case NodeType.Interface:
                if (callback.InterfaceCallback) {
                    return callback.InterfaceCallback(pre, <TypeDecl>ast);
                }
                break;

            case NodeType.Module:
                if (callback.ModuleCallback) {
                    return callback.ModuleCallback(pre, <ModuleDecl>ast);
                }
                break;

            case NodeType.Import:
                if (callback.ImportCallback) {
                    return callback.ImportCallback(pre, ast);
                }
                break;

            case NodeType.With:
                if (callback.WithCallback) {
                    return callback.WithCallback(pre, ast);
                }
                break;

            case NodeType.Label:
                if (callback.LabelCallback) {
                    return callback.LabelCallback(pre, ast);
                }
                break;

            case NodeType.LabeledStatement:
                if (callback.LabeledStatementCallback) {
                    return callback.LabeledStatementCallback(pre, ast);
                }
                break;

            case NodeType.EBStart:
                if (callback.EBStartCallback) {
                    return callback.EBStartCallback(pre, ast);
                }
                break;

            case NodeType.GotoEB:
                if (callback.GotoEBCallback) {
                    return callback.GotoEBCallback(pre, ast);
                }
                break;

            case NodeType.EndCode:
                if (callback.EndCodeCallback) {
                    return callback.EndCodeCallback(pre, ast);
                }
                break;

            case NodeType.Error:
                if (callback.ErrorCallback) {
                    return callback.ErrorCallback(pre, ast);
                }
                break;

            case NodeType.Comment:
                if (callback.CommentCallback) {
                    return callback.CommentCallback(pre, ast);
                }
                break;

            case NodeType.Debugger:
                if (callback.DebuggerCallback) {
                    return callback.DebuggerCallback(pre, ast);
                }
                break;

            default:
                throw new Error("please implement new NodeType Walker correctly");
        }

        if (callback.DefaultCallback) {
            return callback.DefaultCallback(pre, ast);
        }

        return true; // Default is to go to children
    }
}