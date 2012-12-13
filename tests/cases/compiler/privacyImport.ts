export module m1 {
    export module m1_M1_public {
        function f1() {
        }
    }

    module m1_M2_private {
    }

    declare export module "m1_M3_public" {
        export function f1();
    }

    declare module "m1_M4_private" {
        export function f1();
    }

    import m1_im1_private = m1_M1_public;
    import m1_im2_private = m1_M2_private;
    import m1_im3_private = module("m1_M3_public");
    import m1_im4_private = module("m1_M4_private");

    export import m1_im1_public = m1_M1_public;
    export import m1_im2_public = m1_M2_private;
    export import m1_im3_public = module("m1_M3_public");
    export import m1_im4_public = module("m1_M4_private");
}

module m2 {
    export module m2_M1_public {
        function f1() {
        }
    }

    module m2_M2_private {
    }

    declare export module "m2_M3_public" {
        export function f1();
    }

    declare module "m2_M4_private" {
        export function f1();
    }

    import m2_im1_private = m2_M1_public;
    import m2_im2_private = m2_M2_private;
    import m2_im3_private = module("m2_M3_public");
    import m2_im4_private = module("m2_M4_private");

    export import m2_im1_public = m2_M1_public;
    export import m2_im2_public = m2_M2_private;
    export import m2_im3_public = module("m2_M3_public");
    export import m2_im4_public = module("m2_M4_private");
}

export module glo_M1_public {
    function f1() {
    }
}

module glo_M2_private {
}

declare export module "glo_M3_public" {
    export function f1();
}

declare module "glo_M4_private" {
    export function f1();
}

import glo_im1_private = glo_M1_public;
import glo_iglo_private = glo_M2_private;
import glo_im3_private = module("glo_M3_public");
import glo_im4_private = module("glo_M4_private");

export import glo_im1_public = glo_M1_public;
export import glo_iglo_public = glo_M2_private;
export import glo_im3_public = module("glo_M3_public");
export import glo_im4_public = module("glo_M4_private");