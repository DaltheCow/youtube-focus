import React from 'react';

const VideoLinkItem = (props) => {
  let { id, title, viewsShort, viewsLong, channel, publishDate, duration } = props;
  const src = `http://img.youtube.com/vi/${id}/mqdefault.jpg`;
  const fallback = `https://img.youtube.com/vi/${id}/0.jpg`
  const [error, setError] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(src);

  const onError = () => {
    if (!error) {
      setImgSrc(fallback);
      setError(true);
    }
  }

  duration = !duration ? null : (
    <div className="duration-container">
      { duration }
    </div>
  );


  return (
    <div>
      <a style={{ display: "inline", textDecoration: "none", maxWidth: "360px", maxHeight: "240px", position: "relative" }} href={`https://www.youtube.com/watch?v=${id}`}>
        <img width="360" src={imgSrc} onError={onError} />
        <div style={{ position: "absolute", bottom: 0, right: 0, margin: "4px", backgroundColor: "rgba(0,0,0,0.8)", padding: "3px 4px", height: "12px", borderRadius: "2px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} className="img-duration-container">
          { duration }
        </div>
        <div className="vid-info">
          <div style={{ fontSize: "14px", lineHeight: "2rem", maxHeight: "4rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", fontWeight: "500" }}>{ title }</div>
        </div>
      </a>
    </div>
  );
};

export default VideoLinkItem;

// https://img.youtube.com/vi/5yx6BWlEVcY/0.jpg
// https://i.ytimg.com/vi/5yx6BWlEVcY/hq720_live.jpg?sqp=CNCroYQG-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDhgyCJi4G2ewSKH9QPsq06pP1qSQ



// https://www.youtube.com/watch?v=BOdLmxy06H0
// https://i.ytimg.com/an_webp/BOdLmxy06H0/mqdefault_6s.webp?du=3000&sqp=CNmZoYQG&rs=AOn4CLDj8ggvoq3uwoUwsAIRBpARsDkuTw
// https://i.ytimg.com/vi/BOdLmxy06H0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAeQQI6wlogQrdd6LnElUuod7yc0A

// https://i.ytimg.com/vi/BOdLmxy06H0/hq720_live.jpg