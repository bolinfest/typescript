module Test {
    class A {
        one: string;
        two: bool;
        constructor (t: string) {
            this.one = t;
            this.two = false;
        }
    }
    export class B {
        private member: A[];

        constructor () {
            this.member = [];
        }
    }
}
