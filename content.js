chrome.runtime.sendMessage({action: "showPageAction"});
chrome.runtime.sendMessage({action: "getState"});


chrome.runtime.onMessage.addListener(data => {
    switch(data.action) {
      case "hideField":
      const regex = /https:\/\/www.youtube.com\/watch*/;
        if (regex.test(location.href)) {
          const legend = { 'hideRelated': 'hide-related', 'hideComments': 'hide-comments', 'hideEndScreen': 'hide-end-screen' };
          const className = legend[data.field];
          if (data.value) {
            document.body.classList.add(className);
          } else {
            document.body.classList.remove(className);
          }
        }
        break;
      case 'gatherVideoInfo':
        //i need to gather title and an image if I can, then send a message
        break;
      case 'gatherPLInfoPL':
        var title = document.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
        break;
      case 'gatherPLInfo2Video':
        var title = document.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string');
        break;
    }
});
