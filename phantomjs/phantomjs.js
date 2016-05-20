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
        cssText.push(cssRule.cssText);
      }
    }

    // Get all JavaScript texts
    var jsText = [];
    var scripts = document.scripts;
    for (var k = 0, lenK = scripts.length; k < lenK; k++) {
      var script = scripts[k];
  /*
      // Scripts with inlined code
      var textContent = script.textContent.trim();
      if (textContent) {
        jsText.push(textContent);
      }
  */
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

    console.log('%%%%%%', result, '%%%%%%');

    window.callPhantom(result);
})();
