interface I {
    w: {
        z: I;
        (): bool;
        [s: string]: { x: any; y: any; };
        [n: number]: { x: any; y: any; };
    };
    x: bool;
    y: (s: string) => bool;
    z: I; 
}