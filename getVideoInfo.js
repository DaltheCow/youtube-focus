const intvl = setInterval(() => {
  // debugger
  if (window.ytInitialData && window.ytInitialPlayerResponse) {
    clearInterval(intvl);
    try {
      const date = window.ytInitialData.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.dateText.simpleText;
      const data = Object.assign({},window.ytInitialPlayerResponse.videoDetails, { date });
      const stringified = JSON.stringify(data);
      const span = document.createElement('span');
      span.innerText = stringified;
      span.style.display = 'none';
      span.setAttribute('id', 'forContentScript');
      document.body.appendChild(span);
    } catch (err) {
      console.log("error reading youtube data:", err);
    }
  }
}, 100);
