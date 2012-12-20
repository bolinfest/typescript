declare module "quotedm1" {
    import m4 = module("m4");
    export class v {
        public c: m4.d;
    }
}

declare module "quotedm2" {
    import m1 = module("quotedm1");
    export var c: m1.v;
}



