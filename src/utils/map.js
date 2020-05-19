import area from "@turf/area";
import polylabel from "polylabel";

export const getIconPosition = ({ type, coordinates }) => {
  let polygon = coordinates;

  if (type === "MultiPolygon") {
    const areas = coordinates.map((coords) =>
      area({
        type: "Polygon",
        coordinates: coords,
      })
    );
    const maxIndex = areas.indexOf(Math.max.apply(null, areas));
    polygon = coordinates[maxIndex];
  }

  return polylabel(polygon, 0.1);
};
