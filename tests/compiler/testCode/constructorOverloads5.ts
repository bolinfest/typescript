 interface IArguments {}

 declare module M {
    export function RegExp(pattern: string): RegExp;
    export function RegExp(pattern: string, flags: string): RegExp;
    export class RegExp {
        constructor(pattern: string);
        constructor(pattern: string, flags: string);
        exec(string: string): string[];
        test(string: string): bool;
        source: string;
        global: bool;
        ignoreCase: bool;
        multiline: bool;
        lastIndex: bool;
    }
}
