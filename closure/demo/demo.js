goog.provide('demo');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.string');
goog.require('goog.style');


// Unfortunately, Closure Lite was generated so long ago, that it predates the
// introduction of goog.scope(), which is why it is not used here.
(function() {


var get = goog.dom.getElement;


/**
 * It is pretty sad that this cannot be done in CSS.
 * @param {goog.events.Event} e
 */
demo.onResize = function(e) {
  // Calculate the remaining window area for the textareas.
  var winSize = goog.dom.getViewportSize();
  var container = get('code-container');
  var position = goog.style.getPosition(container);
  // On Chrome, a textarea has 2px of padding and a 1px border, yet the
  // containing block element is still 3px taller than the textarea.
  // Also, the <body> adds 8px of margin.
  // 8 + 1 + 2 + 2 + 1 + 3 = 17.
  var verticalPadding = 17;
  var height = (winSize.height - position.y - verticalPadding) + 'px';
  if (height < 0) return;

  // Set the height of the textareas.
  var textareas = [get('code-coffee').firstChild, get('code-js').firstChild];
  goog.array.forEach(textareas, function(textarea) {
    textarea.style.height = height;  
  });
};


/** @return {!ITextWriter} */
demo.createITextWriter = function() {
  var out = '';
  return {
    Write: function(s) {
      out += s;
    },
    WriteLine: function(s) {
      out += s + '\n';
    },
    Close: function() {},
    getOutput : function() { return out; }
  };
};


/**
 * Compile the code in the input pane and print it in the output pane.
 */
demo.compile = function() {
  var input = demo.typeScriptEditor.getSession().getValue();
  var checkbox = get('enable-google');

  var value = '';
  var error = null;
  try {
    var errorOutput = demo.createITextWriter();
    var logger = new TypeScript.NullLogger();
    var settings = new TypeScript.CompilationSettings();
    settings.outputGoogleClosureAnnotations = checkbox.checked;

    var compiler = new TypeScript.TypeScriptCompiler(errorOutput, logger, settings);

    // EXTERNS may not be defined when developing the demo locally.
    if (typeof EXTERNS != 'undefined') {
      compiler.addUnit(EXTERNS, 'lib.d.ts');
    }

    var filenameForErrorReportingPurposes = '<INPUT>';
    compiler.addUnit(input, filenameForErrorReportingPurposes);
    compiler.typeCheck();

    var originalTextWriter;
    /** @type {function(string,boolean):ITextWriter} */
    var createFile = function(path, useUtf8) {
      var newTextWriter = demo.createITextWriter();
      if (!originalTextWriter) originalTextWriter = newTextWriter;
      return newTextWriter;
    };
    compiler.emit(createFile);

    value = originalTextWriter.getOutput();
    demo.jsEditor.getSession().setValue(value);

    if (errorOutput.getOutput()) {
      error = errorOutput.getOutput();
    }
  } catch (e) {
    error = e.message;
  }

  // Update the UI to reflect whether there is an error. 
  var isError = (error != null);
  get('error').innerHTML = goog.string.htmlEscape(error || '');
  get('error').style.visibility = isError ? 'visible' : 'hidden';
  // TOOD(bolinfest): Figure out why the text does not turn red.
  goog.dom.classes.enable(get('code-coffee'), 'error', isError);
};


/** @type {ace.Editor} */
demo.typeScriptEditor;


/** @type {ace.Editor} */
demo.jsEditor;


demo.createEditors = function() {
  var typeScriptEditor = demo.typeScriptEditor =
      ace.edit(get('code-coffee').firstChild);
  var jsEditor = demo.jsEditor =
      ace.edit(get('code-js').firstChild);

  var TypeScriptMode = require("ace/mode/typescript").Mode;
  typeScriptEditor.getSession().setMode(new TypeScriptMode());
  typeScriptEditor.getSession().setTabSize(2);
  typeScriptEditor.getSession().setUseSoftTabs(false);
  typeScriptEditor.setFontSize('14px');
  typeScriptEditor.renderer.setHScrollBarAlwaysVisible(false);

  var JavaScriptMode = require("ace/mode/javascript").Mode;
  jsEditor.setTheme("ace/theme/twilight");
  jsEditor.getSession().setMode(new JavaScriptMode());
  jsEditor.setReadOnly(true);
  jsEditor.setFontSize('14px');
  jsEditor.renderer.setHScrollBarAlwaysVisible(false);
};


demo.init = function() {
  // Make sure the editor divs takes up space before creating the editors.
  goog.events.listen(
      window,
      goog.events.EventType.RESIZE,
      demo.onResize);
  demo.onResize();

  demo.createEditors();

  var compileAfterCurrentThread = function() { setTimeout(demo.compile, 0); };

  goog.events.listen(
      get('enable-google'),
      goog.events.EventType.CHANGE,
      compileAfterCurrentThread);
 
  demo.typeScriptEditor.getSession().on('change', compileAfterCurrentThread);

  demo.compile();
};


demo.init();

})();
