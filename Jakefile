// This file contains the build logic for the public repo

var fs = require("fs");
var path = require("path");

// Variables
var compilerDirectory = "src/compiler/";
var servicesDirectory = "src/services/";
var harnessDirectory = "src/harness/";
var runnersDirectory = "tests/runners/";
var libraryDirectory = "typings/";
var builtDirectory = "built/";
var builtLocalDirectory = "built/local/";
var builtTestDirectory = "built/localtest/";
var LKGDirectory = "bin/";
var copyright = "CopyrightNotice.txt";
var thirdParty = "ThirdPartyNoticeText.txt";
var compilerSources = [
	"diagnostics.ts",
	"flags.ts",
	"nodeTypes.ts",
	"hashTable.ts",
	"printContext.ts",
	"scopeWalk.ts",
	"typeCollection.ts",
	"scopeAssignment.ts",
	"binder.ts",
	"tokens.ts",
	"ast.ts",
	"astWalker.ts",
	"astWalkerCallback.ts",
	"astPath.ts",
	"astLogger.ts",
	"scanner.ts",
	"parser.ts",
	"symbolScope.ts",
	"types.ts",
	"signatures.ts",
	"symbols.ts",
	"errorReporter.ts",
	"typeFlow.ts",
	"typeChecker.ts",
	"base64.ts",
	"sourceMapping.ts",
	"emitter.ts",
	"declarationEmitter.ts",
	"precompile.ts",
	"incrementalParser.ts",
	"pathUtils.ts",
	"referenceResolution.ts",
	"typescript.ts"
].map(function (f) {
	return path.join(compilerDirectory, f);
});

var tscSources = [
	"io.ts",
	"optionsParser.ts",
	"tsc.ts"
].map(function (f) {
	return path.join(compilerDirectory, f);
});

var servicesSources = [
	"es5compat.ts",
	"formatting/formatting.ts",
	"formatting/interop.ts",
	"formatting/formattingContext.ts",
	"formatting/formattingManager.ts",
	"formatting/formattingRequestKind.ts",
	"formatting/formattingTask.ts",
	"formatting/iformatter.ts",
	"formatting/ilineIndentationResolver.ts",
	"formatting/indentationBag.ts",
	"formatting/indentationEdgeFinder.ts",
	"formatting/indentationEditInfo.ts",
	"formatting/indentationInfo.ts",
	"formatting/indenter.ts",
	"formatting/matchingBlockFinderTask.ts",
	"formatting/parseNode.ts",
	"formatting/parseNodeExtensions.ts",
	"formatting/parseTree.ts",
	"formatting/rule.ts",
	"formatting/ruleAction.ts",
	"formatting/ruleDescriptor.ts",
	"formatting/ruleFlag.ts",
	"formatting/ruleOperation.ts",
	"formatting/ruleOperationContext.ts",
	"formatting/rules.ts",
	"formatting/rulesMap.ts",
	"formatting/rulesProvider.ts",
	"formatting/smartIndentManager.ts",
	"formatting/smartIndentTask.ts",
	"formatting/statementFinderTask.ts",
	"formatting/textEditInfo.ts",
	"formatting/tokenRange.ts",
	"formatting/tokenSpan.ts",
	"classifier.ts",
	"coreServices.ts",
	"scriptSyntaxAST.ts",
	"compilerState.ts",
	"braceMatchingManager.ts",
	"symbolSet.ts",
	"symbolTree.ts",
	"overridesCollector.ts",
	"languageService.ts",
	"shims.ts",
	"typescriptServices.ts"
].map(function (f) {
	return path.join(servicesDirectory, f);
});

var harnessSources = [
	path.join(compilerDirectory, "io.ts"),
	path.join(compilerDirectory, "optionsParser.ts"),

	path.join(harnessDirectory, "exec.ts"),
	path.join(harnessDirectory, "diff.ts"),
	path.join(harnessDirectory, "harness.ts"),
	path.join(harnessDirectory, "baselining.ts"),
	path.join(harnessDirectory, "fourslash.ts"),
	path.join(harnessDirectory, "dumpAST-baselining.ts"),
	path.join(harnessDirectory, "external/json2.ts"),
	path.join(harnessDirectory, "runner.ts"),

	path.join(runnersDirectory, "runnerbase.ts"),
	path.join(runnersDirectory, "flags/flagsrunner.ts"),
	path.join(runnersDirectory, "compiler/runner.ts"),
	path.join(runnersDirectory, "compiler/sourcemapRunner.ts"),
	path.join(runnersDirectory, "fourslash/fsrunner.ts"),
	path.join(runnersDirectory, "projects/runner.ts"),
	path.join(runnersDirectory, "unittest/unittestrunner.ts")
];

var librarySources = [
	"lib.d.ts",
	"jquery.d.ts",
	"winjs.d.ts",
	"winrt.d.ts"
].map(function (f) {
	return path.join(libraryDirectory, f);
});

// Prepends the contents of prefixFile to destinationFile
function prependFile(prefixFile, destinationFile) {
	if (!fs.existsSync(prefixFile)) {
		fail(prefixFile + " does not exist!");
	}
	if (!fs.existsSync(destinationFile)) {
		fail(destinationFile + " failed to be created!");
	}
	var temp = "temptemp";
	jake.cpR(prefixFile, temp);
	fs.appendFileSync(temp, fs.readFileSync(destinationFile));
	fs.renameSync(temp, destinationFile);
}

/* Compiles a file from a list of sources
	* @param outFile: the target file name
	* @param sources: an array of the names of the source files
	* @param prereqs: prerequisite tasks to compiling the file
	* @param prefixes: a list of files to prepend to the target file
	* @param useBuiltCompiler: true to use the built compiler, false to use the LKG
	*/
function compileFile(outFile, sources, prereqs, prefixes, useBuiltCompiler) {
	file(outFile, prereqs, function() {
		var dir = useBuiltCompiler ? builtLocalDirectory : LKGDirectory;
		var cmd = (process.env.TYPESCRIPT_HOST || "Node") + " " + dir + "tsc.js " + sources.join(" ") + " -out " + outFile;
		console.log(cmd);
		jake.exec([cmd], function() {
			if (prefixes) {
				for (var i in prefixes) {
					prependFile(prefixes[i], outFile);
				}
			}
			complete();
		},
		{printStdout: true, printStderror: true});
	}, {async: true});
}

// Prerequisite task for built directory and library typings
directory(builtLocalDirectory);

task("libraryDecls", [builtLocalDirectory].concat(librarySources), function() {
	for (var i in librarySources) {
		jake.cpR(librarySources[i], builtLocalDirectory);
	}
});	

var typescriptFile = path.join(builtLocalDirectory, "typescript.js");
compileFile(typescriptFile, compilerSources, [builtLocalDirectory, copyright].concat(compilerSources), [copyright]);

var tscFile = path.join(builtLocalDirectory, "tsc.js");
compileFile(tscFile, tscSources, [typescriptFile].concat(tscSources), [typescriptFile]);

var serviceFile = path.join(builtLocalDirectory, "typescriptServices.js");
compileFile(serviceFile, servicesSources, [typescriptFile, thirdParty].concat(servicesSources), [typescriptFile, thirdParty]);

// Local target to build the compiler and services
desc("Builds the full compiler and services");
task("local", ["libraryDecls", typescriptFile, tscFile, serviceFile]);

// Cleans the built directory
desc("Cleans the compiler output, declare files, and tests");
task("clean", function() {
	jake.rmRf(builtDirectory);
});
	
// Makes a new LKG. This target does not build anything, but errors if not all the outputs are present in the built/local directory
desc("Makes a new LKG out of the built js files");
task("LKG", [builtLocalDirectory, "libraryDecls"], function() {
	var expectedFiles = [typescriptFile, tscFile, serviceFile];
	var missingFiles = expectedFiles.filter(function (f) {
		return !fs.existsSync(f);
	});
	if (missingFiles.length > 0) {
		fail("Cannot replace the LKG unless all built targets are present in directory " + builtLocalDirectory +
			    ". The following files are missing:\n" + missingFiles.join("\n"));
	}
	// Copy all the targets into the LKG directory
	jake.mkdirP(LKGDirectory);
	for (var i in librarySources) {
		jake.cpR(librarySources[i].replace(libraryDirectory, builtLocalDirectory), LKGDirectory);
	}
	for (i in expectedFiles) {
		jake.cpR(expectedFiles[i], LKGDirectory);
	}
});

// Test directory
directory(builtTestDirectory);

// Task to build the tests infrastructure using the built compiler
var run = path.join(builtTestDirectory, "run.js");
compileFile(run, harnessSources, [builtTestDirectory, tscFile, "libraryDecls"].concat(harnessSources), [], true);

desc("Builds the test infrastructure using the built compiler");
task("tests", [run, serviceFile, "libraryDecls"], function() {
	// Copy the language service over to the test directory
	jake.cpR(serviceFile, builtTestDirectory);
	jake.cpR(path.join(libraryDirectory, "lib.d.ts"), builtTestDirectory);
});

desc("Runs the tests using the built run.js file. Syntax is jake :runtests[host, testFile]. Both parameters are optional.");
task("runtests", ["tests", builtTestDirectory], function(host, test) {
	host = host || process.env.TYPESCRIPT_HOST || "Node";
	test = test || "";
	var cmd = host + " " + run + " " + test;
	console.log(cmd);
	var ex = jake.createExec([cmd]);
	// Add listeners for output and error
	ex.addListener("stdout", function(output) {
		process.stdout.write(output);
	});
	ex.addListener("stderr", function(error) {
		process.stderr.write(error);
	});
	ex.addListener("cmdEnd", function() {
		complete();
	});
	ex.run();
}, {async: true});

// Makes the test results the new baseline
desc("Makes the most recent test results the new baseline, overwriting the old baseline");
var localBaseline = "tests/baselines/local/";
var refBaseline = "tests/baselines/reference/";
task("baseline-accept", function() {
	jake.rmRf(refBaseline);
	fs.renameSync(localBaseline, refBaseline);
	jake.mkdirP(localBaseline);
});