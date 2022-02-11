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
            console.log(`add ${className}`);
          } else {
            document.body.classList.remove(className);
            console.log(`remove ${className}`);
          }
        }
        break;
      }
      case 'showButton': {
        //TODO: add the code to create and show the add yt focus button
        //on hover it should have an option to add video or playlist
        //eventually maybe add channel too
      }
      case 'log': {
        console.log(data.message);
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
      case 'getTitle': {
        sendTitle(data.targetUrl);
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

  const plVideos = Array.from(contents)
    .map(node => {
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
    })
    .filter(res => res !== undefined);

  return { plName, numVids, numViews }; //, plVideos };
}

function gatherVideoInfo() {
  const titleNode = document.querySelector('#info .title .style-scope.ytd-video-primary-info-renderer');
  //filter out private/not available videos
  if (!titleNode) {
    return null;
  }
  const title = titleNode.innerText;
  const viewsLong = document.querySelector('#info #count .view-count.style-scope.yt-view-count-renderer')?.innerText;
  const viewsShort = document.querySelector('#info #count .short-view-count.style-scope.yt-view-count-renderer')?.innerText;
  const channel = ""//document.querySelector('#upload-info #owner-container .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
  const publishDate = document.querySelector('#upload-info .date.style-scope.ytd-video-secondary-info-renderer')?.innerText;
  let duration = null;
  if (!document.querySelector('#ytd-player .ad-interrupting')) {
    duration = document.querySelector('.ytp-chrome-controls .ytp-time-display .ytp-time-duration')?.innerText;
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

function retrieveVideoInfo() {
  function injectScript(file, nodeName) {
    const node = document.getElementsByTagName(nodeName)[0];
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file);
    node.appendChild(script);
  }
  injectScript( chrome.extension.getURL('getVideoInfo.js'), 'body');

  const intvl = setInterval(() => {
    const span = document.body.querySelector('#forContentScript');
    if (span) {
      document.body.removeChild(span);
      const text = span.innerText;
      const data = JSON.parse(text);
      const { date, title, lengthSeconds, author, shortDescription, channelId, viewCount } = data;
      const parsedDate = date.match(/\w{3}\s\d{1,2},\s\d{1,4}/)[0];
      const info = { title, viewCount, channel: author, publishDate: parsedDate, duration: lengthSeconds, shortDescription, channelId };
      const url = window.location.href;
      chrome.runtime.sendMessage({ action: 'receiveStorageInfo', type: 'receiveVideo', info, url });
      clearInterval(intvl);
    }
  }, 100);
}

function sendTitle(url) {
  console.log("content, sent title");
  
  let links = Array.from(document.querySelectorAll('a'));
  let targetLink = links.filter(link => (
    link.href === url
  ))[0];
  const videoElem = targetLink.closest("ytd-video-renderer") || targetLink.closest("ytd-compact-video-renderer");
  const playlistElem = targetLink.closest("ytd-playlist-renderer") || targetLink.closest("ytd-compact-playlist-renderer") || targetLink.closest("ytd-radio-renderer") || targetLink.closest("ytd-compact-radio-renderer");
  let title, duration, type, plName;
  if (videoElem) {
    title = videoElem.querySelector("#video-title")?.innerText;
    duration = videoElem.querySelector("#overlays span.ytd-thumbnail-overlay-time-status-renderer")?.innerText;
    type = "receiveVideo"
    // can get is live boolean
  } else if (playlistElem) {
    plName = playlistElem.querySelector("#video-title")?.innerText;
    type = "receivePL"
    // pl can potentially get first video id to use as image
  }
  
  if (title || plName) {
    const info = title ? { title } : { plName };
    if (duration) {
      info.duration = duration;
    }
    chrome.runtime.sendMessage({ action: 'receiveStorageInfo', type, info, url });
  }
  // if I ever get to the point where I want to find why things error out I can add the current url of the page and this link url so that I can try to dig and find out what failed.
}