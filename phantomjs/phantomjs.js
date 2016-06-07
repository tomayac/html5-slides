(function() {
    console.log('Running extractor');
    // Get all CSS rules
    var cssText = [];
    var styleSheets = document.styleSheets;
    for (var i = 0, lenI = styleSheets.length; i < lenI; i++) {
      var styleSheet = styleSheets[i];
      var cssRules = styleSheet.cssRules;
      for (var j = 0, lenJ = cssRules.length; j < lenJ; j++) {
        var cssRule = cssRules[j];
        var text = cssRule.cssText;
        // Phantom.js seems to erroneously place commas in content: rules
        if (/content:/g.test(text)) {
          text = text.replace(/content:(.*?);/g, function(_ignore, content) {
            return 'content: ' + content.replace(/,/g, '') + ';';
          });
        }
        // Rewrite absolute file:/// resources to relative resources
        if (/file:\/\/\//g.test(text)) {
          text = text.replace(/file:\/\/\/.*?\/images\//g, './images/');
        }
        cssText.push(text);
      }
    }

    // Get all JavaScript texts
    var jsText = [];
    var scripts = document.scripts;
    for (var k = 0, lenK = scripts.length; k < lenK; k++) {
      var script = scripts[k];
      // Scripts with remote source
      if (script.src) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function() {
          jsText.push(xhr.responseText);
        });
        // Synchronous(!) XHR here
        xhr.open('GET', script.src, false);
        xhr.send(null);
      }
    }

    var result = {
      css: cssText,
      javaScript: jsText
    };

    window.callPhantom(result);
})();
