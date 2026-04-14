import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  geoOrthographic,
  geoPath,
  geoGraticule,
  geoCentroid,
  geoDistance,
  geoArea,
} from "d3-geo";
import { CountriesContext, DataContext, FocusContext } from "../DataProvider";
import { categories, legacyCategories } from "../../utils/data";
import { getCountryColor } from "../../utils/colors";
import { getIconPosition } from "../../utils/map";
import GlobePopup from "./GlobePopup";
import "./Map.css";

const TOP_MARGIN = 10; // px gap between popup top and container edge

// Memoized path element — skips re-render when only hoveredIdx changes for
// unrelated countries, saving ~750 closure allocations and React diffing per
// hover event.
const CountryPath = React.memo(function CountryPath({
  d,
  fill,
  strokeColor,
  strokeWidth,
  idx,
  onEnter,
  onLeave,
  onClick,
}) {
  return (
    <path
      className="globe-country"
      d={d}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      onMouseEnter={() => onEnter(idx)}
      onMouseLeave={onLeave}
      onClick={() => onClick(idx)}
    />
  );
});

const GlobeView = ({ category, selected, setCountry, setCategory }) => {
  const countries = useContext(CountriesContext);
  const dataContext = useContext(DataContext);
  const focus = useContext(FocusContext);
  const data =
    dataContext?.[legacyCategories.includes(category) ? "legacy" : "current"];

  const containerRef = useRef();
  // Cache the container's bounding rect so popupScreenPos never forces a
  // layout reflow — updated only on resize (the only time it actually changes).
  const containerRectRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [rotation, setRotation] = useState([-20, -5]);
  // Keep a ref to the latest rotation so callbacks can read it without stale closures
  const rotationRef = useRef(rotation);
  const [scale, setScale] = useState(1);

  const dragStart = useRef(null);
  const wasDrag = useRef(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const legend = useMemo(
    () => categories.find((c) => c.id === category).legend,
    [category]
  );

  // Popup anchor stored as geographic coords so it re-projects on every render.
  // { properties, lng, lat }
  const [popup, setPopup] = useState(null);
  const [popupClosing, setPopupClosing] = useState(false);
  const [popupHeight, setPopupHeight] = useState(0);
  const hasTilted = useRef(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
      // Cache rect here — avoids getBoundingClientRect() during render (#7)
      containerRectRef.current = el.getBoundingClientRect();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cancel any pending popup-close timer on unmount
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  rotationRef.current = rotation;

  const { width, height } = dimensions;
  const baseRadius = Math.min(width, height) / 2 - 10;
  const radius = baseRadius * scale;

  // Create projection once per stable geometry (width/height/radius), NOT per
  // rotation change. We mutate it in-place with .rotate() before every render,
  // which avoids reallocating the projection + pathGenerator on every drag
  // frame (#1 + #2).
  const projection = useMemo(() => {
    if (!width || !height) return null;
    return geoOrthographic()
      .scale(radius)
      .translate([width / 2, height / 2])
      .clipAngle(90);
  }, [width, height, radius]);

  // Mutate projection with current rotation before any path generation below.
  if (projection) projection.rotate(rotation);

  const pathGenerator = useMemo(
    () => (projection ? geoPath(projection) : null),
    [projection]
  );

  const graticule = useMemo(() => geoGraticule()(), []);

  // Animate rotation from current value to target over `duration` ms,
  // then call `onDone` if provided.
  const animateToRotation = useCallback((target, duration = 400, onDone) => {
    const startTime = performance.now();
    // Capture the start rotation once so every frame interpolates from the
    // same origin — not from whatever `prev` happens to be mid-animation.
    const startRotation = rotationRef.current;
    let rafId;
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const next = [
        startRotation[0] + (target[0] - startRotation[0]) * ease,
        startRotation[1] + (target[1] - startRotation[1]) * ease,
      ];
      setRotation(next);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setRotation(target);
        if (onDone) onDone();
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Given the centroid (lng, lat) and the current rotation, compute the φ
  // that places the centroid at svgY=targetY. Uses the orthographic y formula:
  //   svgY = height/2 - sin((lat + φ) * π/180) * radius
  const phiForAnchorY = useCallback(
    (lat, targetY) => {
      const sinVal = (height / 2 - targetY) / radius;
      return (
        Math.asin(Math.max(-1, Math.min(1, sinVal))) * (180 / Math.PI) - lat
      );
    },
    [height, radius]
  );

  // Drag — reads rotation from ref so this callback is stable across frames (#5)
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY, rotation: rotationRef.current };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.hypot(dx, dy) > 3) wasDrag.current = true;
    const [l0, p0] = dragStart.current.rotation;
    setRotation([l0 + dx * 0.4, p0 - dy * 0.4]);
  }, []);

  const onMouseUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  // Scroll zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      setScale((s) => Math.max(0.4, Math.min(8, s - e.deltaY * 0.001)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Flatten MultiPolygon features
  const features = useMemo(
    () =>
      (countries?.features || [])
        .filter((f) => f.geometry != null)
        .flatMap((feature) => {
          const { geometry, properties } = feature;
          if (geometry.type === "MultiPolygon") {
            return geometry.coordinates.map((coords) => ({
              type: "Feature",
              geometry: { type: "Polygon", coordinates: coords },
              properties,
            }));
          }
          return [feature];
        }),
    [countries]
  );

  // Pre-compute a code→color map so each feature does one O(1) lookup
  // instead of a full legend scan during render (#3).
  const colorMap = useMemo(() => {
    const map = {};
    features.forEach((f) => {
      const code = f.properties.CODE;
      if (code && !(code in map)) {
        map[code] = getCountryColor(code, legend, data);
      }
    });
    return map;
  }, [features, legend, data]);

  // Pre-compute which features should be hidden (area > threshold) so the
  // check is O(1) per feature during render instead of a d3-geo calculation.
  // Keyed on features + radius since the threshold depends on radius.
  const oversizedSet = useMemo(() => {
    if (!pathGenerator) return new Set();
    const threshold = 0.4 * Math.PI * radius * radius;
    const set = new Set();
    features.forEach((f, i) => {
      if (pathGenerator.area(f) > threshold) set.add(i);
    });
    return set;
  }, [features, radius, pathGenerator]);

  // Countries with focus data that have at least one matching legend entry
  const focusIcons = useMemo(() => {
    if (!focus || !legend || !countries?.features) return [];
    return countries.features
      .filter((f) => {
        const code = f.properties.CODE;
        return focus[code] && legend.some((l) => focus[code][l.code]);
      })
      .map((f) => {
        const [lng, lat] = getIconPosition(f.geometry);
        return { properties: f.properties, lng, lat, feature: f };
      });
  }, [focus, legend, countries]);

  const doOpenPopup = useCallback(
    (feature) => {
      const [lng, lat] = geoCentroid(feature);
      hasTilted.current = false;
      setPopupHeight(0);
      setPopupClosing(false);
      setCountry();
      setPopup({ properties: feature.properties, lng, lat });
    },
    [setCountry]
  );

  // Fade out current popup (if any) then open new one.
  const openPopup = useCallback(
    (feature) => {
      if (popup) {
        clearTimeout(closeTimerRef.current);
        setPopupClosing(true);
        closeTimerRef.current = setTimeout(() => doOpenPopup(feature), 200);
      } else {
        doOpenPopup(feature);
      }
    },
    [popup, doOpenPopup]
  );

  const closePopup = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    setPopupClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setPopup(null);
      setPopupClosing(false);
    }, 200);
  }, []);

  // Keep a ref to openPopup so handleClick never needs to change identity
  // when popup state changes, preserving CountryPath memo across popup open/close.
  const openPopupRef = useRef(openPopup);
  openPopupRef.current = openPopup;

  // Stable handlers passed to CountryPath so memo can skip re-renders (#6)
  const handleEnter = useCallback((idx) => setHoveredIdx(idx), []);
  const handleLeave = useCallback(() => setHoveredIdx(null), []);
  const handleClick = useCallback(
    (idx) => {
      if (wasDrag.current) { wasDrag.current = false; return; }
      openPopupRef.current(features[idx]);
    },
    [features]
  );

  // Once the popup has measured its real height, tilt the globe if the popup
  // would be clipped at the top of the container.
  useEffect(() => {
    if (!popup || !projection || popupHeight === 0 || hasTilted.current) return;
    const svgPos = projection([popup.lng, popup.lat]);
    if (!svgPos) return;
    const needed = popupHeight + TOP_MARGIN;
    if (svgPos[1] < needed) {
      hasTilted.current = true;
      const targetPhi = phiForAnchorY(popup.lat, needed);
      animateToRotation([rotationRef.current[0], targetPhi], 300);
    }
  }, [popupHeight, popup, projection, phiForAnchorY, animateToRotation]);

  // Table selection: animate to centroid then open popup
  useEffect(() => {
    if (!selected || !features.length) return;
    const matches = features.filter((f) => f.properties.NAME === selected);
    if (!matches.length) return;
    // Compute geoArea once per candidate to avoid double-calling in reduce (#4)
    const feature = matches
      .map((f) => [f, geoArea(f)])
      .reduce((best, curr) => (curr[1] > best[1] ? curr : best))[0];

    const [lng, lat] = geoCentroid(feature);
    const target = [-lng, -lat];

    return animateToRotation(target, 400, () => {
      hasTilted.current = true; // already centred — no tilt needed
      setPopupHeight(0);
      setPopupClosing(false);
      setPopup({ properties: feature.properties, lng, lat });
    });
  }, [selected, features, animateToRotation]);

  // Re-project popup anchor to screen coords on every render.
  // Returns null if the anchor is behind the horizon → hides the popup.
  // Uses cached containerRect to avoid a forced layout reflow (#7).
  const popupScreenPos = useMemo(() => {
    if (!popup || !projection) return null;
    const visibleCenter = [-rotation[0], -rotation[1]];
    if (geoDistance([popup.lng, popup.lat], visibleCenter) > Math.PI / 2)
      return null;
    const svgPos = projection([popup.lng, popup.lat]);
    if (!svgPos) return null;
    const rect = containerRectRef.current;
    if (!rect) return null;
    return { x: rect.left + svgPos[0], y: rect.top + svgPos[1] };
  }, [popup, projection, rotation]);

  if (!width || !pathGenerator) {
    return <div ref={containerRef} className="Map" />;
  }

  return (
    <div ref={containerRef} className="Map" style={{ cursor: "grab" }}>
      <div style={{ position: "absolute", right: 10, top: 88, zIndex: 1000 }}>
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className="leaflet-control-zoom-in"
            role="button"
            aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(8, s + 0.3))}
          >+</a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className="leaflet-control-zoom-out"
            role="button"
            aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.4, s - 0.3))}
          >−</a>
        </div>
      </div>
      <svg
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="#edf7ff"
          stroke="#aaa"
          strokeWidth={0.5}
        />
        <path
          d={pathGenerator(graticule)}
          fill="none"
          stroke="#ccc"
          strokeWidth={0.4}
        />
        {features.map((feature, i) => {
          if (i === hoveredIdx) return null; // rendered last, on top
          if (oversizedSet.has(i)) return null;
          const d = pathGenerator(feature);
          if (!d) return null;
          return (
            <CountryPath
              key={`${feature.properties.CODE}-${i}`}
              d={d}
              fill={colorMap[feature.properties.CODE] || "#fff"}
              strokeColor="#555"
              strokeWidth={1}
              idx={i}
              onEnter={handleEnter}
              onLeave={handleLeave}
              onClick={handleClick}
            />
          );
        })}
        {/* Hovered country rendered last so its stroke is never occluded */}
        {hoveredIdx !== null && (() => {
          const feature = features[hoveredIdx];
          if (!feature) return null;
          const d = pathGenerator(feature);
          if (!d) return null;
          return (
            <CountryPath
              key={`${feature.properties.CODE}-${hoveredIdx}-top`}
              d={d}
              fill={colorMap[feature.properties.CODE] || "#fff"}
              strokeColor="#333"
              strokeWidth={1.5}
              idx={hoveredIdx}
              onEnter={handleEnter}
              onLeave={handleLeave}
              onClick={handleClick}
            />
          );
        })()}
        {/* Focus info icons */}
        {focusIcons.map(({ properties, lng, lat, feature }) => {
          const svgPos = projection([lng, lat]);
          if (!svgPos) return null;
          const visibleCenter = [-rotation[0], -rotation[1]];
          if (geoDistance([lng, lat], visibleCenter) > Math.PI / 2) return null;
          return (
            <image
              key={`icon-${properties.CODE}`}
              href="/dhis2-in-action/icon-info-48.png"
              x={svgPos[0] - 10}
              y={svgPos[1] - 10}
              width={20}
              height={20}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                if (wasDrag.current) { wasDrag.current = false; return; }
                openPopup(feature);
              }}
            />
          );
        })}
      </svg>

      {popup && popupScreenPos && (
        <GlobePopup
          x={popupScreenPos.x}
          y={popupScreenPos.y}
          closing={popupClosing}
          category={category}
          country={popup.properties}
          legend={legend}
          setCountry={setCountry}
          setCategory={setCategory}
          onHeightChange={setPopupHeight}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default GlobeView;
