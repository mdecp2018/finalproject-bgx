
////////////////////
// Timeout checker
////////////////////

// Capture prompt to reset timeout timer
_prompt = prompt;
_time0 = resetTimeout();
_timeout_time_millis = 4000;

function resetTimeout() {
  _time0 = new Date().getTime();
}

prompt = function() {
  var result = _prompt.apply(this, arguments);
  resetTimeout(); // after prompt
  return result;
}

// place in global namespace for Brython
function checkTimeout() {
  var elapsedTimeMillis = new Date().getTime() - _time0;
  if (elapsedTimeMillis > _timeout_time_millis)
    throw "Error: Timeout! (Perhaps you have an infinite loop?)";
}

function isIdentifierStart(c) {
  // letter, _, $
  var code = c.charCodeAt(0);
  return ((c == '_') ||
          (c == '$') ||
          ((code >= "a".charCodeAt(0)) && (code <= "z".charCodeAt(0))) ||
          ((code >= "A".charCodeAt(0)) && (code <= "Z".charCodeAt(0)))
          );
}

function isIdentifierPart(c) {
  // start (letter, _, $) or digit
  var code = c.charCodeAt(0);
  return ((isIdentifierStart(c)) ||
          ((code >= "0".charCodeAt(0)) && (code <= "9".charCodeAt(0)))
          );
}

function patchCodeToCheckTimeout(code) {
  var result = "";
  var i0=0; // start of substring to copy to result
  var inString=false, endQuote, inComment=false;
  var inLoopPreColon=false, inLoopPostColon=false;
  var curr;
  var bracketCount=0, parenCount=0;
  for (var i=0; i<code.length; i++) {
    curr = code[i];
    if (inComment)
      inComment = (curr != '\n');
    else if ((!inString) && (curr == '#'))
      inComment = true;
    else if (inString) {
      if (endQuote.length == 3)
        inString = ((curr + code[i-1] + code[i-2]) != endQuote);
      else
        inString = ((curr == '\n') ||
                    ((curr != endQuote) || (code[i-1] == '\\')));
    }
    else if ((curr == '"') || (curr == "'")) {
      inString = true;
      if ((i+2 < code.length) && (code[i+1] == curr) && (code[i+2] == curr))
        { endQuote = curr+curr+curr; i+=2; }
      else
        endQuote = curr;
    }
    else if (inLoopPostColon) {
      // we've seen "while ...:" or "for ...:"
      // so looking for first non-whitespace outside comment or quote
      if ((curr != " ") && (curr != "\t") && (curr != "\n")) {
        // we did it!  time to add the patch!
        result += code.substring(i0,i);
        result += "window.checkTimeout();"
        i0 = i;
        inLoopPostColon = false;
      }
    }
    else if (inLoopPreColon) {
      // we've seen "while..." or "for ..."
      // so we're looking for the first colon outside comment or quote
      // and also outside any [brackets] or (parens)
      if (curr == "(") parenCount += 1;
      else if (curr == ")") parenCount -= 1;
      else if (curr == "[") bracketCount += 1;
      else if (curr == "]") bracketCount -= 1;
      else if ((curr == ":") && (parenCount == 0) && (bracketCount == 0)) {
        inLoopPreColon = false;
        inLoopPostColon = true;
      }
    }
    else if ((i >= 1) &&
             !isIdentifierPart(curr) &&
             isIdentifierPart(code[i-1])) {
      // we're looking for "while" or "for" outside comment or quote
      // and we're just past an identifier, so find it
      var j = i-1;
      while ((j > 0) && isIdentifierStart(code[j-1])) j -= 1;
      var identifier = code.substring(j,i);
      if ((identifier == "for") || (identifier == "while")) {
        if (curr == ":")
          inLoopPostColon = true;
        else {
          inLoopPreColon = true;
          bracketCount = 0;
          parenCount = 0;
        }
      }
    }
  }
  result += code.substring(i0,i); // add last bit of code
  // alert(result);
  return result;
}

////////////////////
// MBP (Modal Brython Popup)
////////////////////

var MBP = {
  brythonInited: false,
  aceEditor: null,
  code: "# your code",

  runCodeInEditor: function() { MBP.run(null); },

  initThenRun: function(code) {
    if (MBP.brythonInited == true) {
      alert("ModalBrythonPython: Init called more than once!");
      return;
    }
    // init the ACE editor
    MBP.aceEditor = ace.edit("mbpAceEditor");
    MBP.aceEditor.getSession().setMode("ace/mode/python");
    MBP.aceEditor.setTheme("ace/theme/xcode");
    MBP.aceEditor.setFontSize(13);
    MBP.aceEditor.setHighlightActiveLine(false);
    MBP.aceEditor.$blockScrolling = Infinity; // as per ace's error msg
    MBP.aceEditor.commands.addCommand({
      name: "run",
      bindKey: {win: "Ctrl-R", mac: "Ctrl-R"},
      exec: function(editor) { MBP.runCodeInEditor(); },
      readOnly: true
      });
    $("#modalBrythonPopup").on("shown.bs.modal", function() {
      MBP.aceEditor.resize(true); // force synchronous update
      MBP.evalBrython(MBP.code);
    });
    MBP.brythonInited = true;
    MBP.run(MBP.code);
  },

  run: function(code) {
    if (code != null) {
      code = $('<textarea />').html(code).text(); // unconvert &gt to >, etc
      //console.log(code);
    }
    MBP.code = code;
    if (MBP.brythonInited == false) {
      MBP.initThenRun();
      return;
    }
    if (code == null) {
      code = MBP.aceEditor.getValue();
      code = $('<textarea />').html(code).text(); // unconvert &gt to >, etc
    }
    else {
      MBP.aceEditor.setValue(code);
      MBP.aceEditor.clearSelection();
    }
    MBP.code = code;
    $("#mbpConsole").html("");
    if (!$('#modalBrythonPopup').is(':visible')) {
      $("#modalBrythonPopup").modal("show"); // will run with on("shown")
    }
    else {
      // @TODO: not use a timeout here.  We use it so that
      // the mbpConsole has time to actually clear (otherwise
      // the previous output remains there until the end of the run)
      setTimeout(function() { MBP.evalBrython(MBP.code); }, 10);
    }
  },

  onRun: function(runButton) {
    MBP.runCodeInEditor();
  },

  onClose: function(closeButton) {
    $("#modalBrythonPopup").modal("hide");
  },

  onAboutBrython: function(onAboutBrythonButton) {
    window.open("http://www.brython.info/",'_blank');
  },

  consoleLogFn: function(line) {
      var mbpConsole = $("#mbpConsole");
      if (!mbpConsole) alert("ModalBrythonPopup: missing console!");
      // @TODO: clean up "import _sys from VFS" lines more cleanly
      if ((line.indexOf("import ") == 0) && (line.indexOf("from VFS") > 0)) {
        // bogus line, just eat it
        return;
      }
      // Can't just mbpConsole.append(line) since we have to escape strings
      $(document.createTextNode(line)).appendTo(mbpConsole);
      mbpConsole.scrollTop(mbpConsole.innerHeight());
  },

  evalBrython: function(code) {
    // See: https://groups.google.com/forum/#!topic/brython/xLv55qq-L1s
    function addHiddenCodeDiv(id, code) {
      var newDiv = document.createElement('pre');
      newDiv.id = id;
      newDiv.style.visibility = 'hidden';
      newDiv.type = 'text/python3';
      newDiv.textContent = code;
      document.body.appendChild(newDiv);
      return newDiv
    }

    code = patchCodeToCheckTimeout(code);
    var pyScript = addHiddenCodeDiv('pyScript', code);
    // need pyScriptRunner to deal with cascading tracebacks
    var codeRunnerCode = (
      'from browser import window, document, alert' + '\n' +
      'import traceback' + '\n' +
      'src = document["pyScript"].textContent' + '\n' +
      'try:' + '\n' +
      //'   #alert("src=" + src)' + '\n' +
      '   exec(src,globals())' + '\n' +
      'except Exception as exc:' + '\n' +
      //'   traceback.print_exc()' + '\n' +
      //'   # eat leading frames (from this wrapper code)
      '   lines = traceback.format_exc().splitlines()' + '\n' +
      '   print(lines[0])' + '\n' +
      '   for line in lines[5:]:' + '\n' +
      '     print(line.replace("module exec_1 ",""))' + '\n' +
      ''
    );
    var pyScriptRunner = addHiddenCodeDiv('pyScriptRunner', codeRunnerCode);
    // now capture console
    var _log = console.log;
    console.log = function() {
      var args, i;
      args = []; for (i=0; i<arguments.length; i++) args.push(arguments[i]);
      MBP.consoleLogFn(args.toString());
    };
    // run brython(), based on Pierre's suggested approach
    try {
          // Timing idea from Brython website
          var t0 = (new Date()).getTime();
          resetTimeout();
          brython({debug:1, ipy_id:['pyScriptRunner']});
          var t1 = (new Date()).getTime();
          console.log("[completed in "+(t1-t0)+" ms]");
    }
    catch (err) {
        errMsg = err.toString();
        if (errMsg != "Error") {
          // ignore generic "Error", since Brython will output Python err
          console.log("Brython Error: " + errMsg);
          console.log("<completed (error)>");
        }
    }
    finally {
      console.log = _log;
    }
    document.body.removeChild(pyScript);
    document.body.removeChild(pyScriptRunner);
  },

  modalBrythonPopupHtml: (
  '<!-- begin ModalBrythonPopup -->' + '\n' +
  '<style type="text/css">' + '\n' +
  '@media (min-width: 768px) { .modal-xl { width: 90%; max-width:1200px; } }' + '\n' +
  '</style>' + '\n' +
  '<div class="modal fade" id="modalBrythonPopup" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' + '\n' +
  '    <div class="modal-dialog modal-xl" role="document">' + '\n' +
  '      <div class="modal-content">' + '\n' +
  '        <div class="modal-body" id="modalBrythonPopupBody">' + '\n' +
  '          <div style="margin-bottom:5px">' + '\n' +
  '            <button type="button" class="btn btn-primary btn-xs" onclick="MBP.onRun(this)">' + '\n' +
  '              <span class="glyphicon glyphicon-play" aria-hidden="true"></span>' + '\n' +
  '              Run' + '\n' +
  '            </button>' + '\n' +
  '            <button type="button" class="btn btn-primary btn-xs pull-right"' + '\n' +
  '                    onclick="MBP.onClose(this)">' + '\n' +
  '              <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' + '\n' +
  '              Close' + '\n' +
  '            </button>' + '\n' +
  '            <button type="button" class="btn btn-primary btn-xs pull-right"' + '\n' +
  '                    style="margin-right:10px;"' + '\n' +
  '                    onclick="MBP.onAboutBrython(this)">' + '\n' +
  '              About Brython' + '\n' +
  '            </button>' + '\n' +
  '          </div>' + '\n' +
  '          <div id="mbpAceEditor" style="width:100%; height:250px; margin-bottom:5px;">' + '\n' +
  '            # Your code goes here' + '\n' +
  '          </div>' + '\n' +
  '          <div id="mbpConsoleDiv">' + '\n' +
  '            <pre id="mbpConsole" ' + '\n' +
  '                 style="background-color:#F0F8FF;' + '\n' +
  '                        width:100%; height:250px;">' + '\n' +
  '            </pre>' + '\n' +
  '          </div>' + '\n' +
  '        </div>' + '\n' +
  '      </div>' + '\n' +
  '    </div>' + '\n' +
  '  </div>' + '\n' +
  '<!-- end ModalBrythonPopup -->' + '\n' +
  ''),

  insertModalBrythonPopupHtml: function() {
    $("body").append(MBP.modalBrythonPopupHtml);
  },
};

