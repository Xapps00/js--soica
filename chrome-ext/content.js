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
  var lastUsedSocketNamespace;

  // actions handlers
  var actions = {
    unknownAction: function(data) {
      var title = $('title').text();
      var msg = title + '\n\n' + JSON.stringify(data.message);
      setTimeout(function() {
        var answ = prompt(msg);
        window.postMessage({
          message: answ,
          target: 'devtool'
        }, '*');
      }, 500);
    },
    sendPacketAction: function(data) {
      lastUsedSocketNamespace.packet(JSON.parse(data.message));
    }
  };

  // patch soket.io
  var listOfPatchedMethods = ['packet', 'onPacket'];
  var soketPrototype = io.SocketNamespace.prototype;
  listOfPatchedMethods.forEach(function(name) {
    if(!soketPrototype['_' + name]) {
      var origFunction = soketPrototype[name];
      soketPrototype['_' + name] = origFunction;
      soketPrototype[name] = function(packet) {
        lastUsedSocketNamespace = this;
        var msg = {
          target: 'devtool',
          action: '',
          message: JSON.stringify(packet),
          from: name
        };
        window.postMessage(msg, "*");
        return origFunction.apply(this, arguments);
      }
    }
  });

  window.postMessage({
    action: 'activate',
    target: 'devtool',
    message: '',
    from: 'pageScript'
  }, '*');

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