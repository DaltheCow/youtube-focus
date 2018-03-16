chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case "showPageAction":
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.pageAction.show(tabs[0].id);
      });
      break;
    case "getState":
      chrome.storage.sync.get("settings", function(data) {
        hideRelated(data.settings.hideRelated);
      });
      break;
  }
});

chrome.storage.sync.get("settings", function(data) {
  ensureSettings(data, () => hideRelated(data.settings.hideRelated));
});



(function() {
  let lastURL = "";
  chrome.webNavigation.onHistoryStateUpdated.addListener(
    function(e) {
      const regex = /https:\/\/www.youtube.com\/*/;
      const urlChange = e.url === "" || (regex.test(e.url) && e.url !== lastURL);
      if (urlChange) {
        lastURL = e.url;
        chrome.storage.sync.get("settings", function(data) {
          chrome.tabs.sendMessage( e.tabId,
                                 {action: "hideRelated", value: data.settings.hideRelated } );
        });
      }
    }, { url: [{hostSuffix: "youtube.com", pathPrefix: "/watch"}]}
  );
})();


chrome.tabs.query({}, function(tabs) {
  const regex = /https:\/\/www.youtube.com\/*/;
  const ytTabs = Array.from(tabs)
  .filter(tab => regex.test(tab.url));
  ytTabs.forEach(tab => chrome.pageAction.show(tab.id));
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.settings.oldValue.hideRelated !== changes.settings.newValue.hideRelated) {
    hideRelated(changes.settings.newValue.hideRelated);
  }
});

function hideRelated(value) {
  chrome.tabs.query({}, function(tabs) {
    var message = { action: "hideRelated", value };
    Array.from(tabs)
    .forEach(tab => chrome.tabs.sendMessage(tab.id, message));
  });
}

function ensureSettings(data, callback) {
  let { hideRelated, hideComments, allowedVideos, allowedPlaylists } = data.settings;
  hideRelated = Boolean(hideRelated);
  hideComments = Boolean(hideComments);
  allowedVideos = allowedVideos === undefined ? [] : allowedVideos;
  allowedPlaylists = allowedPlaylists === undefined ? [] : allowedPlaylists;
  const settings = { hideRelated, hideComments, allowedVideos, allowedPlaylists };
  chrome.storage.sync.set( { settings }, () => {
    callback();
  });
}
