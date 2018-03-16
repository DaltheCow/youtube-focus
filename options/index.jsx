import React, { Component } from 'react';
import { render } from 'react-dom';

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
        const hideRelated = settings.hideRelated ? settings.hideRelated : false;
        this.setState({ allowedVideos, allowedPlaylists, hideRelated });
      }
    });
  }

  toggleRelated = () => {
    const { hideRelated } = this.state;
    if (this.state.hideRelated !== null) {
      const settings = Object.assign({}, this.state, { hideRelated: !hideRelated } )
      chrome.storage.sync.set({ settings }, () => {
        this.setState({ hideRelated: !hideRelated });
        console.log('hi');
      })
    }
  }

  render = () => {
    const checked = this.state.hideRelated;
    return (
      <div>
        <div>
          Related Videos:
          <div className="related-toggle">
            <div>SHOW</div>
            <div onClick={ this.toggleRelated } className={`switcher_slider${checked ? " checked" : ""}`}></div>
            <div>HIDE</div>
          </div>
          <div className="video_list">
          </div>
        </div>
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
