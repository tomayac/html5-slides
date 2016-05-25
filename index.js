'use strict';

var phantom = require('phantom');
const fs = require('fs');

const html5Slides = {
  dump: () => {
    return new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/index.html', 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  },

  load: () => {
    return new Promise((resolve, reject) => {
      let page = null;
      let instance = null;
      let content = null;
      let callbackData = null;
      phantom.create(['--ignore-ssl-errors=yes', '--web-security=no'])
      .then(instance_ => {
        instance = instance_;
        return instance.createPage();
      })
      .then(page_ => {
        page = page_;
        return page.open(__dirname + '/body.html');
      })
      .then(status => {
        page.on('onConsoleMessage', (msg) => {
          console.log('From Phantom.js (console.log):', msg);
        });
        page.on('onCallback', (msg) => {
          console.log('From Phantom.js (phantomCallback):', typeof msg);
          callbackData = msg;
        });
        return page.injectJs(__dirname + '/phantomjs/phantomjs.js');
      })
      .then((injected) => {
        return page.property('content');
      })
      .then(content_ => {
        content = content_;
        page.close();
        const css = `\n<style>\n${callbackData.css.join('\n')}\n</style>\n`;
        const javaScript = callbackData.javaScript.map((script) => {
          return `\n<script>\n${script}\n</script>\n`;
        }).join('\n');
        content = content.replace(/<script.*?><\/script>/g, '');
        content = content.replace(/<link.*?>/g, '');
        // Using replacement functions here as the replacement string can
        // contain special replacement patterns like "$'"
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/ ↩
        // Reference/Global_Objects/String/replace ↩
        // #Specifying_a_string_as_a_parameter
        content = content.replace(/<!--\{\{css\}\}-->/g, () => {
          return css;
        });
        content = content.replace(/<!--\{\{javaScript\}\}-->/g, () => {
          return javaScript;
        });
        content = content.replace(/\{\{slides\}\}/g, '');
        content = content.replace(/^\s*$\n/gm, '');
        const fileName = __dirname + '/slides.html';
        fs.writeFile(fileName, content, 'utf8', (err) => {
          if (err) {
            return reject(err);
          }
          instance.exit();
          return resolve(content);
        });
      })
      .catch(err => {
        instance.exit();
        return reject(err);
      });
    });
  }
};

module.exports = html5Slides;
