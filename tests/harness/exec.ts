/// <reference path="..\..\harness\exec.ts" />
/// <reference path="..\..\harness\harness.ts" />

describe("We can run 'ping' successfully", function(done) {
    var execResult;
   
    Exec.exec('ping', [ '-n 3 localhost' ], function(r) {
        execResult = r;
        done();
    });
    
    it("Contains the string 'reply from'", function() {
        assert.notEqual(-1, execResult.stdout.match("Pinging"));
    });
});