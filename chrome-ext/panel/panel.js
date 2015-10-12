$(function() {
  'use strict';

  var actions = {
    unknownAction: function(ret) {
      if(typeof ret !== 'string') {
        ret = '' + ret.from + ' to ' + ret.target + '<hr />' + JSON.stringify(JSON.parse(ret.message), null, ' ' );
      }
      $('#output').html(ret);
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
        action: '',
        target: 'contentPage',
        msg: $('#msgToSend').val()
      });
  });
});