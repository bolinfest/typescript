@echo off
CALL ..\..\bin\tsc --module node HttpServer.ts
node.exe HttpServer.js
