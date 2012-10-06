module m1 {
    export module m2 {

        export function f1(c1: C1) {
        }
        export function f2(c2: C2) {
        }

        export class C2 {
            public get p1(arg) {
                return new C1();
            }

            public set p1(arg1: C1) {
            }
        }
    }

    export function f2(arg1: { x?: C1, y: number }) {
    }

    export function f3(): {
        (a: number) : C1;
    } {
        return null;
    }

    export function f4(arg1: 
    {
    [number]: C1;
    }) {
    }


    export function f5(arg2: {
        new (arg1: C1) : C1
    }) {
    }
    module m3 {
        function f2(f1: C1) {
        }
    }

    class C1 {
    }

    interface i {
        x: number;
    }

    export class C5 implements i {
        public x: number;
    }

    export var v2: C1[];
}

class C2 {
}

module m2 {
    export module m3 {

        
        module m4 {
            class C {
            }
            module m5 {
                
                export module m6 {
                    function f1() {
                        return new C();
                    }
                }
            }
        }

    }
}