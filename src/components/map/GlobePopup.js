import React, { useRef, useState, useEffect, useCallback } from "react";
import PopupContent from "./PopupContent";

const GlobePopup = ({
  x,
  y,
  closing,
  category,
  country,
  legend,
  setCountry,
  setCategory,
  onClose,
  onHeightChange,
}) => {
  const contentRef = useRef(null);
  const onHeightChangeRef = useRef(onHeightChange);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Keep ref in sync so the ResizeObserver always calls the latest callback
  // without needing to re-register the observer on every render.
  useEffect(() => {
    onHeightChangeRef.current = onHeightChange;
  });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
      if (onHeightChangeRef.current) onHeightChangeRef.current(rect.height + 36);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      className={`leaflet-container ${closing ? "globe-popup-exit" : "globe-popup-enter"}`}
      style={{
        position: "fixed",
        left: x - size.width / 2 - 22,
        top: y - size.height - 36,
        width: 300,
        zIndex: 2000,
        overflow: "visible",
        background: "none",
        visibility: size.height === 0 ? "hidden" : "visible",
      }}
    >
      <div className="leaflet-popup leaflet-zoom-animated">
        <div className="leaflet-popup-content-wrapper">
          <div className="leaflet-popup-content">
            <div ref={contentRef} style={{ display: "inline-block" }}>
              <PopupContent
                category={category}
                country={country}
                legend={legend}
                setCountry={setCountry}
                setCategory={setCategory}
              />
            </div>
          </div>
        </div>
        <div className="leaflet-popup-tip-container">
          <div className="leaflet-popup-tip" />
        </div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          className="leaflet-popup-close-button"
          role="button"
          aria-label="Close popup"
          onClick={onCloseClick}
        >
          ×
        </a>
      </div>
    </div>
  );
};

export default GlobePopup;
