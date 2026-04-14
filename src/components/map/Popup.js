import React, { useContext, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { popup } from "leaflet";
import PopupContent from "./PopupContent";
import { MapContext } from "./MapProvider";

const container = document.createElement("div");

const Popup = ({
  latlng,
  category,
  country,
  legend,
  setCountry,
  setCategory,
  onClose,
}) => {
  const map = useContext(MapContext);

  const onPopupOpen = useCallback(
    () => document.body.classList.add("popupopen"),
    []
  );

  const onPopupClose = useCallback(() => {
    document.body.classList.remove("popupopen");
    setCountry();
    onClose();
  }, [setCountry, onClose]);

  useEffect(() => {
    const { clientWidth, clientHeight } = map.getContainer();
    const maxWidth = clientWidth < 400 ? clientWidth - 100 : 300;
    const maxHeight = clientHeight - 100;

    popup({ maxWidth, maxHeight })
      .setLatLng(latlng)
      .setContent(container)
      .openOn(map);
  }, [map, latlng, category]);

  useEffect(() => {
    if (map) {
      map.on("popupopen", onPopupOpen);
      map.on("popupclose", onPopupClose);
    }
    return () => {
      if (map) {
        map.off("popupopen", onPopupOpen);
        map.off("popupclose", onPopupClose);
      }
    };
  }, [map, onPopupOpen, onPopupClose]);

  return createPortal(
    <PopupContent
      category={category}
      country={country}
      legend={legend}
      setCountry={setCountry}
      setCategory={setCategory}
    />,
    container
  );
};

export default Popup;
