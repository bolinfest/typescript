module "quotedm1" {
    import m4 = module ("m4");
    class v {
        public c: m4.d;
    }
}
module "quotedm2" {
    import m1 = module ("quotedm1");
    var c: m1.v;
}
