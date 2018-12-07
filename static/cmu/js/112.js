function oops(msg) {
    alert("Error: " + msg);
    console.log("Error: " + msg);
    throw(msg);
}

function contains(haystack, needle) {
    return !!~haystack.indexOf(needle);
}

function canCopyToClipboard() {
    var isChrome = (navigator.userAgent.indexOf("Chrome") != -1);
    return isChrome; 
}

function copyToClipboard() {
    try { 
        document.execCommand('copy');
        return true;
    }
    catch (err) {
        return false;
    }
}

function launchTraceVisualization(code) {
    code = "# from CMU 15-112\n# http://www.cs.cmu.edu/~112\n\n" + code;
    code = encodeURIComponent(code);
    code = code.replace(/%26lt%3B/g, "%3C")
               .replace(/%26gt%3B/g, "%3E");
    var url = "http://pythontutor.com/iframe-embed.html#";
    url += "code=" + code;
    url += "&cumulative=false&py=3";
    window.open(url, "_blank");
}

function onCodeRun(codeRunButton) {
    if (!$("#modalBrythonPopup").length) {
        oops("onCodeRun: Cannot find modalBrythonPopup!");
    }
    var code = $(codeRunButton).parent().data("code");
    MBP.run(code);
}

function onCodeVisualize(codeVisualizeButton) {
    var code = $(codeVisualizeButton).parent().data("code");
    launchTraceVisualization(code);
}

function onCodeSelect(codeSelectButton) {
    var s = window.getSelection();
    if(s.rangeCount > 0) s.removeAllRanges();
    var range = document.createRange();
    var domPre =  $(codeSelectButton).parent().children("pre:first")[0];
    range.selectNode(domPre);
    s.addRange(range);
}

function onCodeCopy(codeCopyButton) {
    onCodeSelect(codeCopyButton);
    copyToClipboard();
}

var lastPressedPlayVideoScrollTop = null;
var seenPlayingAfterVideoStarted = false;

function onPlayVideo(playVideoButton) {
    lastPressedPlayVideoScrollTop = $("body").scrollTop();
    seenPlayingAfterVideoStarted = false;
    var src = $(playVideoButton).attr("data-src") + "?autoplay=false";
    $("#videoPlayerDiv").attr("width", "100%");
    $("#videoPlayerDiv").attr("height", $(window).height()*0.8);
    // videoPlayer.loadVideoByUrl(src); // plays immediately, does not track!
    videoPlayer.cueVideoByUrl(src); // plays on "run", does track!
    $("#playVideoPopup").modal("show");
}

function insertPlayVideoPopupHtml() {
  var playVideoPopupHtml = (
  '<!-- begin playVideoPopup -->' + '\n' +
  '<div class="modal fade" id="playVideoPopup" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' + '\n' +
  '    <div class="modal-dialog modal-lg" role="document">' + '\n' +
  '      <div class="modal-content">' + '\n' +
  '        <div class="modal-body" id="playVideoPopupBody">' + '\n' +
  '            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + '\n' +
  '            <br><br>' + '\n' +
  '        <div id="videoPlayerDiv"></div>' + '\n' +
  '        </div>' + '\n' +
  '      </div>' + '\n' +
  '    </div>' + '\n' +
  '  </div>' + '\n' +
  '<!-- end playVideoPopup -->' + '\n' +
  '');
  $("body").append(playVideoPopupHtml);
  $('#playVideoPopup').on('hide.bs.modal', function() {
    videoPlayer.stopVideo();
  });
}

var videoPlayer;

function onYouTubePlayerReady() {
    setupPlayVideoButtons();
}

function onYouTubePlayerStateChange(newState) {
    // alert("state change, state=" + newState.data);
    // see https://developers.google.com/youtube/js_api_reference?csw=1#Events
    if (newState.data == YT.PlayerState.PLAYING) {
        seenPlayingAfterVideoStarted = true;
    }
    else if ((newState.data == YT.PlayerState.ENDED) ||
             (newState.data == YT.PlayerState.UNSTARTED)) {
        // reset page position since it zeroes after fullsize video (in chrome)
        var scrollTop = lastPressedPlayVideoScrollTop;
        lastPressedPlayVideoScrollTop = null;
        if (scrollTop !== null) {
            $("body").scrollTop(scrollTop);
            if (seenPlayingAfterVideoStarted) {
                // @TODO: reconsider this.  We get here when the video
                // ended on its own.  Should we close the popup?
                // The next does that, but would leave the browser
                // in fullscreen, which is suboptimal.
                // $("#playVideoPopup").modal("hide");
            }
        }
    }
}

function onYouTubeIframeAPIReady() {
    videoPlayer = new YT.Player('videoPlayerDiv', {
      height: '390',
      width: '640',
      events: {
        'onReady': onYouTubePlayerReady,
        'onStateChange': onYouTubePlayerStateChange
      }
    });
}

function setupPlayVideoButtons() {
    $("span.play-video").each(function(i) {
        var src = $(this).attr("data-src");
        var useBRs = false;
        var html = (
            (useBRs ? '<br>' : '&nbsp;') +
            '<button class="btn btn-default btn-xs" onclick="onPlayVideo(this)"' +
            //' style="background-color:#EEE"' + 
            ' data-src="' + src + '">' +      
            '<span class="glyphicon glyphicon-facetime-video" aria-hidden="true"></span>' +
            '&nbsp;video</button>' +
            (useBRs ? '<br>' : '')
            );
        $(this).html(html);
    });
}

function setupPythonCode() {
    hljs.configure({tabReplace: '    '});
    $('div.python-code').each(function(i) {
        var jqueryDiv = $(this);
        var trimmedCode = jqueryDiv.html().trim();
        jqueryDiv.data("code", trimmedCode);
        // replace code body with what highlight.js needs
        var html = "<pre><code>";
        html += trimmedCode;
        html += "</code></pre>";
        // code to generate button html:
        function buttonHtml(name, glyphicon, enabled) {
            return ('<button class="btn btn-default btn-xs" onclick="onCode'+name+'(this)"'+
                    (enabled ? "" : " disabled") + '>' +
                    '<span class="glyphicon glyphicon-'+glyphicon+'" aria-hidden="true"></span>' +
                    ' '+name+'</button>'
                   );
        }
        // add the copy or select button
        if (!jqueryDiv.hasClass("no-copy")) {
            if (canCopyToClipboard()) {
                html += buttonHtml('Copy', 'copy', true);
            }
            else {
                html += buttonHtml('Select', 'copy', true);
            }
        }
        // add the visualize button, as necessary
        if (!jqueryDiv.hasClass("no-viz")) {
            var classes = jqueryDiv.attr("class");
            html += buttonHtml('Visualize', 'eye-open', true);
        }
        // add run button
        if (!jqueryDiv.hasClass("no-run")) {
            html += buttonHtml('Run', 'play', false);
        }
        // set the html
        jqueryDiv.html(html);
        // and call highlight.js
        var domPre = jqueryDiv.children("pre:first")[0];
        hljs.highlightBlock(domPre);
    });
}

function enableBrythonRunButtons() {
    $('div.python-code .btn').each(function(i) {
        if ($(this).html().indexOf("Run" > 0)) $(this).removeAttr('disabled');
    });
}

function loadJs(url, callback) {
    // Don't use $.getScript since it disables caching
    callback = callback || jQuery.noop;
    $.ajax({'url':url,'dataType':'script','cache':true,'success':callback});
};

function asyncLoadOrCallList(urlOrFnList, callback) {
    callback = callback || jQuery.noop;
    var i = -1;
    var innerCallback = function() {
        i += 1;
        if (i == urlOrFnList.length) callback();
        else if (urlOrFnList[i] instanceof Function) {
            urlOrFnList[i]();
            innerCallback();
        }
        else loadJs(urlOrFnList[i], innerCallback);
    };
    innerCallback();
}

function adjustAceBasePath() {
    // ace.config.set("packaged", true);
    // ace.config.set("basePath", "../js/");
    var path = "";
    var depth = getFolderDepthOfHtml();
    for (var i=0; i<depth; i++) path += "../";
    path += "js/";
    ace.config.set("basePath", path);
}

function getRelativePathToHtml() {
    var thisUrl = document.location.toString();
    var jsUrl = $("#112-script")[0].src;
    // thisUrl like: http://127.0.0.1:8000/src/notes/notes-getting-started.html
    // jsUrl   like: http://127.0.0.1:8000/src/js/112.js
    // need:                                   notes/notes-getting-started.html
    var suffix = "js/112.js"
    if (jsUrl.indexOf(suffix) != jsUrl.length - suffix.length)
        oops("getRelativePathToHtml: jsUrl does not end with js/112.js!");
    var prefix = jsUrl.substring(0, jsUrl.length - suffix.length);
    //if (thisUrl.indexOf(prefix) != 0)
        //oops("getRelativePathToHtml: thisUrl does not start with " + prefix + "!");
    //return thisUrl.substring(prefix.length);
    return "https://localhost:8443"
}

function getFolderDepthOfHtml() {
    var path = getRelativePathToHtml();
    var folders = 0;
    for (var i=0; i<path.length; i++) if (path[i] == "/") folders += 1;
    return folders;
}

function isTopLevel() {
    return (getFolderDepthOfHtml() == 0);
}

function setupVideos() {
    urlOrFnList = [
        insertPlayVideoPopupHtml, // do this first!
        "https://www.youtube.com/iframe_api",
        // setupPlayVideoButtons, // called when YouTube player is ready
    ]
    asyncLoadOrCallList(urlOrFnList);
}

function hideNavbarIfNeeded() {
    if (window.location.href.indexOf("hideNavbar=1") >= 0) {
        $(".navbar").hide();
        $(".content").css("margin-left","5px");
    }
}

function setupBrython() {
    urlOrFnList = [
        setupPythonCode,
        "/static/cmu/js/brython_dist.js",
        "/static/cmu/js/ace.js",
        adjustAceBasePath,
        "/static/cmu/js/theme-xcode.js",
        "/static/cmu/js/modal-brython-popup.js",
        // function(){alert("wahoo");},
        function() { MBP.insertModalBrythonPopupHtml() }, // wrap since not yet defined
        enableBrythonRunButtons
    ]
    asyncLoadOrCallList(urlOrFnList);
}

$(document).ready(function() {
    hideNavbarIfNeeded();
    if (isTopLevel() == false) {
        // only setup Brython for non-top-level for now (@TODO: better way?)
        setupVideos();
        setupBrython();
    }
});
