// bug 535531: duplicate identifier error reported for "import" declarations in separate files

module A
{

    declare class MyRoot { }

    export module B
    {
        declare class MyClass{ }
    }
}