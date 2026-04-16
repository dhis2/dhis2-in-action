import React, { useContext } from "react";
import { DataContext, FocusContext } from "../DataProvider";
import { legacyCategories } from "../../utils/data";
import MatchingStatesLinks, { getMatchingStates } from "./MatchingStatesLinks";
import PopupExplore from "./PopupExplore";
import PopupFocus from "./PopupFocus";

const PopupContent = ({ category, country, legend, setCountry, setCategory }) => {
  const dataContext = useContext(DataContext);
  const data =
    dataContext?.[legacyCategories.includes(category) ? "legacy" : "current"];
  const focus = useContext(FocusContext);

  const { CODE, NAME } = country;

  const countryData = data?.countriesAndStates[CODE];
  const focusItem = legend.find((l) => focus?.[CODE]?.[l.code]);
  const countryFocus = focus?.[CODE]?.[focusItem?.code];

  const isExploreMode = legend.length > 0 && legend[0].code === "_";

  const legendItems =
    countryData &&
    legend
      .map((i) => ({
        ...i,
        year: data.years.find(
          (y) => countryData[y] && countryData[y].includes(i.code)
        ),
      }))
      .filter((i) => i.year);

  return (
    <>
      <h2>{NAME}</h2>
      {legendItems?.map(({ code, name, year }) => {
        const matchingStates = getMatchingStates({
          data,
          countryCode: CODE,
          categoryCode: code,
          lastYear: data.lastYear,
        });

        return (
          <div key={code}>
            {name === "National" ? (
              matchingStates.length ? "National scale" : "National scale since "
            ) : name === "Subnational" ? (
              matchingStates.length ? "Using DHIS2" : "Using DHIS2 since "
            ) : matchingStates.length ? (
              <>{name}</>
            ) : (
              <>{name}: Since </>
            )}
            {matchingStates.length ? (
              <MatchingStatesLinks
                states={matchingStates}
                onStateClick={setCountry}
              />
            ) : (
              year
            )}
          </div>
        );
      })}
      {isExploreMode && countryData ? (
        <PopupExplore
          country={country}
          letters={countryData[data.lastYear]}
          data={data}
          lastYear={data.lastYear}
          setCountry={setCountry}
          setCategory={setCategory}
        />
      ) : null}
      {countryFocus ? <PopupFocus data={countryFocus} /> : null}
    </>
  );
};

export default PopupContent;
