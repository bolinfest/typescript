BIN=$(BASE)bin
BUILT=$(BASE)built
BUILT_LOCAL=$(BUILT)\local
BUILT_LOCALTEST=$(BUILT)\localtest

HOST=$(TYPESCRIPT_HOST)

#compiler source location
CSRC=$(BASE)src\compiler

#compiler services source location
SSRC=$(BASE)src\services

#library source location
LSRC=$(BASE)typings

#test source location
TSRC=$(BASE)test

# harness source location
HSRC=$(BASE)src\harness

STRC_LOCAL=$(HOST) $(BUILT_LOCAL)\tsc.js -cflowu 
STRC_LKG=$(HOST) $(BIN)\tsc.js -cflowu 

COMPILER_SOURCES_BASE= \
  $(CSRC)\diagnostics.ts \
  $(CSRC)\flags.ts \
  $(CSRC)\nodeTypes.ts \
  $(CSRC)\hashTable.ts \
  $(CSRC)\printContext.ts \
  $(CSRC)\scopeWalk.ts \
  $(CSRC)\typeCollection.ts \
  $(CSRC)\scopeAssignment.ts \
  $(CSRC)\binder.ts \
  $(CSRC)\tokens.ts \
  $(CSRC)\ast.ts \
  $(CSRC)\astWalker.ts \
  $(CSRC)\astWalkerCallback.ts \
  $(CSRC)\astPath.ts \
  $(CSRC)\astLogger.ts \
  $(CSRC)\scanner.ts \
  $(CSRC)\parser.ts \
  $(CSRC)\symbolScope.ts \
  $(CSRC)\types.ts \
  $(CSRC)\signatures.ts \
  $(CSRC)\symbols.ts \
  $(CSRC)\errorReporter.ts \
  $(CSRC)\typeFlow.ts \
  $(CSRC)\typeChecker.ts \
  $(CSRC)\base64.ts \
  $(CSRC)\sourceMapping.ts \
  $(CSRC)\emitter.ts \
  $(CSRC)\declarationEmitter.ts \
  $(CSRC)\precompile.ts \
  $(CSRC)\incrementalParser.ts \
  $(CSRC)\pathUtils.ts \
  $(CSRC)\referenceResolution.ts \
  $(CSRC)\typescript.ts

COMPILER_SOURCES=$(COMPILER_SOURCES_BASE)
FRONTEND_SOURCES=$(COMPILER_SOURCES) $(CSRC)\io.ts $(CSRC)\optionsParser.ts $(CSRC)\tsc.ts 

SERVICES_SOURCES_BASE= \
  $(SSRC)\es5compat.ts \
  $(SSRC)\formatting\formatting.ts \
  $(SSRC)\formatting\interop.ts \
  $(SSRC)\formatting\formattingContext.ts \
  $(SSRC)\formatting\formattingManager.ts \
  $(SSRC)\formatting\formattingRequestKind.ts \
  $(SSRC)\formatting\formattingTask.ts \
  $(SSRC)\formatting\iformatter.ts \
  $(SSRC)\formatting\ilineIndentationResolver.ts \
  $(SSRC)\formatting\indentationBag.ts \
  $(SSRC)\formatting\indentationEdgeFinder.ts \
  $(SSRC)\formatting\indentationEditInfo.ts \
  $(SSRC)\formatting\indentationInfo.ts \
  $(SSRC)\formatting\indenter.ts \
  $(SSRC)\formatting\matchingBlockFinderTask.ts \
  $(SSRC)\formatting\parseNode.ts \
  $(SSRC)\formatting\parseNodeExtensions.ts \
  $(SSRC)\formatting\parseTree.ts \
  $(SSRC)\formatting\rule.ts \
  $(SSRC)\formatting\ruleAction.ts \
  $(SSRC)\formatting\ruleDescriptor.ts \
  $(SSRC)\formatting\ruleFlag.ts \
  $(SSRC)\formatting\ruleOperation.ts \
  $(SSRC)\formatting\ruleOperationContext.ts \
  $(SSRC)\formatting\rules.ts \
  $(SSRC)\formatting\rulesMap.ts \
  $(SSRC)\formatting\rulesProvider.ts \
  $(SSRC)\formatting\smartIndentManager.ts \
  $(SSRC)\formatting\smartIndentTask.ts \
  $(SSRC)\formatting\statementFinderTask.ts \
  $(SSRC)\formatting\textEditInfo.ts \
  $(SSRC)\formatting\tokenRange.ts \
  $(SSRC)\formatting\tokenSpan.ts \
  $(SSRC)\classifier.ts \
  $(SSRC)\coreServices.ts \
  $(SSRC)\scriptSyntaxAST.ts \
  $(SSRC)\compilerState.ts \
  $(SSRC)\braceMatchingManager.ts \
  $(SSRC)\symbolSet.ts \
  $(SSRC)\symbolTree.ts \
  $(SSRC)\overridesCollector.ts \
  $(SSRC)\languageService.ts \
  $(SSRC)\shims.ts \
  $(SSRC)\typescriptServices.ts

SERVICES_SOURCES= \
  $(COMPILER_SOURCES_BASE) \
  $(SERVICES_SOURCES_BASE)

prebuild-local:
	if not exist $(BUILT) mkdir $(BUILT)
	if not exist $(BUILT_LOCAL) mkdir $(BUILT_LOCAL)
	if not exist $(BUILT_LOCALTEST) mkdir $(BUILT_LOCALTEST)
	copy /Y $(LSRC)\lib.d.ts $(BUILT_LOCAL)\lib.d.ts
	copy /Y $(LSRC)\jquery.d.ts $(BUILT_LOCAL)\jquery.d.ts
	copy /Y $(LSRC)\winjs.d.ts $(BUILT_LOCAL)\winjs.d.ts
	copy /Y $(LSRC)\winrt.d.ts $(BUILT_LOCAL)\winrt.d.ts

$(BUILT_LOCAL)\typescript.js: $(COMPILER_SOURCES)
	$(STRC_LKG) $(COMPILER_SOURCES) -declaration -out $@
        copy CopyrightNotice.txt+$@ $(BUILT_LOCAL)\temp.js /b
        copy $(BUILT_LOCAL)\temp.js $@ 
        del $(BUILT_LOCAL)\temp.js
        copy CopyrightNotice.txt+$(BUILT_LOCAL)\typescript.d.ts $(BUILT_LOCAL)\temp.d.ts /b
        copy $(BUILT_LOCAL)\temp.d.ts $(BUILT_LOCAL)\typescript.d.ts
        del $(BUILT_LOCAL)\temp.d.ts

$(BUILT_LOCAL)\tsc.js: $(FRONTEND_SOURCES) 
	$(STRC_LKG) $(FRONTEND_SOURCES) -declaration -out $@
        copy CopyrightNotice.txt+$@ $(BUILT_LOCAL)\temp.js /b
        copy $(BUILT_LOCAL)\temp.js $@ 
        del $(BUILT_LOCAL)\temp.js
        copy CopyrightNotice.txt+$(BUILT_LOCAL)\tsc.d.ts $(BUILT_LOCAL)\temp.d.ts /b
        copy $(BUILT_LOCAL)\temp.d.ts $(BUILT_LOCAL)\tsc.d.ts
        del $(BUILT_LOCAL)\temp.d.ts

$(BUILT_LOCAL)\typescriptServices.js: $(SERVICES_SOURCES)
	$(STRC_LKG) $(SERVICES_SOURCES) -declaration -out $@
        copy CopyrightNotice.txt+ThirdPartyNoticeText.txt+$@ $(BUILT_LOCAL)\temp.js /b
        copy $(BUILT_LOCAL)\temp.js $@ 
        del $(BUILT_LOCAL)\temp.js
        copy CopyrightNotice.txt+$(BUILT_LOCAL)\typescriptServices.d.ts $(BUILT_LOCAL)\temp.d.ts /b
        copy $(BUILT_LOCAL)\temp.d.ts $(BUILT_LOCAL)\typescriptServices.d.ts
        del $(BUILT_LOCAL)\temp.d.ts

local: prebuild-local $(BUILT_LOCAL)\typescript.js $(BUILT_LOCAL)\tsc.js $(BUILT_LOCAL)\typescriptServices.js

compiler: local

COMPILER_TESTS=--compiler
LS_TESTS=--ls
SERVICES_TESTS=--services
HARNESS_TESTS=--harness

unit-tests-dependencies:  $(FRONTEND_SOURCES) $(SERVICES_SOURCES) $(BUILT_LOCAL)\typescriptServices.js $(HSRC)\harness.ts $(HSRC)\diff.ts $(HSRC)\exec.ts $(HSRC)\baselining.ts $(HSRC)\dumpAST-baselining.ts $(HSRC)\external\json2.ts $(HSRC)\runner.ts

# conditionally build unit test progrmams
$(BUILT_LOCALTEST)\run.js: unit-tests-dependencies
	$(STRC_LOCAL) -noresolve $(BUILT_LOCAL)\typescriptServices.d.ts $(CSRC)\io.ts $(HSRC)\exec.ts $(HSRC)\diff.ts $(HSRC)\harness.ts $(HSRC)\external\json2.ts $(HSRC)\baselining.ts $(HSRC)\dumpAST-baselining.ts -out $(BUILT_LOCALTEST)\harness.js
	$(STRC_LOCAL) -noresolve $(BUILT_LOCAL)\typescriptServices.d.ts $(CSRC)\io.ts $(HSRC)\exec.ts  $(HSRC)\diff.ts $(HSRC)\harness.ts $(HSRC)\external\json2.ts $(HSRC)\generate.ts -out $(BUILT_LOCALTEST)\generate.js
	$(STRC_LOCAL) -noresolve -target es5 $(BUILT_LOCAL)\typescriptServices.d.ts $(CSRC)\io.ts $(CSRC)\optionsParser.ts $(HSRC)\exec.ts  $(HSRC)\diff.ts $(HSRC)\harness.ts $(HSRC)\baselining.ts $(HSRC)\dumpAST-baselining.ts $(HSRC)\external\json2.ts $(HSRC)\runner.ts -out $(BUILT_LOCALTEST)\run.js
    copy /Y $(BUILT_LOCAL)\typescriptServices.js $(BUILT_LOCALTEST)
    copy /Y $(LSRC)\lib.d.ts $(BUILT_LOCALTEST)

# build unit test programs
unit-tests:  $(BUILT_LOCALTEST)\run.js

tests: local unit-tests

runtests: tests
	$(HOST) $(BUILT_LOCALTEST)\run.js $(tests)

runtests-compiler: tests
	$(HOST) $(BUILT_LOCALTEST)\run.js $(COMPILER_TESTS)

runtests-ls: tests
	$(HOST) $(BUILT_LOCALTEST)\run.js $(LS_TESTS)

runtests-services: tests
	$(HOST) $(BUILT_LOCALTEST)\run.js $(SERVICES_TESTS)

runtests-harness: tests
	$(HOST) $(BUILT_LOCALTEST)\run.js $(HARNESS_TESTS)

world: local tests

# create a new lkg
install-local: clean world
	copy /Y $(BUILT_LOCAL)\lib.d.ts $(BIN)
	copy /Y $(BUILT_LOCAL)\jquery.d.ts $(BIN)
	copy /Y $(BUILT_LOCAL)\winjs.d.ts $(BIN)
	copy /Y $(BUILT_LOCAL)\winrt.d.ts $(BIN)
	copy /Y $(BUILT_LOCAL)\typescript.js $(BIN)
	copy /Y $(BUILT_LOCAL)\tsc.js $(BIN)
	copy /Y $(BUILT_LOCAL)\typescriptServices.js $(BIN)

install: install-local

clean-local:
	if exist $(BUILT_LOCAL) rmdir /S /Q $(BUILT_LOCAL)
	if exist $(BUILT_LOCALTEST) rmdir /S /Q $(BUILT_LOCALTEST)

clean: clean-local
	if exist $(BUILT) rmdir /S /Q $(BUILT)

baseline-accept:
	start /wait robocopy tests\baselines\local tests\baselines\reference /mir
	del /q tests\baselines\local\*
