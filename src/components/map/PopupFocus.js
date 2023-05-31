import React from "react";

const PopupFocus = ({ data }) => {
  const { title, body, imageurl, imagelink, youtubeid, readmorelink } = data;

  return (
    <>
      <h3>{title}</h3>
      {body && <div dangerouslySetInnerHTML={{ __html: body }} />}
      {youtubeid ? (
        <div className="aspect-ratio">
          <iframe
            title="YouTube video player"
            src={`https://www.youtube.com/embed/${youtubeid}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : imageurl ? (
        <>
          {imagelink ? (
            <a href={imagelink} rel="noopener noreferrer" target="_blank">
              <img src={imageurl} alt="" />
            </a>
          ) : (
            <img src={imageurl} alt="" />
          )}
        </>
      ) : null}
      {readmorelink && (
        <p>
          <a href={readmorelink} rel="noopener noreferrer" target="_blank">
            Learn more
          </a>
        </p>
      )}
    </>
  );
};

export default PopupFocus;
