import { getStorage, setStorage } from "../modules/storage";
import { YT_REGEX, VID_PL_REGEX } from "../constants";
import { vidOrPL } from "../util";

// chrome.storage.sync.clear(() => console.log("hi"));

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const tabId = sender.tab.id,
    url = sender.tab.url;
  switch(request.action) {
    case 'showPageAction': {
      // need to turn it off when navigating to non valid page, maybe in on tabs updated
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const isVidOrPl = vidOrPL(tabs[0].url);
        if (isVidOrPl.isPL || isVidOrPl.isVid) {
          chrome.pageAction.show(tabs[0].id);
        }
      });
      const isVidOrPl = vidOrPL(url);
      if (isVidOrPl.isPL || isVidOrPl.isVid) {
        chrome.pageAction.show(tabId);
      }

      break;
    }
    case 'getState': {
      getStorage('settings', function(data) {
        if (data.settings.enableContentBlocking) {
            blockContent(tabId, url, data.settings.allowedVideos, data.settings.allowedPlaylists);
        }
        updateStorageInfoMsg(tabId, url, data.settings.allowedVideos, data.settings.allowedPlaylists);
        ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(field => {
          sendStateToContent(data.settings[field], field, tabId);
        });
      });
      break;
    }
    //figure out how to deal with incoming message with ytInfo from window
    case 'receiveStorageInfo': {
      const { url, type, vidInfo, plInfo, info } = request;
      const { isPL, PlID, isVid, vidID } = vidOrPL(url);
        getStorage(['plStorage', 'videoStorage'], function(data) {
          let { plStorage, videoStorage } = data;
          switch(type) {
            case 'receivePL': {
              let newPLStorage = Object.assign({}, plStorage);
              newPLStorage[PlID] = newPLStorage[PlID] || {};
              newPLStorage[PlID] = Object.assign({}, plStorage[PlID], info);
              setStorage('plStorage', { plStorage: newPLStorage });
              break;
            }
            case 'receivePL2': {
              let newPLStorage = Object.assign({}, plStorage);
              let newVideoStorage = Object.assign({}, videoStorage);
              newPLStorage[PlID] = Object.assign({}, newPLStorage[PlID], plInfo);
              newVideoStorage[vidID] = Object.assign({}, newVideoStorage[vidID], vidInfo);
              setStorage({ plStorage: newPLStorage });
              setStorage({ videoStorage: newVideoStorage });
              break;
            }
            case 'receiveVideo': {
              let newVideoStorage = Object.assign({}, videoStorage);
              newVideoStorage[vidID] = newVideoStorage[vidID] || {};
              newVideoStorage[vidID] = Object.assign({}, videoStorage[vidID], info);
              setStorage({ videoStorage: newVideoStorage });
            }
          }
        });
      break;
    }
    case 'log': {
      console.log(request);
    }
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

(function() {
  getStorage(['settings', 'videoStorage', 'plStorage'])
  .then(data => {
    ensureSettings(data, (newData) => {
      if (newData.settings.enableContentBlocking) {
        chrome.tabs.query({}, function(tabs) {
          const regex = /https:\/\/www.youtube.com\/*/;
          const ytTabs = Array.from(tabs)
          .filter(tab => regex.test(tab.url));
          ytTabs.forEach(tab => {
            blockContent(tab.id, tab.url, newData.settings.allowedVideos, newData.settings.allowedPlaylists);
          });
        });
      }
      ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(field => {
        sendStateToContent(newData.settings[field], field);
      });
    });
  });
})();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.url && YT_REGEX.test(changeInfo.url)) {
    const videoRegex = /https:\/\/www.youtube.com\/watch*/;
    getStorage('settings', function(data) {
      if (videoRegex.test(changeInfo.url)) {
        ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(field => {
          chrome.tabs.sendMessage( tabId, { action: 'hideField', value: data.settings[field], field });
        });
      }
      updateStorageInfoMsg(tabId, changeInfo.url, data.settings.allowedVideos, data.settings.allowedPlaylists);

      if (data.settings.enableContentBlocking) {
        blockContent(tabId, changeInfo.url, data.settings.allowedVideos, data.settings.allowedPlaylists);
      }
  });

  }
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.settings) {
    const { oldValue, newValue } = changes.settings;
    if (oldValue && newValue) {
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
    }
  }
});

function ensureSettings(data, callback) {
  let prevSettings = data.settings || {};
  let videoStorage = data.videoStorage || {};
  let plStorage = data.plStorage || {};

  let { hideRelated, hideComments, hideEndScreen, enableContentBlocking, allowedVideos, allowedPlaylists } = prevSettings;

  hideRelated = Boolean(hideRelated);
  hideComments = Boolean(hideComments);
  hideEndScreen = Boolean(hideEndScreen);
  enableContentBlocking = Boolean(enableContentBlocking);
  allowedVideos = allowedVideos === undefined ? [] : allowedVideos;
  allowedPlaylists = allowedPlaylists === undefined ? [] : allowedPlaylists;
  videoStorage = videoStorage === undefined ? {} : videoStorage;
  plStorage = plStorage === undefined ? {} : plStorage;
  const settings = { hideRelated, hideComments, hideEndScreen, enableContentBlocking, allowedVideos, allowedPlaylists };
  //update storage use to new set function
  let newData = {};
  setStorage('settings', { settings }).then(data => {
    newData = Object.assign(newData, data);
    return setStorage('plStorage', { plStorage });
  }).then(data => {
    newData = Object.assign(newData, data);
    return setStorage('videoStorage', { videoStorage });
  }).then(data => {
    newData = Object.assign(newData, data);
    callback(newData);
  });
  //check to makesure this works!
}

function updateStorageInfoMsg(tabId, url, allowedVideos, allowedPlaylists) {
  const { isPL, PlID, isVid, vidID, notYt } = vidOrPL(url);
  if ( isPL && isVid) {
    if (allowedVideos.includes(vidID) || allowedPlaylists.includes(PlID)) {
      chrome.tabs.sendMessage(tabId, { action: 'gatherPLInfo2' });
    }
  } else if (isPL) {
    if (allowedPlaylists.includes(PlID)) {
      chrome.tabs.sendMessage(tabId, { action: 'gatherPLInfo' });
    }
  } else if (isVid) {
    if (allowedVideos.includes(vidID)) {
      chrome.tabs.sendMessage(tabId, { action: 'gatherVideoInfo' });
    }

  }
}

function sendStateToContent(value, field, tabId) {
  var message = { action: 'hideField', value, field };
  if (tabId) {
    chrome.tabs.sendMessage(tabId, message);
  }
  chrome.tabs.query({}, function(tabs) {
    Array.from(tabs)
    .forEach(tab => chrome.tabs.sendMessage(tab.id, message));
  });
}

function blockContent(tabId, url, allowedVideos, allowedPlaylists) {
  const { isPL, PlID, isVid, vidID, notYt } = vidOrPL(url);
  const pageIsntAllowed = (((isVid && !isPL) && !allowedVideos.includes(vidID)) || (isPL && !allowedPlaylists.includes(PlID)) || (!isVid && !isPL && !notYt));
  if (pageIsntAllowed) {
    chrome.tabs.update(tabId, {url: 'not_available/not_available.html'});
  }
}
