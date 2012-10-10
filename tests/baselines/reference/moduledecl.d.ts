module a {
}
module b.a {
}
module c.a.b {
    export import ma = a;
}
module mImport {
    export import d1 = a;
    export import e1 = b.a;
}
module m0 {
}
module m1 {
    export function f1(): void;
    export function f2(s: string);
    export class c1 {
        public n;
        public n2: number;
        private n3;
        private n4;
        public a: () => string;
        private b;
        static s1;
        static s2;
        public d(): string;
        public e: { x: number; y: string; };
        constructor (n, n2: number, n3, n4: string);
        public f: c.a;
    }
    export interface i1 {
        (): Object;
        [n: number]: c1;
    }
    export import m2 = a;
    export import m3 = b;
    export import m4 = b.a;
    export import m5 = c;
    export import m6 = c.a;
    export import m7 = c.a.b;
    export import m8 = c.a.b.ma;
}
module m {
    export module m2 {
        export var b: number;
    }
    export module m3 {
        export var c: number;
    }
}
module m.m25.m5 {
    export var c: number;
}
module m13.m4 {
    export module m2.m3 {
        export var c: number;
    }
    export function f(): number;
}
module m4 {
    export var b;
}
module m5 {
    export var c;
}
module m43 {
    export var b: number;
}
module m55 {
    export var c: number;
}
module "m3" {
    export var b: number;
}
module mQImport {
    export import _m3 = module ("m3");
}
module exportTests {
    export class C1_public {
        private f2();
        public f3(): string;
    }
    export class C3_public {
        private getC2_private();
        private setC2_private(arg);
        private c2;
        public getC1_public(): C1_public;
        public setC1_public(arg: C1_public): void;
        public c1 : C1_public;
    }
}

