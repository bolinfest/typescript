function run() {
    var scanner = new TypeScript.Scanner();
    var lines = [
        "var x= /* \r\n", 
        "*/ 10; \r\n", 
        "/* comment\r\n", 
        "comment\r\n", 
        "*/\r\n"
    ];
    var lexState = TypeScript.LexState.Start;
    var result = "";
    for(var i = 0; i < lines.length; i++) {
        var toks = scanner.scanLine(lines[i], lexState);
        for(var j = 0; j < toks.length; j++) {
            result += (toks[j].toString());
        }
        lexState = scanner.getLexState();
    }
    return result;
}
run();