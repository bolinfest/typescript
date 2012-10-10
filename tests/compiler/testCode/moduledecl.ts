module a {
}

module b.a {
}

module c.a.b {
    export import ma = a;
}

module mImport {
    import d = a;
    import e = b.a;
    export import d1 = a;
    export import e1 = b.a;
}

module m0 {
    function f1() {
    }

    function f2(s: string);
    function f2(n: number);
    function f2(ns: any) {
    }

    class c1 {
        public a : ()=>string;
        private b: ()=>number;
        private static s1;
        public static s2;
    }

    interface i1 {
        () : Object;
        [n: number]: c1;
    }

    import m2 = a;
    import m3 = b;
    import m4 = b.a;
    import m5 = c;
    import m6 = c.a;
    import m7 = c.a.b;
    import m8 = c.a.b.ma;
}

module m1 {
    export function f1() {
    }

    export function f2(s: string);
    function f2(n: number);
    export function f2(ns: any) {
    }

    export class c1 {
        public a: () =>string;
        private b: () =>number;
        private static s1;
        public static s2;

        public d() {
            return "Hello";
        }

        public e: { x: number; y: string; };
        constructor (public n, public n2: number, private n3, private n4: string) {
        }

        public f = c.a.b.ma;
    }

    export interface i1 {
        () : Object;
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
        var a = 10;
        export var b: number;
    }

    export module m3 {
        export var c: number;
    }
}

module m {

    export module m25 {
        export module m5 {
            export var c: number;
        }
    }
}

module m13 {
    export module m4 {
        export module m2 {
            export module m3 {
                export var c: number;
            }
        }

        export function f() {
            return 20;
        }
    }
}

declare module m4 {
    export var b;
}

declare module m5 {
    export var c;
}

declare module m43 {
    export var b = 10;
}

declare module m55 {
    export var c = 10;
}

declare module "m3" {
    export var b: number;
}
module mQImport {
    import m3 = module ("m3");
    export import _m3 = module("m3");
}

module exportTests {
    export class C1_public {
        private f2() {
            return 30;
        }

        public f3() {
            return "string";
        }
    }
    class C2_private {
        private f2() {
            return 30;
        }

        public f3() {
            return "string";
        }
    }

    export class C3_public {
        private getC2_private() {
            return new C2_private();
        }
        private setC2_private(arg: C2_private) {
        }
        private get c2() {
            return new C2_private();
        }
        public getC1_public() {
            return new C1_public();
        }
        public setC1_public(arg: C1_public) {
        }
        public get c1() {
            return new C1_public();
        }
    }
}
