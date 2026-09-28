import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Layers,
  ArrowRight,
  ArrowLeftRight,
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  fetchDrivingRoute,
  reverseGeocodeCoords,
  TUNISIA_LOCATIONS_PRESETS
} from '../../utils/routing';
import './ChauffeurAdminMapPicker.css';

export default function ChauffeurAdminMapPicker({
  fromCoords,
  toCoords,
  fromText,
  toText,
  onChange,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerARef = useRef(null);
  const markerBRef = useRef(null);
  const polylineLayersRef = useRef([]);

  const [activePickerMode, setActivePickerMode] = useState('start'); // 'start' | 'end'
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Keep ref to latest props/callbacks
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const fromCoordsRef = useRef(fromCoords);
  fromCoordsRef.current = fromCoords;

  const toCoordsRef = useRef(toCoords);
  toCoordsRef.current = toCoords;

  const activePickerModeRef = useRef(activePickerMode);
  activePickerModeRef.current = activePickerMode;

  // Custom Marker HTML helper
  const createMarkerIcon = (letter, label, isStart) => {
    return L.divIcon({
      className: 'custom-route-marker',
      html: `
        <div class="route-marker-pin ${isStart ? 'route-marker-pin--start' : 'route-marker-pin--end'}">
          <span class="route-marker-pulse"></span>
          <span>${letter}</span>
        </div>
        <div class="route-marker-label">${label}</div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 20],
    });
  };

  // Recalculate driving trail whenever coordinates change
  const updateRouteTrail = useCallback(async (start, end) => {
    if (!start || !end || !mapInstanceRef.current) return;

    setCalculatingRoute(true);
    // Clear previous polylines
    polylineLayersRef.current.forEach((layer) => layer.remove());
    polylineLayersRef.current = [];

    const routeData = await fetchDrivingRoute(start, end);
    if (!routeData || !mapInstanceRef.current) {
      setCalculatingRoute(false);
      return;
    }

    const { trail, distanceStr, durationStr } = routeData;

    // Draw outer glow polyline
    const glowLine = L.polyline(trail, {
      color: '#A84A3B',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapInstanceRef.current);

    // Draw inner sharp polyline
    const mainLine = L.polyline(trail, {
      color: '#A84A3B',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapInstanceRef.current);

    // Dotted center line
    const dotLine = L.polyline(trail, {
      color: '#FFFFFF',
      weight: 1.5,
      opacity: 0.8,
      dashArray: '6, 6',
    }).addTo(mapInstanceRef.current);

    polylineLayersRef.current = [glowLine, mainLine, dotLine];

    // Auto-fit bounds
    const bounds = L.latLngBounds(trail);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });

    setCalculatingRoute(false);

    // Notify parent
    onChangeRef.current({
      routeTrail: trail,
      distance: distanceStr,
      duration: durationStr,
    });
  }, []);

  // Update or Create Marker on Map
  const setPointA = useCallback(
    async (coords, label = '') => {
      if (!mapInstanceRef.current) return;

      if (markerARef.current) {
        markerARef.current.setLatLng([coords.lat, coords.lng]);
        markerARef.current.setIcon(createMarkerIcon('A', label || 'Point A (Départ)', true));
      } else {
        const marker = L.marker([coords.lat, coords.lng], {
          icon: createMarkerIcon('A', label || 'Point A (Départ)', true),
          draggable: true,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', async (e) => {
          const latlng = e.target.getLatLng();
          const newCoords = { lat: latlng.lat, lng: latlng.lng };
          const placeName = await reverseGeocodeCoords(newCoords.lat, newCoords.lng);
          marker.setIcon(createMarkerIcon('A', placeName, true));
          onChangeRef.current({
            fromCoords: newCoords,
            from: placeName,
          });
          if (toCoordsRef.current) {
            updateRouteTrail(newCoords, toCoordsRef.current);
          }
        });

        markerARef.current = marker;
      }

      onChangeRef.current({
        fromCoords: coords,
        ...(label && { from: label }),
      });

      if (toCoordsRef.current) {
        updateRouteTrail(coords, toCoordsRef.current);
      }
    },
    [updateRouteTrail]
  );

  const setPointB = useCallback(
    async (coords, label = '') => {
      if (!mapInstanceRef.current) return;

      if (markerBRef.current) {
        markerBRef.current.setLatLng([coords.lat, coords.lng]);
        markerBRef.current.setIcon(createMarkerIcon('B', label || 'Point B (Arrivée)', false));
      } else {
        const marker = L.marker([coords.lat, coords.lng], {
          icon: createMarkerIcon('B', label || 'Point B (Arrivée)', false),
          draggable: true,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', async (e) => {
          const latlng = e.target.getLatLng();
          const newCoords = { lat: latlng.lat, lng: latlng.lng };
          const placeName = await reverseGeocodeCoords(newCoords.lat, newCoords.lng);
          marker.setIcon(createMarkerIcon('B', placeName, false));
          onChangeRef.current({
            toCoords: newCoords,
            to: placeName,
          });
          if (fromCoordsRef.current) {
            updateRouteTrail(fromCoordsRef.current, newCoords);
          }
        });

        markerBRef.current = marker;
      }

      onChangeRef.current({
        toCoords: coords,
        ...(label && { to: label }),
      });

      if (fromCoordsRef.current) {
        updateRouteTrail(fromCoordsRef.current, coords);
      }
    },
    [updateRouteTrail]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter = [36.2, 10.2]; // Center of North/Central Tunisia
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Google Maps Tile Layer
    const getGoogleTileUrl = (type) =>
      type === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    const tiles = L.tileLayer(getGoogleTileUrl(mapType), {
      maxZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    tileLayerRef.current = tiles;
    mapInstanceRef.current = map;

    // Handle Map Click to place Point A or Point B
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const coords = { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
      const currentMode = activePickerModeRef.current;

      const placeName = await reverseGeocodeCoords(coords.lat, coords.lng);

      if (currentMode === 'start') {
        setPointA(coords, placeName);
        if (!toCoordsRef.current) {
          setActivePickerMode('end');
        }
      } else {
        setPointB(coords, placeName);
        if (!fromCoordsRef.current) {
          setActivePickerMode('start');
        }
      }
    });

    // Populate initial markers if coords exist
    if (fromCoordsRef.current && fromCoordsRef.current.lat) {
      setPointA(fromCoordsRef.current, fromText || 'Départ');
    }
    if (toCoordsRef.current && toCoordsRef.current.lat) {
      setPointB(toCoordsRef.current, toText || 'Arrivée');
    }
    if (fromCoordsRef.current && toCoordsRef.current) {
      updateRouteTrail(fromCoordsRef.current, toCoordsRef.current);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Type Toggle
  const handleToggleMapType = (newType) => {
    setMapType(newType);
    if (tileLayerRef.current) {
      const url =
        newType === 'satellite'
          ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      tileLayerRef.current.setUrl(url);
    }
  };

  // Swap Points
  const handleSwapPoints = () => {
    const prevA = fromCoords;
    const prevB = toCoords;
    const prevFromText = fromText;
    const prevToText = toText;

    if (prevB) setPointA(prevB, prevToText);
    if (prevA) setPointB(prevA, prevFromText);
  };

  // Handle Preset Selection
  const handleSelectPreset = (e) => {
    const val = e.target.value;
    if (!val) return;
    const preset = TUNISIA_LOCATIONS_PRESETS.find((p) => p.name === val);
    if (!preset) return;

    const coords = { lat: preset.lat, lng: preset.lng };

    if (activePickerMode === 'start') {
      setPointA(coords, preset.name);
      if (!toCoords) setActivePickerMode('end');
    } else {
      setPointB(coords, preset.name);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 11);
    }
    e.target.value = '';
  };

  // Reset / Recenter Bounds
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (fromCoords && toCoords) {
      const bounds = L.latLngBounds([
        [fromCoords.lat, fromCoords.lng],
        [toCoords.lat, toCoords.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else if (fromCoords) {
      mapInstanceRef.current.setView([fromCoords.lat, fromCoords.lng], 10);
    } else {
      mapInstanceRef.current.setView([36.2, 10.2], 7);
    }
  };

  return (
    <div className="admin-map-picker-container">
      {/* Top Toolbar */}
      <div className="admin-map-picker-toolbar">
        <div className="admin-map-picker-modes">
          <button
            type="button"
            className={`admin-map-mode-btn ${
              activePickerMode === 'start' ? 'admin-map-mode-btn--start-active' : ''
            }`}
            onClick={() => setActivePickerMode('start')}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>📍 Placer Départ (A)</span>
          </button>

          <button
            type="button"
            className={`admin-map-mode-btn ${
              activePickerMode === 'end' ? 'admin-map-mode-btn--end-active' : ''
            }`}
            onClick={() => setActivePickerMode('end')}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>🏁 Placer Arrivée (B)</span>
          </button>

          <button
            type="button"
            className="admin-map-mode-btn"
            onClick={handleSwapPoints}
            title="Inverser les deux points"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Presets Dropdown */}
        <div className="admin-map-presets-wrap">
          <select
            className="admin-map-preset-select"
            onChange={handleSelectPreset}
            defaultValue=""
          >
            <option value="" disabled>
              ⚡ Choisir un lieu en Tunisie...
            </option>
            {TUNISIA_LOCATIONS_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div className="admin-map-canvas-frame">
        <div ref={mapContainerRef} className="admin-map-leaflet" />

        {/* Tip Badge */}
        <div className="admin-map-overlay-tip">
          <Info className="w-3.5 h-3.5 text-[#F4A261]" />
          <span>
            {activePickerMode === 'start'
              ? 'Cliquez sur la carte ou déplacez le marqueur pour définir le DÉPART (Point A)'
              : 'Cliquez sur la carte ou déplacez le marqueur pour définir l’ARRIVÉE (Point B)'}
          </span>
        </div>

        {/* Floating Top-Right Controls */}
        <div className="admin-map-floating-controls">
          <button
            type="button"
            className={`admin-map-icon-btn ${
              mapType === 'roadmap' ? 'admin-map-icon-btn--active' : ''
            }`}
            onClick={() => handleToggleMapType('roadmap')}
          >
            Plan
          </button>
          <button
            type="button"
            className={`admin-map-icon-btn ${
              mapType === 'satellite' ? 'admin-map-icon-btn--active' : ''
            }`}
            onClick={() => handleToggleMapType('satellite')}
          >
            Satellite
          </button>
          <button
            type="button"
            className="admin-map-icon-btn"
            onClick={handleRecenter}
            title="Recentrer"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Coords & Route Distance Summary Footer */}
      <div className="admin-map-coords-footer">
        <div
          className={`admin-map-coord-card ${
            activePickerMode === 'start' ? 'admin-map-coord-card--active' : ''
          }`}
          onClick={() => setActivePickerMode('start')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-map-coord-label">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A84A3B]" />
            <span>Point A (Départ)</span>
          </div>
          <span className="admin-map-coord-val">
            {fromCoords?.lat ? `${fromCoords.lat.toFixed(4)}, ${fromCoords.lng.toFixed(4)}` : 'Non défini'}
          </span>
        </div>

        <div
          className={`admin-map-coord-card ${
            activePickerMode === 'end' ? 'admin-map-coord-card--active' : ''
          }`}
          onClick={() => setActivePickerMode('end')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-map-coord-label">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E56]" />
            <span>Point B (Arrivée)</span>
          </div>
          <span className="admin-map-coord-val">
            {toCoords?.lat ? `${toCoords.lat.toFixed(4)}, ${toCoords.lng.toFixed(4)}` : 'Non défini'}
          </span>
        </div>
      </div>
    </div>
  );
}
