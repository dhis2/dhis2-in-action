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
const CountryPath = React.memo(React.forwardRef(function CountryPath({
  d,
  fill,
  strokeColor,
  strokeWidth,
  style,
  idx,
  onEnter,
  onLeave,
  onClick,
}, ref) {
  return (
    <path
      ref={ref}
      className="globe-country"
      d={d}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      style={style}
      onMouseEnter={() => onEnter(idx)}
      onMouseLeave={onLeave}
      onClick={() => onClick(idx)}
    />
  );
}));

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
  const cancelAnimRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Refs for direct DOM manipulation during drag (bypass React re-renders)
  const graticuleRef = useRef(null);
  const pathRefsRef = useRef([]); // sparse array of { el, feature } indexed by feature index
  const iconRefsRef = useRef([]); // array of { el, lng, lat }
  const popupRef = useRef(null);
  const popupSizeRef = useRef({ width: 0, height: 0 });
  const popupAnchorRef = useRef(null); // { lng, lat } kept in sync with popup state
  // Updated each render so the drag handler always has the latest pathGenerator/graticule
  const applyRotationRef = useRef(null);

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

  // Cancel any pending popup-close timer or animation on unmount
  useEffect(() => () => {
    clearTimeout(closeTimerRef.current);
    if (cancelAnimRef.current) cancelAnimRef.current();
  }, []);

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
    // Cancel any in-flight animation before starting a new one
    if (cancelAnimRef.current) cancelAnimRef.current();
    const startTime = performance.now();
    // Capture the start rotation once so every frame interpolates from the
    // same origin — not from whatever `prev` happens to be mid-animation.
    const startRotation = rotationRef.current;
    let rafId;
    const cancel = () => {
      cancelAnimationFrame(rafId);
      cancelAnimRef.current = null;
    };
    cancelAnimRef.current = cancel;
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
        cancelAnimRef.current = null;
        if (onDone) onDone();
      }
    };
    rafId = requestAnimationFrame(step);
    return cancel;
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

  // Applies a rotation directly to the DOM without triggering a React re-render.
  // Called on every drag frame; setRotation is called once on mouseup to sync state.
  const applyDragRotation = useCallback((rot) => {
    if (applyRotationRef.current) applyRotationRef.current(rot);
  }, []);

  // Drag — mousemove/mouseup are attached to window so dragging continues
  // even when the cursor leaves the viewport.
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY, rotation: rotationRef.current };

    const onMove = (e) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 3) wasDrag.current = true;
      const [l0, p0] = dragStart.current.rotation;
      applyDragRotation([l0 + dx * 0.4, p0 - dy * 0.4]);
    };

    const onUp = () => {
      dragStart.current = null;
      setRotation([...rotationRef.current]);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [applyDragRotation]);

  // Touch drag — mirrors mouse drag for single-finger rotation
  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX, y: t.clientY, rotation: rotationRef.current };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragStart.current) return;
    dragStart.current = null;
    setRotation([...rotationRef.current]);
  }, []);

  // Scroll zoom + touch move (both need passive:false to call preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheelHandler = (e) => {
      e.preventDefault();
      setScale((s) => Math.max(0.4, Math.min(8, s - e.deltaY * 0.001)));
    };
    const touchMoveHandler = (e) => {
      if (!dragStart.current || e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.x;
      const dy = t.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 3) wasDrag.current = true;
      const [l0, p0] = dragStart.current.rotation;
      applyDragRotation([l0 + dx * 0.4, p0 - dy * 0.4]);
    };
    el.addEventListener("wheel", wheelHandler, { passive: false });
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheelHandler);
      el.removeEventListener("touchmove", touchMoveHandler);
    };
  }, [applyDragRotation]);

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
  const handleEnter = useCallback((idx) => { if (!dragStart.current) setHoveredIdx(idx); }, []);
  const handleLeave = useCallback(() => { if (!dragStart.current) setHoveredIdx(null); }, []);
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
      return animateToRotation([rotationRef.current[0], targetPhi], 300);
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

    setPopup(null);
    setPopupClosing(false);

    return animateToRotation(target, 400, () => {
      doOpenPopup(feature);
    });
  }, [selected, features, animateToRotation, doOpenPopup]);

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

  // Keep popup anchor ref in sync so the drag loop can access it without stale closures
  popupAnchorRef.current = popup ? { lng: popup.lng, lat: popup.lat } : null;

  // Rebuild the drag DOM-update function each render so it closes over the
  // latest pathGenerator and graticule (changes on scale/resize, not on drag).
  if (pathGenerator) {
    applyRotationRef.current = (rot) => {
      projection.rotate(rot);
      rotationRef.current = rot;

      // Graticule
      if (graticuleRef.current) {
        const d = pathGenerator(graticule);
        if (d) graticuleRef.current.setAttribute("d", d);
      }

      // Country paths
      pathRefsRef.current.forEach((entry) => {
        if (!entry) return;
        const { el, feature } = entry;
        const d = pathGenerator(feature);
        if (d) {
          el.setAttribute("d", d);
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      });

      // Focus icons
      const visibleCenter = [-rot[0], -rot[1]];
      iconRefsRef.current.forEach((entry) => {
        if (!entry) return;
        const { el, lng, lat } = entry;
        if (geoDistance([lng, lat], visibleCenter) > Math.PI / 2) {
          el.style.display = "none";
          return;
        }
        const svgPos = projection([lng, lat]);
        if (!svgPos) { el.style.display = "none"; return; }
        el.setAttribute("x", svgPos[0] - 10);
        el.setAttribute("y", svgPos[1] - 10);
        el.style.display = "";
      });

      // Popup
      const anchor = popupAnchorRef.current;
      if (popupRef.current && anchor) {
        if (geoDistance([anchor.lng, anchor.lat], visibleCenter) > Math.PI / 2) {
          popupRef.current.style.visibility = "hidden";
        } else {
          const svgPos = projection([anchor.lng, anchor.lat]);
          if (svgPos && containerRectRef.current) {
            const rect = containerRectRef.current;
            const sx = rect.left + svgPos[0];
            const sy = rect.top + svgPos[1];
            const { width: pw, height: ph } = popupSizeRef.current;
            popupRef.current.style.left = `${sx - pw / 2 - 22}px`;
            popupRef.current.style.top = `${sy - ph - 36}px`;
            if (ph > 0) popupRef.current.style.visibility = "visible";
          }
        }
      }
    };
  }

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
        style={{ touchAction: "none" }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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
          ref={graticuleRef}
          d={pathGenerator(graticule)}
          fill="none"
          stroke="#ccc"
          strokeWidth={0.4}
        />
        {features.map((feature, i) => {
          if (oversizedSet.has(i)) return null;
          const d = pathGenerator(feature);
          const isHovered = i === hoveredIdx;
          return (
            <CountryPath
              ref={(el) => { pathRefsRef.current[i] = el ? { el, feature } : null; }}
              key={`${feature.properties.CODE}-${i}`}
              d={d || ""}
              fill={colorMap[feature.properties.CODE] || "#fff"}
              strokeColor={isHovered ? "#333" : "#555"}
              strokeWidth={isHovered ? 1.5 : 1}
              idx={i}
              onEnter={handleEnter}
              onLeave={handleLeave}
              onClick={handleClick}
              style={d ? undefined : { display: "none" }}
            />
          );
        })}
        {/* Focus info icons */}
        {focusIcons.map(({ properties, lng, lat, feature }, i) => {
          const svgPos = projection([lng, lat]);
          if (!svgPos) return null;
          const visibleCenter = [-rotation[0], -rotation[1]];
          if (geoDistance([lng, lat], visibleCenter) > Math.PI / 2) return null;
          return (
            <image
              ref={(el) => { iconRefsRef.current[i] = el ? { el, lng, lat } : null; }}
              key={`icon-${properties.CODE}`}
              href="icon-info-48.png"
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
          ref={popupRef}
          x={popupScreenPos.x}
          y={popupScreenPos.y}
          closing={popupClosing}
          category={category}
          country={popup.properties}
          legend={legend}
          setCountry={setCountry}
          setCategory={setCategory}
          onSizeChange={(w, h) => {
            popupSizeRef.current = { width: w, height: h };
            setPopupHeight(h + 36);
          }}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default GlobeView;
