import React, { Component } from 'react';
import { render } from 'react-dom';
import VideoLinkItem from '../components/VideoLinkItem.jsx';
import LinkList from '../components/linkList.jsx';
import { getStorage, setStorage, getStorageAll } from "../modules/storage";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false };
  }

  componentDidMount = () => {
    getStorageAll(['settings', 'videoStorage', 'plStorage'])
    .then(data => {
      console.log(data);
      const { settings, videoStorage, plStorage } = data;
      const { allowedVideos, allowedPlaylists, hideRelated, hideComments, hideEndScreen, enableContentBlocking } = settings;

      this.setState({ allowedVideos, allowedPlaylists, videoStorage, plStorage, hideRelated, hideComments, hideEndScreen, enableContentBlocking, loaded: true });
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes['settings']) {
        const { oldValue, newValue } = changes.settings;
        const fields = ['hideRelated', 'hideComments', 'hideEndScreen', 'enableContentBlocking', 'allowedVideos', 'allowedPlaylists'];
        while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
          fields.shift();
        }
        this.setState({ [fields[0]]: newValue[fields[0]]});
      } else if (changes['plStorage']) {
        const { newValue } = changes.plStorage;
        this.setState({ plStorage: newValue });
      } else if (changes['videoStorage']) {
        const { newValue } = changes.videoStorage;
        this.setState({ videoStorage: newValue})
      }
    });
  }

  onToggle = (field_name) => {
    const field = this.state[field_name];
    getStorage('settings', data => {
      const settings = Object.assign(data.settings, { [field_name]: !field });
      setStorage('settings', { settings }, () => {
        this.setState({ [field_name]: !field });
      });
    })
  }

  onDeleteLink = (listType, id) => {
    getStorageAll(['settings', 'videoStorage', 'plStorage'])
      .then(data => {
        let { settings, videoStorage, plStorage } = data;
        let { allowedVideos, allowedPlaylists } = settings;

        if (listType === 'pl') {
          allowedPlaylists = allowedPlaylists.filter(PlID => PlID !== id);
          delete plStorage[id];
        } else {
          allowedVideos = allowedVideos.filter(vidID => vidID !== id);
          delete videoStorage[id];
        }
        settings = Object.assign({}, data.settings, { allowedVideos, allowedPlaylists });
        setStorage('settings', { settings }, () => {
          setStorage('plStorage', { plStorage });
          setStorage('videoStorage', { videoStorage });
        });
      });
  }

  render = () => {
    const { allowedVideos, allowedPlaylists, videoStorage, plStorage, hideRelated, hideComments, hideEndScreen, enableContentBlocking, loaded } = this.state;

    return (
      <div>
        { !loaded ? null : <div className="main-content">
          <div className="switch-list-container">
            <div className="switch-container">
              Related Videos:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => this.onToggle('hideRelated') } className={`switcher_slider${hideRelated ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              Comments:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => this.onToggle('hideComments') } className={`switcher_slider${hideComments ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              End Screen Videos:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => this.onToggle('hideEndScreen') } className={`switcher_slider${hideEndScreen ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              Content Restrictions:
              <div className="switch">
                <div className="switch-show">OFF</div>
                <div onClick={ () => this.onToggle('enableContentBlocking') } className={`switcher_slider${enableContentBlocking ? " checked" : ""}`}></div>
                <div className="switch-hide">ON</div>
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
                      <a href={ link }>{ (videoStorage && videoStorage[vidId]) ? videoStorage[vidId].title : link }</a>
                      <div className="icon-container" onMouseOver={() => this.setState({ vidHoverIdx: i })}
                           onMouseLeave={() => this.setState({ vidHoverIdx: undefined })}
                           onClick={() => this.onDeleteLink('vid', vidId)}>
                         <i className="far fa-times-circle"></i>
                      </div>
                      <div className="thumbnail-img-container">
                        <img src={`https://img.youtube.com/vi/${vidId}/0.jpg`}/>
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
                      <a href={ link }>{ (plStorage && plStorage[PlID]) ? plStorage[PlID].plName : link }</a>
                        <div className="icon-container" onMouseOver={() => this.setState({plHoverIdx: i})}
                             onMouseLeave={() => this.setState({ plHoverIdx: undefined })}
                             onClick={() => this.onDeleteLink('pl', PlID)}>
                           <i className="far fa-times-circle"></i>
                        </div>
                    </div>
                  </div>
                );
              }) }
            </div>
            <LinkList>
              { allowedVideos.map((id, i) => {
                const vidInfo = videoStorage[id];
                return (
                  <VideoLinkItem key={i} { ...vidInfo } id={ id } />
                );
              })}
            </LinkList>
          </div>
        </div>}
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
