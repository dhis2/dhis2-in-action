import React, { useContext, useCallback } from "react";
import { DataContext } from "../DataProvider";
import MatchingStatesLinks, { getMatchingStates } from "./MatchingStatesLinks"
import { categories } from "../../utils/data";

const PopupExplore = ({ country, letters = "", lastYear, setCategory, setCountry }) => {
  const dataContext = useContext(DataContext);
  const onClick = useCallback(
    (category) => {
      setCategory(category);
      setCountry(country.NAME);
    },
    [country, setCategory, setCountry]
  );

  return categories
    .filter((c) => !c.legacy && c.legend.find((l) => letters.includes(l.code)))
    .map(({ id, title, legend, legacy }) => {
      const { code, name } = legend.find((l) => letters.includes(l.code));
      const data = dataContext[legacy ? 'legacy' : 'current']
      const matchingStates = getMatchingStates({ data, countryCode: country.CODE, categoryCode: code, lastYear })

      return (
        <div className="explore" key={code} onClick={() => onClick(id)}>
          {legend.length > 1 ? (
            <>
              {title}: {name}
              <MatchingStatesLinks states={matchingStates} onStateClick={setCountry} />
            </>
          ) : (
            <>
              {name}
              <MatchingStatesLinks states={matchingStates} onStateClick={setCountry} />
            </>
          )}
        </div>
      );
    });
};

export default PopupExplore;
