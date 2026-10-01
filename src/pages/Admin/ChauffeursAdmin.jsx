import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiDollarSign, FiX, FiAlertCircle, FiRefreshCw, FiClock, FiMapPin, FiTrendingUp, FiTrendingDown, FiBarChart2, FiNavigation
} from 'react-icons/fi';
import { chauffeurService } from '../../services/chauffeurService';
import { useCurrency } from '../../context/CurrencyContext';
import ChauffeurAdminMapPicker from '../../components/ChauffeurMap/ChauffeurAdminMapPicker';
import ChauffeurTrailModal from '../../components/ChauffeurMap/ChauffeurTrailModal';
import ChauffeurLocationsAdmin from './ChauffeurLocationsAdmin';
import './ApartmentsAdmin.css';

// ── Native Admin Helper Components (Identical to Voitures & Hébergements) ──
function Toggle({ active, onChange, disabled }) {
  return (
    <button
      className={`admin-toggle ${active ? 'admin-toggle--on' : ''}`}
      onClick={() => onChange(!active)}
      role="switch"
      aria-checked={active}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <span className="admin-toggle__knob" />
    </button>
  );
}

function ResBadge({ status }) {
  const map = {
    recu:      { bg: 'rgba(59,130,246,.15)',  c: '#60a5fa', l: 'Reçu'      },
    confirmed: { bg: 'rgba(34,197,94,.12)',   c: '#4ade80', l: 'Confirmée' },
    pending:   { bg: 'rgba(245,158,11,.12)',  c: '#fbbf24', l: 'En attente'},
    cancelled: { bg: 'rgba(239,68,68,.12)',   c: '#f87171', l: 'Annulée'  },
    completed: { bg: 'rgba(139,92,246,.12)',  c: '#a78bfa', l: 'Terminée' },
  };
  const s = map[status] || { bg: 'rgba(255,255,255,.08)', c: '#9ca3af', l: status };
  return <span className="res-badge" style={{ background: s.bg, color: s.c }}>{s.l}</span>;
}

function KpiCard({ icon, label, value, sub, trend, up }) {
  return (
    <div className="dash-stat">
      <div className="dash-stat__icon">{icon}</div>
      <div className="dash-stat__body">
        <span className="dash-stat__label">{label}</span>
        <span className="dash-stat__value">{value ?? '—'}</span>
        {sub && <span className="dash-stat__sub">{sub}</span>}
      </div>
      {trend != null && (
        <div className={`dash-stat__trend ${up ? 'dash-stat__trend--up' : 'dash-stat__trend--down'}`}>
          {up ? <FiTrendingUp size={12}/> : <FiTrendingDown size={12}/>}
          <span>{trend > 0 ? '+' : ''}{trend}%</span>
        </div>
      )}
    </div>
  );
}

function getWeekDays(offsetDays = 0) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays + i);
    const isToday = d.toDateString() === today.toDateString();
    out.push({
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      date: d,
      isToday,
      isPast: d < today,
    });
  }
  return out;
}

export default function ChauffeursAdmin() {
  const { formatPrice } = useCurrency();
  const fmtMoney = (n) => (formatPrice ? formatPrice(n) : `${(n || 0).toLocaleString('fr-FR')} TND`);

  // Sub-tabs identical to Voitures & Hébergements
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'routes' | 'reservations' | 'calendar'
  const [routes, setRoutes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [previewMapRoute, setPreviewMapRoute] = useState(null);

  // Calendar offset
  const [calOffset, setCalOffset] = useState(0);

  // Routes Filter
  const [routeSearch, setRouteSearch] = useState('');
  const [routeFilterRegion, setRouteFilterRegion] = useState('all');
  const [routeFilterStatus, setRouteFilterStatus] = useState('all');

  // Reservations Filter
  const [resSearch, setResSearch] = useState('');
  const [resFilterStatus, setResFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    from: '',
    to: '',
    duration: '1h 30m',
    distance: '120 km',
    basePriceTND: 120,
    fromCoords: null,
    toCoords: null,
    routeTrail: [],
    vehicleType: 'business-sedan',
    available: true,
    status: 'active',
    assignedChauffeur: {
      name: 'Chauffeur privé',
      phone: '+216 27 908 060',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      rating: 4.95,
      experienceYears: 8,
      spokenLanguages: ['Français', 'العربية', 'English'],
      vehicleModel: 'Mercedes-Benz Classe E',
      vehiclePlate: '230 TU 1234',
      vehicleColor: 'Noir Métallisé',
      amenities: ['Climatisation bi-zone', 'Wi-Fi 5G illimité', 'Bouteilles d\'eau minérale', 'Chargeurs téléphone', 'Accueil nominatif pancarte']
    },
    includes: [
      'Péages autoroutiers inclus',
      'Attente gratuite 60 min avec suivi du vol',
      'Assistance bagages personnalisée'
    ]
  };

  const [formData, setFormData] = useState(initialForm);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [routesData, resData] = await Promise.all([
        chauffeurService.getAll(),
        chauffeurService.getReservations(),
      ]);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setReservations(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error('Error loading chauffeur admin data:', err);
      setError('Impossible de charger les lignes et les demandes de trajet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeRoutes = Array.isArray(routes) ? routes : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const DAYS = getWeekDays(calOffset);

  // Metrics
  const totalRoutes = safeRoutes.length;
  const activeRoutes = safeRoutes.filter(r => r.available).length;
  const avgRoutePrice = totalRoutes > 0
    ? Math.round(safeRoutes.reduce((acc, r) => acc + (r.basePriceTND || 0), 0) / totalRoutes)
    : 0;

  const totalReservations = safeReservations.length;
  const confirmedCount = safeReservations.filter(r => r.status === 'confirmed').length;
  const pendingCount = safeReservations.filter(r => r.status === 'pending' || r.status === 'recu').length;
  const completedCount = safeReservations.filter(r => r.status === 'completed').length;
  const cancelledCount = safeReservations.filter(r => r.status === 'cancelled').length;

  const totalRevenue = safeReservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.priceTND || 0), 0);

  // Filtered Routes
  const filteredRoutes = safeRoutes.filter(r => {
    const q = routeSearch.toLowerCase();
    const matchesSearch =
      r.from.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q) ||
      (r.assignedChauffeur?.name || '').toLowerCase().includes(q) ||
      (r.assignedChauffeur?.vehicleModel || '').toLowerCase().includes(q);

    const matchesRegion =
      routeFilterRegion === 'all' ||
      r.from.includes(routeFilterRegion) ||
      r.to.includes(routeFilterRegion);

    const matchesStatus =
      routeFilterStatus === 'all' ||
      (routeFilterStatus === 'active' && r.available) ||
      (routeFilterStatus === 'inactive' && !r.available);

    return matchesSearch && matchesRegion && matchesStatus;
  });

  // Filtered Reservations
  const filteredReservations = safeReservations.filter(r => {
    const q = resSearch.toLowerCase();
    const matchesSearch =
      (r.fullName || '').toLowerCase().includes(q) ||
      (r.routeName || '').toLowerCase().includes(q) ||
      (r.from || '').toLowerCase().includes(q) ||
      (r.to || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r._id || '').toLowerCase().includes(q);

    const matchesStatus = resFilterStatus === 'all' || r.status === resFilterStatus;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleToggleActive = async (route) => {
    setTogglingId(route._id);
    try {
      const updated = await chauffeurService.update(route._id, {
        available: !route.available
      });
      setRoutes(prev => prev.map(r => r._id === route._id ? { ...r, available: !r.available } : r));
    } catch (err) {
      alert("Erreur lors de la modification de l'état : " + (err?.response?.data?.message || err.message));
      setRoutes(prev => prev.map(r => r._id === route._id ? { ...r, available: !r.available } : r));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement cette ligne régulière ?')) return;
    try {
      await chauffeurService.delete(routeId);
      setRoutes(prev => prev.filter(r => r._id !== routeId));
    } catch (err) {
      alert("Erreur lors de la suppression : " + (err?.response?.data?.message || err.message));
      setRoutes(prev => prev.filter(r => r._id !== routeId));
    }
  };

  const handleUpdateResStatus = async (resId, newStatus) => {
    try {
      await chauffeurService.updateReservationStatus(resId, newStatus);
      setReservations(prev => prev.map(r => r._id === resId ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const handleOpenModal = (route = null) => {
    setModalError(null);
    if (route) {
      setEditingRoute(route);
      setFormData({
        title: route.title || `${route.from} ➔ ${route.to}`,
        from: route.from || '',
        to: route.to || '',
        duration: route.duration || '1h 30m',
        distance: route.distance || '120 km',
        basePriceTND: route.basePriceTND || 100,
        fromCoords: route.fromCoords || null,
        toCoords: route.toCoords || null,
        routeTrail: route.routeTrail || [],
        vehicleType: route.vehicleType || 'business-sedan',
        available: route.available ?? true,
        status: route.status || 'active',
        assignedChauffeur: {
          name: 'Chauffeur privé',
          phone: route.assignedChauffeur?.phone || '+216 27 908 060',
          avatar: route.assignedChauffeur?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
          rating: route.assignedChauffeur?.rating || 4.95,
          experienceYears: route.assignedChauffeur?.experienceYears || 8,
          spokenLanguages: route.assignedChauffeur?.spokenLanguages || route.assignedChauffeur?.languages || ['Français', 'العربية'],
          vehicleModel: route.assignedChauffeur?.vehicleModel || 'Mercedes-Benz Classe E',
          vehiclePlate: route.assignedChauffeur?.vehiclePlate || '',
          vehicleColor: route.assignedChauffeur?.vehicleColor || 'Noir',
          amenities: route.assignedChauffeur?.amenities || ['Climatisation', 'Wi-Fi 5G', 'Bouteilles d\'eau minérale']
        },
        includes: route.includes || ['Péages inclus', 'Attente 60 min aéroport']
      });
    } else {
      setEditingRoute(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.from.trim() || !formData.to.trim()) {
      setModalError('Veuillez spécifier le point de départ et la destination.');
      return;
    }
    if (formData.basePriceTND <= 0) {
      setModalError('Le tarif forfaitaire doit être supérieur à 0 TND.');
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const payload = {
        ...formData,
        title: formData.title?.trim() || `${formData.from.trim()} ➔ ${formData.to.trim()}`,
        assignedChauffeur: {
          ...formData.assignedChauffeur,
          name: 'Chauffeur privé',
          languages: formData.assignedChauffeur?.spokenLanguages || formData.assignedChauffeur?.languages || ['Français', 'العربية'],
        },
      };

      if (editingRoute) {
        const updated = await chauffeurService.update(editingRoute._id, payload);
        setRoutes(prev => prev.map(r => r._id === editingRoute._id ? (updated || { ...r, ...payload }) : r));
      } else {
        const created = await chauffeurService.create(payload);
        if (created && created._id) {
          setRoutes(prev => [created, ...prev]);
        } else {
          await loadData();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de l'enregistrement dans la base de données.";
      setModalError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ── Sub Tabs Bar (Matches Voitures & Hébergements 1:1) ── */}
      <div className="admin-tabs-bar">
        {[
          ['dashboard', '📊 Dashboard'],
          ['routes', '🗺️ Lignes Fixes'],
          ['locations', '📍 Points & Destinations'],
          ['reservations', '📋 Demandes de Trajet'],
          ['calendar', '📅 Planning Semaine'],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`admin-tab-btn ${activeTab === k ? 'admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {error && (
        <div className="admin-error-bar">
          <FiAlertCircle size={15}/> {error}
          <button onClick={loadData}><FiRefreshCw size={12}/> Réessayer</button>
        </div>
      )}

      {/* ══════════ TAB 1: DASHBOARD (Matches Voitures & Hébergements) ══════════ */}
      {activeTab === 'dashboard' && (
        <div className="dash-layout">
          {/* KPI row */}
          <div className="dash-kpi-row">
            <KpiCard
              icon={<FiDollarSign size={20}/>}
              label="Revenus Trajets"
              value={fmtMoney(totalRevenue)}
              sub={`Total confirmé : ${fmtMoney(totalRevenue)}`}
            />
            <KpiCard
              icon={<FiCalendar size={20}/>}
              label="Réservations Trajets"
              value={totalReservations}
              sub={`${confirmedCount} confirmées · ${pendingCount} en attente`}
            />
            <KpiCard
              icon={<FiBarChart2 size={20}/>}
              label="Taux Lignes Actives"
              value={totalRoutes ? `${Math.round((activeRoutes / totalRoutes) * 100)}%` : '0%'}
              sub={`${activeRoutes} actives · ${totalRoutes - activeRoutes} inactives`}
            />
            <KpiCard
              icon={<FiMapPin size={20}/>}
              label="Total Liaisons & Chauffeurs"
              value={totalRoutes}
              sub="Chauffeur privé inclus sur chaque ligne"
            />
          </div>

          {/* Main Column */}
          <div className="dash-main">
            {/* Top / Popular Lines */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">🏆 Lignes Phares du Réseau Fixe</h3>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => setActiveTab('routes')}
                >
                  Voir tout →
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CIRCUIT / LIGNE</th>
                      <th>DURÉE & DISTANCE</th>
                      <th>CHAUFFEUR ASSIGNÉ</th>
                      <th>VÉHICULE VIP</th>
                      <th>TARIF FIXE</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeRoutes.slice(0, 5).map((route, i) => (
                      <tr key={route._id} className="admin-table__row">
                        <td>
                          <div className="admin-table__vehicle">
                            <div className="admin-table__car-img">
                              <img
                                src={route.assignedChauffeur?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                                alt={route.assignedChauffeur?.name}
                              />
                            </div>
                            <div>
                              <div className="admin-table__car-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{route.from}
                              </div>
                              <div className="admin-table__car-year" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                                ➔ {route.to}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--white-70)', fontSize: 12.5 }}>
                          {route.duration || '1h 30m'} <span style={{ color: 'var(--white-30)' }}>· {route.distance || '100 km'}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--white)' }}>
                            {'Chauffeur privé'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                            ★ {route.assignedChauffeur?.rating || 4.9} · {route.assignedChauffeur?.phone || '—'}
                          </div>
                        </td>
                        <td className="admin-table__category">
                          {route.assignedChauffeur?.vehicleModel || 'Berline VIP'}
                        </td>
                        <td>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                            {fmtMoney(route.basePriceTND)}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: route.available ? 'var(--success)' : 'var(--danger)',
                              background: route.available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              padding: '3px 8px',
                              borderRadius: 12
                            }}
                          >
                            {route.available ? 'En service' : 'Suspendue'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!safeRoutes.length && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 28 }}>
                          Aucune ligne de chauffeur configurée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breakdown by vehicle & service tier */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Statut & Répartition des liaisons</h3>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'En service (Actives)', count: activeRoutes, color: 'var(--success)' },
                  { label: 'Suspendues / Hors ligne', count: totalRoutes - activeRoutes, color: 'var(--danger)' },
                  { label: 'Liaisons Aéroports (TUN / NBE / DJE)', count: safeRoutes.filter(r => r.from.includes('Aéroport') || r.to.includes('Aéroport')).length, color: 'var(--gold)' },
                  { label: 'Berlines Affaires & Luxe (Classe E, A6, BMW)', count: safeRoutes.filter(r => (r.assignedChauffeur?.vehicleModel || '').includes('Mercedes') || (r.assignedChauffeur?.vehicleModel || '').includes('Audi') || (r.assignedChauffeur?.vehicleModel || '').includes('BMW')).length, color: '#2C3E56' },
                  { label: 'Vans VIP Familles & Groupes (Vito)', count: safeRoutes.filter(r => (r.assignedChauffeur?.vehicleModel || '').includes('Vito')).length, color: '#a78bfa' }
                ].map(({ label, count, color }) => (
                  <div key={label} className="dash-fleet-row">
                    <span className="dash-fleet-dot" style={{ background: color }} />
                    <span className="dash-fleet-label" style={{ width: 220 }}>{label}</span>
                    <div className="dash-fleet-bar-wrap">
                      <div
                        className="dash-fleet-bar"
                        style={{
                          width: totalRoutes ? `${(count / totalRoutes) * 100}%` : '0%',
                          background: color
                        }}
                      />
                    </div>
                    <span className="dash-fleet-count">{count} / {totalRoutes}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings Activity */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Activité récente des réservations avec chauffeur</h3>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => setActiveTab('reservations')}
                >
                  Toutes les demandes →
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CLIENT</th>
                      <th>LIGNE CONFIRMÉE</th>
                      <th>DATE & HEURE</th>
                      <th>VOL / DÉTAILS</th>
                      <th>PRIX</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeReservations.slice(0, 5).map(res => (
                      <tr key={res._id} className="admin-table__row">
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--white)' }}>{res.fullName}</div>
                          <div style={{ fontSize: 11, color: 'var(--white-30)' }}>{res.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white-70)' }}>
                            {res.routeName || `${res.from} ➔ ${res.to}`}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gold)' }}>
                            Chauffeur : {res.chauffeurName}
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--white-70)' }}>
                          {res.date} à {res.time}
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--white-50)' }}>
                          {res.flightNumber ? `Vol : ${res.flightNumber}` : 'Trajet direct'} · {res.passengers} pers
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                          {fmtMoney(res.priceTND)}
                        </td>
                        <td>
                          <ResBadge status={res.status} />
                        </td>
                      </tr>
                    ))}
                    {!safeReservations.length && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 24 }}>
                          Aucune réservation pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="dash-side">
            {/* Upcoming Pickups */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Prochains Départs VIP</h3>
              </div>
              <div className="admin-reservations">
                {!safeReservations.length ? (
                  <p style={{ textAlign: 'center', color: 'var(--white-30)', fontSize: 13, padding: '20px 16px' }}>
                    Aucun départ prévu.
                  </p>
                ) : (
                  safeReservations.slice(0, 6).map(r => {
                    const p = new Date(r.date || Date.now());
                    return (
                      <div key={r._id} className="res-item">
                        <div className="res-item__date">
                          <span className="res-item__day">{p.getDate()}</span>
                          <span className="res-item__month">
                            {p.toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}
                          </span>
                        </div>
                        <div className="res-item__info">
                          <div className="res-item__top">
                            <span className="res-item__client">{r.fullName}</span>
                            <ResBadge status={r.status} />
                          </div>
                          <span className="res-item__car">{r.routeName || `${r.from} ➔ ${r.to}`}</span>
                          <span className="res-item__dates">
                            {r.time} · {fmtMoney(r.priceTND)} · {r.chauffeurName}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Actions rapides</h3>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="admin-btn admin-btn--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleOpenModal(null)}
                >
                  <FiPlus size={14} /> Nouvelle Ligne avec Chauffeur
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('calendar')}
                >
                  <FiClock size={14} /> Planning des Chauffeurs
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('reservations')}
                >
                  <FiCalendar size={14} /> Gérer les Réservations
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('routes')}
                >
                  <FiNavigation size={14} /> Voir le Réseau de Lignes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 2: ROUTES LIST (Matches Vehicles & Hébergements 1:1) ══════════ */}
      {activeTab === 'routes' && (
        <div className="admin-full">
          {/* Summary Row */}
          <div className="admin-summary-row">
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalRoutes}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Total Lignes</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{activeRoutes}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>En service</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{totalRoutes - activeRoutes}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Suspendues</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{totalRoutes}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Lignes avec chauffeur privé</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>{fmtMoney(avgRoutePrice)}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Tarif moyen</div>
            </div>
          </div>

          {/* Main Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <h2 className="admin-card__title">
                  Lignes & Circuits Fixes <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30)' }}>({filteredRoutes.length})</span>
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par départ, destination, chauffeur..."
                    value={routeSearch}
                    onChange={e => setRouteSearch(e.target.value)}
                    style={{
                      padding: '6px 12px 6px 30px',
                      borderRadius: 6,
                      border: '1px solid var(--black-5)',
                      background: 'var(--black-3)',
                      color: 'var(--white)',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      outline: 'none',
                      minWidth: 220
                    }}
                  />
                </div>

                {/* Filter Region / Airport */}
                <select
                  value={routeFilterRegion}
                  onChange={e => setRouteFilterRegion(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--black-5)',
                    background: 'var(--black-3)',
                    color: 'var(--white)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Toutes les zones</option>
                  <option value="Tunis">Tunis / Carthage</option>
                  <option value="Sousse">Sousse / Sahloul</option>
                  <option value="Hammamet">Hammamet</option>
                  <option value="Enfidha">Enfidha</option>
                  <option value="Djerba">Djerba</option>
                  <option value="Bizerte">Bizerte</option>
                </select>

                {/* Filter Status */}
                <select
                  value={routeFilterStatus}
                  onChange={e => setRouteFilterStatus(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--black-5)',
                    background: 'var(--black-3)',
                    color: 'var(--white)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">En service</option>
                  <option value="inactive">Suspendue</option>
                </select>
              </div>

              <button
                className="admin-btn admin-btn--primary"
                onClick={() => handleOpenModal(null)}
              >
                <FiPlus size={14} /> Nouvelle Ligne avec Chauffeur
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>LIGNE & ITINÉRAIRE (POINT A ➔ POINT B)</th>
                    <th>DURÉE & DISTANCE</th>
                    <th>CHAUFFEUR ASSIGNÉ</th>
                    <th>VÉHICULE & IMMATRICULATION</th>
                    <th>TARIF FIXE</th>
                    <th>EN LIGNE</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map(route => (
                    <tr key={route._id} className="admin-table__row">
                      {/* Route column */}
                      <td>
                        <div className="admin-table__vehicle">
                          <div className="admin-table__car-img">
                            <img
                              src={route.assignedChauffeur?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                              alt={route.assignedChauffeur?.name}
                            />
                          </div>
                          <div>
                            <div className="admin-table__car-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {route.from}
                              {route.popular && (
                                <span style={{ fontSize: 10, color: 'var(--gold)', background: 'var(--gold-pale)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                  ★ LIGNE DIRECTE
                                </span>
                              )}
                            </div>
                            <div className="admin-table__car-year" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                              ➔ {route.to}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Distance & Duration */}
                      <td style={{ color: 'var(--white-70)', fontSize: 12.5 }}>
                        <div style={{ fontWeight: 600, color: 'var(--white)' }}>{route.duration || '1h 30m'}</div>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>{route.distance || '100 km'}</div>
                      </td>

                      {/* Chauffeur */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--white)' }}>
                          {'Chauffeur privé'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--white-50)' }}>
                          ★ {route.assignedChauffeur?.rating || 4.9} · {route.assignedChauffeur?.phone || '—'}
                        </div>
                      </td>

                      {/* Vehicle & Plate */}
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>
                          {route.assignedChauffeur?.vehicleModel || 'Berline VIP'}
                        </div>
                        <div className="admin-table__plate">
                          {route.assignedChauffeur?.vehiclePlate || '—'}
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 13.5 }}>
                          {fmtMoney(route.basePriceTND)}
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                          Péages inclus
                        </div>
                      </td>

                      {/* Toggle Active */}
                      <td>
                        <Toggle
                          active={route.available}
                          disabled={togglingId === route._id}
                          onChange={() => handleToggleActive(route)}
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="admin-table__action"
                            style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                            onClick={() => setPreviewMapRoute(route)}
                            title="Visualiser le tracé routier sur la carte Google Maps"
                          >
                            <FiNavigation size={13} /> Tracé Carte
                          </button>
                          <button
                            className="admin-table__action"
                            onClick={() => handleOpenModal(route)}
                            title="Modifier la ligne ou réaffecter le chauffeur"
                          >
                            <FiEdit2 size={13} /> Modifier
                          </button>
                          <button
                            className="admin-table__action admin-table__action--danger"
                            onClick={() => handleDelete(route._id)}
                            title="Supprimer cette ligne"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredRoutes.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 32 }}>
                        Aucune ligne ne correspond aux filtres appliqués.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: LOCATIONS MANAGEMENT (CRUD) ══════════ */}
      {activeTab === 'locations' && (
        <ChauffeurLocationsAdmin />
      )}

      {/* ══════════ TAB 4: RESERVATIONS / DEMANDES (Matches Voitures & Hébergements 1:1) ══════════ */}
      {activeTab === 'reservations' && (
        <div className="admin-full">
          {/* Summary Row */}
          <div className="admin-summary-row">
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalReservations}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Total Demandes</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{confirmedCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Confirmées</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>En attente</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>{completedCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Terminées</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{cancelledCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Annulées</div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <h2 className="admin-card__title">
                  Réservations & Prises en Charge ({filteredReservations.length})
                </h2>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par client, téléphone, n° vol..."
                    value={resSearch}
                    onChange={e => setResSearch(e.target.value)}
                    style={{
                      padding: '6px 12px 6px 30px',
                      borderRadius: 6,
                      border: '1px solid var(--black-5)',
                      background: 'var(--black-3)',
                      color: 'var(--white)',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      outline: 'none',
                      minWidth: 230
                    }}
                  />
                </div>

                <select
                  value={resFilterStatus}
                  onChange={e => setResFilterStatus(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--black-5)',
                    background: 'var(--black-3)',
                    color: 'var(--white)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Terminées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>DOSSIER & CLIENT</th>
                    <th>LIGNE FIXE CONFIRMÉE</th>
                    <th>DATE & HEURE</th>
                    <th>VOL & PASSAGERS</th>
                    <th>CHAUFFEUR DÉDIÉ</th>
                    <th>TARIF</th>
                    <th>STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map(res => (
                    <tr key={res._id} className="admin-table__row">
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--white)' }}>{res.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--white-50)' }}>
                          <span style={{ color: 'var(--gold)' }}>{res._id}</span> · {res.phone}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--white)' }}>
                          {res.routeName || `${res.from} ➔ ${res.to}`}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                          {res.notes || 'Sans note particulière'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 12.5 }}>
                          {res.date}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gold)' }}>
                          {res.time}
                        </div>
                      </td>

                      <td style={{ fontSize: 12, color: 'var(--white-70)' }}>
                        <div>{res.flightNumber ? `Vol : ${res.flightNumber}` : 'Sans vol'}</div>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                          {res.passengers} passager(s) · {res.luggage} bagage(s)
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--white)' }}>
                          {res.chauffeurName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                          {res.vehicleModel}
                        </div>
                      </td>

                      <td>
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(res.priceTND)}
                        </span>
                      </td>

                      <td>
                        <select
                          className="admin-status-select"
                          value={res.status}
                          onChange={e => handleUpdateResStatus(res._id, e.target.value)}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="completed">Terminée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!filteredReservations.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 32 }}>
                        Aucune demande trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 4: CALENDAR (Matches Voitures & Hébergements 1:1) ══════════ */}
      {activeTab === 'calendar' && (
        <div className="admin-full">
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 className="admin-card__title">📅 Planning & Disponibilités des Chauffeurs</h3>
                <span style={{ fontSize: 12, color: 'var(--white-30)' }}>
                  Semaine du {DAYS[0].label} au {DAYS[6].label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => setCalOffset(c => c - 7)}
                >
                  ← Semaine précédente
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => setCalOffset(0)}
                >
                  Aujourd'hui
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => setCalOffset(c => c + 7)}
                >
                  Semaine suivante →
                </button>
              </div>
            </div>

            <div className="admin-avail-grid">
              {/* Header row */}
              <div className="admin-avail-row admin-avail-row--header">
                <div className="admin-avail-row__car-col" style={{ width: 230, minWidth: 230 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--white-50)', letterSpacing: 0.5 }}>
                    CHAUFFEUR / CIRCUIT
                  </span>
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                  {DAYS.map((day, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: day.isToday ? 800 : 600,
                        color: day.isToday ? 'var(--gold)' : 'var(--white-50)',
                        background: day.isToday ? 'rgba(168,74,59,0.08)' : 'transparent',
                        borderLeft: '1px solid var(--black-4)'
                      }}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows for each route/chauffeur */}
              {safeRoutes.map(route => (
                <div key={route._id} className="admin-avail-row">
                  <div className="admin-avail-row__car-col" style={{ width: 230, minWidth: 230 }}>
                    <div className="admin-avail-row__car-img">
                      <img
                        src={route.assignedChauffeur?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                        alt={route.assignedChauffeur?.name}
                      />
                    </div>
                    <div>
                      <div className="admin-avail-row__car-name" style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {route.assignedChauffeur?.name || 'Chauffeur VIP'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--gold)', fontWeight: 600 }}>
                        {route.from.split('(')[0].trim()} ➔ {route.to.split('&')[0].trim()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flex: 1 }}>
                    {DAYS.map((day, idx) => {
                      // Check if there is a reservation on this day
                      const dayStr = day.date.toISOString().split('T')[0];
                      const hit = safeReservations.find(r => r.date === dayStr && (r.chauffeurName === route.assignedChauffeur?.name || r.routeName?.includes(route.to)));

                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            padding: '12px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderLeft: '1px solid var(--black-4)',
                            background: day.isToday ? 'rgba(168,74,59,0.03)' : 'transparent'
                          }}
                        >
                          {hit ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '4px 8px',
                                borderRadius: 10,
                                background: hit.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                color: hit.status === 'confirmed' ? '#4ade80' : '#fbbf24',
                                textAlign: 'center',
                                display: 'block',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={`${hit.fullName} (${hit.time}) - ${fmtMoney(hit.priceTND)}`}
                            >
                              {hit.time}
                            </span>
                          ) : (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: route.available ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
                              }}
                              title={route.available ? 'Disponible' : 'Suspendue'}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: ADD / EDIT ROUTE & CHAUFFEUR (Matches ApartmentModal 1:1) ══════════ */}
      {isModalOpen && (
        <div className="apt-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="apt-modal-card" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="apt-modal-header">
              <div className="apt-modal-header__info">
                <span className="apt-modal-badge">{editingRoute ? 'Édition Ligne Fixe' : 'Nouvelle Liaison Fixe'}</span>
                <h2 className="apt-modal-title">
                  {editingRoute ? `${formData.from} ➔ ${formData.to}` : 'Ajouter une Ligne Régulière avec Chauffeur'}
                </h2>
              </div>
              <button className="apt-modal-close" onClick={() => setIsModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            {modalError && (
              <div className="apt-modal-alert apt-modal-alert--error">
                <FiAlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="apt-modal-form">
              <div className="apt-modal-scroll">
                {/* 1. Circuit Fixe */}
                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">1. Circuit Fixe & Trajet (Point A ➔ Point B)</h3>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Point de Départ (A) *</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        required
                        placeholder="Ex: Aéroport Tunis-Carthage (TUN)"
                        value={formData.from}
                        onChange={e => setFormData({ ...formData, from: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Point d'Arrivée (B) *</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        required
                        placeholder="Ex: Sousse Sahloul"
                        value={formData.to}
                        onChange={e => setFormData({ ...formData, to: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Durée Estimée</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        placeholder="Ex: 1h 45m"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Distance</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        placeholder="Ex: 142 km"
                        value={formData.distance}
                        onChange={e => setFormData({ ...formData, distance: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Tarif Forfaitaire (TND) *</label>
                      <input
                        type="number"
                        className="apt-form-input"
                        required
                        min={10}
                        value={formData.basePriceTND}
                        onChange={e => setFormData({ ...formData, basePriceTND: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Interactive Google Maps Route Picker */}
                  <div style={{ marginTop: 14 }}>
                    <label className="apt-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiNavigation size={14} color="#A84A3B" />
                        <span>Sélectionner le Point A (Départ) & Point B (Arrivée) sur Google Maps</span>
                      </span>
                      <span style={{ fontSize: 11, color: '#D4AF37', fontWeight: 600 }}>
                        Calcul automatique du tracé & distance routière
                      </span>
                    </label>
                    <ChauffeurAdminMapPicker
                      fromCoords={formData.fromCoords}
                      toCoords={formData.toCoords}
                      fromText={formData.from}
                      toText={formData.to}
                      onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                    />
                  </div>
                </div>

                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">2. Chauffeur privé inclus</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--white-70)' }}>
                    Un chauffeur privé est inclus automatiquement pour cette ligne.
                  </p>
                </div>

                {/* 3. Véhicule Dédié */}
                <div className="apt-form-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 className="apt-form-section__title" style={{ margin: 0 }}>3. Véhicule de Prestige Dédié</h3>
                    <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>
                      Véhicule utilisé pour cette ligne
                    </span>
                  </div>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Catégorie de Service *</label>
                      <select
                        className="apt-form-select"
                        value={formData.vehicleType || 'business-sedan'}
                        onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                      >
                        <option value="business-sedan">Berline Affaires (Classe E, Série 5, A6)</option>
                        <option value="first-class">Première Classe (Classe S, Série 7, A8)</option>
                        <option value="luxury-van">Van VIP Prestige (Mercedes Vito / V-Class)</option>
                        <option value="suv-prestige">SUV Grand Luxe (Range Rover, Cayenne)</option>
                      </select>
                    </div>
                    <div className="apt-form-field" style={{ flex: 1.2 }}>
                      <label className="apt-form-label">Modèle du Véhicule *</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        required
                        placeholder="Ex: Mercedes-Benz Classe E 2025"
                        value={formData.assignedChauffeur.vehicleModel}
                        onChange={e => setFormData({
                          ...formData,
                          assignedChauffeur: { ...formData.assignedChauffeur, vehicleModel: e.target.value }
                        })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 0.8 }}>
                      <label className="apt-form-label">Immatriculation</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        placeholder="Ex: 242 TU 8890"
                        value={formData.assignedChauffeur.vehiclePlate}
                        onChange={e => setFormData({
                          ...formData,
                          assignedChauffeur: { ...formData.assignedChauffeur, vehiclePlate: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="apt-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--black-4)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn--primary"
                >
                  {saving ? 'Enregistrement...' : editingRoute ? 'Enregistrer les Modifications' : 'Créer la Ligne Fixe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: MAP TRAIL PREVIEW (Embedded Google Maps) ══════════ */}
      {previewMapRoute && (
        <ChauffeurTrailModal
          route={previewMapRoute}
          onClose={() => setPreviewMapRoute(null)}
          onBookNow={(r) => {
            setPreviewMapRoute(null);
            handleOpenModal(r);
          }}
        />
      )}
    </div>
  );
}
