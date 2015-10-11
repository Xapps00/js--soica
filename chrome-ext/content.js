(function(){
  'use strict';

  alert(1);
  debugger;
  chrome.extension.onMessage.addListener(function (message, sender) {
    console.log("In content Script Message Recieved is " + message);
    debugger;
    //Send needed information to background page
    chrome.extension.sendMessage("My URL is" + window.location.origin);
  });
})();