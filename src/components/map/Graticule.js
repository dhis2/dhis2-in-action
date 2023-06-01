import { useContext, useEffect } from "react";
import Graticule from "../../utils/graticule";
import { MapContext } from "./MapProvider";

const GraticuleLayer = () => {
  const map = useContext(MapContext);

  useEffect(() => {
    new Graticule({
      sphere: true,
      style: {
        opacity: 0,
        fillColor: "#edf7ff",
        fillOpacity: 1,
        clickable: false,
      },
    }).addTo(map);
  }, [map]);

  return null;
};

export default GraticuleLayer;
