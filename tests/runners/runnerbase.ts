/// <reference path="../../src/compiler/io.ts" />
/// <reference path="../../src/harness/harness.ts" />

class RunnerBase
{
    public enumerateFiles(folder: string, recursive?: bool = false): string[]
    {
        return IO.dir(Harness.userSpecifiedroot + folder, /\.ts$/);
    }

    public runTests(): void
    {
        throw new Error('run method not implemented');
    }
}