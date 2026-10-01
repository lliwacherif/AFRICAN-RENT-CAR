import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiSearch,
  FiCompass, FiCalendar, FiDollarSign, FiUsers, FiCheck, FiX,
  FiAlertCircle, FiRefreshCw, FiEye, FiBarChart2, FiTrendingUp, FiTrendingDown,
  FiClock, FiStar, FiFilter, FiLayers, FiList, FiMapPin, FiPhone, FiMail,
  FiCheckCircle, FiChevronLeft, FiChevronRight, FiNavigation
} from 'react-icons/fi';
import { excursionsService } from '../../services/excursionsService';
import { hasGroupPricing, getExcursionStartingPrice } from '../../utils/excursionPricing';
import { useCurrency } from '../../context/CurrencyContext';
import ExcursionModal from './ExcursionModal';
import './ApartmentsAdmin.css';

// ── Native Admin Helper Components (Identical to Voitures, Hébergements & Chauffeurs) ──
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

function CategoryBadge({ category }) {
  const map = {
    'Sahara & Désert':     { bg: 'rgba(212,175,55,0.15)', c: '#d97706', icon: '🐪' },
    'Mer & Bateau':        { bg: 'rgba(6,182,212,0.15)',  c: '#0891b2', icon: '⛵' },
    'Randonnée & Nature':  { bg: 'rgba(34,197,94,0.15)',  c: '#16a34a', icon: '🌲' },
    'Culture & Histoire':  { bg: 'rgba(147,51,234,0.15)', c: '#9333ea', icon: '🏛️' },
    'Aventure & Quad':     { bg: 'rgba(239,68,68,0.15)',  c: '#ea580c', icon: '🏎️' },
  };
  const s = map[category] || { bg: 'rgba(168,74,59,0.12)', c: 'var(--gold)', icon: '🧭' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: s.bg,
      color: s.c,
      padding: '3px 8px',
      borderRadius: 6,
      fontSize: 11.5,
      fontWeight: 700
    }}>
      <span>{s.icon}</span>
      <span>{category}</span>
    </span>
  );
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

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
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
      dayName: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
      date: d,
      isToday,
      isPast: d < today,
      dateString: d.toISOString().split('T')[0]
    });
  }
  return out;
}

export default function ExcursionsAdmin() {
  const { formatPrice } = useCurrency();
  const fmtMoney = (n) => (formatPrice ? formatPrice(n) : `${(n || 0).toLocaleString('fr-FR')} TND`);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'excursions' | 'reservations' | 'calendar'
  const [excursions, setExcursions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Calendar
  const [calOffset, setCalOffset] = useState(0);

  // Filters for Excursions
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filters for Reservations
  const [resSearch, setResSearch] = useState('');
  const [resFilterStatus, setResFilterStatus] = useState('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExcursion, setEditingExcursion] = useState(null);
  const [resDetailModal, setResDetailModal] = useState(null);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [excData, resData] = await Promise.all([
        excursionsService.getAllAdmin(),
        excursionsService.getReservations(),
      ]);
      setExcursions(Array.isArray(excData) ? excData : []);
      setReservations(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error('Error loading excursions admin data:', err);
      setError('Impossible de charger les données des excursions et réservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeExcursions = Array.isArray(excursions) ? excursions : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const DAYS = getWeekDays(calOffset);

  // Metrics
  const totalExcursions = safeExcursions.length;
  const activeExcursions = safeExcursions.filter(e => e.isActive !== false).length;
  const featuredExcursions = safeExcursions.filter(e => e.featured).length;
  const avgAdultPrice = totalExcursions > 0
    ? Math.round(safeExcursions.reduce((acc, e) => acc + getExcursionStartingPrice(e), 0) / totalExcursions)
    : 0;

  const totalReservations = safeReservations.length;
  const confirmedCount = safeReservations.filter(r => r.status === 'confirmed').length;
  const pendingCount = safeReservations.filter(r => r.status === 'pending' || r.status === 'recu').length;
  const completedCount = safeReservations.filter(r => r.status === 'completed').length;
  const cancelledCount = safeReservations.filter(r => r.status === 'cancelled').length;

  const totalRevenue = safeReservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

  // Upcoming departures sorted by date
  const upcomingDepartures = [...safeReservations]
    .filter(r => r.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filtered Excursions
  const filteredExcursions = safeExcursions.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (e.title || '').toLowerCase().includes(q) ||
      (e.destination || '').toLowerCase().includes(q) ||
      (e.departureCity || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q);

    const matchCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchCity = filterCity === 'all' || e.departureCity === filterCity;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && e.isActive !== false) ||
      (filterStatus === 'inactive' && e.isActive === false) ||
      (filterStatus === 'featured' && e.featured);

    return matchSearch && matchCategory && matchCity && matchStatus;
  });

  // Filtered Reservations
  const filteredReservations = safeReservations.filter(r => {
    const q = resSearch.toLowerCase().trim();
    const clientName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
    const excTitle = (r.excursion?.title || '').toLowerCase();
    const code = (r._id || '').toLowerCase();

    const matchSearch = !q || clientName.includes(q) || excTitle.includes(q) || code.includes(q);
    const matchStatus = resFilterStatus === 'all' || r.status === resFilterStatus;

    return matchSearch && matchStatus;
  });

  // Unique departure cities & categories
  const uniqueCities = Array.from(new Set(safeExcursions.map(e => e.departureCity).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(safeExcursions.map(e => e.category).filter(Boolean)));

  // Handlers
  const handleToggleActive = async (exc) => {
    setTogglingId(exc._id);
    try {
      const updated = await excursionsService.toggleActive(exc._id, exc.isActive !== false);
      setExcursions(prev => prev.map(e => e._id === exc._id ? { ...e, isActive: updated.isActive } : e));
    } catch (err) {
      alert("Erreur lors de la modification de l'état : " + (err.response?.data?.message || err.message));
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (exc) => {
    try {
      const updated = await excursionsService.toggleFeatured(exc._id, Boolean(exc.featured));
      setExcursions(prev => prev.map(e => e._id === exc._id ? { ...e, featured: updated.featured } : e));
    } catch (err) {
      alert("Erreur lors de la modification du statut vedette : " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (exc) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'excursion "${exc.title}" ?`)) return;
    try {
      await excursionsService.delete(exc._id);
      setExcursions(prev => prev.filter(e => e._id !== exc._id));
    } catch (err) {
      alert("Erreur lors de la suppression : " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateResStatus = async (resId, newStatus) => {
    try {
      const updated = await excursionsService.updateReservationStatus(resId, newStatus);
      setReservations(prev => prev.map(r => r._id === resId ? { ...r, status: updated.status } : r));
      if (resDetailModal && resDetailModal._id === resId) {
        setResDetailModal(prev => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut : " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenModal = (exc = null) => {
    setEditingExcursion(exc);
    setIsModalOpen(true);
  };

  const handleSavedModal = (savedExc) => {
    if (editingExcursion) {
      setExcursions(prev => prev.map(e => e._id === editingExcursion._id ? { ...e, ...savedExc } : e));
    } else {
      setExcursions(prev => [savedExc, ...prev]);
    }
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div>
      {/* ── Sub Tabs Bar (Matches Voitures, Hébergements & Chauffeurs 100%) ── */}
      <div className="admin-tabs-bar">
        {[
          ['dashboard', '📊 Dashboard'],
          ['excursions', '🧭 Circuits & Excursions'],
          ['reservations', '📋 Réservations'],
          ['calendar', '📅 Calendrier des Départs'],
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

      {/* ══════════ TAB 1: DASHBOARD (Matches Apartments & Cars 100%) ══════════ */}
      {activeTab === 'dashboard' && (
        <div className="dash-layout">
          {/* KPI row */}
          <div className="dash-kpi-row">
            <KpiCard
              icon={<FiDollarSign size={20}/>}
              label="Revenus Circuits"
              value={fmtMoney(totalRevenue)}
              sub={`Total confirmé : ${fmtMoney(totalRevenue)}`}
            />
            <KpiCard
              icon={<FiCalendar size={20}/>}
              label="Réservations Total"
              value={totalReservations}
              sub={`${confirmedCount} confirmées · ${pendingCount} en attente`}
            />
            <KpiCard
              icon={<FiBarChart2 size={20}/>}
              label="Taux en Ligne"
              value={totalExcursions ? `${Math.round((activeExcursions / totalExcursions) * 100)}%` : '0%'}
              sub={`${activeExcursions} actifs · ${totalExcursions - activeExcursions} inactifs`}
            />
            <KpiCard
              icon={<FiCompass size={20}/>}
              label="Total Circuits"
              value={totalExcursions}
              sub={`${featuredExcursions} coup de cœur · ${uniqueCities.length} villes`}
            />
          </div>

          {/* Main Column */}
          <div className="dash-main">
            {/* Top / Catalog Excursions */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">🏆 Circuits & Excursions du catalogue</h3>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => setActiveTab('excursions')}
                >
                  Voir tout →
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CIRCUIT / DESTINATION</th>
                      <th>CATÉGORIE</th>
                      <th>VILLE DÉPART</th>
                      <th>DURÉE</th>
                      <th>TARIF À PARTIR DE</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeExcursions.slice(0, 5).map((exc, i) => (
                      <tr key={exc._id} className="admin-table__row">
                        <td>
                          <div className="admin-table__vehicle">
                            <div className="admin-table__car-img">
                              {exc.images?.[0] ? (
                                <img src={exc.images[0]} alt={exc.title} />
                              ) : (
                                <span style={{ fontSize: 18 }}>🧭</span>
                              )}
                            </div>
                            <div>
                              <div className="admin-table__car-name">
                                {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{exc.title}
                              </div>
                              <div className="admin-table__car-year">{exc.destination || exc.departureCity}</div>
                            </div>
                          </div>
                        </td>
                        <td className="admin-table__category">
                          <CategoryBadge category={exc.category} />
                        </td>
                        <td style={{ color: 'var(--white-70)', fontSize: 12.5 }}>📍 {exc.departureCity}</td>
                        <td style={{ color: 'var(--white-70)', fontSize: 12 }}>⏱️ {exc.duration}</td>
                        <td>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                            {fmtMoney(getExcursionStartingPrice(exc))} {hasGroupPricing(exc) ? '/ groupe' : '/ pers.'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: exc.isActive !== false ? 'var(--success)' : 'var(--danger)',
                              background: exc.isActive !== false ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              padding: '3px 8px',
                              borderRadius: 12
                            }}
                          >
                            {exc.isActive !== false ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!safeExcursions.length && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 28 }}>
                          Aucun circuit enregistré pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category and Fleet Status Breakdown */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Statut & Répartition des circuits</h3>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'En ligne', count: activeExcursions, color: 'var(--success)' },
                  { label: 'Hors ligne', count: totalExcursions - activeExcursions, color: 'var(--danger)' },
                  { label: 'Coup de cœur', count: featuredExcursions, color: 'var(--gold)' },
                  { label: 'Sahara & Désert', count: safeExcursions.filter(e => e.category === 'Sahara & Désert').length, color: '#d97706' },
                  { label: 'Mer & Bateau', count: safeExcursions.filter(e => e.category === 'Mer & Bateau').length, color: '#0891b2' },
                  { label: 'Randonnée & Nature', count: safeExcursions.filter(e => e.category === 'Randonnée & Nature').length, color: '#16a34a' },
                  { label: 'Culture & Histoire', count: safeExcursions.filter(e => e.category === 'Culture & Histoire').length, color: '#9333ea' },
                  { label: 'Aventure & Quad', count: safeExcursions.filter(e => e.category === 'Aventure & Quad').length, color: '#ea580c' }
                ].map(({ label, count, color }) => (
                  <div key={label} className="dash-fleet-row">
                    <span className="dash-fleet-dot" style={{ background: color }} />
                    <span className="dash-fleet-label" style={{ width: 170 }}>{label}</span>
                    <div className="dash-fleet-bar-wrap">
                      <div
                        className="dash-fleet-bar"
                        style={{
                          width: totalExcursions ? `${(count / totalExcursions) * 100}%` : '0%',
                          background: color
                        }}
                      />
                    </div>
                    <span className="dash-fleet-count">{count} / {totalExcursions}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings Activity */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Activité récente des réservations</h3>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => setActiveTab('reservations')}
                >
                  Voir tout →
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CLIENT</th>
                      <th>CIRCUIT</th>
                      <th>DATE DÉPART</th>
                      <th>VOYAGEURS</th>
                      <th>TOTAL TTC</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeReservations.slice(0, 6).map(r => (
                      <tr key={r._id} className="admin-table__row">
                        <td>
                          <div className="admin-table__car-name">{r.user?.firstName || 'Client'} {r.user?.lastName || ''}</div>
                          <div className="admin-table__car-year">{r.user?.email || r.contactPhone || '—'}</div>
                        </td>
                        <td>
                          <div className="admin-table__car-name">{r.excursion?.title || 'Circuit'}</div>
                          <div className="admin-table__car-year">{r.excursion?.destination || ''}</div>
                        </td>
                        <td style={{ fontSize: 11.5, color: 'var(--white-50)' }}>
                          {fmtDate(r.date)}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--white-70)' }}>
                          👥 {r.totalParticipants || (r.adults + (r.children || 0))} pers.
                        </td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(r.totalPrice)}
                        </td>
                        <td>
                          <ResBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                    {!safeReservations.length && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 28 }}>
                          Aucune réservation d'excursion enregistrée.
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
            {/* Upcoming Departures */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Prochains départs</h3>
              </div>
              <div className="admin-reservations">
                {!upcomingDepartures.length ? (
                  <p style={{ textAlign: 'center', color: 'var(--white-30)', fontSize: 13, padding: '20px 16px' }}>
                    Aucun départ prévu.
                  </p>
                ) : (
                  upcomingDepartures.slice(0, 8).map(r => {
                    const p = new Date(r.date);
                    return (
                      <div
                        key={r._id}
                        className="res-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setResDetailModal(r)}
                      >
                        <div className="res-item__date">
                          <span className="res-item__day">{p.getDate()}</span>
                          <span className="res-item__month">
                            {p.toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}
                          </span>
                        </div>
                        <div className="res-item__info">
                          <div className="res-item__top">
                            <span className="res-item__client">
                              {r.user?.firstName || 'Client'} {r.user?.lastName || ''}
                            </span>
                            <ResBadge status={r.status} />
                          </div>
                          <span className="res-item__car">{r.excursion?.title || 'Circuit Excursion'}</span>
                          <span className="res-item__dates">
                            {fmtMoney(r.totalPrice)} · {r.totalParticipants || (r.adults + (r.children || 0))} pers.
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
                  <FiPlus size={14} /> Ajouter un circuit
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('calendar')}
                >
                  <FiClock size={14} /> Calendrier des Départs
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('reservations')}
                >
                  <FiCalendar size={14} /> Réservations Départs
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('excursions')}
                >
                  <FiCompass size={14} /> Gérer les Circuits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 2: CIRCUITS & EXCURSIONS (Matches Apartments Tab 100%) ══════════ */}
      {activeTab === 'excursions' && (
        <div className="admin-full">
          {/* Summary Row */}
          <div className="admin-summary-row">
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalExcursions}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Total Circuits</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{activeExcursions}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>En ligne</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{totalExcursions - activeExcursions}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Hors ligne</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{featuredExcursions}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Coup de cœur</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>{uniqueCities.length}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Villes Départs</div>
            </div>
          </div>

          {/* Main Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <h2 className="admin-card__title">
                  Circuits & Excursions <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30)' }}>({filteredExcursions.length})</span>
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par titre, ville..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      padding: '6px 12px 6px 30px',
                      borderRadius: 6,
                      border: '1px solid var(--black-5)',
                      background: 'var(--black-3)',
                      color: 'var(--white)',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      outline: 'none',
                      minWidth: 200
                    }}
                  />
                </div>

                {/* Filter Category */}
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
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
                  <option value="all">Toutes les catégories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Filter City */}
                <select
                  value={filterCity}
                  onChange={e => setFilterCity(e.target.value)}
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
                  <option value="all">Toutes les villes</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
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
                  <option value="active">En ligne</option>
                  <option value="inactive">Hors ligne</option>
                  <option value="featured">Coup de cœur</option>
                </select>
              </div>

              <button
                className="admin-btn admin-btn--primary"
                onClick={() => handleOpenModal(null)}
              >
                <FiPlus size={14} /> Ajouter un circuit
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CIRCUIT & DESTINATION</th>
                    <th>CATÉGORIE</th>
                    <th>DÉPART</th>
                    <th>DURÉE & GROUPE</th>
                    <th>TARIFS</th>
                    <th>EN LIGNE</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExcursions.map(exc => (
                    <tr key={exc._id} className="admin-table__row">
                      <td>
                        <div className="admin-table__vehicle">
                          <div className="admin-table__car-img">
                            {exc.images?.[0] ? <img src={exc.images[0]} alt={exc.title} /> : <span style={{ fontSize: 18 }}>🧭</span>}
                          </div>
                          <div>
                            <div className="admin-table__car-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {exc.title}
                              {exc.featured && (
                                <span style={{ fontSize: 10, color: 'var(--gold)', background: 'var(--gold-pale)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                  ★ STAR
                                </span>
                              )}
                            </div>
                            <div className="admin-table__car-year">📍 {exc.destination || exc.departureCity}</div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table__category">
                        <CategoryBadge category={exc.category} />
                      </td>
                      <td style={{ color: 'var(--white-70)', fontSize: 12.5 }}>📍 {exc.departureCity}</td>
                      <td style={{ color: 'var(--white-70)', fontSize: 12 }}>
                        <div>⏱️ {exc.duration}</div>
                        <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>
                          👥 {exc.minGroupSize}-{exc.maxGroupSize} pers.
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(getExcursionStartingPrice(exc))} {hasGroupPricing(exc) ? '/ groupe' : '/ pers.'}
                        </span>
                        {hasGroupPricing(exc) ? exc.priceTiers.map(tier => (
                          <div key={tier.minPeople} style={{ fontSize: 11, color: 'var(--white-70)' }}>
                            {tier.minPeople}–{tier.maxPeople} pers. : {fmtMoney(tier.price)}
                          </div>
                        )) : exc.pricePerChild > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--white-50)' }}>
                            {fmtMoney(exc.pricePerChild)} / enf.
                          </div>
                        )}
                      </td>
                      <td>
                        <Toggle
                          active={exc.isActive !== false}
                          disabled={togglingId === exc._id}
                          onChange={() => handleToggleActive(exc)}
                        />
                      </td>
                      <td>
                        <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="admin-table__action"
                            style={{ color: exc.featured ? '#f59e0b' : 'var(--white-50)' }}
                            onClick={() => handleToggleFeatured(exc)}
                            title={exc.featured ? 'Retirer du coup de cœur' : 'Mettre en avant'}
                          >
                            <FiStar size={13} fill={exc.featured ? '#f59e0b' : 'none'} />
                          </button>
                          <a
                            href={`/excursions/${exc._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-table__action"
                            title="Voir sur le site public"
                          >
                            <FiExternalLink size={13} />
                          </a>
                          <button
                            className="admin-table__action"
                            title="Modifier"
                            onClick={() => handleOpenModal(exc)}
                          >
                            <FiEdit2 size={13} /> Modifier
                          </button>
                          <button
                            className="admin-table__action admin-table__action--danger"
                            title="Supprimer"
                            onClick={() => handleDelete(exc)}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredExcursions.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 36 }}>
                        Aucun circuit ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 3: RESERVATIONS LIST (Matches Reservations Tab 100%) ══════════ */}
      {activeTab === 'reservations' && (
        <div className="admin-full">
          {/* Summary Row */}
          <div className="admin-summary-row">
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--white)' }}>{totalReservations}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Total</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{confirmedCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Confirmées</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--warning)' }}>{pendingCount}</div>
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

          {/* Main Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <h2 className="admin-card__title">
                  Réservations Circuits <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30)' }}>({filteredReservations.length})</span>
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par client, circuit, code..."
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
                      minWidth: 220
                    }}
                  />
                </div>

                {/* Status Filter */}
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
                  <option value="recu">Reçu</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <button className="admin-btn admin-btn--outline" onClick={loadData}>
                <FiRefreshCw size={13} /> Actualiser
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>RÉFÉRENCE</th>
                    <th>CLIENT</th>
                    <th>CIRCUIT EXCURSION</th>
                    <th>DATE DÉPART</th>
                    <th>VOYAGEURS</th>
                    <th>TOTAL TTC</th>
                    <th>STATUT</th>
                    <th style={{ textAlign: 'right' }}>DÉTAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map(res => (
                    <tr key={res._id} className="admin-table__row">
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--gold)' }}>
                          #{res._id.slice(-6).toUpperCase()}
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--white-30)', marginTop: 2 }}>
                          {fmtDate(res.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="admin-table__car-name">
                          {res.user?.firstName || 'Client'} {res.user?.lastName || ''}
                        </div>
                        <div className="admin-table__car-year">{res.user?.email || res.contactPhone || '—'}</div>
                      </td>
                      <td>
                        <div className="admin-table__car-name">{res.excursion?.title || 'Circuit'}</div>
                        <div className="admin-table__car-year">{res.excursion?.destination || 'Tunisie'}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--white-70)' }}>
                        <div>📅 {fmtDate(res.date)}</div>
                      </td>
                      <td style={{ color: 'var(--white-70)', fontSize: 12 }}>
                        {res.adults || 1} ad. {res.children > 0 ? `· ${res.children} enf.` : ''}
                      </td>
                      <td>
                        <div style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(res.totalPrice)}
                        </div>
                        {res.pickupLocation && (
                          <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                            {res.pickupLocation.slice(0, 20)}...
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          className="admin-status-select"
                          value={res.status}
                          onChange={e => handleUpdateResStatus(res._id, e.target.value)}
                        >
                          <option value="recu">📥 Reçu</option>
                          <option value="pending">⏳ En attente</option>
                          <option value="confirmed">✅ Confirmée</option>
                          <option value="completed">🏁 Terminée</option>
                          <option value="cancelled">❌ Annulée</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="admin-btn admin-btn--outline"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => setResDetailModal(res)}
                        >
                          <FiEye size={12}/> Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredReservations.length && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 36 }}>
                        Aucune réservation trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 4: CALENDRIER DES DÉPARTS (Matches Voitures & Apartments 100%) ══════════ */}
      {activeTab === 'calendar' && (
        <div className="dash-layout">
          <div className="dash-main" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-card" style={{ overflow: 'hidden' }}>
              {/* Header */}
              <div
                className="admin-card__header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCalendar size={15} color="var(--gold)"/>
                  <h3 className="admin-card__title">
                    Planning des Départs & Excursions
                    <span style={{ fontWeight: 400, color: 'var(--white-30)', fontSize: 12, marginLeft: 8 }}>
                      {DAYS[0]?.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – {DAYS[DAYS.length - 1]?.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </h3>
                  {loading && <span className="admin-spinner" style={{ marginLeft: 6 }}/>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="admin-btn admin-btn--outline"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => setCalOffset(o => o - 7)}
                  >
                    ← Préc.
                  </button>
                  <button
                    className="admin-btn admin-btn--outline"
                    style={{ padding: '4px 10px', fontSize: 12, opacity: calOffset === 0 ? 0.4 : 1 }}
                    onClick={() => setCalOffset(0)}
                    disabled={calOffset === 0}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    className="admin-btn admin-btn--outline"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => setCalOffset(o => o + 7)}
                  >
                    Suiv. →
                  </button>
                  <button
                    className="admin-btn admin-btn--outline"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={loadData}
                    title="Actualiser"
                  >
                    <FiRefreshCw size={12}/>
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, padding: '8px 18px 10px', borderBottom: '1px solid var(--black-5)', flexWrap: 'wrap' }}>
                {[
                  { color: '#4ade80', label: 'Ouvert & Disponible' },
                  { color: '#fbbf24', label: 'Départ Réservé' },
                  { color: '#f87171', label: 'Complet / Confirmé' },
                  { color: '#6b7280', label: 'Non programmé ce jour' },
                ].map(({ color, label }) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--white-50)' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
                    {label}
                  </span>
                ))}
              </div>

              {/* Grid */}
              <div className="admin-avail-grid">
                {/* Header Row */}
                <div className="admin-avail-row admin-avail-row--header">
                  <div className="admin-avail-row__car-col" style={{ width: 240, minWidth: 240 }}>
                    <span style={{ fontSize: 10, color: 'var(--white-30)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                      Circuit & Ville Départ
                    </span>
                  </div>
                  {DAYS.map(d => {
                    const parts = d.date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
                    const dateNum = d.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                    return (
                      <div
                        key={d.label}
                        className="admin-avail-row__day"
                        style={{
                          flexDirection: 'column',
                          gap: 1,
                          background: d.isToday ? 'rgba(168,74,59,0.12)' : undefined,
                          color: d.isToday ? 'var(--gold)' : d.isPast ? 'var(--white-30)' : 'var(--white-70)',
                          borderRadius: d.isToday ? '4px 4px 0 0' : undefined,
                        }}
                      >
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>{parts}</span>
                        <span style={{ fontSize: 10, fontWeight: d.isToday ? 700 : 500 }}>{dateNum}</span>
                        {d.isToday && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', marginTop: 1 }}/>}
                      </div>
                    );
                  })}
                </div>

                {/* Excursion Rows */}
                {safeExcursions.map(exc => (
                  <div key={exc._id} className="admin-avail-row" style={{ opacity: exc.isActive !== false ? 1 : 0.45 }}>
                    <div className="admin-avail-row__car-col" style={{ width: 240, minWidth: 240 }}>
                      <div className="admin-avail-row__car-img">
                        {exc.images?.[0] ? <img src={exc.images[0]} alt={exc.title}/> : <span style={{ fontSize: 16 }}>🧭</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, overflow: 'hidden' }}>
                        <span className="admin-avail-row__car-name" style={{ maxWidth: 160 }} title={exc.title}>
                          {exc.title}
                        </span>
                        <span style={{ fontSize: 10.5, color: 'var(--white-50)' }}>
                          📍 {exc.departureCity} · {exc.category}
                        </span>
                      </div>
                    </div>

                    {DAYS.map(d => {
                      const dayLower = d.date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
                      const isDayOpen = exc.availableDays?.includes('Tous les jours') ||
                        exc.availableDays?.some(ad => ad.toLowerCase().includes(dayLower));

                      // Find day bookings (Timezone-safe comparison using Year, Month, Day)
                      const dayBookings = safeReservations.filter(r => {
                        if (r.status === 'cancelled') return false;
                        const excId = (r.excursion?._id || r.excursion)?.toString();
                        if (excId !== exc._id?.toString()) return false;
                        if (!r.date) return false;
                        const rDate = new Date(r.date);
                        return (
                          rDate.getFullYear() === d.date.getFullYear() &&
                          rDate.getMonth() === d.date.getMonth() &&
                          rDate.getDate() === d.date.getDate()
                        );
                      });

                      const bookedSeats = dayBookings.reduce((sum, r) => sum + (r.totalParticipants || (r.adults + (r.children || 0))), 0);
                      const maxSeats = exc.maxGroupSize || 16;
                      const isFull = bookedSeats >= maxSeats;

                      // Priority: Bookings ALWAYS show, even if not an official open day
                      let state = 'ok';
                      let title = '';

                      if (dayBookings.length > 0) {
                        if (isFull) {
                          state = 'booked';
                          title = `Complet — ${bookedSeats}/${maxSeats} pers. (${dayBookings.length} résa)`;
                        } else {
                          state = 'pending';
                          title = `Départ réservé — ${bookedSeats}/${maxSeats} pers. (${dayBookings.length} résa) · Cliquez pour voir`;
                        }
                      } else if (!isDayOpen) {
                        state = 'inactive';
                        title = 'Pas de départ programmé';
                      } else {
                        state = 'ok';
                        title = `Disponible — 0/${maxSeats} places réservées`;
                      }

                      return (
                        <div
                          key={d.label}
                          className="admin-avail-row__day"
                          title={title}
                          style={{
                            background: d.isToday
                              ? 'rgba(168,74,59,0.06)'
                              : dayBookings.length > 0
                              ? 'rgba(245,158,11,0.04)'
                              : !isDayOpen
                              ? 'var(--black-4, #FAF8F5)'
                              : 'transparent',
                            borderLeft: d.isToday ? '2px solid var(--gold)' : undefined,
                            cursor: dayBookings.length > 0 ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 4px'
                          }}
                          onClick={() => dayBookings.length > 0 && setResDetailModal(dayBookings[0])}
                        >
                          {state === 'pending' && (
                            <div
                              style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 8,
                                background: 'rgba(245,158,11,0.18)',
                                border: '1.5px solid rgba(245,158,11,0.4)',
                                boxShadow: '0 2px 6px rgba(245,158,11,0.15)',
                                transition: 'transform 0.15s'
                              }}
                            >
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#B45309', whiteSpace: 'nowrap' }}>
                                👥 {bookedSeats} pers.
                              </span>
                              <span style={{ fontSize: 9, fontWeight: 600, color: '#926300', whiteSpace: 'nowrap' }}>
                                {dayBookings.length} résa · {maxSeats - bookedSeats} libre{maxSeats - bookedSeats > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {state === 'booked' && (
                            <div
                              style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 8,
                                background: 'rgba(239,68,68,0.18)',
                                border: '1.5px solid rgba(239,68,68,0.4)',
                                boxShadow: '0 2px 6px rgba(239,68,68,0.15)'
                              }}
                            >
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#B91C1C', whiteSpace: 'nowrap' }}>
                                🔴 Complet
                              </span>
                              <span style={{ fontSize: 9, fontWeight: 600, color: '#B91C1C', whiteSpace: 'nowrap' }}>
                                {bookedSeats}/{maxSeats} pers.
                              </span>
                            </div>
                          )}

                          {state === 'ok' && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#15803D',
                                background: 'rgba(34,197,94,0.08)',
                                border: '1px solid rgba(34,197,94,0.22)',
                                padding: '3px 7px',
                                borderRadius: 6
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }}></span>
                              <span style={{ fontSize: 10.5 }}>Libre (0/{maxSeats})</span>
                            </div>
                          )}

                          {state === 'inactive' && (
                            <span style={{ color: 'var(--white-30, #9CA3AF)', fontSize: 14, fontWeight: 600 }}>
                              —
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ EXCURSION RESERVATION MODAL (Matches Stay Modal 100%) ══════════ */}
      {resDetailModal && (
        <div className="vm-overlay" onClick={e => e.target === e.currentTarget && setResDetailModal(null)}>
          <div className="vm-modal" style={{ maxWidth: 520 }}>
            <div className="vm-header">
              <div>
                <h2 className="vm-title">📋 Réservation Circuit #{resDetailModal._id?.slice(-6).toUpperCase()}</h2>
                <p style={{ fontSize: 12, color: 'var(--white-50)', margin: '3px 0 0' }}>
                  Enregistrée le {new Date(resDetailModal.createdAt || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button className="vm-close" onClick={() => setResDetailModal(null)}><FiX size={18}/></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Excursion Information */}
              <div style={{ background: 'var(--black-3)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                <div style={{ fontSize: 11, color: 'var(--white-50)', textTransform: 'uppercase', fontWeight: 700 }}>Circuit Excursion</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>{resDetailModal.excursion?.title}</div>
                <div style={{ fontSize: 12, color: 'var(--white-70)', marginTop: 3 }}>
                  📍 {resDetailModal.excursion?.destination || 'Tunisie'} · 🏷️ {resDetailModal.excursion?.category || 'Excursion'}
                </div>
              </div>

              {/* Client & Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--black-3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--white-50)', textTransform: 'uppercase' }}>Client</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>
                    {resDetailModal.user?.firstName} {resDetailModal.user?.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--white-70)' }}>{resDetailModal.user?.email || '—'}</div>
                </div>

                <div style={{ background: 'var(--black-3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--white-50)', textTransform: 'uppercase' }}>Contact & Groupe</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>
                    {resDetailModal.contactPhone || resDetailModal.user?.phone || 'Non renseigné'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--white-70)' }}>
                    👥 {resDetailModal.totalParticipants || (resDetailModal.adults + (resDetailModal.children || 0))} voyageur(s)
                  </div>
                </div>
              </div>

              {/* Dates & Financials */}
              <div style={{ background: 'var(--black-3)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--white-50)' }}>Date de départ :</span>
                  <strong style={{ color: 'var(--white)' }}>
                    {fmtDate(resDetailModal.date)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--white-50)' }}>Lieu de prise en charge :</span>
                  <strong style={{ color: 'var(--white-70)' }}>
                    {resDetailModal.pickupLocation || 'Standard / Agence'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--white-50)' }}>Montant Total TTC :</span>
                  <strong style={{ color: 'var(--gold)', fontSize: 15 }}>{fmtMoney(resDetailModal.totalPrice)}</strong>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--white-70)', marginBottom: 6 }}>
                  Statut de la réservation :
                </label>
                <select
                  className="admin-status-select"
                  style={{ width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 8 }}
                  value={resDetailModal.status}
                  onChange={e => handleUpdateResStatus(resDetailModal._id, e.target.value)}
                >
                  <option value="recu">📥 Reçu</option>
                  <option value="pending">⏳ En attente</option>
                  <option value="confirmed">✅ Confirmée</option>
                  <option value="completed">🏁 Terminée</option>
                  <option value="cancelled">❌ Annulée</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button className="admin-btn admin-btn--primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setResDetailModal(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: ADD / EDIT EXCURSION ══════════ */}
      {isModalOpen && (
        <ExcursionModal
          excursion={editingExcursion}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleSavedModal}
        />
      )}
    </div>
  );
}
