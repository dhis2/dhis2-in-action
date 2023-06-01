import React, { useCallback } from "react";
import { categories } from "../../utils/data";

const PopupExplore = ({ country, letters = "", setCategory, setCountry }) => {
  const onClick = useCallback(
    (category) => {
      setCategory(category);
      setCountry(country.NAME);
    },
    [country, setCategory, setCountry]
  );

  return categories
    .filter((c) => !c.legacy && c.legend.find((l) => letters.includes(l.code)))
    .map(({ id, title, legend }) => {
      const { code, name } = legend.find((l) => letters.includes(l.code));
      return (
        <div className="explore" key={code} onClick={() => onClick(id)}>
          {legend.length > 1 ? (
            <>
              {title}: {name}
            </>
          ) : (
            name
          )}
        </div>
      );
    });
};

export default PopupExplore;
