var V;
function F(): void;
class C {
    constructor ();
    public pV;
    private rV;
    public pF(): void;
    private rF(): void;
    public get pgF();
    public set psF(param: any);
    private get rgF();
    private set rsF(param: any);
    static tV;
    static tF(): void;
    static set tsF(param: any);
    static get tgF();
}
interface I {
    ();
    (): number;
    (p);
    (p1: string);
    (p2?: string);
    (...p3: any[]);
    (p4: string, p5?: string);
    (p6: string, ...p7: any[]);
    new();
    new(): number;
    new(p: string);
    new(p2?: string);
    new(...p3: any[]);
    new(p4: string, p5?: string);
    new(p6: string, ...p7: any[]);
    [p];
    [p1: string];
    [p2: string, p3: number];
    p;
    p1?;
    p2?: string;
    p3();
    p4? ();
    p5? (): void;
    p6(pa1): void;
    p7(pa1, pa2): void;
    p7? (pa1, pa2): void;
}
module M {
    export var eV;
    export function eF(): void;
    export class eC {
        constructor ();
        public pV;
        private rV;
        public pF(): void;
        private rF(): void;
        public get pgF();
        public set psF(param: any);
        private get rgF();
        private set rsF(param: any);
        static tV;
        static tF(): void;
        static set tsF(param: any);
        static get tgF();
    }
    export interface eI {
        ();
        (): number;
        (p);
        (p1: string);
        (p2?: string);
        (...p3: any[]);
        (p4: string, p5?: string);
        (p6: string, ...p7: any[]);
        new();
        new(): number;
        new(p: string);
        new(p2?: string);
        new(...p3: any[]);
        new(p4: string, p5?: string);
        new(p6: string, ...p7: any[]);
        [p];
        [p1: string];
        [p2: string, p3: number];
        p;
        p1?;
        p2?: string;
        p3();
        p4? ();
        p5? (): void;
        p6(pa1): void;
        p7(pa1, pa2): void;
        p7? (pa1, pa2): void;
    }
    export module eM {
        export var eV;
        export function eF(): void;
        export class eC {
        }
        export interface eI {
        }
        export module eM {
        }
        export var eaV;
        export class eaC {
        }
        export module eaM {
        }
    }
    export var eaV;
    export class eaC {
        constructor ();
    }
}
export module eaM {
    export var V;
    export class C {
    }
    export var eV;
    export class eC {
    }
    export interface eI {
    }
    export module eM {
    }
}

