export module m1 {
    export class C1_public {
        private f1() {
        }
    }


    class C2_private {
    }

    export interface C3_public {
        (c1: C1_public);
        (c1: C2_private);
        (): C1_public;
        (c2: number): C2_private;

        new (c1: C1_public);
        new (c1: C2_private);
        new (): C1_public;
        new (c2: number): C2_private;

        [c: number]: C1_public;
        [c: string]: C2_private;

        x: C1_public;
        y: C2_private;

        a?: C1_public;
        b?: C2_private;

        f1(a1: C1_public);
        f2(a1: C2_private);
        f3(): C1_public;
        f4(): C2_private;

    }

    interface C4_private {
        (c1: C1_public);
        (c1: C2_private);
        (): C1_public;
        (c2: number): C2_private;

        new (c1: C1_public);
        new (c1: C2_private);
        new (): C1_public;
        new (c2: number): C2_private;

        [c: number]: C1_public;
        [c: string]: C2_private;

        x: C1_public;
        y: C2_private;

        a?: C1_public;
        b?: C2_private;

        f1(a1: C1_public);
        f2(a1: C2_private);
        f3(): C1_public;
        f4(): C2_private;

    }
}


module m2 {
    export class C1_public {
        private f1() {
        }
    }


    class C2_private {
    }

    export interface C3_public {
        (c1: C1_public);
        (c1: C2_private);
        (): C1_public;
        (c2: number): C2_private;

        new (c1: C1_public);
        new (c1: C2_private);
        new (): C1_public;
        new (c2: number): C2_private;

        [c: number]: C1_public;
        [c: string]: C2_private;

        x: C1_public;
        y: C2_private;

        a?: C1_public;
        b?: C2_private;

        f1(a1: C1_public);
        f2(a1: C2_private);
        f3(): C1_public;
        f4(): C2_private;

    }

    interface C4_private {
        (c1: C1_public);
        (c1: C2_private);
        (): C1_public;
        (c2: number): C2_private;

        new (c1: C1_public);
        new (c1: C2_private);
        new (): C1_public;
        new (c2: number): C2_private;

        [c: number]: C1_public;
        [c: string]: C2_private;

        x: C1_public;
        y: C2_private;

        a?: C1_public;
        b?: C2_private;

        f1(a1: C1_public);
        f2(a1: C2_private);
        f3(): C1_public;
        f4(): C2_private;

    }
}

export class C5_public {
    private f1() {
    }
}


class C6_private {
}

export interface C7_public {
    (c1: C5_public);
    (c1: C6_private);
    (): C5_public;
    (c2: number): C6_private;

    new (c1: C5_public);
    new (c1: C6_private);
    new (): C5_public;
    new (c2: number): C6_private;

    [c: number]: C5_public;
    [c: string]: C6_private;

    x: C5_public;
    y: C6_private;

    a?: C5_public;
    b?: C6_private;

    f1(a1: C5_public);
    f2(a1: C6_private);
    f3(): C5_public;
    f4(): C6_private;

}

interface C8_private {
    (c1: C5_public);
    (c1: C6_private);
    (): C5_public;
    (c2: number): C6_private;

    new (c1: C5_public);
    new (c1: C6_private);
    new (): C5_public;
    new (c2: number): C6_private;

    [c: number]: C5_public;
    [c: string]: C6_private;

    x: C5_public;
    y: C6_private;

    a?: C5_public;
    b?: C6_private;

    f1(a1: C5_public);
    f2(a1: C6_private);
    f3(): C5_public;
    f4(): C6_private;

}