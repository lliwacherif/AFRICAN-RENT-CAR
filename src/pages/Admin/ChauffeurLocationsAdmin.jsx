import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin,
  FiCheck, FiX, FiAlertCircle, FiRefreshCw, FiStar,
  FiCompass, FiNavigation, FiTag, FiLayers
} from 'react-icons/fi';
import { chauffeurService } from '../../services/chauffeurService';

const REGIONS = [
  'Grand Tunis',
  'Sahel',
  'Cap Bon',
  'Sud & Djerba',
  'Nord-Ouest',
  'Centre'
];

const CATEGORIES = [
  { id: 'airport', label: '✈️ Aéroport', icon: '✈️', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { id: 'hotel_zone', label: '🏨 Zone Hôtelière & Côtes', icon: '🏨', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { id: 'city', label: '🏙️ Ville & Centre', icon: '🏙️', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { id: 'port', label: '⚓ Port & Marina', icon: '⚓', color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
  { id: 'station', label: '🚉 Gare / Station', icon: '🚉', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { id: 'other', label: '📍 Autre lieu', icon: '📍', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
];

export default function ChauffeurLocationsAdmin({ onLocationsChanged }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [togglingId, setTogglingId] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const initialForm = {
    name: '',
    type: 'both',
    category: 'city',
    region: 'Grand Tunis',
    city: 'Tunis',
    popular: false,
    isActive: true,
    order: 0,
  };
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chauffeurService.getAdminLocations();
      setLocations(Array.isArray(data) ? data : []);
      if (onLocationsChanged) onLocationsChanged(data);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Impossible de charger les points et destinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered List
  const filteredLocations = locations.filter(loc => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      loc.name?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q) ||
      loc.region?.toLowerCase().includes(q);

    const matchCat = categoryFilter === 'all' || loc.category === categoryFilter;
    const matchType = typeFilter === 'all' || loc.type === typeFilter || (typeFilter !== 'both' && loc.type === 'both');
    const matchRegion = regionFilter === 'all' || loc.region === regionFilter;

    return matchSearch && matchCat && matchType && matchRegion;
  });

  // Modal handlers
  const handleOpenModal = (loc = null) => {
    setModalError(null);
    if (loc) {
      setEditingLoc(loc);
      setForm({
        name: loc.name || '',
        type: loc.type || 'both',
        category: loc.category || 'city',
        region: loc.region || 'Grand Tunis',
        city: loc.city || '',
        popular: Boolean(loc.popular),
        isActive: loc.isActive !== false,
        order: loc.order || 0,
      });
    } else {
      setEditingLoc(null);
      setForm(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setModalError('Le nom du lieu est obligatoire.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (editingLoc) {
        await chauffeurService.updateLocation(editingLoc._id, form);
      } else {
        await chauffeurService.createLocation(form);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loc) => {
    if (!window.confirm(`Confirmez-vous la suppression du lieu « ${loc.name} » ?`)) return;
    try {
      await chauffeurService.deleteLocation(loc._id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Erreur lors de la suppression.');
    }
  };

  const handleToggle = async (loc) => {
    setTogglingId(loc._id);
    try {
      await chauffeurService.toggleLocation(loc._id);
      setLocations(prev => prev.map(l => l._id === loc._id ? { ...l, isActive: !l.isActive } : l));
      if (onLocationsChanged) {
        onLocationsChanged(locations.map(l => l._id === loc._id ? { ...l, isActive: !l.isActive } : l));
      }
    } catch (err) {
      alert('Erreur lors de la modification du statut.');
    } finally {
      setTogglingId(null);
    }
  };

  // KPIs
  const totalCount = locations.length;
  const airportCount = locations.filter(l => l.category === 'airport').length;
  const hotelZoneCount = locations.filter(l => l.category === 'hotel_zone').length;
  const cityCount = locations.filter(l => l.category === 'city').length;
  const activeCount = locations.filter(l => l.isActive).length;

  return (
    <div className="admin-full">
      {/* ── Summary Row / KPIs ── */}
      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold, #A84A3B)' }}>{totalCount}</div>
          <div style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 2 }}>Total Lieux Répertoriés</div>
        </div>
        <div className="admin-summary-card">
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb' }}>{airportCount}</div>
          <div style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 2 }}>Aéroports Internationaux</div>
        </div>
        <div className="admin-summary-card">
          <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706' }}>{hotelZoneCount}</div>
          <div style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 2 }}>Zones Hôtelières & Côtes</div>
        </div>
        <div className="admin-summary-card">
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{cityCount}</div>
          <div style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 2 }}>Villes & Centres</div>
        </div>
        <div className="admin-summary-card">
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success, #16a34a)' }}>{activeCount}</div>
          <div style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 2 }}>Actifs dans le Vérificateur</div>
        </div>
      </div>

      {/* ── Main Table Card ── */}
      <div className="admin-card">
        <div className="admin-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <h2 className="admin-card__title">
              Points de Prise en Charge & Destinations Client{' '}
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30, #9ca3af)' }}>
                ({filteredLocations.length})
              </span>
            </h2>

            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30, #9ca3af)' }} />
              <input
                type="text"
                placeholder="Rechercher un aéroport, ville, hôtel..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '6px 12px 6px 30px',
                  borderRadius: 6,
                  border: '1px solid var(--black-5, #dad3c5)',
                  background: 'var(--black-3, #f8f7ee)',
                  color: 'var(--white, #191c1f)',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  outline: 'none',
                  minWidth: 220
                }}
              />
            </div>

            {/* Filter Category */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--black-5, #dad3c5)',
                background: 'var(--black-3, #f8f7ee)',
                color: 'var(--white, #191c1f)',
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">Toutes les catégories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* Filter Usage */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--black-5, #dad3c5)',
                background: 'var(--black-3, #f8f7ee)',
                color: 'var(--white, #191c1f)',
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les rôles (Départ / Arrivée)</option>
              <option value="both">Départ & Destination (Les Deux)</option>
              <option value="departure">Point de Départ uniquement</option>
              <option value="destination">Destination uniquement</option>
            </select>

            {/* Filter Region */}
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--black-5, #dad3c5)',
                background: 'var(--black-3, #f8f7ee)',
                color: 'var(--white, #191c1f)',
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">Toutes les régions</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="admin-btn admin-btn--outline"
              onClick={loadData}
              title="Rafraîchir la liste"
            >
              <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={() => handleOpenModal(null)}
            >
              <FiPlus size={14} /> Ajouter un Lieu
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-error-bar">
            <FiAlertCircle size={15}/> {error}
            <button onClick={loadData}><FiRefreshCw size={12}/> Réessayer</button>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>NOM DU LIEU / ÉTAPE</th>
                <th>CATÉGORIE</th>
                <th>USAGE CLIENT</th>
                <th>RÉGION & GOUVERNORAT</th>
                <th>POPULARITÉ</th>
                <th>EN SERVICE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--white-50)' }}>
                    Chargement des points et destinations...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--white-50)' }}>
                    Aucun lieu trouvé correspondant aux filtres.
                  </td>
                </tr>
              ) : (
                filteredLocations.map(loc => {
                  const cat = CATEGORIES.find(c => c.id === loc.category) || CATEGORIES[5];
                  const typeLabel =
                    loc.type === 'departure'
                      ? '🛫 Départ uniquement'
                      : loc.type === 'destination'
                      ? '🛬 Destination uniquement'
                      : '🔄 Départ & Destination';

                  return (
                    <tr key={loc._id}>
                      {/* Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: 18,
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: cat.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {cat.icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--white, #191c1f)', fontSize: 13 }}>
                              {loc.name}
                            </div>
                            {loc.city && (
                              <div style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 1 }}>
                                📍 {loc.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: cat.color,
                          background: cat.bg,
                          padding: '3px 9px',
                          borderRadius: 6,
                          border: `1px solid ${cat.color}30`
                        }}>
                          {cat.label}
                        </span>
                      </td>

                      {/* Usage Type */}
                      <td>
                        <span style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: 'var(--white-70, #4a525a)',
                          background: 'rgba(44,62,86,0.06)',
                          padding: '3px 8px',
                          borderRadius: 5
                        }}>
                          {typeLabel}
                        </span>
                      </td>

                      {/* Region */}
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--white, #191c1f)' }}>
                          {loc.region || 'Grand Tunis'}
                        </span>
                      </td>

                      {/* Popular / Star */}
                      <td>
                        {loc.popular ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#d97706',
                            background: 'rgba(217,119,6,0.1)',
                            padding: '2px 7px',
                            borderRadius: 12,
                            border: '1px solid rgba(217,119,6,0.25)'
                          }}>
                            <FiStar size={11} fill="#d97706" /> Fréquent
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--white-30, #9ca3af)' }}>Standard</span>
                        )}
                      </td>

                      {/* Active Toggle */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggle(loc)}
                          disabled={togglingId === loc._id}
                          className={`admin-toggle ${loc.isActive ? 'admin-toggle--on' : ''}`}
                          role="switch"
                          aria-checked={loc.isActive}
                          title={loc.isActive ? 'Désactiver (masquer côté client)' : 'Activer (rendre visible)'}
                          style={{
                            cursor: 'pointer',
                            opacity: togglingId === loc._id ? 0.5 : 1
                          }}
                        >
                          <span className="admin-toggle__knob" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn--icon"
                            onClick={() => handleOpenModal(loc)}
                            title="Modifier ce lieu"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--icon admin-btn--danger"
                            onClick={() => handleDelete(loc)}
                            title="Supprimer ce lieu"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add / Edit Location ── */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 540 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingLoc ? 'Modifier le Lieu de Prise en Charge / Destination' : 'Nouveau Point de Prise en Charge / Destination'}
              </h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="admin-modal__error" style={{ margin: '16px 24px 0' }}>
                <FiAlertCircle size={14} /> {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="admin-modal__form">
              {/* Name */}
              <div className="admin-form-group">
                <label className="admin-label">
                  Nom complet du lieu (Libellé affiché au client) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Aéroport Tunis-Carthage (TUN) ou Midoun & Zone Hôtelière"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="admin-input"
                />
                <span style={{ fontSize: 11, color: 'var(--white-50, #727d88)', marginTop: 4 }}>
                  Ce libellé apparaîtra directement dans les menus déroulants du Vérificateur de Ligne.
                </span>
              </div>

              {/* Category & Usage row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="admin-select"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Rôle d'usage client</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="both">🔄 Départ & Destination</option>
                    <option value="departure">🛫 Point de Départ uniquement</option>
                    <option value="destination">🛬 Destination uniquement</option>
                  </select>
                </div>
              </div>

              {/* Region & City row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Région géographique</label>
                  <select
                    value={form.region}
                    onChange={e => setForm(prev => ({ ...prev, region: e.target.value }))}
                    className="admin-select"
                  >
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Ville / Commune</label>
                  <input
                    type="text"
                    placeholder="ex: Tunis, Djerba, Hammamet..."
                    value={form.city}
                    onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Checkboxes: Popular & Active */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={e => setForm(prev => ({ ...prev, popular: e.target.checked }))}
                    style={{ accentColor: 'var(--gold, #A84A3B)', width: 16, height: 16 }}
                  />
                  <span>
                    <strong>⭐ Lieu Populaire / Fréquent</strong> — Sera positionné en tête des choix.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ accentColor: 'var(--gold, #A84A3B)', width: 16, height: 16 }}
                  />
                  <span>
                    <strong>🟢 Actif et Ouvert aux Clients</strong> — Accessible immédiatement sur le site.
                  </span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : editingLoc ? 'Mettre à jour le lieu' : 'Créer le lieu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
