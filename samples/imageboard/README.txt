===== TypeScript Sample: Image Board =====

=== Overview ===

This sample implements a complete Node.js application.
Notable features:
- Typed usage of express for server side MVC
- Typed usage of mongodb for server side database
- Typed usage of Node.js 
- Use of TypeScript module syntax  
- Visual Studio project file for working with the project

=== Running ===

Start in the directory containing the README.

Get mongodb running:

<mongoinstalldir>\bin\mongod
<mongoinstalldir>\bin\mongorestore dump

Install node dependencies:

npm install

Compile the app:

tsc app.ts --module Node

Run the app:
node app.js

