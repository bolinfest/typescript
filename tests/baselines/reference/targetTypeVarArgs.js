this.Stmt = (function () {
    function Stmt() { }
    return Stmt;
})();
this.Blk = (function () {
    function Blk() { }
    Blk.prototype.emptyStmt = function () {
        return new Stmt();
    };
    return Blk;
})();
var b = new this.Blk();
var a = [
    b.emptyStmt()
];
b.stmts.concat(a);
b.stmts.concat([
    b.emptyStmt()
]);