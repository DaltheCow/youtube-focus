chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case "showPageAction":
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.pageAction.show(tabs[0].id);
      });
      break;
    case "getState":
      chrome.storage.sync.get("settings", function(data) {
        sendStateToContent(data.settings.hideRelated, 'hideRelated');
        sendStateToContent(data.settings.hideComments, 'hideComments');
        sendStateToContent(data.settings.hideEndScreen, 'hideEndScreen');
      });
      break;
  }
});

chrome.tabs.query({}, function(tabs) {
  const regex = /https:\/\/www.youtube.com\/*/;
  const ytTabs = Array.from(tabs)
  .filter(tab => regex.test(tab.url));
  ytTabs.forEach(tab => chrome.pageAction.show(tab.id));
});

chrome.storage.sync.get("settings", function(data) {
  ensureSettings(data, () => {
    sendStateToContent(data.settings.hideRelated, 'hideRelated');
    sendStateToContent(data.settings.hideComments, 'hideComments');
    sendStateToContent(data.settings.hideEndScreen, 'hideEndScreen');
  });
});

(function() {
  let lastURL = "";
  chrome.webNavigation.onHistoryStateUpdated.addListener(function(e) {
      const regex = /https:\/\/www.youtube.com\/*/;
      const urlChange = e.url === "" || (regex.test(e.url) && e.url !== lastURL);
      if (urlChange) {
        lastURL = e.url;
        chrome.storage.sync.get("settings", function(data) {
          chrome.tabs.sendMessage( e.tabId,
                                 { action: "hideField",
                                   value: data.settings.hideRelated,
                                   field: 'hideRelated' } );
          chrome.tabs.sendMessage( e.tabId,
                                 { action: "hideField",
                                   value: data.settings.hideComments,
                                   field: 'hideComments' } );
          chrome.tabs.sendMessage( e.tabId,
                                 { action: "hideField",
                                   value: data.settings.hideEndScreen,
                                   field: 'hideEndScreen' } );
        });
      }
    }, { url: [{hostSuffix: "youtube.com", pathPrefix: "/watch"}]}
  );
})();


chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.settings.oldValue.hideRelated !== changes.settings.newValue.hideRelated) {
    sendStateToContent(changes.settings.newValue.hideRelated, 'hideRelated');
  } else if (changes.settings.oldValue.hideComments !== changes.settings.newValue.hideComments) {
    sendStateToContent(changes.settings.newValue.hideComments, 'hideComments');
  } else if (changes.settings.oldValue.hideEndScreen !== changes.settings.newValue.hideEndScreen) {
    sendStateToContent(changes.settings.newValue.hideEndScreen, 'hideEndScreen');
  }
});

function sendStateToContent(value, field) {
  chrome.tabs.query({}, function(tabs) {
    var message = { action: "hideField", value, field };
    Array.from(tabs)
    .forEach(tab => chrome.tabs.sendMessage(tab.id, message));
  });
}

function ensureSettings(data, callback) {
  let { hideRelated, hideComments, hideEndScreen, allowedVideos, allowedPlaylists } = data.settings;
  hideRelated = Boolean(hideRelated);
  hideComments = Boolean(hideComments);
  hideEndScreen = Boolean(hideEndScreen);
  allowedVideos = allowedVideos === undefined ? [] : allowedVideos;
  allowedPlaylists = allowedPlaylists === undefined ? [] : allowedPlaylists;
  const settings = { hideRelated, hideComments, hideEndScreen, allowedVideos, allowedPlaylists };
  chrome.storage.sync.set( { settings }, () => {
    callback();
  });
}
