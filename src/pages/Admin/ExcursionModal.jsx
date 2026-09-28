import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2, FiPlus, FiAlertCircle, FiCheck, FiMapPin, FiCalendar, FiDollarSign, FiClock, FiStar, FiCompass } from 'react-icons/fi';
import { excursionsService } from '../../services/excursionsService';
import { uploadService } from '../../services/vehiclesService';
import './ApartmentsAdmin.css';

const EXCURSION_CATEGORIES = [
  'Sahara & Désert',
  'Randonnée & Nature',
  'Culture & Histoire',
  'Mer & Bateau',
  'Aventure & Quad'
];

const DEPARTURE_CITIES = [
  'Tunis',
  'Sousse',
  'Hammamet',
  'Djerba',
  'Tozeur',
  'Monastir',
  'Tabarka',
  'Sfax',
  'Bizerte'
];

const POPULAR_DAYS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
];

function normalizeAvailableDays(rawDays) {
  if (!rawDays || !Array.isArray(rawDays) || rawDays.length === 0) {
    return ['Tous les jours'];
  }
  if (rawDays.includes('Tous les jours')) {
    return ['Tous les jours'];
  }
  const normalized = [];
  rawDays.forEach(item => {
    const lower = String(item).toLowerCase();
    if (lower.includes('tous les jours')) {
      if (!normalized.includes('Tous les jours')) normalized.push('Tous les jours');
      return;
    }
    POPULAR_DAYS.forEach(day => {
      if (lower.includes(day.toLowerCase()) && !normalized.includes(day)) {
        normalized.push(day);
      }
    });
  });
  return normalized.length > 0 ? normalized : ['Tous les jours'];
}

export default function ExcursionModal({ excursion, onClose, onSaved }) {
  const isEdit = Boolean(excursion?._id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Sahara & Désert',
    departureCity: 'Tunis',
    destination: '',
    duration: '1 jour',
    pricePerAdult: 120,
    pricePerChild: 60,
    maxGroupSize: 16,
    minGroupSize: 2,
    included: [
      'Transport aller-retour en véhicule climatisé / 4x4',
      'Guide touristique officiel agréé',
      'Déjeuner traditionnel tunisien'
    ],
    excluded: [
      'Dépenses personnelles et pourboires',
      'Boissons non incluses au menu'
    ],
    itinerary: [
      { dayOrTime: '08:30', title: 'Départ & Rassemblement', description: 'Prise en charge à votre lieu de résidence et départ en direction du circuit.' }
    ],
    images: [],
    availableDays: ['Tous les jours'],
    isActive: true,
    featured: false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [newExcludedItem, setNewExcludedItem] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (excursion) {
      setForm({
        title: excursion.title || '',
        description: excursion.description || '',
        category: excursion.category || 'Sahara & Désert',
        departureCity: excursion.departureCity || 'Tunis',
        destination: excursion.destination || '',
        duration: excursion.duration || '1 jour',
        pricePerAdult: excursion.pricePerAdult ?? 120,
        pricePerChild: excursion.pricePerChild ?? 60,
        maxGroupSize: excursion.maxGroupSize ?? 16,
        minGroupSize: excursion.minGroupSize ?? 2,
        included: Array.isArray(excursion.included) && excursion.included.length > 0
          ? excursion.included
          : ['Transport tout confort', 'Guide professionnel'],
        excluded: Array.isArray(excursion.excluded)
          ? excursion.excluded
          : ['Dépenses personnelles'],
        itinerary: Array.isArray(excursion.itinerary) && excursion.itinerary.length > 0
          ? excursion.itinerary.map(it => ({ dayOrTime: it.dayOrTime || '', title: it.title || '', description: it.description || '' }))
          : [{ dayOrTime: '08:30', title: 'Départ & Accueil', description: 'Prise en charge et début du circuit.' }],
        images: Array.isArray(excursion.images) ? excursion.images : [],
        availableDays: normalizeAvailableDays(excursion.availableDays),
        isActive: excursion.isActive !== false,
        featured: Boolean(excursion.featured),
      });
    }
  }, [excursion]);

  // Image Upload via API
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadService.uploadImage(file, 'excursions');
      if (res?.url) {
        setForm(prev => ({ ...prev, images: [...prev.images, res.url] }));
      }
    } catch (err) {
      setError("Erreur lors de l'envoi de l'image : " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError("L'URL doit commencer par http:// ou https://");
      return;
    }
    setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    setNewImageUrl('');
    setError(null);
  };

  const handleRemoveImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Included & Excluded items management
  const handleAddIncluded = () => {
    const item = newIncludedItem.trim();
    if (!item) return;
    if (form.included.includes(item)) return;
    setForm(prev => ({ ...prev, included: [...prev.included, item] }));
    setNewIncludedItem('');
  };

  const handleRemoveIncluded = (index) => {
    setForm(prev => ({ ...prev, included: prev.included.filter((_, i) => i !== index) }));
  };

  const handleAddExcluded = () => {
    const item = newExcludedItem.trim();
    if (!item) return;
    if (form.excluded.includes(item)) return;
    setForm(prev => ({ ...prev, excluded: [...prev.excluded, item] }));
    setNewExcludedItem('');
  };

  const handleRemoveExcluded = (index) => {
    setForm(prev => ({ ...prev, excluded: prev.excluded.filter((_, i) => i !== index) }));
  };

  // Itinerary step management
  const handleAddStep = () => {
    setForm(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { dayOrTime: `Étape ${prev.itinerary.length + 1}`, title: '', description: '' }
      ]
    }));
  };

  const handleUpdateStep = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((st, i) => i === index ? { ...st, [field]: value } : st)
    }));
  };

  const handleRemoveStep = (index) => {
    if (form.itinerary.length <= 1) {
      alert("Le programme doit comporter au moins une étape.");
      return;
    }
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  // Day toggle
  const toggleAvailableDay = (day) => {
    if (day === 'Tous les jours') {
      setForm(prev => ({ ...prev, availableDays: ['Tous les jours'] }));
      return;
    }
    setForm(prev => {
      let days = (prev.availableDays || []).filter(d => POPULAR_DAYS.includes(d));
      if (days.includes(day)) {
        days = days.filter(d => d !== day);
      } else {
        days = [...days, day];
      }
      return { ...prev, availableDays: days.length > 0 ? days : ['Tous les jours'] };
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Le titre de l'excursion est obligatoire.");
      return;
    }
    if (!form.destination.trim()) {
      setError("La destination / circuit est obligatoire.");
      return;
    }
    if (form.pricePerAdult <= 0) {
      setError("Le tarif adulte doit être supérieur à 0 TND.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        destination: form.destination.trim(),
        pricePerAdult: Number(form.pricePerAdult),
        pricePerChild: Number(form.pricePerChild || 0),
        maxGroupSize: Number(form.maxGroupSize || 16),
        minGroupSize: Number(form.minGroupSize || 2),
      };

      let result;
      if (isEdit) {
        result = await excursionsService.update(excursion._id, payload);
      } else {
        result = await excursionsService.create(payload);
      }

      onSaved(result || payload);
    } catch (err) {
      console.error('Error saving excursion:', err);
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement de l'excursion.";
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="apt-modal-overlay" onClick={onClose}>
      <div className="apt-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 840 }}>
        {/* Header */}
        <div className="apt-modal-header">
          <div className="apt-modal-header__info">
            <span className="apt-modal-badge">{isEdit ? 'Édition Circuit' : 'Nouveau Circuit & Excursion'}</span>
            <h2 className="apt-modal-title">
              {isEdit ? form.title || "Modifier l'Excursion" : "Ajouter un Circuit Touristique"}
            </h2>
          </div>
          <button className="apt-modal-close" onClick={onClose} aria-label="Fermer">
            <FiX size={20} />
          </button>
        </div>

        {error && (
          <div className="apt-modal-alert apt-modal-alert--error">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="apt-modal-form">
          <div className="apt-modal-scroll">

            {/* 1. Informations Générales */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">1. Informations Générales</h3>

              <div className="apt-form-row">
                <div className="apt-form-field" style={{ flex: 2 }}>
                  <label className="apt-form-label">Titre de l'Excursion *</label>
                  <input
                    type="text"
                    className="apt-form-input"
                    required
                    placeholder="Ex: Grand Circuit Sahara : Tozeur, Chott El Djerid & Douz"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 1.2 }}>
                  <label className="apt-form-label">Catégorie *</label>
                  <select
                    className="apt-form-select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {EXCURSION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="apt-form-row">
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Ville de Départ *</label>
                  <select
                    className="apt-form-select"
                    value={form.departureCity}
                    onChange={e => setForm({ ...form, departureCity: e.target.value })}
                  >
                    {DEPARTURE_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="apt-form-field" style={{ flex: 1.3 }}>
                  <label className="apt-form-label">Destination / Lieux Visités *</label>
                  <input
                    type="text"
                    className="apt-form-input"
                    required
                    placeholder="Ex: Tozeur, Douz & Matmata"
                    value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })}
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Durée *</label>
                  <input
                    type="text"
                    className="apt-form-input"
                    required
                    placeholder="Ex: 2 jours / 1 nuit"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="apt-form-field" style={{ marginTop: 10 }}>
                <label className="apt-form-label">Description Détaillée</label>
                <textarea
                  className="apt-form-textarea"
                  rows={3}
                  placeholder="Décrivez l'expérience, les paysages, l'ambiance et les émotions vécues..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Statuts & Flags */}
              <div className="apt-toggles-row" style={{ marginTop: 14 }}>
                <label className="apt-toggle-label">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <div>
                    <strong>🟢 Visible et Ouverte aux Réservations (Active)</strong>
                    <p>Accessible et réservable immédiatement par les voyageurs sur le site</p>
                  </div>
                </label>
                <label className="apt-toggle-label">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm({ ...form, featured: e.target.checked })}
                  />
                  <div>
                    <strong>⭐ Coup de Cœur (Circuit Vedette)</strong>
                    <p>Mettre en avant sur la page d'accueil avec badge exclusif</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Tarification & Capacité */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">2. Tarifs & Taille de Groupe</h3>

              <div className="apt-form-row">
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Tarif Adulte (TND) *</label>
                  <input
                    type="number"
                    className="apt-form-input"
                    required
                    min={1}
                    value={form.pricePerAdult}
                    onChange={e => setForm({ ...form, pricePerAdult: Number(e.target.value) })}
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Tarif Enfant &lt; 12 ans (TND)</label>
                  <input
                    type="number"
                    className="apt-form-input"
                    min={0}
                    value={form.pricePerChild}
                    onChange={e => setForm({ ...form, pricePerChild: Number(e.target.value) })}
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Groupe Minimum</label>
                  <input
                    type="number"
                    className="apt-form-input"
                    min={1}
                    value={form.minGroupSize}
                    onChange={e => setForm({ ...form, minGroupSize: Number(e.target.value) })}
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Groupe Maximum</label>
                  <input
                    type="number"
                    className="apt-form-input"
                    min={form.minGroupSize}
                    value={form.maxGroupSize}
                    onChange={e => setForm({ ...form, maxGroupSize: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Jours Disponibles */}
              <div style={{ marginTop: 14 }}>
                <label className="apt-form-label" style={{ marginBottom: 8, display: 'block' }}>Jours de Départ Disponibles :</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => toggleAvailableDay('Tous les jours')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      border: '1.5px solid',
                      borderColor: form.availableDays.includes('Tous les jours') ? 'var(--gold, #A84A3B)' : 'var(--black-4, #ebe6dc)',
                      background: form.availableDays.includes('Tous les jours') ? 'var(--gold, #A84A3B)' : 'var(--black-3, #f8f7ee)',
                      color: form.availableDays.includes('Tous les jours') ? '#FFFFFF' : 'var(--white-70, #4a525a)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🌟 Tous les jours
                  </button>
                  {POPULAR_DAYS.map(day => {
                    const isSelected = form.availableDays.includes(day) && !form.availableDays.includes('Tous les jours');
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleAvailableDay(day)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          border: '1.5px solid',
                          borderColor: isSelected ? 'var(--gold, #A84A3B)' : 'var(--black-4, #ebe6dc)',
                          background: isSelected ? 'var(--gold, #A84A3B)' : 'var(--black-3, #f8f7ee)',
                          color: isSelected ? '#FFFFFF' : 'var(--white-70, #4a525a)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Inclus & Non Inclus */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">3. Ce qui est Inclus & Exclu</h3>

              {/* Prestations Incluses */}
              <div style={{ marginBottom: 18 }}>
                <label className="apt-form-label">✅ Prestations & Équipements Inclus :</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 10 }}>
                  <input
                    type="text"
                    className="apt-form-input"
                    placeholder="Ex: Déjeuner grillades de la mer + boissons fraîches"
                    value={newIncludedItem}
                    onChange={e => setNewIncludedItem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddIncluded(); } }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--outline"
                    onClick={handleAddIncluded}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FiPlus size={14} /> Ajouter
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.included.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#15803D',
                        padding: '5px 12px',
                        borderRadius: 16,
                        fontSize: 12.5,
                        fontWeight: 600
                      }}
                    >
                      <span>✓ {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIncluded(idx)}
                        style={{ background: 'none', border: 'none', color: '#15803D', cursor: 'pointer', padding: 0, display: 'flex' }}
                        title="Retirer"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Prestations Exclues */}
              <div>
                <label className="apt-form-label">❌ Prestations Non Incluses :</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 10 }}>
                  <input
                    type="text"
                    className="apt-form-input"
                    placeholder="Ex: Boissons alcoolisées ou pourboires du guide"
                    value={newExcludedItem}
                    onChange={e => setNewExcludedItem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddExcluded(); } }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--outline"
                    onClick={handleAddExcluded}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FiPlus size={14} /> Ajouter
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.excluded.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#B91C1C',
                        padding: '5px 12px',
                        borderRadius: 16,
                        fontSize: 12.5,
                        fontWeight: 600
                      }}
                    >
                      <span>✗ {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExcluded(idx)}
                        style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', padding: 0, display: 'flex' }}
                        title="Retirer"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Programme / Itinéraire Étape par Étape */}
            <div className="apt-form-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 className="apt-form-section__title" style={{ margin: 0 }}>4. Programme / Itinéraire Détaillé</h3>
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={handleAddStep}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  <FiPlus size={13} /> Ajouter une étape
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.itinerary.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--black-3, #f8f7ee)',
                      border: '1.5px solid var(--black-4, #ebe6dc)',
                      borderRadius: 10,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold, #A84A3B)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Étape #{idx + 1}
                      </span>
                      {form.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--white-50, #727d88)',
                            cursor: 'pointer',
                            padding: 2,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Supprimer cette étape"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="apt-form-row" style={{ marginBottom: 8 }}>
                      <div className="apt-form-field" style={{ flex: 0.8 }}>
                        <label className="apt-form-label" style={{ fontSize: 11 }}>Horaire / Moment</label>
                        <input
                          type="text"
                          className="apt-form-input"
                          placeholder="Ex: 09:00 ou Jour 1 - Matin"
                          value={step.dayOrTime}
                          onChange={e => handleUpdateStep(idx, 'dayOrTime', e.target.value)}
                        />
                      </div>
                      <div className="apt-form-field" style={{ flex: 1.5 }}>
                        <label className="apt-form-label" style={{ fontSize: 11 }}>Titre de l'étape *</label>
                        <input
                          type="text"
                          className="apt-form-input"
                          placeholder="Ex: Traversée du Chott El Djerid"
                          value={step.title}
                          onChange={e => handleUpdateStep(idx, 'title', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="apt-form-field">
                      <label className="apt-form-label" style={{ fontSize: 11 }}>Description de l'activité</label>
                      <textarea
                        className="apt-form-textarea"
                        rows={2}
                        placeholder="Détails du déroulement, des arrêts photos ou du repas..."
                        value={step.description}
                        onChange={e => handleUpdateStep(idx, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Photos & Galerie */}
            <div className="apt-form-section" style={{ borderBottom: 'none' }}>
              <h3 className="apt-form-section__title">5. Photos & Galerie ({form.images.length})</h3>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="apt-form-input"
                  style={{ flex: 1, minWidth: 240 }}
                  placeholder="Collez une URL d'image (https://...)"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={handleAddImageUrl}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <FiPlus size={14} /> Ajouter URL
                </button>
                <label className="admin-btn admin-btn--outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <FiUpload size={14} />
                  <span>{uploading ? 'Envoi...' : 'Importer'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Gallery Grid */}
              {form.images.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', border: '2px dashed var(--black-4, #ebe6dc)', borderRadius: 10, color: 'var(--white-50, #727d88)', fontSize: 13, background: 'var(--black-3, #f8f7ee)' }}>
                  Aucune photo pour l'instant. Ajoutez au moins 1 image représentative de l'excursion.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 95, border: '1.5px solid var(--black-4, #ebe6dc)' }}>
                      <img
                        src={img}
                        alt={`Photo ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'; }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Supprimer la photo"
                      >
                        <FiX size={13} />
                      </button>
                      {i === 0 && (
                        <span style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          background: 'var(--gold, #A84A3B)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer Actions */}
          <div className="apt-modal-footer">
            <button
              type="button"
              className="apt-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="apt-btn-save"
              disabled={saving}
            >
              {saving ? 'Enregistrement en cours...' : isEdit ? "Enregistrer les modifications" : "Créer l'excursion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
