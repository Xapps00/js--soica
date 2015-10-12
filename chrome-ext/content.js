(function(){
  'use strict';
  chrome.extension.onMessage.addListener(function (message, sender) {
    if(message.target === 'contentPage') {
      console.info("SOICa recieve message for contentPage: ", message);
      window.postMessage(message, '*');
    }
  });

  var port = chrome.extension.connect({
    name: "devtools" //Given a Name
  });
  window.addEventListener("message", function(ev) {
    if (ev.source !== window)
      return;

    var data = ev.data;
    if(data.target === 'devtool') {
      console.info("SOICa recieve message for devtool: ", data);
      chrome.extension.sendMessage(data);
    }
  });

  injectPageScript();
})();

function pageScript() {
  // actions handlers
  var actions = {
    unknownAction: function(data) {
      var title = $('title').text();
      var msg = title + '\n\n' + JSON.stringify(data.msg);
      setTimeout(function() {
        var answ = prompt(msg);
        window.postMessage({
          message: answ,
          target: 'devtool'
        }, '*');
      }, 500);
    }
  };

  // patch soket.io
  var soketPrototype = io.Socket.prototype;
  if(!soketPrototype._on && !soketPrototype._emit) {
    soketPrototype._on = soketPrototype.on;
    soketPrototype.on = function () {
      var msg = {
        target: 'devtool',
        action: 'socketOn',
        message: JSON.stringify(arguments)
      };
      window.postMessage(msg, "*");
      console.info('Patched func', msg);

      return this._on.apply(this, arguments);
    };
    soketPrototype._emit = soketPrototype.emit;
    soketPrototype.emit = function () {
      var msg = {
        target: 'devtool',
        action: 'socketEmit',
        message: JSON.stringify(arguments)
      };
      window.postMessage(msg, "*");
      console.info('Patched func', msg);

      return this._emit.apply(this, arguments);
    };
  }

  // handle messages from ext
  window.addEventListener("message", function(ev) {
    var data = ev.data;
    if(data.target === 'contentPage') {
      var action = (data.action || 'unknown') + 'Action';
      actions[action](data);
    }
  });
}

function injectPageScript() {
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.innerHTML = '(' + pageScript.toString() + ')();';
  document.getElementsByTagName("body")[0].appendChild(script);
}