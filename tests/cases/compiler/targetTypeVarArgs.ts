export class Stmt {
}

export class Blk {
  public stmts:Stmt[];
  public emptyStmt():Stmt { return new Stmt(); }
}

var b = new Blk();
var a = [b.emptyStmt()];

b.stmts.concat(a); // should not be an error
b.stmts.concat([b.emptyStmt()]); // should not be an error

