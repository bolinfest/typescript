// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

// Allows for executing a program with command-line arguments and reading the result
interface IExec {
    exec: (filename: string, cmdLineArgs: string[], handleResult: (ExecResult) => void) => void;
}

declare var require;

class ExecResult {
    public stdout = "";
    public stderr = "";
    public exitCode: number;
}

class WindowsScriptHostExec implements IExec {
    public exec(filename: string, cmdLineArgs: string[], handleResult: (ExecResult) => void) : void {
        var result = new ExecResult();
        var shell = new ActiveXObject('WScript.Shell');
        try {
            var process = shell.Exec(filename + ' ' + cmdLineArgs.join(' '));
        } catch(e) {
            result.stderr = e.message;
            result.exitCode = 1
            handleResult(result);
            return;
        }
        // Wait for it to finish running
        while (process.Status != 0) { /* todo: sleep? */ }

        
        result.exitCode = process.ExitCode;
        if(!process.StdOut.AtEndOfStream) result.stdout = process.StdOut.ReadAll();
        if(!process.StdErr.AtEndOfStream) result.stderr = process.StdErr.ReadAll();

        handleResult(result);
    }
}

class NodeExec implements IExec {
    public exec(filename: string, cmdLineArgs: string[], handleResult: (ExecResult) => void) : void {
        var nodeExec = require('child_process').exec;

        var result = new ExecResult();
        result.exitCode = null;
        var cmdLine = filename + ' ' + cmdLineArgs.join(' ');
        var process = nodeExec(cmdLine, function(error, stdout, stderr) {
            result.stdout = stdout;
            result.stderr = stderr;
            result.exitCode = error ? error.code : 0;
            handleResult(result);
        });
    }
}

var Exec: IExec = function() : IExec {
    var global = <any>Function("return this;").call(null);
    if(typeof global.ActiveXObject !== "undefined") {
        return new WindowsScriptHostExec();
    } else {
        return new NodeExec();
    }
}();