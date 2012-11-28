// bug 503: http://typescript.codeplex.com/workitem/503
// both cases should compile

declare module A.B
{
    export class C{ }
}

import ab = A.B;

class D extends ab.C{ }

class E extends A.B.C{ }
