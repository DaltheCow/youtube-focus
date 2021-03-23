import * as React from 'react';
import { render } from 'react-dom';
import VideoLinkItem from '../components/VideoLinkItem.jsx';
import LinkList from '../components/linkList.jsx';
import { useStorageContext, StorageProvider } from '../contexts/storage.context.jsx';


const App = () => {
  const { dataStorage, isLoaded } = useStorageContext();
  const { allowedVideos, videoStorage } = dataStorage;
  if (!isLoaded) {
    return <div>'...loading'</div>
  }
  return (
    <LinkList>
      { allowedVideos.map((id, i) => {
        const vidInfo = videoStorage[id];
        return (
          <VideoLinkItem key={i} { ...vidInfo } id={ id } />
        );
      })}
    </LinkList>
  )
}

const AppWrapper = () => {
  return (
    <StorageProvider>
      <App />
    </StorageProvider>
  )
}


render(<AppWrapper />, document.getElementById('root'));
