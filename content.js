chrome.runtime.sendMessage({ action: "showPageAction" });
chrome.runtime.sendMessage({ action: "getState" });


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
      }
        break;
      case 'gatherPLInfo2': {
        sendPL2info();
      }
    }
});

//upon loading tab/page, if this video/playlist is in allowedVideos/allowedPlaylists then update the info

function gatherPLinfo() {
  const plNameNode = document.querySelector('#title .yt-simple-endpoint.style-scope.yt-formatted-string');
  //filter out private playlists
  if (!plNameNode) {
    return { plName: null, stats: null, numVids: null, numViews: null, plVideos: null };
  }
  plName = plNameNode.innerText;
  const stats = document.querySelectorAll('#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
  const numVids = stats[0];
  const numViews = stats[1];
  const contents = document.querySelectorAll('#contents #contents #contents .style-scope.ytd-playlist-video-list-renderer');

  const plVideos = mapFilter(Array.from(contents), node => {
    const durationNode = node.querySelector('#thumbnail #overlays .style-scope.ytd-thumbnail-overlay-time-status-renderer');
    //filter out private videos
    if (!durationNode) {
      return { plName: null, stats: null, numVids: null, numViews: null, plVideos: null };
    }
    const duration = durationNode.innerText;
    const thumbnailImg = node.querySelector('#thumbnail #img').getAttribute('src');
    const title = node.querySelector('#meta #video-title').innerText;
    const channel = node.querySelector('#metadata #byline .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
    const index = document.querySelector('#contents #contents #index').innerText;
    return { thumbnailImg, duration, title, channel, index };
  }, res => res !== undefined);

  return { plName, stats, numVids, numViews, plVideos };
}

function gatherVideoInfo() {
  const titleNode = document.querySelector('#info .title .style-scope.ytd-video-primary-info-renderer');
  //filter out private/not available videos
  if (!titleNode) {
    return { title: null, viewsLong: null, viewsShort: null, channel: null, publishDate: null, duration: null };
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
    return { plName: null, numVids: null };
  }
  const plName = plNameNode.innerText;
  const numVids = document.querySelector('#header-contents #publisher-container .index-message.style-scope.ytd-playlist-panel-renderer').innerText.split(' ').pop();
  return { plName, numVids };
}

function sendPLinfo() {
  const info = gatherPLinfo();
  chrome.runtime.sendMessage({ action: "receivePL", info });
}

function sendPL2info() {
  const vidInfo = gatherVideoInfo();
  const plInfo = gatherPLinfo2();
  chrome.runtime.sendMessage({ action: "receivePL2", vidInfo, plInfo });
}

function sendVideoinfo() {
  const info = gatherVideoInfo();
  chrome.runtime.sendMessage({ action: "receiveVideo", info });
}


function mapFilter(arr, func, test) {
  const newArr = [];
  arr.forEach(el => {
    const res = func(el);
    if (test(res)) newArr.push(res);
  });
  return newArr;
}

//see if these are present when content.js loads
console.log(gatherPLinfo());
console.log(gatherVideoInfo());
console.log(gatherPLinfo2());
