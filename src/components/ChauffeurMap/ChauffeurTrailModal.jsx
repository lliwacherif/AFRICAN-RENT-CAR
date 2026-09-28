import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  Navigation,
  Clock,
  Car,
  Check,
  Star,
  MapPin,
  Layers,
  Maximize2,
  Calendar,
  Sparkles,
  Phone
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { fetchDrivingRoute, TUNISIA_LOCATIONS_PRESETS } from '../../utils/routing';
import './ChauffeurTrailModal.css';

// Resolve fallback coordinates if route doesn't have fromCoords/toCoords
function resolveCoords(coords, placeName, isStart = true) {
  if (coords && coords.lat && coords.lng) return coords;
  if (!placeName) return isStart ? { lat: 36.8510, lng: 10.2272 } : { lat: 35.8360, lng: 10.5982 };

  const clean = placeName.toLowerCase();
  const found = TUNISIA_LOCATIONS_PRESETS.find(p =>
    clean.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(clean)
  );

  if (found) return { lat: found.lat, lng: found.lng };
  return isStart ? { lat: 36.8510, lng: 10.2272 } : { lat: 35.8360, lng: 10.5982 };
}

export default function ChauffeurTrailModal({ route, onClose, onBookNow }) {
  const { formatPrice } = useCurrency();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLayersRef = useRef([]);

  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [routeStats, setRouteStats] = useState({
    distance: route?.distance || '120 km',
    duration: route?.duration || '1h 30m',
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Initialize Leaflet Map with Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current || !route) return;

    const fromCoords = resolveCoords(route.fromCoords, route.from, true);
    const toCoords = resolveCoords(route.toCoords, route.to, false);

    // Initial center midpoint
    const midLat = (fromCoords.lat + toCoords.lat) / 2;
    const midLng = (fromCoords.lng + toCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control at bottom right
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

    // Create Custom HTML Marker Icon
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
        iconSize: [40, 60],
        iconAnchor: [20, 20],
      });
    };

    // Marker A (Départ)
    const markerA = L.marker([fromCoords.lat, fromCoords.lng], {
      icon: createMarkerIcon('A', `Départ: ${route.from}`, true),
    }).addTo(map);

    // Marker B (Arrivée)
    const markerB = L.marker([toCoords.lat, toCoords.lng], {
      icon: createMarkerIcon('B', `Arrivée: ${route.to}`, false),
    }).addTo(map);

    routeLayersRef.current.push(markerA, markerB);

    // Fetch and Draw Highway Driving Trail
    let isCancelled = false;

    async function loadTrail() {
      setLoadingRoute(true);
      let trailPoints = route.routeTrail && route.routeTrail.length > 1 ? route.routeTrail : null;

      if (!trailPoints) {
        const routeData = await fetchDrivingRoute(fromCoords, toCoords);
        if (!isCancelled && routeData) {
          trailPoints = routeData.trail;
          setRouteStats({
            distance: routeData.distanceStr,
            duration: routeData.durationStr,
          });
        }
      }

      if (isCancelled || !mapInstanceRef.current || !trailPoints) {
        setLoadingRoute(false);
        return;
      }

      // Outer glow polyline
      const glowPolyline = L.polyline(trailPoints, {
        color: '#A84A3B',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Inner sharp route polyline
      const mainPolyline = L.polyline(trailPoints, {
        color: '#A84A3B',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Accent border for high contrast over satellite
      const corePolyline = L.polyline(trailPoints, {
        color: '#FFFFFF',
        weight: 1.5,
        opacity: 0.7,
        dashArray: '8, 8',
      }).addTo(map);

      routeLayersRef.current.push(glowPolyline, mainPolyline, corePolyline);

      // Fit map bounds to show entire route with comfortable padding
      const bounds = L.latLngBounds(trailPoints);
      map.fitBounds(bounds, {
        paddingTopLeft: [60, 60],
        paddingBottomRight: [380, 60], // Offset for floating card on left/bottom
      });

      setLoadingRoute(false);
    }

    loadTrail();

    // Trigger map invalidation once rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      isCancelled = true;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [route]);

  // Handle Map Type Switch (Google Roadmap vs Google Satellite)
  const handleToggleMapType = (newType) => {
    setMapType(newType);
    if (tileLayerRef.current && mapInstanceRef.current) {
      const url =
        newType === 'satellite'
          ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      tileLayerRef.current.setUrl(url);
    }
  };

  // Recenter Bounds
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !route) return;
    const fromCoords = resolveCoords(route.fromCoords, route.from, true);
    const toCoords = resolveCoords(route.toCoords, route.to, false);
    const bounds = L.latLngBounds([
      [fromCoords.lat, fromCoords.lng],
      [toCoords.lat, toCoords.lng],
    ]);
    mapInstanceRef.current.fitBounds(bounds, {
      paddingTopLeft: [60, 60],
      paddingBottomRight: [380, 60],
    });
  };

  if (!route) return null;

  return (
    <div className="chauffeur-modal-overlay" onClick={onClose}>
      <div className="chauffeur-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="chauffeur-modal-header">
          <div className="chauffeur-modal-header__info">
            <span className="chauffeur-modal-badge">
              <Navigation className="w-3.5 h-3.5 text-[#A84A3B]" />
              <span>Itinéraire Direct Google Maps</span>
            </span>

            <h3 className="chauffeur-modal-title">
              <span>{route.from}</span>
              <span className="text-[#A84A3B]">➔</span>
              <span>{route.to}</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#FAF8F5] border border-[#EBE6DC] px-3 py-1.5 rounded-xl text-xs font-bold text-[#2C3E56]">
              <Clock className="w-3.5 h-3.5 text-[#A84A3B]" />
              <span>{routeStats.duration}</span>
              <span className="text-[#EBE6DC]">•</span>
              <span className="text-[#727D88]">{routeStats.distance}</span>
            </div>

            <button
              type="button"
              className="chauffeur-modal-close-btn"
              onClick={onClose}
              title="Fermer la carte (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="chauffeur-modal-map-wrap">
          <div ref={mapContainerRef} className="chauffeur-leaflet-map" />

          {/* Top Right Controls (Roadmap / Satellite / Recenter) */}
          <div className="chauffeur-modal-top-controls">
            <button
              type="button"
              className={`chauffeur-map-ctrl-btn ${mapType === 'roadmap' ? 'chauffeur-map-ctrl-btn--active' : ''}`}
              onClick={() => handleToggleMapType('roadmap')}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Google Plan</span>
            </button>
            <button
              type="button"
              className={`chauffeur-map-ctrl-btn ${mapType === 'satellite' ? 'chauffeur-map-ctrl-btn--active' : ''}`}
              onClick={() => handleToggleMapType('satellite')}
            >
              <span>Satellite</span>
            </button>
            <button
              type="button"
              className="chauffeur-map-ctrl-btn"
              onClick={handleRecenter}
              title="Recentrer le tracé"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recentrer</span>
            </button>
          </div>

          {/* Floating Driver & Booking Card */}
          <div className="chauffeur-modal-floating-card">
            {/* Step Route Indicator */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EBE6DC]/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A84A3B] animate-ping" />
                <span className="text-xs font-black text-[#191C1F] uppercase tracking-wider">
                  Tracé Direct en Temps Réel
                </span>
              </div>
              <div className="text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-md">
                {routeStats.distance} • {routeStats.duration}
              </div>
            </div>

            {/* Chauffeur Information */}
            <div className="flex items-center gap-3 mb-3.5">
              <img
                src={
                  route.assignedChauffeur?.avatar ||
                  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
                }
                alt={route.assignedChauffeur?.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-black text-[#191C1F] truncate">
                    {route.assignedChauffeur?.name || 'Chauffeur VIP Dédié'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{route.assignedChauffeur?.rating || 4.95}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-[#A84A3B] flex items-center gap-1.5 mt-0.5 truncate">
                  <Car className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{route.assignedChauffeur?.vehicleModel || 'Berline Prestige'}</span>
                </p>

                <p className="text-[11px] text-[#727D88] font-semibold mt-0.5">
                  Immatriculation : <span className="font-mono font-bold text-[#191C1F]">{route.assignedChauffeur?.vehiclePlate || '242 TU 8890'}</span>
                </p>
              </div>
            </div>

            {/* Inclusions checklist */}
            <div className="space-y-1 mb-4 text-[11.5px] text-[#4A525A] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EBE6DC]">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Péages d'autoroutes inclus sans supplément</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Accueil avec pancarte nominative à la dépose</span>
              </div>
            </div>

            {/* Price & Booking Button */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-[10px] uppercase font-black text-[#727D88] tracking-wider block">
                  Tarif Forfaitaire Garanti
                </span>
                <div className="text-2xl font-black text-[#A84A3B] tracking-tight">
                  {formatPrice(route.basePriceTND)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onBookNow) onBookNow(route);
                }}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#A84A3B] to-[#C25847] hover:brightness-110 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Réserver ce Trajet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
