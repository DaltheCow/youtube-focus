chrome.runtime.sendMessage({ action: 'showPageAction' });
chrome.runtime.sendMessage({ action: 'getState' });


chrome.runtime.onMessage.addListener(data => {
    switch(data.action) {
      case 'hideField': {
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
      }
      case 'gatherVideoInfo': {
        sendVideoinfo();
        break;
      }
      case 'gatherPLInfo': {
        sendPLinfo();
        break;
      }
      case 'gatherPLInfo2': {
        sendPL2info();
        break;
      }
    }
});

//upon loading tab/page, if this video/playlist is in allowedVideos/allowedPlaylists then update the info

function gatherPLinfo() {
  const plNameNode = document.querySelector('#title .yt-simple-endpoint.style-scope.yt-formatted-string');
  //filter out private playlists
  if (!plNameNode) {
    return null;
  }
  plName = plNameNode.innerText;
  const stats = document.querySelectorAll('#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
  const numVids = stats[0].innerText;
  const numViews = stats[1].innerText;
  const contents = document.querySelectorAll('#contents #contents #contents .style-scope.ytd-playlist-video-list-renderer');

  const plVideos = mapFilter(Array.from(contents), node => {
    const durationNode = node.querySelector('#thumbnail #overlays .style-scope.ytd-thumbnail-overlay-time-status-renderer');
    //filter out private videos
    if (!durationNode) {
      return undefined;
    }
    const duration = durationNode.innerText;
    const thumbnailImg = node.querySelector('#thumbnail #img').getAttribute('src');
    const title = node.querySelector('#meta #video-title').innerText;
    const channel = node.querySelector('#metadata #byline .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
    const index = document.querySelector('#contents #contents #index').innerText;
    return { thumbnailImg, duration, title, channel, index };
  }, res => res !== undefined);

  return { plName, numVids, numViews, plVideos };
}

function gatherVideoInfo() {
  const titleNode = document.querySelector('#info .title .style-scope.ytd-video-primary-info-renderer');
  //filter out private/not available videos
  if (!titleNode) {
    return null;
  }
  const title = titleNode.innerText;
  const viewsLong = document.querySelector('#info #count .view-count.style-scope.yt-view-count-renderer').innerText;
  const viewsShort = document.querySelector('#info #count .short-view-count.style-scope.yt-view-count-renderer').innerText;
  const channel = document.querySelector('#upload-info #owner-container .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
  const publishDate = document.querySelector('#upload-info .date.style-scope.ytd-video-secondary-info-renderer').innerText;
  let duration = null;
  if (!document.querySelector('#ytd-player .ad-interrupting')) {
    duration = document.querySelector('.ytp-chrome-controls .ytp-time-display .ytp-time-duration').innerText;
  }
  return { title, viewsLong, viewsShort, channel, publishDate, duration };
}

function gatherPLinfo2() {
  //filter out private playlists
  const plNameNode = document.querySelector('#header-contents .yt-simple-endpoint.style-scope.yt-formatted-string');
  if (!plNameNode) {
    return null;
  }
  const plName = plNameNode.innerText;
  const numVids = document.querySelector('#header-contents #publisher-container .index-message.style-scope.ytd-playlist-panel-renderer').innerText.split(' ').pop();
  return { plName, numVids };
}

function sendPLinfo() {
  const url = window.location.href;
  const intervalId = setInterval(() => {
    const info = gatherPLinfo();
    if (info !== null)  {
      chrome.runtime.sendMessage({ action: 'receiveStorageInfo', type: 'receivePL', info, url });
      clearInterval(intervalId);
    }
  }, 1000);
}

function sendPL2info() {
  const url = window.location.href;
  const intervalId = setInterval(() => {
    const vidInfo = gatherVideoInfo();
    const plInfo = gatherPLinfo2();
    if (vidInfo !== null || plInfo !== null)  {
      chrome.runtime.sendMessage({ action: 'receiveStorageInfo', type: 'receivePL2', vidInfo, plInfo, url });
      clearInterval(intervalId);
    }
  }, 1000);
}

function sendVideoinfo() {
  const url = window.location.href;
  const intervalId = setInterval(() => {
    const info = gatherVideoInfo();
    if (info !== null)  {
      chrome.runtime.sendMessage({ action: 'receiveStorageInfo', type: 'receiveVideo', info, url });
      clearInterval(intervalId);
    }
  }, 1000);
}


function mapFilter(arr, func, test) {
  const newArr = [];
  arr.forEach(el => {
    const res = func(el);
    if (test(res)) newArr.push(res);
  });
  return newArr;
}

// if (!window['ytInitialPlayerResponse']) {
//   console.log('not loaded');
// } else {
//   console.log('loaded from the beginning');
// }
// const intvl = setInterval(() => {
//   if (!window['ytInitialPlayerResponse']) {
//     console.log('not loaded');
//   } else {
//     clearInterval(intvl);
//   }
// }, 100);

// console.log(window);

// i need to do what
// im trying to message content script inject from ehre
// i need to build it
//
function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
injectScript( chrome.extension.getURL('window_access.js'), 'body');


// runtime.onMessageExternal.addListener(data => {
//   console.log('---------hoi----------');
//   console.log(data);
//   console.log('---------hoi----------');
// });
