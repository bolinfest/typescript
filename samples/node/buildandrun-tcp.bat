@echo off
CALL ..\..\bin\tsc --module node TcpServer.ts
node.exe TcpServer.js
