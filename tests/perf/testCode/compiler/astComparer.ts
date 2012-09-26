///<reference path='typescript.ts' />

module Tools {

    export class ASTEdit {

        constructor (public ast1: AST, public ast2: AST) { }

    }

    //
    // Simple tree comparer:
    //  Given two syntax trees, detects if all the edit(s) happened inside a single function.
    //
    // Algorithm:
    //  Given 2 nodes of the AST, they are 
    // 
    //
    export class ASTComparer {

        constructor (public script1: AST, public script2: AST) { }

        public compareTopLevelTrees(oldScript: Script, newScript: Script): ASTEdit[]{
            return [];
        }

        //public compareScripts(oldScript:Script, newScript:Script):UpdateUnitResult {
        //    return compareAstNodes(null, oldScript, null, newScript, new AstPath());
        //}

        //public compareAstNodes(parentOldNode:AST, oldNode:AST, parentNewNode:AST, newNode:AST, path:AstPath):UpdateUnitResult {
        //    if (oldNode === null && newNode === null) {
        //        return UpdateUnitResult.NoEdits;
        //    }
        //    else if (oldNode === null && newNode !== null) {
        //        return UpdateUnitResult.Unknown;
        //    }
        //    else if (oldNode !== null && newNode === null) {
        //        return UpdateUnitResult.Unknown;
        //    }

        //    if (!astNodesAreEqual(oldNode, newNode))
        //        return UpdateUnitResult.Unknown;

        //    //if(path.is
        //    // If we are at a top level function
        //    var ctx1 = new BaseWalkContext();
        //    oldNode.walk(null, null, parentOldNode, ctx1);

        //    //return compareAstNodes(oldNode, newNode);
        //    return null;
        //}

        //public astNodesAreEqual(node1:AST, node2:AST):bool {
        //    if (node1 === null && node2 === null)
        //        return true;

        //    if (node1 !== null && node2 === null)
        //        return false;

        //    if (node1 === null && node2 !== null)
        //        return false;

        //    if (node1.nodeType !== node2.nodeType)
        //        return false;

        //    switch(node1.nodeType) {
        //        case NodeType.Module:
        //            return (<ModuleDecl>node1).name == (<ModuleDecl>node2).name &&
        //                astNodesAreEqual((<ModuleDecl>node1).alias, (<ModuleDecl>node2).name);

        //        case NodeType.Class:
        //        case NodeType.Interface:
        //            return (<TypeDecl>node1).name == (<TypeDecl>node2).name;
        //    }
        //    return true;
        //}

    }

}
