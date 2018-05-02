const intvl = setInterval(() => {
  if (window.ytInitialData && window.ytInitialPlayerResponse) {
    clearInterval(intvl);
    const date = window.ytInitialData.contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.dateText.simpleText;
    const data = Object.assign({},window.ytInitialPlayerResponse.videoDetails, { date });
    const stringified = JSON.stringify(data);
    const span = document.createElement('span');
    span.innerText = stringified;
    span.style.display = 'none';
    span.setAttribute('id', 'forContentScript');
    document.body.appendChild(span);
  }
}, 100);
