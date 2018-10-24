/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 32);
/******/ })
/************************************************************************/
/******/ ({

/***/ 26:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const getStorage = (key, callback) => {
  const storage = (key === 'settings' ? chrome.storage.sync : chrome.storage.local);
  let promise = new Promise(resolve => {
    storage.get(key, (data) => resolve(data));
  });
  return (callback ? promise.then(callback) : promise);
};
/* harmony export (immutable) */ __webpack_exports__["getStorage"] = getStorage;


const setStorage = (key, object, callback) => {
  const storage = (key === 'settings' ? chrome.storage.sync : chrome.storage.local);
  let promise = new Promise(resolve => {
    storage.set(object, () => {
      storage.get(key, data => {
        return resolve(data);
      });
    });
  });
  return (callback ? promise.then(callback) : promise);
};
/* harmony export (immutable) */ __webpack_exports__["setStorage"] = setStorage;


const getStorageAll = (keys, callback) => {
  const storagesKeys = keys.map(key => {
    return { key, storage: chrome.storage[(key === 'settings' ? 'sync' : 'local')] };
  });
  let promise = Promise.all(storagesKeys.map(storageKey => {
    const { storage, key } = storageKey;
    return new Promise(resolve => {
      storage.get(key, (data) => resolve(data));
    });
  })).then(res => {
    const data = {};
    res.forEach((item, idx) => data[keys[idx]] = item[keys[idx]]);
    return data;
  });
  return (callback ? promise.then(callback) : promise);
};
/* harmony export (immutable) */ __webpack_exports__["getStorageAll"] = getStorageAll;


// need a function that gets as many objects as given keys for async so that i have access to everything without promises


/***/ }),

/***/ 32:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_storage__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__constants__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(35);




// chrome.storage.sync.clear(() => console.log("hi"));

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const tabId = sender.tab.id,
    url = sender.tab.url;
  switch(request.action) {
    case 'showPageAction': {
      // need to turn it off when navigating to non valid page, maybe in on tabs updated
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const isVidOrPl = Object(__WEBPACK_IMPORTED_MODULE_2__util__["vidOrPL"])(tabs[0].url);
        if (isVidOrPl.isPL || isVidOrPl.isVid) {
          chrome.pageAction.show(tabs[0].id);
        }
      });
      const isVidOrPl = Object(__WEBPACK_IMPORTED_MODULE_2__util__["vidOrPL"])(url);
      if (isVidOrPl.isPL || isVidOrPl.isVid) {
        chrome.pageAction.show(tabId);
      }

      break;
    }
    case 'getState': {
      chrome.storage.sync.get('settings', function(data) {
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
      const { isPL, PlID, isVid, vidID } = Object(__WEBPACK_IMPORTED_MODULE_2__util__["vidOrPL"])(url);
        chrome.storage.sync.get('settings', function(data) {
          let { plStorage, videoStorage } = data.settings;
          switch(type) {
            case 'receivePL': {
              let newPLStorage = Object.assign({}, plStorage);
              newPLStorage[PlID] = newPLStorage[PlID] || {};
              newPLStorage[PlID] = Object.assign({}, plStorage[PlID], info);
              const settings = Object.assign({}, data.settings, { plStorage: newPLStorage });
              console.log(JSON.stringify(settings).length);
              console.log(settings);
              chrome.storage.sync.set({ settings });
              break;
            }
            case 'receivePL2': {
              let newPLStorage = Object.assign({}, plStorage);
              let newVideoStorage = Object.assign({}, videoStorage);
              newPLStorage[PlID] = Object.assign({}, newPLStorage[PlID], plInfo);
              newVideoStorage[vidID] = Object.assign({}, newVideoStorage[vidID], vidInfo);
              const settings = Object.assign({}, data.settings, { plStorage: newPLStorage, videoStorage: newVideoStorage });
              chrome.storage.sync.set({ settings });
              break;
            }
            case 'receiveVideo': {
              let newVideoStorage = Object.assign({}, videoStorage);
              newVideoStorage[vidID] = newVideoStorage[vidID] || {};
              newVideoStorage[vidID] = Object.assign({}, videoStorage[vidID], info);
              const settings = Object.assign({}, data.settings, { videoStorage: newVideoStorage });
              chrome.storage.sync.set({ settings });
            }
          }
        });
      break;
    }
    case 'log': {
      console.log(request);
    }
    case 'testing': {
      console.log('inleeeeeeeeee');
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
  let data = {};
  Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["getStorage"])('settings')
  .then(settingsData => {
    data = Object.assign(data, settingsData);
    return Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["getStorage"])('videoStorage');
  })
  .then(videoStorageData => {
    data = Object.assign(data, videoStorageData);
    return Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["getStorage"])('plStorage');
  })
  .then(plStorageData => {
    data = Object.assign(data, plStorageData);
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
  if (changeInfo.url && __WEBPACK_IMPORTED_MODULE_1__constants__["YT_REGEX"].test(changeInfo.url)) {
    const videoRegex = /https:\/\/www.youtube.com\/watch*/;
    chrome.storage.sync.get('settings', function(data) {
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
  Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["setStorage"])('settings', { settings }).then(data => {
    newData = Object.assign(newData, data);
    return Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["setStorage"])('plStorage', { plStorage });
  }).then(data => {
    newData = Object.assign(newData, data);
    return Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["setStorage"])('videoStorage', { videoStorage });
  }).then(data => {
    newData = Object.assign(newData, data);
    callback(newData);
  });
  //check to makesure this works!
}

function updateStorageInfoMsg(tabId, url, allowedVideos, allowedPlaylists) {
  const { isPL, PlID, isVid, vidID, notYt } = Object(__WEBPACK_IMPORTED_MODULE_2__util__["vidOrPL"])(url);
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
  const { isPL, PlID, isVid, vidID, notYt } = Object(__WEBPACK_IMPORTED_MODULE_2__util__["vidOrPL"])(url);
  const pageIsntAllowed = (((isVid && !isPL) && !allowedVideos.includes(vidID)) || (isPL && !allowedPlaylists.includes(PlID)) || (!isVid && !isPL && !notYt));
  if (pageIsntAllowed) {
    chrome.tabs.update(tabId, {url: 'not_available/not_available.html'});
  }
}


/***/ }),

/***/ 34:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const YT_REGEX = /https:\/\/www.youtube.com\/*/;
/* harmony export (immutable) */ __webpack_exports__["YT_REGEX"] = YT_REGEX;


const VID_PL_REGEX = /https:\/\/www\.youtube\.com\/(playlist\?list=(.+))?(watch\?v=([A-Za-z0-9_-]{11}))?(&t=[^&]+)?(&index[^&]+)?(&list=([^&]+)?)?(&.*)?/;
/* harmony export (immutable) */ __webpack_exports__["VID_PL_REGEX"] = VID_PL_REGEX;



/***/ }),

/***/ 35:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(34);


const vidOrPL = (url) => {
  const res = url.match(__WEBPACK_IMPORTED_MODULE_0__constants__["VID_PL_REGEX"]);
  return { isPL: Boolean(res[1] || res[7]),
           PlID: res[2] || res[8],
           isVid: Boolean((res[3] && res[4])),
           vidID: res[4] };
};
/* harmony export (immutable) */ __webpack_exports__["vidOrPL"] = vidOrPL;



/***/ })

/******/ });
//# sourceMappingURL=background.js.map