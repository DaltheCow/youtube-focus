chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.todo === "showPageAction") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.pageAction.show(tabs[0].id);
    });
  }
});

let lastURL = "";
chrome.webNavigation.onHistoryStateUpdated.addListener(
  function(e) {
    const regex = /https:\/\/www.youtube.com\/*/;
    const urlChange = e.url === "" || (regex.test(e.url) && e.url !== lastURL);
    if (urlChange) {
      lastURL = e.url;
      let string = "";
      for (let prop in e) {
        string += prop + " ";
      }
      chrome.tabs.sendMessage( e.tabId,
                               {action: "watching"} );
    }
  }, { url: [{hostSuffix: "youtube.com", pathPrefix: "/watch"}]}
);
