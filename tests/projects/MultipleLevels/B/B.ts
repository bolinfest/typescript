import A = module("../A/A");
import AA = module("../A/AA/AA");

export class B
{
    public Create(): IA
    {
        return new A.A();
    }
}

export interface IA
{
    A(): string;
}
