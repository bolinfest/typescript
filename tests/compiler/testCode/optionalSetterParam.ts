class foo {
    // Shouldn't be allowed (bug 15965)
    public set bar(param?:any) { }
}
