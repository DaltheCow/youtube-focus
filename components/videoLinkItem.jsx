import React from 'react';

const VideoLinkItem = (props) => {
  let { id, title, viewsShort, viewsLong, channel, publishDate, duration } = props;
  console.log(props);
  duration = !duration ? null : (
    <div className="duration-container">
      { duration }
    </div>
  )

  return (
    <div>
      <a href={`https://www.youtube.com/watch?v=${id}`}>
        <div className="img-duration-container">
          <img src={`https://img.youtube.com/vi/${id}/0.jpg`} />
          { duration }
        </div>
      </a>
    </div>
  );
};

export default VideoLinkItem;
