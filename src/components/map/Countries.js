import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { geoJSON } from "leaflet";
import Popup from "./Popup";
import { MapContext } from "./MapProvider";
import CountryFocus from "./CountryFocus";
import { CountriesContext, DataContext } from "../DataProvider";
import { categories, legacyCategories } from "../../utils/data";
import { getIconPosition } from "../../utils/map";
import { getCountryColor } from "../../utils/colors";

const Countries = ({ category, selected, setCountry, setCategory }) => {
  const countries = useContext(CountriesContext);
  const dataContext = useContext(DataContext);
  const data =
    dataContext?.[legacyCategories.includes(category) ? "legacy" : "current"];

  const map = useContext(MapContext);
  const [layer, setLayer] = useState();
  const [feature, setFeature] = useState();
  const [latlng, setLatlng] = useState();
  const hoveredLayer = useRef(null);

  const legend = useMemo(
    () => categories.find((c) => c.id === category).legend,
    [category]
  );

  const onClick = useCallback(
    ({ latlng, layer }) => {
      setFeature();
      setLatlng(latlng);
      setFeature(layer.feature.properties);
      setCountry(); // Clear previously clicked country in list
    },
    [setCountry]
  );

  useEffect(() => {
    if (countries) {
      setLayer(
        geoJSON(countries, {
          color: "#555",
          weight: 1,
          fillColor: "#fff",
          fillOpacity: 1,
          onEachFeature: (_feature, l) => {
            l.on({
              mouseover: (e) => {
                if (hoveredLayer.current && hoveredLayer.current !== e.target) {
                  hoveredLayer.current.setStyle({ color: "#555", weight: 1 });
                }
                hoveredLayer.current = e.target;
                e.target.setStyle({ color: "#333", weight: 1.5 });
                e.target.bringToFront();
              },
              mouseout: (e) => {
                if (hoveredLayer.current === e.target) {
                  hoveredLayer.current = null;
                }
                e.target.setStyle({ color: "#555", weight: 1 });
              },
            });
          },
        }).addTo(map)
      );
    }
  }, [map, countries]);

  useEffect(() => {
    if (layer && legend && data) {
      const { countriesOrStates } = data;

      layer.eachLayer((item) => {
        const code = item.feature.properties.CODE;

        // Use name from Google Spreadsheet
        if (code && countriesOrStates[code]) {
          item.feature.properties.NAME = countriesOrStates[code].name;
        }

        item.setStyle({ fillColor: getCountryColor(code, legend, data) });
      });
    }
  }, [layer, legend, data]);

  useEffect(() => {
    if (!map) return;
    const reset = () => {
      if (hoveredLayer.current) {
        hoveredLayer.current.setStyle({ color: "#555", weight: 1 });
        hoveredLayer.current = null;
      }
    };
    const container = map.getContainer();
    container.addEventListener("mouseleave", reset);
    return () => container.removeEventListener("mouseleave", reset);
  }, [map]);

  useEffect(() => {
    if (layer) {
      layer.on("click", onClick);
    }
    return () => {
      if (layer) {
        layer.off("click", onClick);
      }
    };
  }, [layer, onClick]);

  useEffect(() => {
    if (selected) {
      const selectedLayer = layer
        .getLayers()
        .find((l) => l.feature.properties.NAME === selected);

      if (selectedLayer) {
        setLatlng(getIconPosition(selectedLayer.feature.geometry).reverse());
        setFeature(selectedLayer.feature.properties);
      }
    }
  }, [layer, selected]);

  return (
    <>
      <CountryFocus layer={layer} legend={legend} onClick={onClick} />
      {feature ? (
        <Popup
          category={category}
          country={feature}
          latlng={latlng}
          legend={legend}
          setCountry={setCountry}
          setCategory={setCategory}
          onClose={() => setFeature()}
        />
      ) : null}
    </>
  );
};

export default Countries;
