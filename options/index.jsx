import React, { Component } from 'react';
import { render } from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { hideRelated: null, allowedVideos: [], allowedPlaylists: [] }
  }

  componentDidMount = () => {
    chrome.storage.sync.get('settings', data => {
      let { allowedVideos, allowedPlaylists, hideRelated, hideComments } = data.settings;
      this.setState({ allowedVideos, allowedPlaylists, hideRelated, hideComments });
    });
  }

  toggleRelated = () => {
    const { hideRelated } = this.state;
    if (this.state.hideRelated !== null) {
      const settings = Object.assign({}, this.state, { hideRelated: !hideRelated } )
      chrome.storage.sync.set({ settings }, () => {
        this.setState({ hideRelated: !hideRelated });
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
