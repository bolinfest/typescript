module a {
}
module b.a {
}
module c.a.b {
    export import ma = a;
}
import d = a;
import e = b.a;
module m0 {
}
module m1 {
    export function f1(): void;
    export function f2(s: string);
    export class c1 {
        public n;
        public n2: number;
        private n3;
        private n4: string;
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

