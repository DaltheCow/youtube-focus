import { getStorage, setStorage, getStorageAll } from "../modules/storage";
import { YT_REGEX, AUTOPLAY_CANCEL_ELEMENT } from "../constants";
import { vidOrPL } from "../util";

// chrome.storage.sync.clear(() => console.log("cleared"));
// chrome.contextMenus.create({
//   title: "You seein this?",
//   contexts: ["all"],
//   onclick: () => alert('hi')
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const tabId = sender.tab.id,
    url = sender.tab.url;
  switch(request.action) {
    case 'showPageAction': {
      // need to turn it off when navigating to non valid page, maybe in on tabs updated
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
          const isVidOrPl = vidOrPL(tabs[0].url);
          if (isVidOrPl.isPL || isVidOrPl.isVid) {
            chrome.pageAction.show(tabs[0].id);
          }
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
          sendStateToContent('hideField', data.settings[field], field, tabId);
        });
        ['disableAutoplay'].forEach(field => {
          const properties = { element: AUTOPLAY_CANCEL_ELEMENT, makeClick: data.settings[field], timer: 1000 };
          sendStateToContent('continuousClick', properties, undefined, tabId);
        })
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
              setStorage('plStorage', { plStorage: newPLStorage });
              setStorage('videoStorage', { videoStorage: newVideoStorage });
              break;
            }
            case 'receiveVideo': {
              let newVideoStorage = Object.assign({}, videoStorage);
              newVideoStorage[vidID] = newVideoStorage[vidID] || {};
              newVideoStorage[vidID] = Object.assign({}, videoStorage[vidID], info);
              setStorage('videoStorage', { videoStorage: newVideoStorage });
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

chrome.contextMenus.create({
  "title": "Add Playlist",
  "contexts": ["page"],
  "id": "plPage",
  "documentUrlPatterns": ["https://www.youtube.com/playlist*", "https://www.youtube.com/watch*list=*"]
});
chrome.contextMenus.create({
  "title": "Add Video",
  "contexts": ["page"],
  "id": "videoPage",
  "documentUrlPatterns": ["https://www.youtube.com/watch*"]
});
chrome.contextMenus.create({
  "title": "Add Video",
  "contexts": ["link"],
  "id": "videoLink",
  "targetUrlPatterns": ["https://www.youtube.com/watch*"]
});
chrome.contextMenus.create({
  "title": "Add Playlist",
  "contexts": ["link"],
  "id": "plLink",
  "targetUrlPatterns": ["https://www.youtube.com/playlist*", "https://www.youtube.com/watch*list=*"]
});

chrome.contextMenus.onClicked.addListener(addVidOrPl);

function addVidOrPl(e, tab) {
  let url = e.linkUrl || e.pageUrl;
  getStorage('settings', data => {
    let { allowedVideos, allowedPlaylists } = data.settings;
    
    const { isPL, PlID, isVid, vidID } = vidOrPL(url);

    if (isPL && !allowedPlaylists.includes(PlID)) {
      allowedPlaylists = allowedPlaylists.concat(PlID);
    }
    if (!isPL && isVid && !allowedVideos.includes(vidID)) {
      allowedVideos = allowedVideos.concat(vidID);
    }
    if (isPL || isVid) {
      const settings = Object.assign({}, data.settings, { allowedVideos, allowedPlaylists });
      chrome.storage.sync.set({ settings });
      // !e.linkUrl implies that you are on the page for the vid or pl you are adding so info can be grabbed

      // if I want to get video and playlist titles when the link clicked is the way the video was added then I need to do a deep dive on the content page and it could be a pain.
      let action;
      if (!e.linkUrl) {
        if (isPL && isVid) {
          action = 'gatherPLInfo2';
        } else {
          action = isPL ? 'gatherPLInfo' : 'gatherVideoInfo';
        }
        chrome.tabs.sendMessage(tab.id, { action });
      } else {
        action = "getTitle";
        chrome.tabs.sendMessage(tab.id, { action, targetUrl: url });
      }
    }
  });
}

chrome.tabs.query({}, function(tabs) {
  const regex = /https:\/\/www.youtube.com\/*/;
  const ytTabs = Array.from(tabs)
  .filter(tab => regex.test(tab.url));
  ytTabs.forEach(tab => {
    chrome.pageAction.show(tab.id);
  });
});

(function() {
  getStorageAll(['settings', 'videoStorage', 'plStorage'])
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
        sendStateToContent("hideField", newData.settings[field], field);
      });
      ['disableAutoplay'].forEach(field => {
        const properties = { element: AUTOPLAY_CANCEL_ELEMENT, makeClick: data.settings[field], timer: 1000 };
        sendStateToContent('continuousClick', properties);
      });
    });
  });
})();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.url && YT_REGEX.test(changeInfo.url)) {
    // make sure the pop up is only available for the correct pages
    const info = vidOrPL(changeInfo.url);
    if (info.isPL || info.isVid) {
      chrome.pageAction.show(tabId);
    } else {
      chrome.pageAction.hide(tabId);
    }
    
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
      const {
        enableContentBlocking: oEnableContentBlocking,
        allowedVideos: oAllowedVideos,
        allowedPlaylists: oAllowedPlaylists,
        hideEndScreen: oHideEndScreen,
        hideRelated: oHideRelated,
        hideComments: oHideComments,
        disableAutoplay: oDisableAutoplay
      } = oldValue;
      const {
        enableContentBlocking: nEnableContentBlocking,
        allowedVideos: nAllowedVideos,
        allowedPlaylists: nAllowedPlaylists,
        hideEndScreen: nHideEndScreen,
        hideRelated: nHideRelated,
        hideComments: nHideComments,
        disableAutoplay: nDisableAutoplay,
      } = newValue;
      const blockEnabled = !oEnableContentBlocking && nEnableContentBlocking,
            vidRemoved = oAllowedVideos.length > nAllowedVideos.length,
            plRemoved = oAllowedPlaylists.length > nAllowedPlaylists.length,
            blockVids = (blockEnabled) || (nEnableContentBlocking && (vidRemoved || plRemoved));
      if (oHideRelated !== nHideRelated) {
        sendStateToContent("hideField", nHideRelated, 'hideRelated');
      } else if (oHideComments !== nHideComments) {
        sendStateToContent("hideField", nHideComments, 'hideComments');
      } else if (oHideEndScreen !== nHideEndScreen) {
        sendStateToContent("hideField", nHideEndScreen, 'hideEndScreen');
      } else if (oDisableAutoplay !== nDisableAutoplay) {
        
        const properties = { element: AUTOPLAY_CANCEL_ELEMENT, makeClick: data.settings[field], timer: 1000 };
        sendStateToContent('continuousClick', properties);
      } else if (blockVids) {
        chrome.tabs.query({}, function(tabs) {
          Array.from(tabs).filter(tab => YT_REGEX.test(tab.url)).forEach(tab => {
            blockContent(tab.id, tab.url, nAllowedVideos, nAllowedPlaylists);
          });
        });
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
  disableAutoplay = Boolean(disableAutoplay);
  enableContentBlocking = Boolean(enableContentBlocking);
  allowedVideos = allowedVideos === undefined ? [] : allowedVideos;
  allowedPlaylists = allowedPlaylists === undefined ? [] : allowedPlaylists;
  videoStorage = videoStorage === undefined ? {} : videoStorage;
  plStorage = plStorage === undefined ? {} : plStorage;
  const settings = { hideRelated, hideComments, hideEndScreen, disableAutoplay, enableContentBlocking, allowedVideos, allowedPlaylists };
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

function logToContent(text) {
  const message = { action: 'log', message: text };
  chrome.tabs.query({}, function(tabs) {
    Array.from(tabs)
    .forEach(tab => chrome.tabs.sendMessage(tab.id, message));
  });
}

function sendStateToContent(action, value, field, tabId) {
  var message = { action, value, field };
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
