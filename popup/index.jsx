import React, { Component } from 'react';
import { render } from 'react-dom';
import { log } from '../modules/logger';
import { VID_PL_REGEX } from "../constants";
import { getStorage } from "../modules/storage";
import { vidOrPL } from "../util";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { urlLoaded: false, tabId: null };
  }

  componentDidMount() {
    chrome.tabs.query({'active': true, 'currentWindow': true}, tabs => {
          const { isPL, PlID, isVid, vidID } = vidOrPL(tabs[0].url);
          this.isPL = isPL;
          this.PlID = PlID;
          this.isVid = isVid;
          this.vidID = vidID;
          this.setState({ urlLoaded: true, tabId: tabs[0].id });
       }
    );
  }

  addVidPL = () => {
    getStorage('settings', data => {
      let { allowedVideos, allowedPlaylists } = data.settings;

      const { isPL, PlID, isVid, vidID } = this;

      if (isPL && !allowedPlaylists.includes(PlID)) {
        allowedPlaylists = allowedPlaylists.concat(PlID);
      }
      if (!isPL && isVid && !allowedVideos.includes(vidID)) {
        allowedVideos = allowedVideos.concat(vidID);
      }
      if (isPL || isVid) {
        const settings = Object.assign({}, data.settings, { allowedVideos, allowedPlaylists });
        chrome.storage.sync.set({ settings });
        let action;
        if (isPL && isVid) {
          action = 'gatherPLInfo2';
        } else {
          action = isPL ? 'gatherPLInfo' : 'gatherVideoInfo';
        }
        chrome.tabs.sendMessage(this.state.tabId, { action });
      }
    });
  }

  render = () => {
    const { isPL, isVid } = this;
    const { urlLoaded } = this.state;
    const btnTxt = ( (isPL || isVid) ? ( isPL ? "Playlist" : "Video" ) : null );
    return (
      <div>
        { urlLoaded ? (
          !btnTxt ? null : <button onClick={ this.addVidPL }>{ `Add ${btnTxt}` }</button>
        ) : "Loading..."}
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
