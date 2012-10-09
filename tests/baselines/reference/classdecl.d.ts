class a {
    constructor (n: number);
    constructor (s: string);
    public pgF(): void;
    public pv;
    public d : number;
    static p2 : { x: number; y: number; };
    static d2();
    static p3;
    private pv3;
    private foo(n);
    private foo(s);
}
class b extends a {
}
module m1 {
    export class b {
    }
    export interface ib {
    }
}
module m2.m3 {
    export class c extends b {
    }
    export class ib2 implements m1.ib {
    }
}
class c extends m1.b {
}
class ib2 implements m1.ib {
}
class aAmbient {
    constructor (n: number);
    constructor (s: string);
    public pgF(): void;
    public pv;
    public d: number;
    static p2: { x: number; y: number; };
    static d2();
    static p3;
    private pv3;
    private foo(s);
}

