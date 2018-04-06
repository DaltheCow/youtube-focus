chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case "showPageAction":
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.pageAction.show(tabs[0].id);
      });
      break;
    case "getState":
      chrome.storage.sync.get("settings", function(data) {
        if (data.settings.enableContentBlocking) {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            blockContent(tabs[0].id, tabs[0].url, data.settings.allowedVideos, data.settings.allowedPlaylists);
          });
        }
        ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(field => {
          sendStateToContent(data.settings[field], field);
        });
      });
      break;
  }
});

chrome.tabs.query({}, function(tabs) {
  const regex = /https:\/\/www.youtube.com\/*/;
  const ytTabs = Array.from(tabs)
  .filter(tab => regex.test(tab.url));
  ytTabs.forEach(tab => {
    chrome.pageAction.show(tab.id);
  });
});

chrome.storage.sync.get("settings", function(data) {
  ensureSettings(data, () => {
    chrome.tabs.query({}, function(tabs) {
      const regex = /https:\/\/www.youtube.com\/*/;
      const ytTabs = Array.from(tabs)
      .filter(tab => regex.test(tab.url));
      ytTabs.forEach(tab => {
        blockContent(tab.id, tab.url, data.settings.allowedVideos, data.settings.allowedPlaylists);
      });
    });
    ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(field => {
      sendStateToContent(data.settings[field], field);
    });
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  const ytRegex = /https:\/\/www.youtube.com\/*/;
  if (changeInfo.url && ytRegex.test(changeInfo.url)) {
    const videoRegex = /https:\/\/www.youtube.com\/watch*/;
    chrome.storage.sync.get("settings", function(data) {
      if (videoRegex.test(changeInfo.url)) {
        ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(field => {
          chrome.tabs.sendMessage( tabId, { action: 'hideField', value: data.settings[field], field });
        });
      }
      if (data.settings.enableContentBlocking) {
        blockContent(tabId, changeInfo.url, data.settings.allowedVideos, data.settings.allowedPlaylists);
      }
  });

  }
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  const { oldValue, newValue } = changes.settings;
  if (oldValue.hideRelated !== newValue.hideRelated) {
    sendStateToContent(newValue.hideRelated, 'hideRelated');
  } else if (oldValue.hideComments !== newValue.hideComments) {
    sendStateToContent(newValue.hideComments, 'hideComments');
  } else if (oldValue.hideEndScreen !== newValue.hideEndScreen) {
    sendStateToContent(newValue.hideEndScreen, 'hideEndScreen');
  } else if (oldValue.enableContentBlocking !== newValue.enableContentBlocking) {
    if (newValue.enableContentBlocking) {
      chrome.tabs.query({}, function(tabs) {
        Array.from(tabs).forEach(tab => {
          blockContent(tab.id, tab.url, newValue.allowedVideos, newValue.allowedPlaylists);
        });
      });
    }
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
  let { hideRelated, hideComments, hideEndScreen, enableContentBlocking, allowedVideos, allowedPlaylists, videoStorage, plStorage } = data.settings;
  hideRelated = Boolean(hideRelated);
  hideComments = Boolean(hideComments);
  hideEndScreen = Boolean(hideEndScreen);
  enableContentBlocking = Boolean(enableContentBlocking);
  allowedVideos = allowedVideos === undefined ? [] : allowedVideos;
  allowedPlaylists = allowedPlaylists === undefined ? [] : allowedPlaylists;
  videoStorage = videoStorage === undefined ? {} : videoStorage;
  plStorage = plStorage === undefined ? {} : plStorage;
  const settings = { hideRelated, hideComments, hideEndScreen, enableContentBlocking, allowedVideos, allowedPlaylists, videoStorage, plStorage };
  chrome.storage.sync.set( { settings }, () => {
    callback();
  });
}

function blockContent(tabId, url, allowedVideos, allowedPlaylists) {
  const { isPL, PlID, isVid, vidID, notYt } = vidOrPL(url);
  const pageIsntAllowed = (((isVid && !isPL) && !allowedVideos.includes(vidID)) || (isPL && !allowedPlaylists.includes(PlID)) || (!isVid && !isPL && !notYt));
  if (pageIsntAllowed) {
    chrome.tabs.update(tabId, {url: "not_available/not_available.html"});
  }
}

function vidOrPL(url) {
  const regex = /https:\/\/www\.youtube\.com\/(playlist\?list=(.+))?(watch\?v=([A-Za-z0-9_-]{11}))?(&index[^&]+)?(&list=([^&]+)?)?(&.*)?/;
  const res = url.match(regex);
  const result = !res ? { isPL: false, PlID: null, isVid: false, vidID: null, notYt: true } : {
    isPL: Boolean(res[1] || res[6]),
    PlID: (res[2] || res[7]),
    isVid: Boolean(res[3] && res[4]),
    vidID: res[4] };
  return result;
}
