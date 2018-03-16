import React, { Component } from 'react';
import { render } from 'react-dom';

const vidOrPL = (url) => {
  // "https://www.youtube.com/watch?v=C3xihL88JHw"
  // "https://www.youtube.com/playlist?list=PLXsTYn-i7cbcb3Usvt9o8uxLQTV3g8hun"
  // "https://www.youtube.com/watch?v=JythPfPjJcQ&list=PLXsTYn-i7cbcb3Usvt9o8uxLQTV3g8hun"
  const regex = /https:\/\/www\.youtube\.com\/(playlist\?list=)?(watch\?v=([A-Za-z0-9_-]{11})?)?(&list=(.+)?)?/
  const res = url.match(regex);
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { hideRelated: null, allowedVideos: [], allowedPlaylists: [] }
  }

  componentDidMount = () => {
    chrome.storage.sync.get('settings', data => {
      const { settings } = data;
      if (settings) {
        const allowedVideos = settings.allowedVideos ? settings.allowedVideos : [];
        const allowedPlaylists = settings.allowedPlaylists ? settings.allowedPlaylists : [];
        this.setState({ allowedVideos, allowedPlaylists });
      }
    });
  }

  addVidPL = () => {
    const urlType = vidOrPL(window.location.href);
  }

  render = () => {
    return (
      <div>
        <button>Add Video/Playlist</button>
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
