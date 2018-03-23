import React, { Component } from 'react';
import { render } from 'react-dom';

const vidOrPL = (url) => {
  const regex = /https:\/\/www\.youtube\.com\/(playlist\?list=(.+))?(watch\?v=([A-Za-z0-9_-]{11}))?(&list=(.+)?)?/;
  const res = url.match(regex);
  return { isPL: Boolean(res[1] || res[5]),
           PlID: res[2] || res[6],
           isVid: Boolean((res[3] && res[4])),
           vidID: res[4] };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { urlLoaded: false, stateLoaded: false };
  }

  componentDidMount() {
    chrome.tabs.query({'active': true, 'currentWindow': true}, tabs => {
          const { isPL, PlID, isVid, vidID } = vidOrPL(tabs[0].url);
          this.isPL = isPL;
          this.PlID = PlID;
          this.isVid = isVid;
          this.vidID = vidID;
          this.setState({ urlLoaded: true });
       }
    );
    chrome.storage.sync.get('settings', data => {
      let { allowedVideos, allowedPlaylists, hideRelated, hideComments } = data.settings;
      this.setState({ allowedVideos, allowedPlaylists, hideRelated, hideComments, stateLoaded: true });
    });
  }

  addVidPL = () => {
    let { allowedVideos, allowedPlaylists, hideRelated, hideComments } = this.state;
    const { isPL, PlID, isVid, vidID } = this;

    if (isPL && !allowedPlaylists.includes(PlID)) {
      allowedPlaylists = allowedPlaylists.concat(PlID);
    }
    if (!isPL && isVid && !allowedVideos.includes(vidID)) {
      allowedVideos = allowedVideos.concat(vidID);
    }
    if (isPL || isVid) {
      const settings = { allowedVideos, allowedPlaylists, hideRelated, hideComments };
      chrome.storage.sync.set({ settings });
    }
  }

  render = () => {
    const { isPL, isVid } = this;
    const { urlLoaded, stateLoaded } = this.state;
    const btnTxt = ( (isPL || isVid) ? ( isPL ? "Playlist" : "Video" ) : null );
    return (
      <div>
        { urlLoaded && stateLoaded ? (
          !btnTxt ? null : <button onClick={ this.addVidPL }>{ `Add ${btnTxt}` }</button>
        ) : "Loading..."}
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
