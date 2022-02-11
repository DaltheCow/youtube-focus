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
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ({

/***/ 19:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return YT_REGEX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return VID_PL_REGEX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AUTOPLAY_CANCEL_ELEMENT; });
var YT_REGEX = /https:\/\/www.youtube.com\/*/;
var VID_PL_REGEX = /https:\/\/www\.youtube\.com\/(playlist\?list=(.+))?(watch\?v=([A-Za-z0-9_-]{11}))?(&t=[^&]+)?(&index[^&]+)?(&list=([^&]+)?)?(&.*)?/;
var AUTOPLAY_CANCEL_ELEMENT = ".ytp-autonav-endscreen-upnext-button.ytp-autonav-endscreen-upnext-cancel-button";

/***/ }),

/***/ 20:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return vidOrPL; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(19);

var vidOrPL = function vidOrPL(url) {
  var res = url.match(__WEBPACK_IMPORTED_MODULE_0__constants__["b" /* VID_PL_REGEX */]);
  return {
    isPL: Boolean(res[1] || res[7]),
    PlID: res[2] || res[8],
    isVid: Boolean(res[3] && res[4]),
    vidID: res[4]
  };
};

/***/ }),

/***/ 28:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_storage__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__constants__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(20);


 // chrome.storage.sync.clear(() => console.log("cleared"));
// chrome.contextMenus.create({
//   title: "You seein this?",
//   contexts: ["all"],
//   onclick: () => alert('hi')
// });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var tabId = sender.tab.id,
      url = sender.tab.url;

  switch (request.action) {
    case 'showPageAction':
      {
        // need to turn it off when navigating to non valid page, maybe in on tabs updated
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function (tabs) {
          if (tabs.length > 0) {
            var _isVidOrPl = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(tabs[0].url);

            if (_isVidOrPl.isPL || _isVidOrPl.isVid) {
              chrome.pageAction.show(tabs[0].id);
            }
          }
        });
        var isVidOrPl = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(url);

        if (isVidOrPl.isPL || isVidOrPl.isVid) {
          chrome.pageAction.show(tabId);
        }

        break;
      }

    case 'getState':
      {
        Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["a" /* getStorage */])('settings', function (data) {
          if (data.settings.enableContentBlocking) {
            blockContent(tabId, url, data.settings.allowedVideos, data.settings.allowedPlaylists);
          }

          updateStorageInfoMsg(tabId, url, data.settings.allowedVideos, data.settings.allowedPlaylists);
          ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(function (field) {
            sendStateToContent('hideField', data.settings[field], field, tabId);
          });
          ['disableAutoplay'].forEach(function (field) {
            var properties = {
              element: __WEBPACK_IMPORTED_MODULE_1__constants__["a" /* AUTOPLAY_CANCEL_ELEMENT */],
              makeClick: data.settings[field],
              timer: 1000
            };
            sendStateToContent('continuousClick', properties, undefined, tabId);
          });
        });
        break;
      }
    //figure out how to deal with incoming message with ytInfo from window

    case 'receiveStorageInfo':
      {
        var _url = request.url,
            type = request.type,
            vidInfo = request.vidInfo,
            plInfo = request.plInfo,
            info = request.info;

        var _vidOrPL = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(_url),
            isPL = _vidOrPL.isPL,
            PlID = _vidOrPL.PlID,
            isVid = _vidOrPL.isVid,
            vidID = _vidOrPL.vidID;

        Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["a" /* getStorage */])(['plStorage', 'videoStorage'], function (data) {
          var plStorage = data.plStorage,
              videoStorage = data.videoStorage;

          switch (type) {
            case 'receivePL':
              {
                var newPLStorage = Object.assign({}, plStorage);
                newPLStorage[PlID] = newPLStorage[PlID] || {};
                newPLStorage[PlID] = Object.assign({}, plStorage[PlID], info);
                Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('plStorage', {
                  plStorage: newPLStorage
                });
                break;
              }

            case 'receivePL2':
              {
                var _newPLStorage = Object.assign({}, plStorage);

                var newVideoStorage = Object.assign({}, videoStorage);
                _newPLStorage[PlID] = Object.assign({}, _newPLStorage[PlID], plInfo);
                newVideoStorage[vidID] = Object.assign({}, newVideoStorage[vidID], vidInfo);
                Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('plStorage', {
                  plStorage: _newPLStorage
                });
                Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('videoStorage', {
                  videoStorage: newVideoStorage
                });
                break;
              }

            case 'receiveVideo':
              {
                var _newVideoStorage = Object.assign({}, videoStorage);

                _newVideoStorage[vidID] = _newVideoStorage[vidID] || {};
                _newVideoStorage[vidID] = Object.assign({}, videoStorage[vidID], info);
                Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('videoStorage', {
                  videoStorage: _newVideoStorage
                });
              }
          }
        });
        break;
      }

    case 'log':
      {
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
  var url = e.linkUrl || e.pageUrl;
  Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["a" /* getStorage */])('settings', function (data) {
    var _data$settings = data.settings,
        allowedVideos = _data$settings.allowedVideos,
        allowedPlaylists = _data$settings.allowedPlaylists;

    var _vidOrPL2 = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(url),
        isPL = _vidOrPL2.isPL,
        PlID = _vidOrPL2.PlID,
        isVid = _vidOrPL2.isVid,
        vidID = _vidOrPL2.vidID;

    if (isPL && !allowedPlaylists.includes(PlID)) {
      allowedPlaylists = allowedPlaylists.concat(PlID);
    }

    if (!isPL && isVid && !allowedVideos.includes(vidID)) {
      allowedVideos = allowedVideos.concat(vidID);
    }

    if (isPL || isVid) {
      var settings = Object.assign({}, data.settings, {
        allowedVideos: allowedVideos,
        allowedPlaylists: allowedPlaylists
      });
      chrome.storage.sync.set({
        settings: settings
      }); // !e.linkUrl implies that you are on the page for the vid or pl you are adding so info can be grabbed
      // if I want to get video and playlist titles when the link clicked is the way the video was added then I need to do a deep dive on the content page and it could be a pain.

      var action;

      if (!e.linkUrl) {
        if (isPL && isVid) {
          action = 'gatherPLInfo2';
        } else {
          action = isPL ? 'gatherPLInfo' : 'gatherVideoInfo';
        }

        chrome.tabs.sendMessage(tab.id, {
          action: action
        });
      } else {
        action = "getTitle";
        chrome.tabs.sendMessage(tab.id, {
          action: action,
          targetUrl: url
        });
      }
    }
  });
}

chrome.tabs.query({}, function (tabs) {
  var regex = /https:\/\/www.youtube.com\/*/;
  var ytTabs = Array.from(tabs).filter(function (tab) {
    return regex.test(tab.url);
  });
  ytTabs.forEach(function (tab) {
    chrome.pageAction.show(tab.id);
  });
});

(function () {
  Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["b" /* getStorageAll */])(['settings', 'videoStorage', 'plStorage']).then(function (data) {
    ensureSettings(data, function (newData) {
      if (newData.settings.enableContentBlocking) {
        chrome.tabs.query({}, function (tabs) {
          var regex = /https:\/\/www.youtube.com\/*/;
          var ytTabs = Array.from(tabs).filter(function (tab) {
            return regex.test(tab.url);
          });
          ytTabs.forEach(function (tab) {
            blockContent(tab.id, tab.url, newData.settings.allowedVideos, newData.settings.allowedPlaylists);
          });
        });
      }

      ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(function (field) {
        sendStateToContent("hideField", newData.settings[field], field);
      });
      ['disableAutoplay'].forEach(function (field) {
        var properties = {
          element: __WEBPACK_IMPORTED_MODULE_1__constants__["a" /* AUTOPLAY_CANCEL_ELEMENT */],
          makeClick: data.settings[field],
          timer: 1000
        };
        sendStateToContent('continuousClick', properties);
      });
    });
  });
})();

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url && __WEBPACK_IMPORTED_MODULE_1__constants__["c" /* YT_REGEX */].test(changeInfo.url)) {
    // make sure the pop up is only available for the correct pages
    var info = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(changeInfo.url);

    if (info.isPL || info.isVid) {
      chrome.pageAction.show(tabId);
    } else {
      chrome.pageAction.hide(tabId);
    }

    var videoRegex = /https:\/\/www.youtube.com\/watch*/;
    Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["a" /* getStorage */])('settings', function (data) {
      if (videoRegex.test(changeInfo.url)) {
        ['hideRelated', 'hideComments', 'hideEndScreen'].forEach(function (field) {
          chrome.tabs.sendMessage(tabId, {
            action: 'hideField',
            value: data.settings[field],
            field: field
          });
        });
      }

      updateStorageInfoMsg(tabId, changeInfo.url, data.settings.allowedVideos, data.settings.allowedPlaylists);

      if (data.settings.enableContentBlocking) {
        blockContent(tabId, changeInfo.url, data.settings.allowedVideos, data.settings.allowedPlaylists);
      }
    });
  }
});
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.settings) {
    var _changes$settings = changes.settings,
        oldValue = _changes$settings.oldValue,
        newValue = _changes$settings.newValue;

    if (oldValue && newValue) {
      var oEnableContentBlocking = oldValue.enableContentBlocking,
          oAllowedVideos = oldValue.allowedVideos,
          oAllowedPlaylists = oldValue.allowedPlaylists,
          oHideEndScreen = oldValue.hideEndScreen,
          oHideRelated = oldValue.hideRelated,
          oHideComments = oldValue.hideComments,
          oDisableAutoplay = oldValue.disableAutoplay;
      var nEnableContentBlocking = newValue.enableContentBlocking,
          nAllowedVideos = newValue.allowedVideos,
          nAllowedPlaylists = newValue.allowedPlaylists,
          nHideEndScreen = newValue.hideEndScreen,
          nHideRelated = newValue.hideRelated,
          nHideComments = newValue.hideComments,
          nDisableAutoplay = newValue.disableAutoplay;
      var blockEnabled = !oEnableContentBlocking && nEnableContentBlocking,
          vidRemoved = oAllowedVideos.length > nAllowedVideos.length,
          plRemoved = oAllowedPlaylists.length > nAllowedPlaylists.length,
          blockVids = blockEnabled || nEnableContentBlocking && (vidRemoved || plRemoved);

      if (oHideRelated !== nHideRelated) {
        sendStateToContent("hideField", nHideRelated, 'hideRelated');
      } else if (oHideComments !== nHideComments) {
        sendStateToContent("hideField", nHideComments, 'hideComments');
      } else if (oHideEndScreen !== nHideEndScreen) {
        sendStateToContent("hideField", nHideEndScreen, 'hideEndScreen');
      } else if (oDisableAutoplay !== nDisableAutoplay) {
        var properties = {
          element: __WEBPACK_IMPORTED_MODULE_1__constants__["a" /* AUTOPLAY_CANCEL_ELEMENT */],
          makeClick: data.settings[field],
          timer: 1000
        };
        sendStateToContent('continuousClick', properties);
      } else if (blockVids) {
        chrome.tabs.query({}, function (tabs) {
          Array.from(tabs).filter(function (tab) {
            return __WEBPACK_IMPORTED_MODULE_1__constants__["c" /* YT_REGEX */].test(tab.url);
          }).forEach(function (tab) {
            blockContent(tab.id, tab.url, nAllowedVideos, nAllowedPlaylists);
          });
        });
      }
    }
  }
});

function ensureSettings(data, callback) {
  var prevSettings = data.settings || {};
  var videoStorage = data.videoStorage || {};
  var plStorage = data.plStorage || {};
  var hideRelated = prevSettings.hideRelated,
      hideComments = prevSettings.hideComments,
      hideEndScreen = prevSettings.hideEndScreen,
      enableContentBlocking = prevSettings.enableContentBlocking,
      allowedVideos = prevSettings.allowedVideos,
      allowedPlaylists = prevSettings.allowedPlaylists;
  hideRelated = Boolean(hideRelated);
  hideComments = Boolean(hideComments);
  hideEndScreen = Boolean(hideEndScreen);
  disableAutoplay = Boolean(disableAutoplay);
  enableContentBlocking = Boolean(enableContentBlocking);
  allowedVideos = allowedVideos === undefined ? [] : allowedVideos;
  allowedPlaylists = allowedPlaylists === undefined ? [] : allowedPlaylists;
  videoStorage = videoStorage === undefined ? {} : videoStorage;
  plStorage = plStorage === undefined ? {} : plStorage;
  var settings = {
    hideRelated: hideRelated,
    hideComments: hideComments,
    hideEndScreen: hideEndScreen,
    disableAutoplay: disableAutoplay,
    enableContentBlocking: enableContentBlocking,
    allowedVideos: allowedVideos,
    allowedPlaylists: allowedPlaylists
  }; //update storage use to new set function

  var newData = {};
  Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('settings', {
    settings: settings
  }).then(function (data) {
    newData = Object.assign(newData, data);
    return Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('plStorage', {
      plStorage: plStorage
    });
  }).then(function (data) {
    newData = Object.assign(newData, data);
    return Object(__WEBPACK_IMPORTED_MODULE_0__modules_storage__["c" /* setStorage */])('videoStorage', {
      videoStorage: videoStorage
    });
  }).then(function (data) {
    newData = Object.assign(newData, data);
    callback(newData);
  }); //check to makesure this works!
}

function updateStorageInfoMsg(tabId, url, allowedVideos, allowedPlaylists) {
  var _vidOrPL3 = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(url),
      isPL = _vidOrPL3.isPL,
      PlID = _vidOrPL3.PlID,
      isVid = _vidOrPL3.isVid,
      vidID = _vidOrPL3.vidID,
      notYt = _vidOrPL3.notYt;

  if (isPL && isVid) {
    if (allowedVideos.includes(vidID) || allowedPlaylists.includes(PlID)) {
      chrome.tabs.sendMessage(tabId, {
        action: 'gatherPLInfo2'
      });
    }
  } else if (isPL) {
    if (allowedPlaylists.includes(PlID)) {
      chrome.tabs.sendMessage(tabId, {
        action: 'gatherPLInfo'
      });
    }
  } else if (isVid) {
    if (allowedVideos.includes(vidID)) {
      chrome.tabs.sendMessage(tabId, {
        action: 'gatherVideoInfo'
      });
    }
  }
}

function logToContent(text) {
  var message = {
    action: 'log',
    message: text
  };
  chrome.tabs.query({}, function (tabs) {
    Array.from(tabs).forEach(function (tab) {
      return chrome.tabs.sendMessage(tab.id, message);
    });
  });
}

function sendStateToContent(action, value, field, tabId) {
  var message = {
    action: action,
    value: value,
    field: field
  };

  if (tabId) {
    chrome.tabs.sendMessage(tabId, message);
  }

  chrome.tabs.query({}, function (tabs) {
    Array.from(tabs).forEach(function (tab) {
      return chrome.tabs.sendMessage(tab.id, message);
    });
  });
}

function blockContent(tabId, url, allowedVideos, allowedPlaylists) {
  var _vidOrPL4 = Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* vidOrPL */])(url),
      isPL = _vidOrPL4.isPL,
      PlID = _vidOrPL4.PlID,
      isVid = _vidOrPL4.isVid,
      vidID = _vidOrPL4.vidID,
      notYt = _vidOrPL4.notYt;

  var pageIsntAllowed = isVid && !isPL && !allowedVideos.includes(vidID) || isPL && !allowedPlaylists.includes(PlID) || !isVid && !isPL && !notYt;

  if (pageIsntAllowed) {
    chrome.tabs.update(tabId, {
      url: 'not_available/not_available.html'
    });
  }
}

/***/ }),

/***/ 4:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getStorage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return setStorage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getStorageAll; });
var getStorage = function getStorage(key, callback) {
  var storage = key === 'settings' ? chrome.storage.sync : chrome.storage.local;
  var promise = new Promise(function (resolve) {
    storage.get(key, function (data) {
      return resolve(data);
    });
  });
  return callback ? promise.then(callback) : promise;
};
var setStorage = function setStorage(key, object, callback) {
  var storage = key === 'settings' ? chrome.storage.sync : chrome.storage.local;
  var promise = new Promise(function (resolve) {
    storage.set(object, function () {
      storage.get(key, function (data) {
        return resolve(data);
      });
    });
  });
  return callback ? promise.then(callback) : promise;
};
var getStorageAll = function getStorageAll(keys, callback) {
  var storagesKeys = keys.map(function (key) {
    return {
      key: key,
      storage: chrome.storage[key === 'settings' ? 'sync' : 'local']
    };
  });
  var promise = Promise.all(storagesKeys.map(function (storageKey) {
    var storage = storageKey.storage,
        key = storageKey.key;
    return new Promise(function (resolve) {
      storage.get(key, function (data) {
        return resolve(data);
      });
    });
  })).then(function (res) {
    var data = {};
    res.forEach(function (item, idx) {
      return data[keys[idx]] = item[keys[idx]];
    });
    return data;
  });
  return callback ? promise.then(callback) : promise;
};

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjI2MzllZWExNjM2NDM1OTEyYzUiLCJ3ZWJwYWNrOi8vLy4vY29uc3RhbnRzLmpzIiwid2VicGFjazovLy8uL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vYmFja2dyb3VuZC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3N0b3JhZ2UuanMiXSwibmFtZXMiOlsiWVRfUkVHRVgiLCJWSURfUExfUkVHRVgiLCJBVVRPUExBWV9DQU5DRUxfRUxFTUVOVCIsInZpZE9yUEwiLCJyZXMiLCJ1cmwiLCJpc1BMIiwiQm9vbGVhbiIsIlBsSUQiLCJpc1ZpZCIsInZpZElEIiwiY2hyb21lIiwidGFiSWQiLCJzZW5kZXIiLCJyZXF1ZXN0IiwiYWN0aXZlIiwiY3VycmVudFdpbmRvdyIsInRhYnMiLCJpc1ZpZE9yUGwiLCJnZXRTdG9yYWdlIiwiZGF0YSIsImJsb2NrQ29udGVudCIsInVwZGF0ZVN0b3JhZ2VJbmZvTXNnIiwic2VuZFN0YXRlVG9Db250ZW50IiwicHJvcGVydGllcyIsImVsZW1lbnQiLCJtYWtlQ2xpY2siLCJ0aW1lciIsInR5cGUiLCJ2aWRJbmZvIiwicGxJbmZvIiwiaW5mbyIsInBsU3RvcmFnZSIsInZpZGVvU3RvcmFnZSIsIm5ld1BMU3RvcmFnZSIsIk9iamVjdCIsInNldFN0b3JhZ2UiLCJuZXdWaWRlb1N0b3JhZ2UiLCJjb25zb2xlIiwiZSIsImFsbG93ZWRWaWRlb3MiLCJhbGxvd2VkUGxheWxpc3RzIiwic2V0dGluZ3MiLCJhY3Rpb24iLCJ0YWIiLCJ0YXJnZXRVcmwiLCJyZWdleCIsInl0VGFicyIsImdldFN0b3JhZ2VBbGwiLCJlbnN1cmVTZXR0aW5ncyIsIm5ld0RhdGEiLCJjaGFuZ2VJbmZvIiwidmlkZW9SZWdleCIsInZhbHVlIiwiZmllbGQiLCJjaGFuZ2VzIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsIm9FbmFibGVDb250ZW50QmxvY2tpbmciLCJvQWxsb3dlZFZpZGVvcyIsIm9BbGxvd2VkUGxheWxpc3RzIiwib0hpZGVFbmRTY3JlZW4iLCJvSGlkZVJlbGF0ZWQiLCJvSGlkZUNvbW1lbnRzIiwib0Rpc2FibGVBdXRvcGxheSIsIm5FbmFibGVDb250ZW50QmxvY2tpbmciLCJuQWxsb3dlZFZpZGVvcyIsIm5BbGxvd2VkUGxheWxpc3RzIiwibkhpZGVFbmRTY3JlZW4iLCJuSGlkZVJlbGF0ZWQiLCJuSGlkZUNvbW1lbnRzIiwibkRpc2FibGVBdXRvcGxheSIsImJsb2NrRW5hYmxlZCIsInZpZFJlbW92ZWQiLCJwbFJlbW92ZWQiLCJibG9ja1ZpZHMiLCJBcnJheSIsInByZXZTZXR0aW5ncyIsImhpZGVSZWxhdGVkIiwiaGlkZUNvbW1lbnRzIiwiaGlkZUVuZFNjcmVlbiIsImVuYWJsZUNvbnRlbnRCbG9ja2luZyIsImRpc2FibGVBdXRvcGxheSIsImNhbGxiYWNrIiwibm90WXQiLCJtZXNzYWdlIiwidGV4dCIsInBhZ2VJc250QWxsb3dlZCIsInN0b3JhZ2UiLCJrZXkiLCJwcm9taXNlIiwicmVzb2x2ZSIsInN0b3JhZ2VzS2V5cyIsInN0b3JhZ2VLZXkiLCJrZXlzIiwiaXRlbSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM3RE8sSUFBTUEsUUFBUSxHQUFkO0FBRUEsSUFBTUMsWUFBWSxHQUFsQjtBQUVBLElBQU1D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QUFIQSxRQUFZO0FBQUEsYUFBZWdCLElBQUksQ0FBQzBFLElBQUksQ0FBVDFFLEdBQVMsQ0FBTCxDQUFKQSxHQUFrQjJFLElBQUksQ0FBQ0QsSUFBSSxDQUExQyxHQUEwQyxDQUFMLENBQXJDO0FBQVoxRjtBQUNBO0FBUkYsR0FBYyxDQUFkO0FBVUEsU0FBUStFLFFBQVEsR0FBR08sT0FBTyxDQUFQQSxLQUFILFFBQUdBLENBQUgsR0FBaEI7QUFkSyxFIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAyOCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNjI2MzllZWExNjM2NDM1OTEyYzUiLCJleHBvcnQgY29uc3QgWVRfUkVHRVggPSAvaHR0cHM6XFwvXFwvd3d3LnlvdXR1YmUuY29tXFwvKi87XG5cbmV4cG9ydCBjb25zdCBWSURfUExfUkVHRVggPSAvaHR0cHM6XFwvXFwvd3d3XFwueW91dHViZVxcLmNvbVxcLyhwbGF5bGlzdFxcP2xpc3Q9KC4rKSk/KHdhdGNoXFw/dj0oW0EtWmEtejAtOV8tXXsxMX0pKT8oJnQ9W14mXSspPygmaW5kZXhbXiZdKyk/KCZsaXN0PShbXiZdKyk/KT8oJi4qKT8vO1xuXG5leHBvcnQgY29uc3QgQVVUT1BMQVlfQ0FOQ0VMX0VMRU1FTlQgPSBcIi55dHAtYXV0b25hdi1lbmRzY3JlZW4tdXBuZXh0LWJ1dHRvbi55dHAtYXV0b25hdi1lbmRzY3JlZW4tdXBuZXh0LWNhbmNlbC1idXR0b25cIjtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9jb25zdGFudHMuanMiLCJpbXBvcnQgeyBWSURfUExfUkVHRVggfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuZXhwb3J0IGNvbnN0IHZpZE9yUEwgPSAodXJsKSA9PiB7XG4gIGNvbnN0IHJlcyA9IHVybC5tYXRjaChWSURfUExfUkVHRVgpO1xuICByZXR1cm4geyBpc1BMOiBCb29sZWFuKHJlc1sxXSB8fCByZXNbN10pLFxuICAgICAgICAgICBQbElEOiByZXNbMl0gfHwgcmVzWzhdLFxuICAgICAgICAgICBpc1ZpZDogQm9vbGVhbigocmVzWzNdICYmIHJlc1s0XSkpLFxuICAgICAgICAgICB2aWRJRDogcmVzWzRdIH07XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vdXRpbC5qcyIsImltcG9ydCB7IGdldFN0b3JhZ2UsIHNldFN0b3JhZ2UsIGdldFN0b3JhZ2VBbGwgfSBmcm9tIFwiLi4vbW9kdWxlcy9zdG9yYWdlXCI7XG5pbXBvcnQgeyBZVF9SRUdFWCwgQVVUT1BMQVlfQ0FOQ0VMX0VMRU1FTlQgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyB2aWRPclBMIH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuLy8gY2hyb21lLnN0b3JhZ2Uuc3luYy5jbGVhcigoKSA9PiBjb25zb2xlLmxvZyhcImNsZWFyZWRcIikpO1xuLy8gY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xuLy8gICB0aXRsZTogXCJZb3Ugc2VlaW4gdGhpcz9cIixcbi8vICAgY29udGV4dHM6IFtcImFsbFwiXSxcbi8vICAgb25jbGljazogKCkgPT4gYWxlcnQoJ2hpJylcbi8vIH0pO1xuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgY29uc3QgdGFiSWQgPSBzZW5kZXIudGFiLmlkLFxuICAgIHVybCA9IHNlbmRlci50YWIudXJsO1xuICBzd2l0Y2gocmVxdWVzdC5hY3Rpb24pIHtcbiAgICBjYXNlICdzaG93UGFnZUFjdGlvbic6IHtcbiAgICAgIC8vIG5lZWQgdG8gdHVybiBpdCBvZmYgd2hlbiBuYXZpZ2F0aW5nIHRvIG5vbiB2YWxpZCBwYWdlLCBtYXliZSBpbiBvbiB0YWJzIHVwZGF0ZWRcbiAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgICAgIGlmICh0YWJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBpc1ZpZE9yUGwgPSB2aWRPclBMKHRhYnNbMF0udXJsKTtcbiAgICAgICAgICBpZiAoaXNWaWRPclBsLmlzUEwgfHwgaXNWaWRPclBsLmlzVmlkKSB7XG4gICAgICAgICAgICBjaHJvbWUucGFnZUFjdGlvbi5zaG93KHRhYnNbMF0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zdCBpc1ZpZE9yUGwgPSB2aWRPclBMKHVybCk7XG4gICAgICBpZiAoaXNWaWRPclBsLmlzUEwgfHwgaXNWaWRPclBsLmlzVmlkKSB7XG4gICAgICAgIGNocm9tZS5wYWdlQWN0aW9uLnNob3codGFiSWQpO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZ2V0U3RhdGUnOiB7XG4gICAgICBnZXRTdG9yYWdlKCdzZXR0aW5ncycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEuc2V0dGluZ3MuZW5hYmxlQ29udGVudEJsb2NraW5nKSB7XG4gICAgICAgICAgICBibG9ja0NvbnRlbnQodGFiSWQsIHVybCwgZGF0YS5zZXR0aW5ncy5hbGxvd2VkVmlkZW9zLCBkYXRhLnNldHRpbmdzLmFsbG93ZWRQbGF5bGlzdHMpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVN0b3JhZ2VJbmZvTXNnKHRhYklkLCB1cmwsIGRhdGEuc2V0dGluZ3MuYWxsb3dlZFZpZGVvcywgZGF0YS5zZXR0aW5ncy5hbGxvd2VkUGxheWxpc3RzKTtcbiAgICAgICAgWydoaWRlUmVsYXRlZCcsICdoaWRlQ29tbWVudHMnLCAnaGlkZUVuZFNjcmVlbiddLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgIHNlbmRTdGF0ZVRvQ29udGVudCgnaGlkZUZpZWxkJywgZGF0YS5zZXR0aW5nc1tmaWVsZF0sIGZpZWxkLCB0YWJJZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBbJ2Rpc2FibGVBdXRvcGxheSddLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7IGVsZW1lbnQ6IEFVVE9QTEFZX0NBTkNFTF9FTEVNRU5ULCBtYWtlQ2xpY2s6IGRhdGEuc2V0dGluZ3NbZmllbGRdLCB0aW1lcjogMTAwMCB9O1xuICAgICAgICAgIHNlbmRTdGF0ZVRvQ29udGVudCgnY29udGludW91c0NsaWNrJywgcHJvcGVydGllcywgdW5kZWZpbmVkLCB0YWJJZCk7XG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvL2ZpZ3VyZSBvdXQgaG93IHRvIGRlYWwgd2l0aCBpbmNvbWluZyBtZXNzYWdlIHdpdGggeXRJbmZvIGZyb20gd2luZG93XG4gICAgY2FzZSAncmVjZWl2ZVN0b3JhZ2VJbmZvJzoge1xuICAgICAgY29uc3QgeyB1cmwsIHR5cGUsIHZpZEluZm8sIHBsSW5mbywgaW5mbyB9ID0gcmVxdWVzdDtcbiAgICAgIGNvbnN0IHsgaXNQTCwgUGxJRCwgaXNWaWQsIHZpZElEIH0gPSB2aWRPclBMKHVybCk7XG4gICAgICAgIGdldFN0b3JhZ2UoWydwbFN0b3JhZ2UnLCAndmlkZW9TdG9yYWdlJ10sIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBsZXQgeyBwbFN0b3JhZ2UsIHZpZGVvU3RvcmFnZSB9ID0gZGF0YTtcbiAgICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmVjZWl2ZVBMJzoge1xuICAgICAgICAgICAgICBsZXQgbmV3UExTdG9yYWdlID0gT2JqZWN0LmFzc2lnbih7fSwgcGxTdG9yYWdlKTtcbiAgICAgICAgICAgICAgbmV3UExTdG9yYWdlW1BsSURdID0gbmV3UExTdG9yYWdlW1BsSURdIHx8IHt9O1xuICAgICAgICAgICAgICBuZXdQTFN0b3JhZ2VbUGxJRF0gPSBPYmplY3QuYXNzaWduKHt9LCBwbFN0b3JhZ2VbUGxJRF0sIGluZm8pO1xuICAgICAgICAgICAgICBzZXRTdG9yYWdlKCdwbFN0b3JhZ2UnLCB7IHBsU3RvcmFnZTogbmV3UExTdG9yYWdlIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ3JlY2VpdmVQTDInOiB7XG4gICAgICAgICAgICAgIGxldCBuZXdQTFN0b3JhZ2UgPSBPYmplY3QuYXNzaWduKHt9LCBwbFN0b3JhZ2UpO1xuICAgICAgICAgICAgICBsZXQgbmV3VmlkZW9TdG9yYWdlID0gT2JqZWN0LmFzc2lnbih7fSwgdmlkZW9TdG9yYWdlKTtcbiAgICAgICAgICAgICAgbmV3UExTdG9yYWdlW1BsSURdID0gT2JqZWN0LmFzc2lnbih7fSwgbmV3UExTdG9yYWdlW1BsSURdLCBwbEluZm8pO1xuICAgICAgICAgICAgICBuZXdWaWRlb1N0b3JhZ2VbdmlkSURdID0gT2JqZWN0LmFzc2lnbih7fSwgbmV3VmlkZW9TdG9yYWdlW3ZpZElEXSwgdmlkSW5mbyk7XG4gICAgICAgICAgICAgIHNldFN0b3JhZ2UoJ3BsU3RvcmFnZScsIHsgcGxTdG9yYWdlOiBuZXdQTFN0b3JhZ2UgfSk7XG4gICAgICAgICAgICAgIHNldFN0b3JhZ2UoJ3ZpZGVvU3RvcmFnZScsIHsgdmlkZW9TdG9yYWdlOiBuZXdWaWRlb1N0b3JhZ2UgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAncmVjZWl2ZVZpZGVvJzoge1xuICAgICAgICAgICAgICBsZXQgbmV3VmlkZW9TdG9yYWdlID0gT2JqZWN0LmFzc2lnbih7fSwgdmlkZW9TdG9yYWdlKTtcbiAgICAgICAgICAgICAgbmV3VmlkZW9TdG9yYWdlW3ZpZElEXSA9IG5ld1ZpZGVvU3RvcmFnZVt2aWRJRF0gfHwge307XG4gICAgICAgICAgICAgIG5ld1ZpZGVvU3RvcmFnZVt2aWRJRF0gPSBPYmplY3QuYXNzaWduKHt9LCB2aWRlb1N0b3JhZ2VbdmlkSURdLCBpbmZvKTtcbiAgICAgICAgICAgICAgc2V0U3RvcmFnZSgndmlkZW9TdG9yYWdlJywgeyB2aWRlb1N0b3JhZ2U6IG5ld1ZpZGVvU3RvcmFnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ2xvZyc6IHtcbiAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QpO1xuICAgIH1cbiAgfVxufSk7XG5cbmNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgXCJ0aXRsZVwiOiBcIkFkZCBQbGF5bGlzdFwiLFxuICBcImNvbnRleHRzXCI6IFtcInBhZ2VcIl0sXG4gIFwiaWRcIjogXCJwbFBhZ2VcIixcbiAgXCJkb2N1bWVudFVybFBhdHRlcm5zXCI6IFtcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3BsYXlsaXN0KlwiLCBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoKmxpc3Q9KlwiXVxufSk7XG5jaHJvbWUuY29udGV4dE1lbnVzLmNyZWF0ZSh7XG4gIFwidGl0bGVcIjogXCJBZGQgVmlkZW9cIixcbiAgXCJjb250ZXh0c1wiOiBbXCJwYWdlXCJdLFxuICBcImlkXCI6IFwidmlkZW9QYWdlXCIsXG4gIFwiZG9jdW1lbnRVcmxQYXR0ZXJuc1wiOiBbXCJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaCpcIl1cbn0pO1xuY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xuICBcInRpdGxlXCI6IFwiQWRkIFZpZGVvXCIsXG4gIFwiY29udGV4dHNcIjogW1wibGlua1wiXSxcbiAgXCJpZFwiOiBcInZpZGVvTGlua1wiLFxuICBcInRhcmdldFVybFBhdHRlcm5zXCI6IFtcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoKlwiXVxufSk7XG5jaHJvbWUuY29udGV4dE1lbnVzLmNyZWF0ZSh7XG4gIFwidGl0bGVcIjogXCJBZGQgUGxheWxpc3RcIixcbiAgXCJjb250ZXh0c1wiOiBbXCJsaW5rXCJdLFxuICBcImlkXCI6IFwicGxMaW5rXCIsXG4gIFwidGFyZ2V0VXJsUGF0dGVybnNcIjogW1wiaHR0cHM6Ly93d3cueW91dHViZS5jb20vcGxheWxpc3QqXCIsIFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2gqbGlzdD0qXCJdXG59KTtcblxuY2hyb21lLmNvbnRleHRNZW51cy5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoYWRkVmlkT3JQbCk7XG5cbmZ1bmN0aW9uIGFkZFZpZE9yUGwoZSwgdGFiKSB7XG4gIGxldCB1cmwgPSBlLmxpbmtVcmwgfHwgZS5wYWdlVXJsO1xuICBnZXRTdG9yYWdlKCdzZXR0aW5ncycsIGRhdGEgPT4ge1xuICAgIGxldCB7IGFsbG93ZWRWaWRlb3MsIGFsbG93ZWRQbGF5bGlzdHMgfSA9IGRhdGEuc2V0dGluZ3M7XG4gICAgXG4gICAgY29uc3QgeyBpc1BMLCBQbElELCBpc1ZpZCwgdmlkSUQgfSA9IHZpZE9yUEwodXJsKTtcblxuICAgIGlmIChpc1BMICYmICFhbGxvd2VkUGxheWxpc3RzLmluY2x1ZGVzKFBsSUQpKSB7XG4gICAgICBhbGxvd2VkUGxheWxpc3RzID0gYWxsb3dlZFBsYXlsaXN0cy5jb25jYXQoUGxJRCk7XG4gICAgfVxuICAgIGlmICghaXNQTCAmJiBpc1ZpZCAmJiAhYWxsb3dlZFZpZGVvcy5pbmNsdWRlcyh2aWRJRCkpIHtcbiAgICAgIGFsbG93ZWRWaWRlb3MgPSBhbGxvd2VkVmlkZW9zLmNvbmNhdCh2aWRJRCk7XG4gICAgfVxuICAgIGlmIChpc1BMIHx8IGlzVmlkKSB7XG4gICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEuc2V0dGluZ3MsIHsgYWxsb3dlZFZpZGVvcywgYWxsb3dlZFBsYXlsaXN0cyB9KTtcbiAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHsgc2V0dGluZ3MgfSk7XG4gICAgICAvLyAhZS5saW5rVXJsIGltcGxpZXMgdGhhdCB5b3UgYXJlIG9uIHRoZSBwYWdlIGZvciB0aGUgdmlkIG9yIHBsIHlvdSBhcmUgYWRkaW5nIHNvIGluZm8gY2FuIGJlIGdyYWJiZWRcblxuICAgICAgLy8gaWYgSSB3YW50IHRvIGdldCB2aWRlbyBhbmQgcGxheWxpc3QgdGl0bGVzIHdoZW4gdGhlIGxpbmsgY2xpY2tlZCBpcyB0aGUgd2F5IHRoZSB2aWRlbyB3YXMgYWRkZWQgdGhlbiBJIG5lZWQgdG8gZG8gYSBkZWVwIGRpdmUgb24gdGhlIGNvbnRlbnQgcGFnZSBhbmQgaXQgY291bGQgYmUgYSBwYWluLlxuICAgICAgbGV0IGFjdGlvbjtcbiAgICAgIGlmICghZS5saW5rVXJsKSB7XG4gICAgICAgIGlmIChpc1BMICYmIGlzVmlkKSB7XG4gICAgICAgICAgYWN0aW9uID0gJ2dhdGhlclBMSW5mbzInO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdGlvbiA9IGlzUEwgPyAnZ2F0aGVyUExJbmZvJyA6ICdnYXRoZXJWaWRlb0luZm8nO1xuICAgICAgICB9XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyBhY3Rpb24gfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3Rpb24gPSBcImdldFRpdGxlXCI7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyBhY3Rpb24sIHRhcmdldFVybDogdXJsIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbih0YWJzKSB7XG4gIGNvbnN0IHJlZ2V4ID0gL2h0dHBzOlxcL1xcL3d3dy55b3V0dWJlLmNvbVxcLyovO1xuICBjb25zdCB5dFRhYnMgPSBBcnJheS5mcm9tKHRhYnMpXG4gIC5maWx0ZXIodGFiID0+IHJlZ2V4LnRlc3QodGFiLnVybCkpO1xuICB5dFRhYnMuZm9yRWFjaCh0YWIgPT4ge1xuICAgIGNocm9tZS5wYWdlQWN0aW9uLnNob3codGFiLmlkKTtcbiAgfSk7XG59KTtcblxuKGZ1bmN0aW9uKCkge1xuICBnZXRTdG9yYWdlQWxsKFsnc2V0dGluZ3MnLCAndmlkZW9TdG9yYWdlJywgJ3BsU3RvcmFnZSddKVxuICAudGhlbihkYXRhID0+IHtcbiAgICBlbnN1cmVTZXR0aW5ncyhkYXRhLCAobmV3RGF0YSkgPT4ge1xuICAgICAgaWYgKG5ld0RhdGEuc2V0dGluZ3MuZW5hYmxlQ29udGVudEJsb2NraW5nKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgICAgICAgY29uc3QgcmVnZXggPSAvaHR0cHM6XFwvXFwvd3d3LnlvdXR1YmUuY29tXFwvKi87XG4gICAgICAgICAgY29uc3QgeXRUYWJzID0gQXJyYXkuZnJvbSh0YWJzKVxuICAgICAgICAgIC5maWx0ZXIodGFiID0+IHJlZ2V4LnRlc3QodGFiLnVybCkpO1xuICAgICAgICAgIHl0VGFicy5mb3JFYWNoKHRhYiA9PiB7XG4gICAgICAgICAgICBibG9ja0NvbnRlbnQodGFiLmlkLCB0YWIudXJsLCBuZXdEYXRhLnNldHRpbmdzLmFsbG93ZWRWaWRlb3MsIG5ld0RhdGEuc2V0dGluZ3MuYWxsb3dlZFBsYXlsaXN0cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgWydoaWRlUmVsYXRlZCcsICdoaWRlQ29tbWVudHMnLCAnaGlkZUVuZFNjcmVlbiddLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICBzZW5kU3RhdGVUb0NvbnRlbnQoXCJoaWRlRmllbGRcIiwgbmV3RGF0YS5zZXR0aW5nc1tmaWVsZF0sIGZpZWxkKTtcbiAgICAgIH0pO1xuICAgICAgWydkaXNhYmxlQXV0b3BsYXknXS5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHsgZWxlbWVudDogQVVUT1BMQVlfQ0FOQ0VMX0VMRU1FTlQsIG1ha2VDbGljazogZGF0YS5zZXR0aW5nc1tmaWVsZF0sIHRpbWVyOiAxMDAwIH07XG4gICAgICAgIHNlbmRTdGF0ZVRvQ29udGVudCgnY29udGludW91c0NsaWNrJywgcHJvcGVydGllcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiSWQsIGNoYW5nZUluZm8pIHtcbiAgaWYgKGNoYW5nZUluZm8udXJsICYmIFlUX1JFR0VYLnRlc3QoY2hhbmdlSW5mby51cmwpKSB7XG4gICAgLy8gbWFrZSBzdXJlIHRoZSBwb3AgdXAgaXMgb25seSBhdmFpbGFibGUgZm9yIHRoZSBjb3JyZWN0IHBhZ2VzXG4gICAgY29uc3QgaW5mbyA9IHZpZE9yUEwoY2hhbmdlSW5mby51cmwpO1xuICAgIGlmIChpbmZvLmlzUEwgfHwgaW5mby5pc1ZpZCkge1xuICAgICAgY2hyb21lLnBhZ2VBY3Rpb24uc2hvdyh0YWJJZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNocm9tZS5wYWdlQWN0aW9uLmhpZGUodGFiSWQpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCB2aWRlb1JlZ2V4ID0gL2h0dHBzOlxcL1xcL3d3dy55b3V0dWJlLmNvbVxcL3dhdGNoKi87XG4gICAgZ2V0U3RvcmFnZSgnc2V0dGluZ3MnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAodmlkZW9SZWdleC50ZXN0KGNoYW5nZUluZm8udXJsKSkge1xuICAgICAgICBbJ2hpZGVSZWxhdGVkJywgJ2hpZGVDb21tZW50cycsICdoaWRlRW5kU2NyZWVuJ10uZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoIHRhYklkLCB7IGFjdGlvbjogJ2hpZGVGaWVsZCcsIHZhbHVlOiBkYXRhLnNldHRpbmdzW2ZpZWxkXSwgZmllbGQgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdXBkYXRlU3RvcmFnZUluZm9Nc2codGFiSWQsIGNoYW5nZUluZm8udXJsLCBkYXRhLnNldHRpbmdzLmFsbG93ZWRWaWRlb3MsIGRhdGEuc2V0dGluZ3MuYWxsb3dlZFBsYXlsaXN0cyk7XG5cbiAgICAgIGlmIChkYXRhLnNldHRpbmdzLmVuYWJsZUNvbnRlbnRCbG9ja2luZykge1xuICAgICAgICBibG9ja0NvbnRlbnQodGFiSWQsIGNoYW5nZUluZm8udXJsLCBkYXRhLnNldHRpbmdzLmFsbG93ZWRWaWRlb3MsIGRhdGEuc2V0dGluZ3MuYWxsb3dlZFBsYXlsaXN0cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuXG5cbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbihjaGFuZ2VzLCBuYW1lc3BhY2UpIHtcbiAgaWYgKGNoYW5nZXMuc2V0dGluZ3MpIHtcbiAgICBjb25zdCB7IG9sZFZhbHVlLCBuZXdWYWx1ZSB9ID0gY2hhbmdlcy5zZXR0aW5ncztcbiAgICBcbiAgICBpZiAob2xkVmFsdWUgJiYgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZW5hYmxlQ29udGVudEJsb2NraW5nOiBvRW5hYmxlQ29udGVudEJsb2NraW5nLFxuICAgICAgICBhbGxvd2VkVmlkZW9zOiBvQWxsb3dlZFZpZGVvcyxcbiAgICAgICAgYWxsb3dlZFBsYXlsaXN0czogb0FsbG93ZWRQbGF5bGlzdHMsXG4gICAgICAgIGhpZGVFbmRTY3JlZW46IG9IaWRlRW5kU2NyZWVuLFxuICAgICAgICBoaWRlUmVsYXRlZDogb0hpZGVSZWxhdGVkLFxuICAgICAgICBoaWRlQ29tbWVudHM6IG9IaWRlQ29tbWVudHMsXG4gICAgICAgIGRpc2FibGVBdXRvcGxheTogb0Rpc2FibGVBdXRvcGxheVxuICAgICAgfSA9IG9sZFZhbHVlO1xuICAgICAgY29uc3Qge1xuICAgICAgICBlbmFibGVDb250ZW50QmxvY2tpbmc6IG5FbmFibGVDb250ZW50QmxvY2tpbmcsXG4gICAgICAgIGFsbG93ZWRWaWRlb3M6IG5BbGxvd2VkVmlkZW9zLFxuICAgICAgICBhbGxvd2VkUGxheWxpc3RzOiBuQWxsb3dlZFBsYXlsaXN0cyxcbiAgICAgICAgaGlkZUVuZFNjcmVlbjogbkhpZGVFbmRTY3JlZW4sXG4gICAgICAgIGhpZGVSZWxhdGVkOiBuSGlkZVJlbGF0ZWQsXG4gICAgICAgIGhpZGVDb21tZW50czogbkhpZGVDb21tZW50cyxcbiAgICAgICAgZGlzYWJsZUF1dG9wbGF5OiBuRGlzYWJsZUF1dG9wbGF5LFxuICAgICAgfSA9IG5ld1ZhbHVlO1xuICAgICAgY29uc3QgYmxvY2tFbmFibGVkID0gIW9FbmFibGVDb250ZW50QmxvY2tpbmcgJiYgbkVuYWJsZUNvbnRlbnRCbG9ja2luZyxcbiAgICAgICAgICAgIHZpZFJlbW92ZWQgPSBvQWxsb3dlZFZpZGVvcy5sZW5ndGggPiBuQWxsb3dlZFZpZGVvcy5sZW5ndGgsXG4gICAgICAgICAgICBwbFJlbW92ZWQgPSBvQWxsb3dlZFBsYXlsaXN0cy5sZW5ndGggPiBuQWxsb3dlZFBsYXlsaXN0cy5sZW5ndGgsXG4gICAgICAgICAgICBibG9ja1ZpZHMgPSAoYmxvY2tFbmFibGVkKSB8fCAobkVuYWJsZUNvbnRlbnRCbG9ja2luZyAmJiAodmlkUmVtb3ZlZCB8fCBwbFJlbW92ZWQpKTtcbiAgICAgIGlmIChvSGlkZVJlbGF0ZWQgIT09IG5IaWRlUmVsYXRlZCkge1xuICAgICAgICBzZW5kU3RhdGVUb0NvbnRlbnQoXCJoaWRlRmllbGRcIiwgbkhpZGVSZWxhdGVkLCAnaGlkZVJlbGF0ZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAob0hpZGVDb21tZW50cyAhPT0gbkhpZGVDb21tZW50cykge1xuICAgICAgICBzZW5kU3RhdGVUb0NvbnRlbnQoXCJoaWRlRmllbGRcIiwgbkhpZGVDb21tZW50cywgJ2hpZGVDb21tZW50cycpO1xuICAgICAgfSBlbHNlIGlmIChvSGlkZUVuZFNjcmVlbiAhPT0gbkhpZGVFbmRTY3JlZW4pIHtcbiAgICAgICAgc2VuZFN0YXRlVG9Db250ZW50KFwiaGlkZUZpZWxkXCIsIG5IaWRlRW5kU2NyZWVuLCAnaGlkZUVuZFNjcmVlbicpO1xuICAgICAgfSBlbHNlIGlmIChvRGlzYWJsZUF1dG9wbGF5ICE9PSBuRGlzYWJsZUF1dG9wbGF5KSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0geyBlbGVtZW50OiBBVVRPUExBWV9DQU5DRUxfRUxFTUVOVCwgbWFrZUNsaWNrOiBkYXRhLnNldHRpbmdzW2ZpZWxkXSwgdGltZXI6IDEwMDAgfTtcbiAgICAgICAgc2VuZFN0YXRlVG9Db250ZW50KCdjb250aW51b3VzQ2xpY2snLCBwcm9wZXJ0aWVzKTtcbiAgICAgIH0gZWxzZSBpZiAoYmxvY2tWaWRzKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgICAgICAgQXJyYXkuZnJvbSh0YWJzKS5maWx0ZXIodGFiID0+IFlUX1JFR0VYLnRlc3QodGFiLnVybCkpLmZvckVhY2godGFiID0+IHtcbiAgICAgICAgICAgIGJsb2NrQ29udGVudCh0YWIuaWQsIHRhYi51cmwsIG5BbGxvd2VkVmlkZW9zLCBuQWxsb3dlZFBsYXlsaXN0cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGVuc3VyZVNldHRpbmdzKGRhdGEsIGNhbGxiYWNrKSB7XG4gIGxldCBwcmV2U2V0dGluZ3MgPSBkYXRhLnNldHRpbmdzIHx8IHt9O1xuICBsZXQgdmlkZW9TdG9yYWdlID0gZGF0YS52aWRlb1N0b3JhZ2UgfHwge307XG4gIGxldCBwbFN0b3JhZ2UgPSBkYXRhLnBsU3RvcmFnZSB8fCB7fTtcblxuICBsZXQgeyBoaWRlUmVsYXRlZCwgaGlkZUNvbW1lbnRzLCBoaWRlRW5kU2NyZWVuLCBlbmFibGVDb250ZW50QmxvY2tpbmcsIGFsbG93ZWRWaWRlb3MsIGFsbG93ZWRQbGF5bGlzdHMgfSA9IHByZXZTZXR0aW5ncztcblxuICBoaWRlUmVsYXRlZCA9IEJvb2xlYW4oaGlkZVJlbGF0ZWQpO1xuICBoaWRlQ29tbWVudHMgPSBCb29sZWFuKGhpZGVDb21tZW50cyk7XG4gIGhpZGVFbmRTY3JlZW4gPSBCb29sZWFuKGhpZGVFbmRTY3JlZW4pO1xuICBkaXNhYmxlQXV0b3BsYXkgPSBCb29sZWFuKGRpc2FibGVBdXRvcGxheSk7XG4gIGVuYWJsZUNvbnRlbnRCbG9ja2luZyA9IEJvb2xlYW4oZW5hYmxlQ29udGVudEJsb2NraW5nKTtcbiAgYWxsb3dlZFZpZGVvcyA9IGFsbG93ZWRWaWRlb3MgPT09IHVuZGVmaW5lZCA/IFtdIDogYWxsb3dlZFZpZGVvcztcbiAgYWxsb3dlZFBsYXlsaXN0cyA9IGFsbG93ZWRQbGF5bGlzdHMgPT09IHVuZGVmaW5lZCA/IFtdIDogYWxsb3dlZFBsYXlsaXN0cztcbiAgdmlkZW9TdG9yYWdlID0gdmlkZW9TdG9yYWdlID09PSB1bmRlZmluZWQgPyB7fSA6IHZpZGVvU3RvcmFnZTtcbiAgcGxTdG9yYWdlID0gcGxTdG9yYWdlID09PSB1bmRlZmluZWQgPyB7fSA6IHBsU3RvcmFnZTtcbiAgY29uc3Qgc2V0dGluZ3MgPSB7IGhpZGVSZWxhdGVkLCBoaWRlQ29tbWVudHMsIGhpZGVFbmRTY3JlZW4sIGRpc2FibGVBdXRvcGxheSwgZW5hYmxlQ29udGVudEJsb2NraW5nLCBhbGxvd2VkVmlkZW9zLCBhbGxvd2VkUGxheWxpc3RzIH07XG4gIC8vdXBkYXRlIHN0b3JhZ2UgdXNlIHRvIG5ldyBzZXQgZnVuY3Rpb25cbiAgbGV0IG5ld0RhdGEgPSB7fTtcbiAgc2V0U3RvcmFnZSgnc2V0dGluZ3MnLCB7IHNldHRpbmdzIH0pLnRoZW4oZGF0YSA9PiB7XG4gICAgbmV3RGF0YSA9IE9iamVjdC5hc3NpZ24obmV3RGF0YSwgZGF0YSk7XG4gICAgcmV0dXJuIHNldFN0b3JhZ2UoJ3BsU3RvcmFnZScsIHsgcGxTdG9yYWdlIH0pO1xuICB9KS50aGVuKGRhdGEgPT4ge1xuICAgIG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKG5ld0RhdGEsIGRhdGEpO1xuICAgIHJldHVybiBzZXRTdG9yYWdlKCd2aWRlb1N0b3JhZ2UnLCB7IHZpZGVvU3RvcmFnZSB9KTtcbiAgfSkudGhlbihkYXRhID0+IHtcbiAgICBuZXdEYXRhID0gT2JqZWN0LmFzc2lnbihuZXdEYXRhLCBkYXRhKTtcbiAgICBjYWxsYmFjayhuZXdEYXRhKTtcbiAgfSk7XG4gIC8vY2hlY2sgdG8gbWFrZXN1cmUgdGhpcyB3b3JrcyFcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3RvcmFnZUluZm9Nc2codGFiSWQsIHVybCwgYWxsb3dlZFZpZGVvcywgYWxsb3dlZFBsYXlsaXN0cykge1xuICBjb25zdCB7IGlzUEwsIFBsSUQsIGlzVmlkLCB2aWRJRCwgbm90WXQgfSA9IHZpZE9yUEwodXJsKTtcbiAgaWYgKCBpc1BMICYmIGlzVmlkKSB7XG4gICAgaWYgKGFsbG93ZWRWaWRlb3MuaW5jbHVkZXModmlkSUQpIHx8IGFsbG93ZWRQbGF5bGlzdHMuaW5jbHVkZXMoUGxJRCkpIHtcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IGFjdGlvbjogJ2dhdGhlclBMSW5mbzInIH0pO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc1BMKSB7XG4gICAgaWYgKGFsbG93ZWRQbGF5bGlzdHMuaW5jbHVkZXMoUGxJRCkpIHtcbiAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IGFjdGlvbjogJ2dhdGhlclBMSW5mbycgfSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzVmlkKSB7XG4gICAgaWYgKGFsbG93ZWRWaWRlb3MuaW5jbHVkZXModmlkSUQpKSB7XG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBhY3Rpb246ICdnYXRoZXJWaWRlb0luZm8nIH0pO1xuICAgIH1cblxuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ1RvQ29udGVudCh0ZXh0KSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSB7IGFjdGlvbjogJ2xvZycsIG1lc3NhZ2U6IHRleHQgfTtcbiAgY2hyb21lLnRhYnMucXVlcnkoe30sIGZ1bmN0aW9uKHRhYnMpIHtcbiAgICBBcnJheS5mcm9tKHRhYnMpXG4gICAgLmZvckVhY2godGFiID0+IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgbWVzc2FnZSkpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VuZFN0YXRlVG9Db250ZW50KGFjdGlvbiwgdmFsdWUsIGZpZWxkLCB0YWJJZCkge1xuICB2YXIgbWVzc2FnZSA9IHsgYWN0aW9uLCB2YWx1ZSwgZmllbGQgfTtcbiAgaWYgKHRhYklkKSB7XG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIG1lc3NhZ2UpO1xuICB9XG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgQXJyYXkuZnJvbSh0YWJzKVxuICAgIC5mb3JFYWNoKHRhYiA9PiBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIG1lc3NhZ2UpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGJsb2NrQ29udGVudCh0YWJJZCwgdXJsLCBhbGxvd2VkVmlkZW9zLCBhbGxvd2VkUGxheWxpc3RzKSB7XG4gIGNvbnN0IHsgaXNQTCwgUGxJRCwgaXNWaWQsIHZpZElELCBub3RZdCB9ID0gdmlkT3JQTCh1cmwpO1xuICBjb25zdCBwYWdlSXNudEFsbG93ZWQgPSAoKChpc1ZpZCAmJiAhaXNQTCkgJiYgIWFsbG93ZWRWaWRlb3MuaW5jbHVkZXModmlkSUQpKSB8fCAoaXNQTCAmJiAhYWxsb3dlZFBsYXlsaXN0cy5pbmNsdWRlcyhQbElEKSkgfHwgKCFpc1ZpZCAmJiAhaXNQTCAmJiAhbm90WXQpKTtcbiAgaWYgKHBhZ2VJc250QWxsb3dlZCkge1xuICAgIGNocm9tZS50YWJzLnVwZGF0ZSh0YWJJZCwge3VybDogJ25vdF9hdmFpbGFibGUvbm90X2F2YWlsYWJsZS5odG1sJ30pO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9iYWNrZ3JvdW5kL2luZGV4LmpzIiwiZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSAoa2V5LCBjYWxsYmFjaykgPT4ge1xuICBjb25zdCBzdG9yYWdlID0gKGtleSA9PT0gJ3NldHRpbmdzJyA/IGNocm9tZS5zdG9yYWdlLnN5bmMgOiBjaHJvbWUuc3RvcmFnZS5sb2NhbCk7XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YSkgPT4gcmVzb2x2ZShkYXRhKSk7XG4gIH0pO1xuICByZXR1cm4gKGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFN0b3JhZ2UgPSAoa2V5LCBvYmplY3QsIGNhbGxiYWNrKSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2UgPSAoa2V5ID09PSAnc2V0dGluZ3MnID8gY2hyb21lLnN0b3JhZ2Uuc3luYyA6IGNocm9tZS5zdG9yYWdlLmxvY2FsKTtcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBzdG9yYWdlLnNldChvYmplY3QsICgpID0+IHtcbiAgICAgIHN0b3JhZ2UuZ2V0KGtleSwgZGF0YSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gKGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2VBbGwgPSAoa2V5cywgY2FsbGJhY2spID0+IHtcbiAgY29uc3Qgc3RvcmFnZXNLZXlzID0ga2V5cy5tYXAoa2V5ID0+IHtcbiAgICByZXR1cm4geyBrZXksIHN0b3JhZ2U6IGNocm9tZS5zdG9yYWdlWyhrZXkgPT09ICdzZXR0aW5ncycgPyAnc3luYycgOiAnbG9jYWwnKV0gfTtcbiAgfSk7XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5hbGwoc3RvcmFnZXNLZXlzLm1hcChzdG9yYWdlS2V5ID0+IHtcbiAgICBjb25zdCB7IHN0b3JhZ2UsIGtleSB9ID0gc3RvcmFnZUtleTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzdG9yYWdlLmdldChrZXksIChkYXRhKSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICB9KTtcbiAgfSkpLnRoZW4ocmVzID0+IHtcbiAgICBjb25zdCBkYXRhID0ge307XG4gICAgcmVzLmZvckVhY2goKGl0ZW0sIGlkeCkgPT4gZGF0YVtrZXlzW2lkeF1dID0gaXRlbVtrZXlzW2lkeF1dKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSk7XG4gIHJldHVybiAoY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZSk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbW9kdWxlcy9zdG9yYWdlLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==