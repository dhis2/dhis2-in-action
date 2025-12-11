import React from "react";
import { STATE_SEPARATOR } from "../../utils/data";

export const getMatchingStates = ({ data, countryCode, categoryCode, lastYear }) => {
  if (!data?.countriesAndStates) return [];

  return Object.entries(data.countriesAndStates)
    .filter(([key, value]) =>
      key.includes(STATE_SEPARATOR) &&
      key.split(STATE_SEPARATOR)[0] === countryCode &&
      value[lastYear]?.includes(categoryCode)
    )
    .map(([key, value]) => ({ name: value.name, key }));
};

const MatchingStatesLinks = ({ states, onStateClick }) => {
  if (!states || states.length === 0) return null;
  return (
    <>
      {" ("}
      {states.map((state, idx) => (
        <>
          <span
            key={state.key}
            onClick={(e) => {
              e.stopPropagation();
              onStateClick(state.name);
            }}
            style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
          >
            {state.name}
          </span>
          <span>
            {idx < states.length - 1 ? ", " : ""}
          </span>
        </>
      ))}
      {")"}
    </>
  );
};

export default MatchingStatesLinks;
