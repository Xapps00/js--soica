$(function() {
  'use strict';

  var typeBlocks = ['packet', 'onPacket'];
  var actions = {
    unknownAction: function(data) {
      var str;
      if(typeof data !== 'string') {
        str = '' + data.from + ' to ' + data.target + '<hr />' + JSON.stringify(JSON.parse(data.message), null, ' ' );
      } else {
        str = data;
      }
      var blockId = (typeBlocks.indexOf(data.from) >= 0)? data.from : 'output';
      $('#' + blockId).html(str);
    }
  };

  var port = chrome.extension.connect({
    name: "devtools" //Given a Name
  });


  port.onMessage.addListener(function (msg) {
    msg = msg || {};
    if(msg.target !== 'devtool') {
      return;
    }
    var action = (msg.action || 'unknown') + 'Action';

    var ret = actions[action](msg);
    console.log(msg);
  });


  $(document.body).on('click', '#fillMsg', function() {
    $('#msgToSend').val(Date.now());
  });

  $(document.body).on('click', '#sendMsg', function() {
    port.postMessage({
        action: 'sendPacket',
        target: 'contentPage',
        message: $('#msgToSend').val()
      });
  });
});