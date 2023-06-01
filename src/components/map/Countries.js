import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { geoJSON } from "leaflet";
import Popup from "./Popup";
import { MapContext } from "./MapProvider";
import CountryFocus from "./CountryFocus";
import { CountriesContext, DataContext } from "../DataProvider";
import { categories, legacyCategories } from "../../utils/data";
import { getIconPosition } from "../../utils/map";

const noDataColor = "#fff";

const Countries = ({ category, selected, setCountry, setCategory }) => {
  const countries = useContext(CountriesContext);
  const dataContext = useContext(DataContext);
  const data =
    dataContext?.[legacyCategories.includes(category) ? "legacy" : "current"];

  const map = useContext(MapContext);
  const [layer, setLayer] = useState();
  const [feature, setFeature] = useState();
  const [latlng, setLatlng] = useState();

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
          fillColor: noDataColor,
          fillOpacity: 0.75,
        }).addTo(map)
      );
    }
  }, [map, countries]);

  useEffect(() => {
    if (layer && legend && data) {
      const { countries, lastYear } = data;

      layer.eachLayer((item) =>
        item.setStyle({
          fillColor: noDataColor,
        })
      );

      layer.eachLayer((item) => {
        const code = item.feature.properties.CODE;

        if (code && countries[code] && countries[code][lastYear]) {
          const country = countries[code];
          const letters = country[lastYear];

          // Use name from Google Spreadsheet
          item.feature.properties.NAME = country.name;

          legend.forEach(({ code, color }) => {
            if (letters.indexOf(code) !== -1 || code === "_") {
              item.setStyle({
                fillColor: color,
              });
            }
          });
        }
      });
    }
  }, [layer, legend, data]);

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
