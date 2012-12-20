// @Filename: importInsideModule_file1.ts
export var x = 1;

// @Filename: importInsideModule_file2.ts
export module myModule {
    import foo = module("importInsideModule_file1");
    var a = foo.x;
}