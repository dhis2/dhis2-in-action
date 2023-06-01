import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { categories } from "../utils/data";
import "./List.css";

const marginTop = 70;
const marginBottom = 20;

const List = ({ category, data, show, focus, onClick }) => {
  const container = useRef();
  const [cols, setCols] = useState(null);

  const legend = useMemo(
    () => categories.find((c) => c.id === category).legend,
    [category]
  );

  const lists = useMemo(() => {
    if (legend && data) {
      const { countries, lastYear } = data;

      setCols(null);

      return legend.map(({ code, name, color }) => ({
        name,
        color,
        items: Object.values(countries)
          .filter((country) => {
            const letters = country[lastYear];
            return letters && (code === "_" || letters.indexOf(code) !== -1);
          }, [])
          .map((c) => c.name)
          .sort(),
        focus: (focus
          ? Object.keys(countries).filter((id) => focus[id] && focus[id][code])
          : []
        ).map((id) => countries[id].name),
      }));
    }
  }, [legend, data, focus]);

  const onResize = useCallback(() => {
    if (lists && container.current) {
      const { clientHeight } = container.current;
      const count = Math.floor((clientHeight - marginTop - marginBottom) / 20);
      const cols = lists.map(({ items }) => Math.ceil(items.length / count));

      setCols(cols);
    }
  }, [container, lists]);

  useEffect(() => {
    if (show) {
      window.addEventListener("resize", onResize);
      onResize();
    }
    return () => window.removeEventListener("resize", onResize);
  }, [show, onResize]);

  return (
    <div
      id="list"
      ref={container}
      className={`List List-${show ? "show" : "hide"}`}
    >
      <div className="container">
        {cols &&
          lists &&
          lists.map(({ name, color, items, focus }, index) => {
            const numCols = cols[index];

            return (
              <div
                key={name}
                className="section"
                style={{
                  flexGrow: numCols,
                  flexShrink: numCols,
                }}
              >
                <h2>
                  <span style={{ backgroundColor: color }}></span>
                  {name}: {items.length}
                </h2>
                <ul
                  style={{
                    columnCount: numCols,
                  }}
                >
                  {items.map((name) => (
                    <li key={name} onClick={() => onClick(name)}>
                      {name}
                      {focus.includes(name) ? (
                        <img src="icon-info-48.png" alt="More information" />
                      ) : (
                        ""
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default List;
