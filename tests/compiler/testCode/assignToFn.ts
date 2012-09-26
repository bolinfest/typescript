module M {
    interface I {
	f(n:number):bool;
    }

    var x:I={ f:function(n) { return true; } };

    x.f="hello";
}
