chrome.runtime.sendMessage({ action: "showPageAction" });
chrome.runtime.sendMessage({ action: "getState" });


chrome.runtime.onMessage.addListener(data => {
    switch(data.action) {
      case "hideField": {
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
        const info = gatherVideoInfo();

        break;
      }
      case 'gatherPLInfoPL': {
        const info = gatherPLinfo();
      }
        break;
      case 'gatherPLInfo2Video': {
        const vidInfo = gatherVideoInfo();
        const plInfo = gatherPLinfo2();

      }
    }
});

//upon loading tab/page, if this video/playlist is in allowedVideos/allowedPlaylists then update the info

function gatherPLinfo() {
  const plName = document.querySelector('#title .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
  const stats = document.querySelectorAll('#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
  const numVids = stats[0];
  const numViews = stats[1];
  const contents = document.querySelectorAll('#contents #contents #contents .style-scope.ytd-playlist-video-list-renderer');
  const plVideos = Array.from(contents).map(node => {
    //filter out private videos
    const thumbnailImg = node.querySelector('#thumbnail #img').getAttribute('src');
    const duration = node.querySelector('#thumbnail #overlays .style-scope.ytd-thumbnail-overlay-time-status-renderer').innerText;
    const title = node.querySelector('#meta #video-title').innerText;
    const channel = node.querySelector('#metadata #byline .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
    return { thumbnailImg, duration, title, channel };
  });
  return { plName, stats, numVids, numViews, plVideos };
}

function gatherVideoInfo() {
  //filter out private videos
  const title = document.querySelector('#info .title .style-scope.ytd-video-primary-info-renderer').innerText;
  const viewsLong = document.querySelector('#info #count .view-count.style-scope.yt-view-count-renderer').innerText;
  const viewsShort = document.querySelector('#info #count .short-view-count.style-scope.yt-view-count-renderer').innerText;
  const channel = document.querySelector('#upload-info #owner-container .yt-simple-endpoint.style-scope.yt-formatted-string').innerText;
  const publishDate = document.querySelector('#upload-info .date.style-scope.ytd-video-secondary-info-renderer').innerText;
  let duration;
  if (!document.querySelector('#ytd-player .ad-interrupting')) {
    duration = document.querySelector('.ytp-chrome-controls .ytp-time-display .ytp-time-duration').innerText;
  }
  return { title, viewsLong, viewsShort, channel, publishDate, duration };
}

function gatherPLinfo2() {
  //filter out private videos
  const plName = document.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string');
  const numVids = document.querySelector('#header-contents #publisher-container .index-message.style-scope.ytd-playlist-panel-renderer').innerText;
  return { plName, numVids };
}
