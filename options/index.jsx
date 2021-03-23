import * as React from 'react';
import { render } from 'react-dom';
import VideoLinkItem from '../components/VideoLinkItem.jsx';
import LinkList from '../components/linkList.jsx';
import { useStorageContext, StorageProvider } from '../contexts/storage.context.jsx';

const App = () => {
  const { dataStorage, isLoaded, toggleField, deleteLink } = useStorageContext();
  
    const { allowedVideos, allowedPlaylists, videoStorage, plStorage, hideRelated, hideComments, hideEndScreen, enableContentBlocking } = dataStorage;
    return (
      <div>
        { isLoaded && <div className="main-content">
          <div className="switch-list-container">
            <div className="switch-container">
              Related Videos:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => toggleField('hideRelated') } className={`switcher_slider${hideRelated ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              Comments:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => toggleField('hideComments') } className={`switcher_slider${hideComments ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              End Screen Videos:
              <div className="switch">
                <div className="switch-show">SHOW</div>
                <div onClick={ () => toggleField('hideEndScreen') } className={`switcher_slider${hideEndScreen ? " checked" : ""}`}></div>
                <div className="switch-hide">HIDE</div>
              </div>
            </div>

            <div className="switch-container">
              Content Restrictions:
              <div className="switch">
                <div className="switch-show">OFF</div>
                <div onClick={ () => toggleField('enableContentBlocking') } className={`switcher_slider${enableContentBlocking ? " checked" : ""}`}></div>
                <div className="switch-hide">ON</div>
              </div>
            </div>
          </div>
          <div className="link-lists-container">
            <div className="link-list right">
              <div className="allowed-title">Allowed Videos</div>
              { allowedVideos?.map((vidId, i) => {
                const link = `https://www.youtube.com/watch?v=${vidId}`;
                return (
                  <div key={i} className="link-item-container">
                    <div className="link-item">
                      <a href={ link }>{ (videoStorage && videoStorage[vidId]) ? videoStorage[vidId].title : link }</a>
                      <div className="icon-container"
                           onClick={() => deleteLink('vid', vidId)}>
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
              { allowedPlaylists?.map((PlID, i) => {
                const link = `https://www.youtube.com/playlist?list=${PlID}`;
                return (
                  <div key={i} className="link-item-container">
                    <div className="link-item">
                      <a href={ link }>{ (plStorage && plStorage[PlID]) ? plStorage[PlID].plName : link }</a>
                        <div className="icon-container"
                             onClick={() => deleteLink('pl', PlID)}>
                           <i className="far fa-times-circle"></i>
                        </div>
                    </div>
                  </div>
                );
              }) }
            </div>
            <LinkList>
              { allowedVideos?.map((id, i) => {
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

const AppWrapper = () => {
  return (
    <StorageProvider>
      <App />
    </StorageProvider>
  );
}


render(<AppWrapper />, document.getElementById('root'));
