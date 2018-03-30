import React, { Component } from 'react';
import { render } from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);
    //alert(chrome.extension.getURL("not_available.html"));
    this.state = { loaded: false };
  }

  componentDidMount = () => {
    chrome.storage.sync.get('settings', data => {
      let { allowedVideos, allowedPlaylists, hideRelated, hideComments, hideEndScreen } = data.settings;
      this.setState({ allowedVideos, allowedPlaylists, hideRelated, hideComments, hideEndScreen, loaded: true });
    });
    chrome.storage.onChanged.addListener((changes, namespace) => {
      const { oldValue, newValue } = changes.settings;
      const fields = ['hideRelated', 'hideComments', 'hideEndScreen', 'allowedVideos', 'allowedPlaylists'];
      while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
        fields.shift();
      }
      this.setState({ [fields[0]]: newValue[fields[0]]});
    });
  }

  toggle = (field_name) => {
    const field = this.state[field_name];
    const settings = Object.assign({}, this.state, { [field_name]: !field } )
    chrome.storage.sync.set({ settings }, () => {
      this.setState({ [field_name]: !field });
    });
  }

  deleteLink = (listType, id) => {
    chrome.storage.sync.get('settings', data => {
      let { allowedVideos, allowedPlaylists } = data.settings;

      if (listType === 'pl') {
        allowedPlaylists = allowedPlaylists.filter(PlID => PlID !== id);
      } else {
        allowedVideos = allowedVideos.filter(vidID => vidID !== id);
      }
      const settings = Object.assign({}, data.settings, { allowedVideos, allowedPlaylists });
      chrome.storage.sync.set({ settings });
    });
  }

  render = () => {
    const { allowedVideos, allowedPlaylists, hideRelated, hideComments, hideEndScreen, loaded, vidHoverIdx, plHoverIdx } = this.state;

    return (
      <div>
        { !loaded ? null : <div className="main-content">
          <div className="switch-list-container">
            <div className="switch-container">
              Related Videos:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => this.toggle('hideRelated') } className={`switcher_slider${hideRelated ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              Comments:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => this.toggle('hideComments') } className={`switcher_slider${hideComments ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              End Screen Videos:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => this.toggle('hideEndScreen') } className={`switcher_slider${hideEndScreen ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>
          </div>
          <div className="link-lists-container">
            <div className="link-list right">
              <div className="allowed-title">Allowed Videos</div>
              { allowedVideos.map((vidId, i) => {
                const link = `https://www.youtube.com/watch?v=${vidId}`;
                return (
                  <div key={i} className="link-item-container">
                    <div className="link-item">
                      <a href={ link }>{ link }</a>
                      <div className="icon-container" onMouseOver={() => this.setState({vidHoverIdx: i})}
                           onMouseLeave={() => this.setState({vidHoverIdx: undefined})}
                           onClick={() => this.deleteLink('vid', vidId)}>
                         <i className="far fa-times-circle"></i>
                      </div>
                    </div>
                  </div>
                );
              }) }
            </div>
            <div className="link-list">
              <div className="allowed-title">Allowed Playlists</div>
              { allowedPlaylists.map((PlID, i) => {
                const link = `https://www.youtube.com/playlist?list=${PlID}`;
                return (
                  <div key={i} className="link-item-container">
                    <div className="link-item">
                      <a href={ link }>{ link }</a>
                        <div className="icon-container" onMouseOver={() => this.setState({plHoverIdx: i})}
                             onMouseLeave={() => this.setState({plHoverIdx: undefined})}
                             onClick={() => this.deleteLink('pl', PlID)}>
                           <i className="far fa-times-circle"></i>
                        </div>
                    </div>
                  </div>
                );
              }) }
            </div>
          </div>
        </div>}
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
