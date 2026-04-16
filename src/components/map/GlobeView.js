import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
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
const DRAG_SENSITIVITY = 0.4; // degrees of rotation per pixel dragged
const ZOOM_CONTROLS_TOP = 88; // px from top of container (matches leaflet-left top + map margin)

// Memoized path element — hover styles are applied directly to the DOM so
// hover never triggers a React re-render (avoids bumping imperative zoom).
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
  // Cache the container's bounding rect so popup positioning never forces a
  // layout reflow — updated only on resize (the only time it actually changes).
  const containerRectRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [rotation, setRotation] = useState([-20, -5]);
  // Keep a ref to the latest rotation so callbacks can read it without stale closures
  const rotationRef = useRef(rotation);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(scale);
  const targetScaleRef = useRef(scale);
  const scaleAnimRef = useRef(null);
  // Rebuilt each render (like applyRotationRef) so closures are always fresh
  const zoomRef = useRef(null);

  const dragStart = useRef(null);
  const isRotating = useRef(false); // true during both drag and coast
  const wasDrag = useRef(false);
  const cancelAnimRef = useRef(null);
  const hoveredElsRef = useRef([]); // DOM elements currently highlighted (all polygons of a country)

  // Refs for direct DOM manipulation during drag (bypass React re-renders)
  const graticuleRef = useRef(null);
  const pathRefsRef = useRef([]); // sparse array of { el, feature } indexed by feature index
  const iconRefsRef = useRef([]); // array of { el, lng, lat }
  const popupRef = useRef(null);
  const popupSizeRef = useRef({ width: 0, height: 0 });
  const popupAnchorRef = useRef(null); // { lng, lat } kept in sync with popup state
  const popupReadyRef = useRef(false); // true once tilt animation (or no-tilt) is done
  const globeCircleRef = useRef(null); // imperative update during zoom animation
  // Updated each render so the drag handler always has the latest pathGenerator/graticule
  const applyRotationRef = useRef(null);

  const legend = useMemo(
    () => (categories.find((c) => c.id === category) || categories[0]).legend,
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

  // Cancel any pending timers or animations on unmount
  useEffect(() => () => {
    clearTimeout(closeTimerRef.current);
    if (cancelAnimRef.current) cancelAnimRef.current();
    if (scaleAnimRef.current) cancelAnimationFrame(scaleAnimRef.current);
  }, []);

  // Only sync refs from state when not mid-animation/drag.
  // During drag or zoom animation, the refs hold the imperative (current)
  // values; overwriting them from stale state would cause a snap-back on any
  // re-render that fires mid-flight (e.g. popup resize, data load).
  if (!isRotating.current) rotationRef.current = rotation;
  if (!isRotating.current && !scaleAnimRef.current) scaleRef.current = scale;

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

  // Mutate projection with the latest rotation and scale before any path
  // generation below. Use refs (not state) so any React re-render that fires
  // mid-drag or mid-zoom-animation uses the current imperative values, not the
  // stale state — preventing paths from snapping back on re-render.
  if (projection) {
    projection.rotate(rotationRef.current);
    projection.scale(baseRadius * scaleRef.current);
  }

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
    // Normalise deltas to [-180, 180] so the animation always takes the
    // shortest arc (avoids the 330° detour when crossing the ±180° meridian).
    const wrap = (d) => ((d % 360) + 540) % 360 - 180;
    const dLng = wrap(target[0] - startRotation[0]);
    const dLat = wrap(target[1] - startRotation[1]);
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
        startRotation[0] + dLng * ease,
        startRotation[1] + dLat * ease,
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

  const clearHover = useCallback(() => {
    for (const el of hoveredElsRef.current) {
      el.setAttribute("stroke", "#555");
      el.setAttribute("stroke-width", "1");
      if (el._nextSibling !== undefined) {
        if (el.parentNode) el.parentNode.insertBefore(el, el._nextSibling);
        delete el._nextSibling;
      }
    }
    hoveredElsRef.current = [];
  }, []);

  // Drag — mousemove/mouseup are attached to window so dragging continues
  // even when the cursor leaves the viewport. Releases with momentum.
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    if (cancelAnimRef.current) cancelAnimRef.current();
    if (scaleAnimRef.current) {
      cancelAnimationFrame(scaleAnimRef.current);
      scaleAnimRef.current = null;
      targetScaleRef.current = scaleRef.current;
      setScale(scaleRef.current); // commit animated scale to state before drag
    }
    dragStart.current = { x: e.clientX, y: e.clientY, rotation: rotationRef.current };
    isRotating.current = true;
    // clearHover is deferred to first actual movement so the DOM element isn't
    // moved between mousedown and click (which would lose the click target).

    // Keep a small ring buffer of recent pointer positions to derive release velocity
    const SAMPLE_MS = 80;
    const samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    let hoverCleared = false;

    const onMove = (e) => {
      if (!hoverCleared) { clearHover(); hoverCleared = true; }
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 6) wasDrag.current = true;
      const [l0, p0] = dragStart.current.rotation;
      applyDragRotation([l0 + dx * DRAG_SENSITIVITY, p0 - dy * DRAG_SENSITIVITY]);

      const now = performance.now();
      samples.push({ x: e.clientX, y: e.clientY, t: now });
      // Discard samples older than SAMPLE_MS
      while (samples.length > 1 && now - samples[0].t > SAMPLE_MS) samples.shift();
    };

    const onUp = () => {
      dragStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      // Reset wasDrag after a short delay so the click event that follows
      // mouseup on a country can still read it, but it doesn't linger longer.
      setTimeout(() => { wasDrag.current = false; }, 0);

      // Compute velocity from oldest surviving sample to newest
      const newest = samples[samples.length - 1];
      const oldest = samples[0];
      const dt = newest.t - oldest.t || 1;
      const vx = (newest.x - oldest.x) / dt;
      const vy = (newest.y - oldest.y) / dt;

      // Convert px/ms velocity to rotation/frame and coast to a stop.
      // SCALE converts px/ms → degrees/frame: sensitivity × assumed frame Δt (ms).
      const DAMPING = 0.85;
      const SCALE = DRAG_SENSITIVITY * 16; // degrees/frame at 60fps
      const COAST_THRESHOLD_PX = 10;
      if (Math.hypot(newest.x - oldest.x, newest.y - oldest.y) < COAST_THRESHOLD_PX) {
        isRotating.current = false;
        setRotation([...rotationRef.current]);
        return;
      }
      let dvx = vx * SCALE, dvy = vy * SCALE;
      let rafId;
      const cancelCoast = () => {
        cancelAnimationFrame(rafId);
        cancelAnimRef.current = null;
        isRotating.current = false;
      };
      const coast = () => {
        dvx *= DAMPING; dvy *= DAMPING;
        if (Math.hypot(dvx, dvy) < 0.01) {
          isRotating.current = false;
          setRotation([...rotationRef.current]);
          cancelAnimRef.current = null;
          return;
        }
        const [l, p] = rotationRef.current;
        applyDragRotation([l + dvx, p - dvy]);
        rafId = requestAnimationFrame(coast);
      };
      cancelAnimRef.current = cancelCoast;
      rafId = requestAnimationFrame(coast);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [applyDragRotation, clearHover]);

  // Tracks the initial distance between two fingers for pinch-to-zoom
  const pinchStartRef = useRef(null); // { dist, scale }
  // Ring buffer of recent touch positions for swipe momentum (same as mouse)
  const touchSamplesRef = useRef([]);

  // Touch drag (1 finger) + pinch-to-zoom (2 fingers)
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Begin pinch — cancel any active drag so the two gestures don't fight
      dragStart.current = null;
      isRotating.current = true;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      pinchStartRef.current = { dist: Math.hypot(dx, dy), scale: scale };
      return;
    }
    if (e.touches.length !== 1) return;
    pinchStartRef.current = null;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX, y: t.clientY, rotation: rotationRef.current };
    touchSamplesRef.current = [{ x: t.clientX, y: t.clientY, t: performance.now() }];
  }, [scale]);

  const onTouchEnd = useCallback(() => {
    if (pinchStartRef.current) {
      pinchStartRef.current = null;
      isRotating.current = false;
      setScale(scaleRef.current);
    }
    if (!dragStart.current) return;
    dragStart.current = null;

    // Swipe momentum — same logic as mouse coast
    const samples = touchSamplesRef.current;
    const newest = samples[samples.length - 1];
    const oldest = samples[0];
    const DAMPING = 0.85;
    const SCALE = DRAG_SENSITIVITY * 16;
    const COAST_THRESHOLD_PX = 10;
    const isTap = !newest || !oldest ||
      Math.hypot(newest.x - oldest.x, newest.y - oldest.y) < COAST_THRESHOLD_PX;
    if (isTap) {
      // Reset wasDrag immediately so the synthesized click fires correctly.
      // (setTimeout(0) can lose the race against the click event on some browsers.)
      wasDrag.current = false;
      isRotating.current = false;
      setRotation([...rotationRef.current]);
      return;
    }
    // Was a real swipe — reset wasDrag after click has had a chance to fire
    setTimeout(() => { wasDrag.current = false; }, 0);
    const dt = newest.t - oldest.t || 1;
    const vx = (newest.x - oldest.x) / dt;
    const vy = (newest.y - oldest.y) / dt;
    let dvx = vx * SCALE, dvy = vy * SCALE;
    let rafId;
    const cancelCoast = () => {
      cancelAnimationFrame(rafId);
      cancelAnimRef.current = null;
      isRotating.current = false;
    };
    const coast = () => {
      dvx *= DAMPING; dvy *= DAMPING;
      if (Math.hypot(dvx, dvy) < 0.01) {
        isRotating.current = false;
        setRotation([...rotationRef.current]);
        cancelAnimRef.current = null;
        return;
      }
      const [l, p] = rotationRef.current;
      applyDragRotation([l + dvx, p - dvy]);
      rafId = requestAnimationFrame(coast);
    };
    cancelAnimRef.current = cancelCoast;
    rafId = requestAnimationFrame(coast);
  }, [applyDragRotation]);

  // Scroll zoom + touch move (both need passive:false to call preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheelHandler = (e) => {
      e.preventDefault();
      targetScaleRef.current = Math.max(0.4, Math.min(8, targetScaleRef.current - e.deltaY * 0.001));
      if (zoomRef.current) {
        zoomRef.current.startZoom();
        if (!scaleAnimRef.current) {
          scaleAnimRef.current = requestAnimationFrame(zoomRef.current.animateZoom);
        }
      }
    };
    const touchMoveHandler = (e) => {
      e.preventDefault();
      // Two-finger pinch-to-zoom
      if (e.touches.length === 2 && pinchStartRef.current) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.hypot(dx, dy);
        const next = Math.max(0.4, Math.min(8, pinchStartRef.current.scale * (dist / pinchStartRef.current.dist)));
        targetScaleRef.current = next;
        if (zoomRef.current) zoomRef.current.applyScale(next);
        return;
      }
      // Single-finger drag
      if (!dragStart.current || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.x;
      const dy = t.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 8) wasDrag.current = true; // higher threshold than mouse — fingers are less precise
      const [l0, p0] = dragStart.current.rotation;
      applyDragRotation([l0 + dx * DRAG_SENSITIVITY, p0 - dy * DRAG_SENSITIVITY]);
      // Track velocity samples for swipe momentum
      const now = performance.now();
      const SAMPLE_MS = 80;
      touchSamplesRef.current.push({ x: t.clientX, y: t.clientY, t: now });
      while (touchSamplesRef.current.length > 1 && now - touchSamplesRef.current[0].t > SAMPLE_MS)
        touchSamplesRef.current.shift();
    };
    el.addEventListener("wheel", wheelHandler, { passive: false });
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheelHandler);
      el.removeEventListener("touchmove", touchMoveHandler);
    };
  }, [applyDragRotation]);

  // Flatten MultiPolygon features into individual Polygons.
  // _key provides a stable React key per sub-polygon (CODE + index within the
  // original MultiPolygon's coordinate array) so that reordering countries in
  // the source data doesn't cause React to remount wrong elements (C-2).
  // _originalFeature retains the full multi-polygon so popup centroid is
  // computed from the whole country, not just the clicked sub-polygon (m-10).
  const features = useMemo(
    () =>
      (countries?.features || [])
        .filter((f) => f.geometry != null)
        .flatMap((feature, featureIdx) => {
          const { geometry, properties } = feature;
          // CODE "-99" is a placeholder used by multiple territories — append the
          // feature index to guarantee uniqueness while keeping real codes stable.
          const baseKey = (properties.CODE && properties.CODE !== "-99")
            ? properties.CODE
            : `f${featureIdx}`;
          if (geometry.type === "MultiPolygon") {
            return geometry.coordinates.map((coords, polyIdx) => ({
              type: "Feature",
              geometry: { type: "Polygon", coordinates: coords },
              properties,
              _key: `${baseKey}-poly${polyIdx}`,
              _originalFeature: feature,
            }));
          }
          return [{ ...feature, _key: baseKey }];
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
  // Uses spherical area (steradians, rotation-independent) rather than
  // projected area so the set doesn't go stale when the globe is rotated (C-3).
  // The threshold (1.5 sr ≈ 12% of the full sphere) is well above any real
  // country (Russia ≈ 0.24 sr) and catches only back-face clipping artifacts.
  const oversizedSet = useMemo(() => {
    const LARGE_AREA_SR = 1.5;
    const set = new Set();
    features.forEach((f, i) => {
      if (geoArea(f) > LARGE_AREA_SR) set.add(i);
    });
    return set;
  }, [features]);

  // Countries with focus data that have at least one matching legend entry
  const focusIcons = useMemo(() => {
    if (!focus || !legend || !countries?.features) return [];
    return countries.features
      .filter((f) => {
        const code = f.properties.CODE;
        return focus[code] && legend.some((l) => focus[code][l.code]);
      })
      .flatMap((f) => {
        try {
          const [lng, lat] = getIconPosition(f.geometry);
          return [{ properties: f.properties, lng, lat, feature: f }];
        } catch {
          // Skip features with degenerate geometry (e.g. < 3 coordinates)
          return [];
        }
      });
  }, [focus, legend, countries]);

  const doOpenPopup = useCallback(
    (feature) => {
      const anchorFeature = feature._originalFeature || feature;
      let lng, lat;
      if (anchorFeature.geometry.type === "MultiPolygon") {
        // Use the centroid of the largest sub-polygon so the anchor lands on the
        // main landmass (e.g. metropolitan France) rather than a weighted average
        // that may fall in the ocean when overseas territories are included.
        const best = anchorFeature.geometry.coordinates
          .map((coords) => ({ type: "Feature", geometry: { type: "Polygon", coordinates: coords }, properties: {} }))
          .reduce((a, b) => (geoArea(a) >= geoArea(b) ? a : b));
        [lng, lat] = geoCentroid(best);
      } else {
        [lng, lat] = geoCentroid(anchorFeature);
      }
      hasTilted.current = false;
      popupReadyRef.current = false; // hidden until tilt animation (or no-tilt) completes
      setPopupHeight(0);
      popupSizeRef.current = { width: 0, height: 0 }; // prevent stale height from previous popup
      setPopupClosing(false);
      // Sync selected country with open popup so switching map↔globe transfers
      // the open popup to the other view. The selected useEffect guards against
      // re-animating when the popup is already open for this country (C-1).
      setCountry(feature.properties.NAME);
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
        closeTimerRef.current = setTimeout(() => doOpenPopup(feature), 100);
      } else {
        doOpenPopup(feature);
      }
    },
    [popup, doOpenPopup]
  );

  const closePopup = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    setPopupClosing(true);
    setCountry();
    closeTimerRef.current = setTimeout(() => {
      setPopup(null);
      setPopupClosing(false);
    }, 150);
  }, [setCountry]);

  // Shadow popup in a ref so the category-change effect below can read whether
  // a popup is open without listing popup as a dep (which would re-run the
  // effect on every popup open/close, not just category changes) (M-3).
  const popupStateRef = useRef(popup);
  popupStateRef.current = popup;

  // Keep a ref to openPopup so handleClick never needs to change identity
  // when popup state changes, preserving CountryPath memo across popup open/close.
  const openPopupRef = useRef(openPopup);
  openPopupRef.current = openPopup;

  // Stable handlers passed to CountryPath so memo can skip re-renders (#6)
  const handleEnter = useCallback((idx) => {
    if (isRotating.current) return;
    clearHover();
    const entry = pathRefsRef.current[idx];
    if (!entry) return;
    // Highlight all polygons belonging to the same country (MultiPolygon split).
    // Group by _originalFeature reference — sub-polygons of the same MultiPolygon
    // share the exact same object. Falls back to the feature itself for simple
    // Polygons, so each is its own group (avoids false matches via shared CODE "-99").
    const anchor = entry.feature._originalFeature || entry.feature;
    const els = [];
    for (const e of Object.values(pathRefsRef.current)) {
      if (!e) continue;
      const eAnchor = e.feature._originalFeature || e.feature;
      if (eAnchor !== anchor) continue;
      const el = e.el;
      el._nextSibling = el.nextSibling;
      if (el.parentNode) el.parentNode.appendChild(el);
      el.setAttribute("stroke", "#333");
      el.setAttribute("stroke-width", "1.5");
      els.push(el);
    }
    hoveredElsRef.current = els;
  }, [clearHover]);

  const handleLeave = useCallback(() => {
    if (!isRotating.current) clearHover();
  }, [clearHover]);
  const handleClick = useCallback(
    (idx) => {
      if (wasDrag.current) { wasDrag.current = false; return; }
      openPopupRef.current(features[idx]);
    },
    [features]
  );

  // When the category changes while a popup is open, the popup height may change —
  // reset hasTilted so the tilt check runs again with the new dimensions.
  // popupStateRef (not popup) is read here so this effect only fires on category
  // changes, not on every popup open/close.
  useEffect(() => {
    if (popupStateRef.current) hasTilted.current = false;
  }, [category]);

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
      return animateToRotation([rotationRef.current[0], targetPhi], 300, () => {
        popupReadyRef.current = true;
        if (applyRotationRef.current) applyRotationRef.current(rotationRef.current);
      });
    }
    // No tilt needed — show immediately
    popupReadyRef.current = true;
    if (applyRotationRef.current) applyRotationRef.current(rotationRef.current);
  }, [popupHeight, popup, projection, phiForAnchorY, animateToRotation]);

  // Table selection: animate to centroid then open popup.
  // Also fires when switching from map→globe with a popup already open (selected
  // is set to the open country name), in which case we skip animation if the
  // popup is already showing that country (popupStateRef guards without extra deps).
  useEffect(() => {
    if (!selected || !features.length) return;
    if (popupStateRef.current?.properties?.NAME === selected) return;
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
  // Keep popup anchor ref in sync so the drag loop can access it without stale closures
  popupAnchorRef.current = popup ? { lng: popup.lng, lat: popup.lat } : null;

  // Rebuild zoom helpers each render so closures always capture the latest
  // projection and baseRadius (same pattern as applyRotationRef).
  // During animation setScale is NOT called, so projection stays stable —
  // only called once when the scale settles to sync React state.
  if (projection) {
    const applyScale = (s) => {
      scaleRef.current = s;
      projection.scale(baseRadius * s);
      if (applyRotationRef.current) applyRotationRef.current(rotationRef.current);
    };
    const animateZoom = () => {
      const next = scaleRef.current + (targetScaleRef.current - scaleRef.current) * 0.15;
      const settled = Math.abs(next - targetScaleRef.current) < 0.001;
      applyScale(settled ? targetScaleRef.current : next);
      if (settled) {
        scaleAnimRef.current = null;
        isRotating.current = false;
        setScale(targetScaleRef.current);
      } else {
        scaleAnimRef.current = requestAnimationFrame(zoomRef.current.animateZoom);
      }
    };
    const startZoom = () => {
      isRotating.current = true;
      clearHover();
    };
    zoomRef.current = { applyScale, animateZoom, startZoom };
  }

  // Pre-compute the static graticule path — only changes when the projection
  // scale/size changes, never on rotation (m-12).
  const graticulePath = useMemo(
    () => (pathGenerator ? pathGenerator(graticule) : ""),
    [pathGenerator, graticule]
  );

  // Rebuild the drag DOM-update function after every render (useLayoutEffect
  // ensures it is set before the browser paints, avoiding a race with
  // in-flight RAF callbacks in concurrent mode) (M-1).
  useLayoutEffect(() => {
    if (!pathGenerator) return;
    applyRotationRef.current = (rot) => {
      projection.rotate(rot);
      rotationRef.current = rot;

      // Globe circle radius — updated here so a single applyRotationRef call
      // resyncs the entire DOM (circle, graticule, paths, icons, popup).
      if (globeCircleRef.current) {
        globeCircleRef.current.setAttribute("r", projection.scale());
      }

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
        if (!popupReadyRef.current || geoDistance([anchor.lng, anchor.lat], visibleCenter) > Math.PI / 2) {
          // Not ready yet (tilt pending / size unknown) or anchor is behind the globe.
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

    // Resync the entire DOM with the current projection state after every
    // React render. Any render during drag or zoom animation may have reset
    // DOM attributes (graticule d, circle r, path d) to stale React-state
    // values. This corrects everything before the browser paints.
    applyRotationRef.current(rotationRef.current);
  }); // end useLayoutEffect

  if (!width || !height || !pathGenerator) {
    return <div ref={containerRef} className="Map" />;
  }

  return (
    <div ref={containerRef} className="Map" style={{ cursor: "grab" }}>
      <div style={{ position: "absolute", right: 10, top: ZOOM_CONTROLS_TOP, zIndex: 1000 }}>
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className="leaflet-control-zoom-in"
            role="button"
            tabIndex={0}
            aria-label="Zoom in"
            onClick={() => {
              targetScaleRef.current = Math.min(8, targetScaleRef.current + 0.3);
              if (zoomRef.current) { zoomRef.current.startZoom(); if (!scaleAnimRef.current) scaleAnimRef.current = requestAnimationFrame(zoomRef.current.animateZoom); }
            }}
          >+</a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            className="leaflet-control-zoom-out"
            role="button"
            tabIndex={0}
            aria-label="Zoom out"
            onClick={() => {
              targetScaleRef.current = Math.max(0.4, targetScaleRef.current - 0.3);
              if (zoomRef.current) { zoomRef.current.startZoom(); if (!scaleAnimRef.current) scaleAnimRef.current = requestAnimationFrame(zoomRef.current.animateZoom); }
            }}
          >−</a>
        </div>
      </div>
      <svg
        width={width}
        height={height}
        style={{ touchAction: "none", WebkitTapHighlightColor: "transparent" }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          ref={globeCircleRef}
          fill="#edf7ff"
          stroke="#aaa"
          strokeWidth={0.5}
        />
        <path
          ref={graticuleRef}
          d={graticulePath}
          fill="none"
          stroke="#ccc"
          strokeWidth={0.4}
        />
        <g>
          {features.map((feature, i) => {
            if (oversizedSet.has(i)) return null;
            const d = pathGenerator(feature);
            return (
              <CountryPath
                ref={(el) => { pathRefsRef.current[i] = el ? { el, feature } : null; }}
                key={feature._key}
                d={d || ""}
                fill={colorMap[feature.properties.CODE] || "#fff"}
                strokeColor="#555"
                strokeWidth={1}
                idx={i}
                onEnter={handleEnter}
                onLeave={handleLeave}
                onClick={handleClick}
                style={d ? undefined : { display: "none" }}
              />
            );
          })}
        </g>
        {/* Focus info icons — always rendered so iconRefsRef is always
            populated and the drag loop can imperatively show/hide them.
            Visibility is controlled via display style, never via return null. */}
        {focusIcons.map(({ properties, lng, lat, feature }, i) => {
          const visibleCenter = [-rotation[0], -rotation[1]];
          const hidden = geoDistance([lng, lat], visibleCenter) > Math.PI / 2;
          const svgPos = hidden ? null : projection([lng, lat]);
          return (
            <image
              ref={(el) => { iconRefsRef.current[i] = el ? { el, lng, lat } : null; }}
              key={`icon-${properties.CODE}`}
              href="icon-info-48.png"
              x={svgPos ? svgPos[0] - 10 : -100}
              y={svgPos ? svgPos[1] - 10 : -100}
              width={20}
              height={20}
              style={{ cursor: "pointer", display: hidden ? "none" : "" }}
              onClick={(e) => {
                e.stopPropagation();
                if (wasDrag.current) { wasDrag.current = false; return; }
                openPopup(feature);
              }}
            />
          );
        })}
      </svg>

      {popup && projection && (
        <GlobePopup
          ref={popupRef}
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
