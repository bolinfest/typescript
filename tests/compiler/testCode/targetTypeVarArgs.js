define(["require", "exports"], function(require, exports) {
    var Stmt = (function () {
        function Stmt() { }
        return Stmt;
    })();
    exports.Stmt = Stmt;
    
    var Blk = (function () {
        function Blk() { }
        Blk.prototype.emptyStmt = function () {
            return new Stmt();
        };
        return Blk;
    })();
    exports.Blk = Blk;
    
    var b = new Blk();
    var a = [        b.emptyStmt()
];
    b.stmts.concat(a);
    b.stmts.concat([        b.emptyStmt()
]);
})
