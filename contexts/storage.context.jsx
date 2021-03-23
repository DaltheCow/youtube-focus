import * as React from 'react';
import { getStorage, setStorage, getStorageAll } from "../modules/storage";


const Context = React.createContext({ isLoaded: false, dataStorage: {}, deleteLink: () => {}, toggleField: () => {}});

export const StorageProvider = ({children}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [dataStorage, setDataStorage] = React.useState({});

    React.useEffect(() => {
        getStorageAll(['settings', 'videoStorage', 'plStorage'])
            .then(data => {
            const { settings, videoStorage, plStorage } = data;
            const { allowedVideos, allowedPlaylists, hideRelated, hideComments, hideEndScreen, enableContentBlocking } = settings;
            setDataStorage({ allowedVideos, allowedPlaylists, videoStorage, plStorage, hideRelated, hideComments, hideEndScreen, enableContentBlocking });
            setIsLoaded(true);
            });
    },[]);

    React.useEffect(() => {
        const listenerFunc = (changes, namespace) => {
            if (changes['settings']) {
                const { oldValue, newValue } = changes.settings;
                const fields = ['hideRelated', 'hideComments', 'hideEndScreen', 'enableContentBlocking', 'allowedVideos', 'allowedPlaylists'];
                while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
                fields.shift();
                }
                setDataStorage({ ...dataStorage, [fields[0]]: newValue[fields[0]]});
            } else if (changes['plStorage']) {
                const { newValue } = changes.plStorage;
                setDataStorage({ ...dataStorage, plStorage: newValue });
            } else if (changes['videoStorage']) {
                const { newValue } = changes.videoStorage;
                setDataStorage({ ...dataStorage, videoStorage: newValue})
            }
        };
        chrome.storage.onChanged.addListener(listenerFunc);

        return () => chrome.storage.onChanged.removeListener(listenerFunc);
    }, [dataStorage]);

    const toggleField = (fieldName) => {
        const field = dataStorage[fieldName];
        getStorage('settings', data => {
            const settings = Object.assign(data.settings, { [fieldName]: !field });
            setStorage('settings', { settings }, () => {
                setDataStorage({ ...dataStorage, [fieldName]: !field });
            });
        })
    }

    const deleteLink = (listType, id) => {
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


    return (
        <Context.Provider value={{ isLoaded, dataStorage, deleteLink, toggleField }}>
            {children}
        </Context.Provider>
    );
};

export const useStorageContext = () => {
    return React.useContext(Context);
}