class foo {
    // Bug 15965: Set accessor doesn't require a required parameter
    public set bar(param?:any) { }
}
