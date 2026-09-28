import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiCalendar, FiDollarSign, FiUsers, FiCheck, FiX,
  FiAlertCircle, FiRefreshCw, FiClock, FiStar, FiFilter,
  FiMapPin, FiPhone, FiCompass, FiShield, FiTrendingUp,
  FiTrendingDown, FiBarChart2, FiNavigation, FiEye, FiCheckCircle,
  FiUser, FiMail, FiAward, FiCheckSquare, FiSquare
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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'routes' | 'chauffeurs' | 'reservations' | 'calendar'
  const [routes, setRoutes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [previewMapRoute, setPreviewMapRoute] = useState(null);

  // Chauffeurs Management State
  const [chauffeurSearch, setChauffeurSearch] = useState('');
  const [chauffeurFilterCity, setChauffeurFilterCity] = useState('all');
  const [chauffeurFilterStatus, setChauffeurFilterStatus] = useState('all');
  const [togglingChauffeurId, setTogglingChauffeurId] = useState(null);

  // Chauffeur Modal State
  const [isChauffeurModalOpen, setIsChauffeurModalOpen] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState(null);
  const [savingChauffeur, setSavingChauffeur] = useState(false);
  const [chauffeurModalError, setChauffeurModalError] = useState(null);

  const initialChauffeurForm = {
    name: '',
    phone: '+216 ',
    email: '',
    city: 'Tunis',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    vehicleModel: 'Mercedes-Benz Classe E',
    vehicleType: 'business-sedan',
    vehiclePlate: '',
    vehicleColor: 'Noir Obsidienne',
    rating: 4.95,
    experienceYears: 8,
    languages: ['Français', 'العربية', 'English'],
    status: 'active',
    available: true,
    bio: '',
  };

  const [chauffeurFormData, setChauffeurFormData] = useState(initialChauffeurForm);

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
  const [selectedChauffeurId, setSelectedChauffeurId] = useState('');
  const [showManualChauffeurFields, setShowManualChauffeurFields] = useState(false);

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
      name: '',
      phone: '+216 ',
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
      const [routesData, resData, chauffeursData] = await Promise.all([
        chauffeurService.getAll(),
        chauffeurService.getReservations(),
        chauffeurService.getChauffeurs(),
      ]);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setReservations(Array.isArray(resData) ? resData : []);
      setChauffeurs(Array.isArray(chauffeursData) ? chauffeursData : []);
    } catch (err) {
      console.error('Error loading chauffeur admin data:', err);
      setError('Impossible de charger les données des chauffeurs et lignes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeRoutes = Array.isArray(routes) ? routes : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeChauffeurs = Array.isArray(chauffeurs) ? chauffeurs : [];
  const DAYS = getWeekDays(calOffset);

  // Metrics
  const totalRoutes = safeRoutes.length;
  const activeRoutes = safeRoutes.filter(r => r.available && r.assignedChauffeur?.name).length;
  const totalChauffeurs = safeChauffeurs.length;
  const activeChauffeurs = safeChauffeurs.filter(c => c.status === 'active' || c.available).length;
  const uniqueDrivers = totalChauffeurs > 0 
    ? totalChauffeurs 
    : new Set(safeRoutes.map(r => r.assignedChauffeur?.name).filter(Boolean)).size;
  const avgChauffeurRating = totalChauffeurs > 0
    ? (safeChauffeurs.reduce((acc, c) => acc + (c.rating || 5.0), 0) / totalChauffeurs).toFixed(2)
    : '4.96';
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

  const handleSelectChauffeurForRoute = (chauffeurId) => {
    setSelectedChauffeurId(chauffeurId);
    if (!chauffeurId || chauffeurId === 'manual') {
      setShowManualChauffeurFields(true);
      return;
    }
    const selected = safeChauffeurs.find(c => c._id === chauffeurId);
    if (selected) {
      setShowManualChauffeurFields(false);
      setFormData(prev => ({
        ...prev,
        vehicleType: selected.vehicleType || prev.vehicleType || 'business-sedan',
        assignedChauffeur: {
          ...prev.assignedChauffeur,
          name: selected.name,
          phone: selected.phone,
          avatar: selected.avatar,
          rating: selected.rating,
          experienceYears: selected.experienceYears,
          spokenLanguages: selected.languages || ['Français', 'العربية'],
          vehicleModel: selected.vehicleModel,
          vehiclePlate: selected.vehiclePlate || prev.assignedChauffeur?.vehiclePlate || '230 TU 1234',
          vehicleColor: selected.vehicleColor || prev.assignedChauffeur?.vehicleColor || 'Noir Obsidienne',
        }
      }));
    }
  };

  const handleOpenModal = (route = null) => {
    setModalError(null);
    setShowManualChauffeurFields(false);
    if (route) {
      setEditingRoute(route);
      const matched = safeChauffeurs.find(c =>
        c.name?.toLowerCase().trim() === route.assignedChauffeur?.name?.toLowerCase().trim()
      );
      setSelectedChauffeurId(matched ? matched._id : (route.assignedChauffeur?.name ? 'manual' : ''));
      if (!matched && route.assignedChauffeur?.name) {
        setShowManualChauffeurFields(true);
      }
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
          name: route.assignedChauffeur?.name || '',
          phone: route.assignedChauffeur?.phone || '+216 ',
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
      const firstChf = safeChauffeurs[0];
      setSelectedChauffeurId(firstChf ? firstChf._id : '');
      setFormData({
        ...initialForm,
        assignedChauffeur: firstChf ? {
          name: firstChf.name,
          phone: firstChf.phone,
          avatar: firstChf.avatar,
          rating: firstChf.rating,
          experienceYears: firstChf.experienceYears,
          spokenLanguages: firstChf.languages || ['Français', 'العربية'],
          vehicleModel: firstChf.vehicleModel,
          vehiclePlate: firstChf.vehiclePlate || '230 TU 1234',
          vehicleColor: firstChf.vehicleColor || 'Noir Obsidienne',
          amenities: ['Climatisation bi-zone', 'Wi-Fi 5G illimité', 'Bouteilles d\'eau minérale', 'Accueil nominatif pancarte']
        } : initialForm.assignedChauffeur,
        vehicleType: firstChf?.vehicleType || 'business-sedan'
      });
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

  // ── Chauffeurs Management Handlers ──
  const filteredChauffeurs = safeChauffeurs.filter((c) => {
    const q = (chauffeurSearch || '').toLowerCase().trim();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.vehicleModel?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      (c.languages || []).some((l) => l.toLowerCase().includes(q));

    const matchCity =
      chauffeurFilterCity === 'all' ||
      c.city?.toLowerCase().includes(chauffeurFilterCity.toLowerCase());

    const matchStatus =
      chauffeurFilterStatus === 'all' ||
      (chauffeurFilterStatus === 'active' && (c.status === 'active' || c.available)) ||
      (chauffeurFilterStatus === 'inactive' && (c.status === 'inactive' || !c.available));

    return matchSearch && matchCity && matchStatus;
  });

  const handleToggleChauffeurActive = async (ch) => {
    setTogglingChauffeurId(ch._id);
    try {
      await chauffeurService.toggleChauffeur(ch._id);
      setChauffeurs((prev) =>
        prev.map((item) =>
          item._id === ch._id
            ? {
                ...item,
                status: item.status === 'active' ? 'inactive' : 'active',
                available: item.status !== 'active',
              }
            : item,
        ),
      );
    } catch (err) {
      console.error('Error toggling chauffeur status:', err);
    } finally {
      setTogglingChauffeurId(null);
    }
  };

  const handleDeleteChauffeur = async (ch) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le chauffeur "${ch.name}" ?`)) {
      return;
    }
    try {
      await chauffeurService.deleteChauffeur(ch._id);
      setChauffeurs((prev) => prev.filter((item) => item._id !== ch._id));
    } catch (err) {
      console.error('Error deleting chauffeur:', err);
      alert('Erreur lors de la suppression du chauffeur.');
    }
  };

  const handleOpenChauffeurModal = (chauffeurToEdit = null) => {
    setEditingChauffeur(chauffeurToEdit);
    setChauffeurModalError(null);
    if (chauffeurToEdit) {
      setChauffeurFormData({
        name: chauffeurToEdit.name || '',
        phone: chauffeurToEdit.phone || '+216 ',
        email: chauffeurToEdit.email || '',
        city: chauffeurToEdit.city || 'Tunis',
        avatar:
          chauffeurToEdit.avatar ||
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        vehicleModel: chauffeurToEdit.vehicleModel || 'Mercedes-Benz Classe E',
        vehicleType: chauffeurToEdit.vehicleType || 'business-sedan',
        vehiclePlate: chauffeurToEdit.vehiclePlate || '',
        vehicleColor: chauffeurToEdit.vehicleColor || 'Noir Obsidienne',
        rating: chauffeurToEdit.rating || 4.95,
        experienceYears: chauffeurToEdit.experienceYears || 8,
        languages: chauffeurToEdit.languages || ['Français', 'العربية', 'English'],
        status: chauffeurToEdit.status || 'active',
        available: chauffeurToEdit.available !== false,
        bio: chauffeurToEdit.bio || '',
      });
    } else {
      setChauffeurFormData(initialChauffeurForm);
    }
    setIsChauffeurModalOpen(true);
  };

  const handleSaveChauffeurModal = async (e) => {
    e.preventDefault();
    if (!chauffeurFormData.name.trim() || !chauffeurFormData.phone.trim()) {
      setChauffeurModalError('Le nom et le numéro de téléphone sont obligatoires.');
      return;
    }
    setSavingChauffeur(true);
    setChauffeurModalError(null);
    try {
      if (editingChauffeur && editingChauffeur._id) {
        const updated = await chauffeurService.updateChauffeur(editingChauffeur._id, chauffeurFormData);
        const merged = { ...editingChauffeur, ...updated, ...chauffeurFormData };
        setChauffeurs((prev) =>
          prev.map((c) => (c._id === editingChauffeur._id ? merged : c)),
        );
        if (isModalOpen && selectedChauffeurId === editingChauffeur._id) {
          setFormData(prev => ({
            ...prev,
            vehicleType: merged.vehicleType || prev.vehicleType,
            assignedChauffeur: {
              ...prev.assignedChauffeur,
              name: merged.name,
              phone: merged.phone,
              avatar: merged.avatar,
              rating: merged.rating,
              experienceYears: merged.experienceYears,
              spokenLanguages: merged.languages || ['Français', 'العربية'],
              vehicleModel: merged.vehicleModel,
              vehiclePlate: merged.vehiclePlate || prev.assignedChauffeur?.vehiclePlate,
              vehicleColor: merged.vehicleColor || prev.assignedChauffeur?.vehicleColor,
            }
          }));
        }
      } else {
        const created = await chauffeurService.createChauffeur(chauffeurFormData);
        const newObj = created || { ...chauffeurFormData, _id: Date.now().toString() };
        setChauffeurs((prev) => [newObj, ...prev]);
        if (isModalOpen && newObj._id) {
          setSelectedChauffeurId(newObj._id);
          setShowManualChauffeurFields(false);
          setFormData(prev => ({
            ...prev,
            vehicleType: newObj.vehicleType || prev.vehicleType,
            assignedChauffeur: {
              ...prev.assignedChauffeur,
              name: newObj.name,
              phone: newObj.phone,
              avatar: newObj.avatar,
              rating: newObj.rating,
              experienceYears: newObj.experienceYears,
              spokenLanguages: newObj.languages || ['Français', 'العربية'],
              vehicleModel: newObj.vehicleModel,
              vehiclePlate: newObj.vehiclePlate || '230 TU 1234',
              vehicleColor: newObj.vehicleColor || 'Noir Obsidienne',
            }
          }));
        }
      }
      setIsChauffeurModalOpen(false);
      setEditingChauffeur(null);
    } catch (err) {
      console.error('Error saving chauffeur:', err);
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement.";
      setChauffeurModalError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSavingChauffeur(false);
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
          ['chauffeurs', '👤 Chauffeurs'],
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
              sub={`${uniqueDrivers} chauffeurs agréés affectés`}
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
                            {route.assignedChauffeur?.name || 'Non assigné'}
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
              <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{uniqueDrivers}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Chauffeurs dédiés</div>
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
                          {route.assignedChauffeur?.name || <span style={{ color: 'var(--danger)', fontStyle: 'italic' }}>Non assigné</span>}
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

      {/* ══════════ TAB 3: CHAUFFEURS LIST (CRUD Matches Voitures & Hébergements 1:1) ══════════ */}
      {activeTab === 'chauffeurs' && (
        <div className="admin-full">
          {/* Summary Row */}
          <div className="admin-summary-row">
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalChauffeurs}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Total Chauffeurs</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{activeChauffeurs}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>En service</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{totalChauffeurs - activeChauffeurs}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Hors service / Repos</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>★ {avgChauffeurRating}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Note moyenne</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{totalRoutes}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Lignes du réseau</div>
            </div>
          </div>

          {/* Main Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <h2 className="admin-card__title">
                  Chauffeurs Professionnels VIP <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30)' }}>({filteredChauffeurs.length})</span>
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par chauffeur, tél, véhicule..."
                    value={chauffeurSearch}
                    onChange={(e) => setChauffeurSearch(e.target.value)}
                    style={{
                      padding: '6px 12px 6px 30px',
                      borderRadius: 6,
                      border: '1px solid var(--black-5)',
                      background: 'var(--black-3)',
                      color: 'var(--white)',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      outline: 'none',
                      minWidth: 230,
                    }}
                  />
                </div>

                {/* Filter City */}
                <select
                  value={chauffeurFilterCity}
                  onChange={(e) => setChauffeurFilterCity(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--black-5)',
                    background: 'var(--black-3)',
                    color: 'var(--white)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Toutes les villes</option>
                  <option value="Tunis">Tunis / Grand Tunis</option>
                  <option value="Sousse">Sousse / Sahel</option>
                  <option value="Hammamet">Hammamet</option>
                  <option value="Djerba">Djerba</option>
                  <option value="Bizerte">Bizerte</option>
                </select>

                {/* Filter Status */}
                <select
                  value={chauffeurFilterStatus}
                  onChange={(e) => setChauffeurFilterStatus(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--black-5)',
                    background: 'var(--black-3)',
                    color: 'var(--white)',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">En service</option>
                  <option value="inactive">Hors service</option>
                </select>
              </div>

              <button
                className="admin-btn admin-btn--primary"
                onClick={() => handleOpenChauffeurModal(null)}
              >
                <FiPlus size={14} /> Ajouter un chauffeur
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CHAUFFEUR</th>
                    <th>CONTACT PRO</th>
                    <th>VÉHICULE VIP ASSIGNÉ</th>
                    <th>EXPÉRIENCE & NOTE</th>
                    <th>LIGNES ATTRIBUÉES</th>
                    <th>STATUT</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChauffeurs.map((ch) => (
                    <tr key={ch._id} className="admin-table__row">
                      {/* Chauffeur identity */}
                      <td>
                        <div className="admin-table__vehicle">
                          <div
                            className="admin-table__car-img"
                            style={{
                              borderRadius: '50%',
                              overflow: 'hidden',
                              width: 44,
                              height: 44,
                              border: '2px solid var(--gold-pale)',
                              flexShrink: 0,
                            }}
                          >
                            {ch.avatar ? (
                              <img
                                src={ch.avatar}
                                alt={ch.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  background: 'var(--black-4)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--gold)',
                                  fontWeight: 800,
                                }}
                              >
                                {ch.name?.charAt(0) || 'C'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="admin-table__car-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {ch.name}
                              <span
                                style={{
                                  fontSize: 10,
                                  background: 'rgba(212,160,23,0.15)',
                                  color: 'var(--gold)',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  fontWeight: 700,
                                }}
                              >
                                {ch.city || 'Tunisie'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                              {(ch.languages || ['Français', 'العربية']).map((lang) => (
                                <span
                                  key={lang}
                                  style={{
                                    fontSize: 9.5,
                                    background: 'var(--black-4)',
                                    color: 'var(--white-70)',
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                    border: '1px solid var(--black-5)',
                                  }}
                                >
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <a
                            href={`tel:${ch.phone}`}
                            style={{
                              color: 'var(--white)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <FiPhone size={12} style={{ color: 'var(--gold)' }} />
                            {ch.phone}
                          </a>
                          {ch.email && (
                            <span style={{ color: 'var(--white-40)', fontSize: 11 }}>
                              {ch.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ color: 'var(--white)', fontWeight: 700, fontSize: 12.5 }}>
                            {ch.vehicleModel || 'Berline Prestige'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--white-50)' }}>
                            {ch.vehiclePlate && <span>{ch.vehiclePlate}</span>}
                            {ch.vehicleColor && <span>· {ch.vehicleColor}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Experience & Rating */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FiStar size={12} style={{ fill: '#fbbf24' }} /> {ch.rating || 4.95}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--white-40)' }}>
                            · {ch.experienceYears || 8} ans exp.
                          </span>
                        </div>
                      </td>

                      {/* Assigned routes */}
                      <td>
                        {ch.assignedRoutes && ch.assignedRoutes.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                              {ch.assignedRoutes.length} liaison{ch.assignedRoutes.length > 1 ? 's' : ''} :
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {ch.assignedRoutes.slice(0, 2).map((r, i) => (
                                <span
                                  key={i}
                                  title={`${r.from} ➔ ${r.to}`}
                                  style={{
                                    fontSize: 10,
                                    background: 'rgba(255,255,255,0.06)',
                                    color: 'var(--white-80)',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    maxWidth: 180,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                  }}
                                >
                                  {r.from?.split(' ')[0]} ➔ {r.to?.split(' ')[0]}
                                </span>
                              ))}
                              {ch.assignedRoutes.length > 2 && (
                                <span style={{ fontSize: 10, color: 'var(--white-40)' }}>
                                  +{ch.assignedRoutes.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--white-30)', fontStyle: 'italic' }}>
                            Aucune ligne affectée
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td>
                        <Toggle
                          active={ch.status === 'active' || ch.available}
                          disabled={togglingChauffeurId === ch._id}
                          onChange={() => handleToggleChauffeurActive(ch)}
                        />
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="admin-table__action"
                            title="Modifier ce chauffeur"
                            onClick={() => handleOpenChauffeurModal(ch)}
                          >
                            <FiEdit2 size={13} /> Modifier
                          </button>
                          <button
                            className="admin-table__action admin-table__action--danger"
                            title="Supprimer ce chauffeur"
                            onClick={() => handleDeleteChauffeur(ch)}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredChauffeurs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--white-40)' }}>
                        Aucun chauffeur trouvé pour ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

                {/* 2. Chauffeur Agréé */}
                <div className="apt-form-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 className="apt-form-section__title" style={{ margin: 0 }}>2. Chauffeur Professionnel Agréé</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        Sélectionnez directement l'un de vos chauffeurs enregistrés dans votre flotte.
                      </p>
                    </div>
                    {safeChauffeurs.length > 0 && (
                      <span className="res-badge" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', fontWeight: 600 }}>
                        {safeChauffeurs.length} chauffeur(s) disponible(s)
                      </span>
                    )}
                  </div>

                  {/* Chauffeur Selector Row */}
                  <div style={{ marginBottom: 14 }}>
                    <label className="apt-form-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiUser size={13} style={{ color: 'var(--gold)' }} />
                      <span>Choisir un chauffeur dans votre liste :</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <select
                          className="apt-form-select"
                          value={selectedChauffeurId}
                          onChange={(e) => handleSelectChauffeurForRoute(e.target.value)}
                          style={{
                            height: 44,
                            fontSize: 13,
                            fontWeight: 500,
                            borderColor: selectedChauffeurId && selectedChauffeurId !== 'manual' ? '#D4AF37' : '#dad3c5',
                            background: '#FFFFFF',
                            color: '#191C1F',
                          }}
                        >
                          <option value="">-- Choisir parmi les chauffeurs enregistrés --</option>
                          {safeChauffeurs.map(ch => (
                            <option key={ch._id} value={ch._id}>
                              👤 {ch.name} — {ch.city} ({ch.vehicleModel || 'Berline'}) · ★ {ch.rating || 5.0} · {ch.phone}
                            </option>
                          ))}
                          <option value="manual">✍️ Saisie manuelle personnalisée (hors flotte)</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn--outline"
                        onClick={() => handleOpenChauffeurModal(null)}
                        title="Créer un nouveau chauffeur et l'ajouter à la base"
                        style={{
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          whiteSpace: 'nowrap',
                          padding: '0 14px',
                          fontSize: 12,
                          borderColor: '#D4AF37',
                          color: '#A84A3B',
                          background: '#FFFFFF',
                          fontWeight: 600
                        }}
                      >
                        <FiPlus size={14} />
                        <span>Nouveau Chauffeur</span>
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const activeChf = safeChauffeurs.find(c => c._id === selectedChauffeurId) ||
                      (formData.assignedChauffeur.name ? safeChauffeurs.find(c => c.name?.toLowerCase().trim() === formData.assignedChauffeur.name?.toLowerCase().trim()) : null);
                    
                    const isManual = selectedChauffeurId === 'manual' || (!activeChf && !formData.assignedChauffeur.name);

                    return (
                      <>
                        {/* VIP Chauffeur Summary Card - High Contrast Luxury Light Style */}
                        {activeChf && (
                          <div style={{
                            padding: '16px 18px',
                            background: '#FFFFFF',
                            border: '1.5px solid #E2D9C8',
                            borderRadius: 12,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            marginBottom: 16,
                          }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                              <img
                                src={formData.assignedChauffeur.avatar || activeChf.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                                alt={formData.assignedChauffeur.name || activeChf.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';
                                }}
                                style={{
                                  width: 68,
                                  height: 68,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2.5px solid #D4AF37',
                                  boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                                  flexShrink: 0
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                                  <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>
                                    {formData.assignedChauffeur.name || activeChf.name}
                                  </h4>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    fontSize: 12,
                                    color: '#B45309',
                                    fontWeight: 700,
                                    background: 'rgba(212,175,55,0.18)',
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    border: '1px solid rgba(212,175,55,0.35)',
                                  }}>
                                    ★ {formData.assignedChauffeur.rating || activeChf.rating || 4.95}
                                  </span>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 11,
                                    color: '#15803D',
                                    fontWeight: 600,
                                    background: 'rgba(34,197,94,0.12)',
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    border: '1px solid rgba(34,197,94,0.25)',
                                  }}>
                                    <FiCheckCircle size={11} /> Chauffeur Agréé
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#4B5563', marginBottom: 6 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <FiPhone size={13} color="#A84A3B" />
                                    <strong style={{ color: '#111827' }}>{formData.assignedChauffeur.phone || activeChf.phone}</strong>
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <FiAward size={13} color="#D4AF37" />
                                    <span>{formData.assignedChauffeur.experienceYears || activeChf.experienceYears || 8} ans d'expérience</span>
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <FiMapPin size={13} color="#A84A3B" />
                                    <span>Base : <strong style={{ color: '#111827' }}>{activeChf.city || 'Tunis'}</strong></span>
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 4, borderTop: '1px solid #F3F4F6' }}>
                                  <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span>🗣️ Langues :</span>
                                    <span style={{ color: '#111827', fontWeight: 600 }}>
                                      {(activeChf.languages || formData.assignedChauffeur.spokenLanguages || ['Français', 'العربية']).join(', ')}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenChauffeurModal(activeChf)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#A84A3B',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: 0
                                      }}
                                    >
                                      <FiEdit2 size={12} /> Modifier la fiche chauffeur
                                    </button>
                                    <span style={{ color: '#D1D5DB' }}>·</span>
                                    <button
                                      type="button"
                                      onClick={() => setShowManualChauffeurFields(!showManualChauffeurFields)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: showManualChauffeurFields ? '#A84A3B' : '#6B7280',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        padding: 0,
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      {showManualChauffeurFields ? 'Masquer la personnalisation' : 'Personnaliser pour ce trajet'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Collapsible / Manual Override Form Fields */}
                        {(showManualChauffeurFields || isManual || !activeChf) && (
                          <div style={{
                            padding: '16px',
                            background: '#FDFCF9',
                            border: '1.5px solid #E2D9C8',
                            borderRadius: 10,
                            marginBottom: 16
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#A84A3B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {activeChf ? 'Surcharge manuelle pour cette ligne spécifique :' : 'Coordonnées du Chauffeur :'}
                              </span>
                              {activeChf && (
                                <button
                                  type="button"
                                  onClick={() => setShowManualChauffeurFields(false)}
                                  style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                  Fermer
                                </button>
                              )}
                            </div>

                            <div className="apt-form-row">
                              <div className="apt-form-field" style={{ flex: 1.2 }}>
                                <label className="apt-form-label">Nom Complet du Chauffeur *</label>
                                <input
                                  type="text"
                                  className="apt-form-input"
                                  required
                                  placeholder="Ex: Hassen Trabelsi"
                                  value={formData.assignedChauffeur.name}
                                  onChange={e => setFormData({
                                    ...formData,
                                    assignedChauffeur: { ...formData.assignedChauffeur, name: e.target.value }
                                  })}
                                />
                              </div>
                              <div className="apt-form-field" style={{ flex: 1 }}>
                                <label className="apt-form-label">Téléphone WhatsApp *</label>
                                <input
                                  type="text"
                                  className="apt-form-input"
                                  required
                                  placeholder="+216 22 555 120"
                                  value={formData.assignedChauffeur.phone}
                                  onChange={e => setFormData({
                                    ...formData,
                                    assignedChauffeur: { ...formData.assignedChauffeur, phone: e.target.value }
                                  })}
                                />
                              </div>
                            </div>

                            <div className="apt-form-row">
                              <div className="apt-form-field" style={{ flex: 1 }}>
                                <label className="apt-form-label">Années d'Expérience</label>
                                <input
                                  type="number"
                                  className="apt-form-input"
                                  min={1}
                                  value={formData.assignedChauffeur.experienceYears}
                                  onChange={e => setFormData({
                                    ...formData,
                                    assignedChauffeur: { ...formData.assignedChauffeur, experienceYears: Number(e.target.value) }
                                  })}
                                />
                              </div>
                              <div className="apt-form-field" style={{ flex: 1 }}>
                                <label className="apt-form-label">Note Moyenne (sur 5.0)</label>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="3.0"
                                  max="5.0"
                                  className="apt-form-input"
                                  value={formData.assignedChauffeur.rating}
                                  onChange={e => setFormData({
                                    ...formData,
                                    assignedChauffeur: { ...formData.assignedChauffeur, rating: Number(e.target.value) }
                                  })}
                                />
                              </div>
                              <div className="apt-form-field" style={{ flex: 1.5 }}>
                                <label className="apt-form-label">Photo / Avatar URL</label>
                                <input
                                  type="text"
                                  className="apt-form-input"
                                  value={formData.assignedChauffeur.avatar}
                                  onChange={e => setFormData({
                                    ...formData,
                                    assignedChauffeur: { ...formData.assignedChauffeur, avatar: e.target.value }
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* 3. Véhicule Dédié */}
                <div className="apt-form-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 className="apt-form-section__title" style={{ margin: 0 }}>3. Véhicule de Prestige Dédié</h3>
                    <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>
                      Auto-renseigné selon le chauffeur choisi
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

      {/* ══════════ MODAL: ADD / EDIT CHAUFFEUR (Matches ApartmentModal 1:1) ══════════ */}
      {isChauffeurModalOpen && (
        <div className="apt-modal-overlay" onClick={() => setIsChauffeurModalOpen(false)}>
          <div className="apt-modal-card" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="apt-modal-header">
              <div className="apt-modal-header__info">
                <span className="apt-modal-badge">{editingChauffeur ? 'Édition Profil Chauffeur' : 'Nouveau Chauffeur VIP'}</span>
                <h2 className="apt-modal-title">
                  {editingChauffeur ? editingChauffeur.name : 'Ajouter un Chauffeur Agréé'}
                </h2>
              </div>
              <button className="apt-modal-close" onClick={() => setIsChauffeurModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            {chauffeurModalError && (
              <div className="apt-modal-alert apt-modal-alert--error">
                <FiAlertCircle size={16} />
                <span>{chauffeurModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveChauffeurModal} className="apt-modal-form">
              <div className="apt-modal-scroll">
                {/* 1. Identité & Contact */}
                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">1. Identité & Contact Professionnel</h3>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1.2 }}>
                      <label className="apt-form-label">Nom Complet du Chauffeur *</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        required
                        placeholder="Ex: Hassen Trabelsi"
                        value={chauffeurFormData.name}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Téléphone WhatsApp *</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        required
                        placeholder="+216 22 555 120"
                        value={chauffeurFormData.phone}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1.2 }}>
                      <label className="apt-form-label">Email Professionnel</label>
                      <input
                        type="email"
                        className="apt-form-input"
                        placeholder="hassen.trabelsi@africanrentcar.tn"
                        value={chauffeurFormData.email}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, email: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Ville / Région de Base</label>
                      <select
                        className="apt-form-select"
                        value={chauffeurFormData.city}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, city: e.target.value })}
                      >
                        <option value="Tunis">Tunis / Grand Tunis</option>
                        <option value="Sousse">Sousse / Sahel</option>
                        <option value="Hammamet">Hammamet</option>
                        <option value="Djerba">Djerba</option>
                        <option value="Monastir">Monastir</option>
                        <option value="Bizerte">Bizerte</option>
                        <option value="Tozeur">Tozeur / Sud</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Véhicule VIP Dédié */}
                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">2. Véhicule VIP Rattaché</h3>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1.5 }}>
                      <label className="apt-form-label">Marque & Modèle du Véhicule *</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        required
                        placeholder="Ex: Mercedes-Benz Classe E 2025"
                        value={chauffeurFormData.vehicleModel}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, vehicleModel: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Catégorie</label>
                      <select
                        className="apt-form-select"
                        value={chauffeurFormData.vehicleType}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, vehicleType: e.target.value })}
                      >
                        <option value="business-sedan">Berline Business</option>
                        <option value="prestige">Berline Prestige</option>
                        <option value="vip-van">Van VIP (7-8 places)</option>
                        <option value="comfort-sedan">Berline Confort</option>
                      </select>
                    </div>
                  </div>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Immatriculation / Plaque</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        placeholder="Ex: 242 TU 8890"
                        value={chauffeurFormData.vehiclePlate}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, vehiclePlate: e.target.value })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Couleur de la carrosserie</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        placeholder="Ex: Noir Obsidienne"
                        value={chauffeurFormData.vehicleColor}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, vehicleColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Expérience, Langues & Évaluation */}
                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">3. Expérience, Note & Langues Parlées</h3>

                  <div className="apt-form-row">
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Années d'Expérience</label>
                      <input
                        type="number"
                        className="apt-form-input"
                        min={1}
                        max={40}
                        value={chauffeurFormData.experienceYears}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, experienceYears: Number(e.target.value) })}
                      />
                    </div>
                    <div className="apt-form-field" style={{ flex: 1 }}>
                      <label className="apt-form-label">Note Moyenne (sur 5.0)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="3.0"
                        max="5.0"
                        className="apt-form-input"
                        value={chauffeurFormData.rating}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, rating: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="apt-form-field" style={{ marginTop: 8 }}>
                    <label className="apt-form-label">Langues Maîtrisées (cliquez pour sélectionner)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {['Français', 'العربية', 'English', 'Italiano', 'Deutsch', 'Español', 'Русский'].map((lang) => {
                        const isSelected = (chauffeurFormData.languages || []).includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              const cur = chauffeurFormData.languages || [];
                              const next = isSelected ? cur.filter(l => l !== lang) : [...cur, lang];
                              setChauffeurFormData({ ...chauffeurFormData, languages: next });
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: isSelected ? '1px solid var(--gold)' : '1px solid var(--black-5)',
                              background: isSelected ? 'rgba(212,160,23,0.18)' : 'var(--black-3)',
                              color: isSelected ? 'var(--gold)' : 'var(--white-60)',
                              transition: 'all 0.2s',
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '}{lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Photo / Avatar & Présentation */}
                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">4. Photo de Profil & Présentation VIP</h3>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--gold)',
                        flexShrink: 0,
                        background: 'var(--black-4)',
                      }}
                    >
                      {chauffeurFormData.avatar ? (
                        <img
                          src={chauffeurFormData.avatar}
                          alt="Aperçu"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                          <FiUser size={24} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className="apt-form-label">URL de la photo de profil</label>
                      <input
                        type="text"
                        className="apt-form-input"
                        placeholder="https://..."
                        value={chauffeurFormData.avatar}
                        onChange={e => setChauffeurFormData({ ...chauffeurFormData, avatar: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="apt-form-label" style={{ fontSize: 11, color: 'var(--white-50)' }}>
                      Ou choisir une photo prédéfinie :
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      {[
                        { name: 'Hassen', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Kais', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Sami', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Nidhal', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Yassine', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Amine', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setChauffeurFormData({ ...chauffeurFormData, avatar: preset.url })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: chauffeurFormData.avatar === preset.url ? '1px solid var(--gold)' : '1px solid var(--black-5)',
                            background: chauffeurFormData.avatar === preset.url ? 'rgba(212,160,23,0.15)' : 'var(--black-4)',
                            color: 'var(--white)',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          <img src={preset.url} alt={preset.name} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="apt-form-field">
                    <label className="apt-form-label">Biographie / Présentation VIP</label>
                    <textarea
                      className="apt-form-textarea"
                      rows={3}
                      placeholder="Chauffeur d’élite certifié pour liaisons aéroport, transferts interurbains et délégations VIP..."
                      value={chauffeurFormData.bio}
                      onChange={e => setChauffeurFormData({ ...chauffeurFormData, bio: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. Statut & Disponibilité */}
                <div className="apt-form-section">
                  <h3 className="apt-form-section__title">5. Statut & Disponibilité</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label className="apt-form-label" style={{ margin: 0 }}>Statut en service (disponible pour les courses) :</label>
                    <Toggle
                      active={chauffeurFormData.status === 'active'}
                      onChange={(act) => setChauffeurFormData({
                        ...chauffeurFormData,
                        status: act ? 'active' : 'inactive',
                        available: act,
                      })}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: chauffeurFormData.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>
                      {chauffeurFormData.status === 'active' ? 'En service' : 'Hors service / En repos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="apt-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--black-4)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setIsChauffeurModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingChauffeur}
                  className="admin-btn admin-btn--primary"
                >
                  {savingChauffeur ? 'Enregistrement...' : editingChauffeur ? 'Enregistrer les Modifications' : 'Créer le Profil Chauffeur'}
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
