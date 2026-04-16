import React, { useRef, useEffect, forwardRef } from "react";
import PopupContent from "./PopupContent";

const GlobePopup = forwardRef(function GlobePopup({
  closing,
  category,
  country,
  legend,
  setCountry,
  setCategory,
  onClose,
  onSizeChange,
}, outerRef) {
  const contentRef = useRef(null);
  const onSizeChangeRef = useRef(onSizeChange);

  // Keep ref in sync so the ResizeObserver always calls the latest callback
  // without needing to re-register the observer on every render.
  useEffect(() => {
    onSizeChangeRef.current = onSizeChange;
  });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Use entry.contentRect to avoid triggering a layout reflow (M-6)
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (onSizeChangeRef.current) onSizeChangeRef.current(width, height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className={`leaflet-container ${closing ? "globe-popup-exit" : "globe-popup-enter"}`}
      style={{
        position: "fixed",
        width: 300,
        zIndex: 0,
        overflow: "visible",
        background: "none",
        // left, top, visibility are set imperatively by applyRotationRef in
        // GlobeView — keeping them out of React style prevents jump on re-render.
      }}
    >
      <div className="leaflet-popup">
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
          onClick={onClose}
        >
          ×
        </a>
      </div>
    </div>
  );
});

export default GlobePopup;
