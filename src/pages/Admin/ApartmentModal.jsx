import { useState, useEffect } from 'react'
import { FiX, FiUpload, FiTrash2, FiPlus, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { apartmentsService } from '../../services/apartmentsService'
import { uploadService } from '../../services/vehiclesService'

const APARTMENT_TYPES = [
  'Appartement',
  'Villa',
  "Maison d'hôtes (Dar)",
  'Studio',
  'Penthouse'
]

const AMENITIES_LIST = [
  { key: 'wifi', label: 'Wi-Fi haut débit', icon: '📶' },
  { key: 'ac', label: 'Climatisation', icon: '❄️' },
  { key: 'pool', label: 'Piscine privée/commune', icon: '🏊' },
  { key: 'seaView', label: 'Vue sur mer', icon: '🌊' },
  { key: 'parking', label: 'Parking gratuit', icon: '🚗' },
  { key: 'kitchen', label: 'Cuisine équipée', icon: '🍳' },
  { key: 'tv', label: 'Smart TV', icon: '📺' },
  { key: 'washingMachine', label: 'Lave-linge', icon: '🧺' },
  { key: 'terrace', label: 'Terrasse / Balcon', icon: '☀️' },
  { key: 'heating', label: 'Chauffage', icon: '🔥' },
  { key: 'elevator', label: 'Ascenseur', icon: '🛗' },
  { key: 'petFriendly', label: 'Animaux acceptés', icon: '🐾' },
]

export default function ApartmentModal({ apartment, onClose, onSaved }) {
  const isEdit = Boolean(apartment?._id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Appartement',
    city: 'Tunis',
    address: '',
    pricePerNight: 150,
    cleaningFee: 40,
    depositAmount: 200,
    bedrooms: 1,
    bathrooms: 1,
    bedsCount: 1,
    maxGuests: 2,
    surfaceM2: 60,
    minNights: 1,
    isActive: true,
    featured: false,
    amenities: {
      wifi: true,
      ac: true,
      pool: false,
      seaView: false,
      parking: true,
      kitchen: true,
      tv: true,
      washingMachine: false,
      terrace: false,
      heating: true,
      elevator: false,
      petFriendly: false,
    },
    images: [],
  })

  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (apartment) {
      setForm({
        title: apartment.title || '',
        description: apartment.description || '',
        type: apartment.type || 'Appartement',
        city: apartment.city || 'Tunis',
        address: apartment.address || '',
        pricePerNight: apartment.pricePerNight ?? 150,
        cleaningFee: apartment.cleaningFee ?? 40,
        depositAmount: apartment.depositAmount ?? 200,
        bedrooms: apartment.bedrooms ?? 1,
        bathrooms: apartment.bathrooms ?? 1,
        bedsCount: apartment.bedsCount ?? 1,
        maxGuests: apartment.maxGuests ?? 2,
        surfaceM2: apartment.surfaceM2 ?? 60,
        minNights: apartment.minNights ?? 1,
        isActive: apartment.isActive ?? true,
        featured: apartment.featured ?? false,
        amenities: {
          wifi: true,
          ac: true,
          pool: false,
          seaView: false,
          parking: true,
          kitchen: true,
          tv: true,
          washingMachine: false,
          terrace: false,
          heating: true,
          elevator: false,
          petFriendly: false,
          ...(apartment.amenities || {})
        },
        images: apartment.images || [],
      })
    }
  }, [apartment])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }))
  }

  const handleAmenityToggle = (key) => {
    setForm(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key]
      }
    }))
  }

  const handleAddImageUrl = (e) => {
    e.preventDefault()
    if (!newImageUrl.trim()) return
    setForm(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }))
    setNewImageUrl('')
  }

  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const res = await uploadService.uploadImage(file, 'apartments')
      if (res?.url) {
        setForm(prev => ({ ...prev, images: [...prev.images, res.url] }))
      }
    } catch (err) {
      setError("Échec du téléversement de l'image. Veuillez réessayer ou entrer une URL.")
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!form.title.trim()) {
      setError('Veuillez entrer un titre pour le bien.')
      setSaving(false)
      return
    }
    if (!form.city.trim()) {
      setError('Veuillez indiquer la ville.')
      setSaving(false)
      return
    }
    if (!form.address.trim()) {
      setError("Veuillez indiquer l'adresse complète.")
      setSaving(false)
      return
    }
    if (form.pricePerNight <= 0) {
      setError('Le prix par nuitée doit être supérieur à 0 TND.')
      setSaving(false)
      return
    }

    try {
      if (isEdit) {
        await apartmentsService.update(apartment._id, form)
      } else {
        await apartmentsService.create(form)
      }
      onSaved()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="apt-modal-overlay" onClick={onClose}>
      <div className="apt-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="apt-modal-header">
          <div className="apt-modal-header__info">
            <span className="apt-modal-badge">{isEdit ? 'Édition hébergement' : 'Nouveau bien'}</span>
            <h2 className="apt-modal-title">{isEdit ? form.title || 'Modifier le bien' : 'Ajouter un hébergement'}</h2>
          </div>
          <button className="apt-modal-close" onClick={onClose}>
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
            {/* 1. Informations Principales */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">1. Informations Générales</h3>
              
              <div className="apt-form-row">
                <div className="apt-form-field" style={{ flex: 2 }}>
                  <label className="apt-form-label">Titre du bien *</label>
                  <input
                    type="text"
                    name="title"
                    className="apt-form-input"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Dar Sidi Bou Said — Vue Mer Panoramique"
                    required
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Type de bien *</label>
                  <select
                    name="type"
                    className="apt-form-select"
                    value={form.type}
                    onChange={handleInputChange}
                    required
                  >
                    {APARTMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="apt-form-row">
                <div className="apt-form-field" style={{ flex: 1 }}>
                  <label className="apt-form-label">Ville *</label>
                  <input
                    type="text"
                    name="city"
                    className="apt-form-input"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="Ex: Sidi Bou Said, Hammamet, Djerba..."
                    required
                  />
                </div>
                <div className="apt-form-field" style={{ flex: 2 }}>
                  <label className="apt-form-label">Adresse complète *</label>
                  <input
                    type="text"
                    name="address"
                    className="apt-form-input"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Ex: Rue Habib Thameur, 2026 Sidi Bou Said"
                    required
                  />
                </div>
              </div>

              <div className="apt-form-field">
                <label className="apt-form-label">Description détaillée</label>
                <textarea
                  name="description"
                  className="apt-form-textarea"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Décrivez l'ambiance, les équipements, l'emplacement et les points forts..."
                />
              </div>
            </div>

            {/* 2. Tarification & Conditions */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">2. Tarification & Conditions</h3>
              
              <div className="apt-form-grid-4">
                <div className="apt-form-field">
                  <label className="apt-form-label">Prix / nuit (TND) *</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    className="apt-form-input"
                    value={form.pricePerNight}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Frais ménage (TND)</label>
                  <input
                    type="number"
                    name="cleaningFee"
                    className="apt-form-input"
                    value={form.cleaningFee}
                    onChange={handleInputChange}
                    min={0}
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Caution (TND)</label>
                  <input
                    type="number"
                    name="depositAmount"
                    className="apt-form-input"
                    value={form.depositAmount}
                    onChange={handleInputChange}
                    min={0}
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Séjour min (nuits)</label>
                  <input
                    type="number"
                    name="minNights"
                    className="apt-form-input"
                    value={form.minNights}
                    onChange={handleInputChange}
                    min={1}
                  />
                </div>
              </div>
            </div>

            {/* 3. Capacité & Dimensions */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">3. Capacité & Spécifications</h3>
              
              <div className="apt-form-grid-5">
                <div className="apt-form-field">
                  <label className="apt-form-label">Voyageurs max</label>
                  <input
                    type="number"
                    name="maxGuests"
                    className="apt-form-input"
                    value={form.maxGuests}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Chambres</label>
                  <input
                    type="number"
                    name="bedrooms"
                    className="apt-form-input"
                    value={form.bedrooms}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Lits</label>
                  <input
                    type="number"
                    name="bedsCount"
                    className="apt-form-input"
                    value={form.bedsCount}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Salles de bain</label>
                  <input
                    type="number"
                    name="bathrooms"
                    className="apt-form-input"
                    value={form.bathrooms}
                    onChange={handleInputChange}
                    min={1}
                    required
                  />
                </div>
                <div className="apt-form-field">
                  <label className="apt-form-label">Surface (m²)</label>
                  <input
                    type="number"
                    name="surfaceM2"
                    className="apt-form-input"
                    value={form.surfaceM2}
                    onChange={handleInputChange}
                    min={10}
                  />
                </div>
              </div>
            </div>

            {/* 4. Équipements inclus */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">4. Équipements & Commodités</h3>
              <div className="apt-amenities-selector">
                {AMENITIES_LIST.map(({ key, label, icon }) => {
                  const isChecked = Boolean(form.amenities[key])
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`apt-amenity-chip ${isChecked ? 'apt-amenity-chip--active' : ''}`}
                      onClick={() => handleAmenityToggle(key)}
                    >
                      <span className="apt-amenity-chip__icon">{icon}</span>
                      <span className="apt-amenity-chip__label">{label}</span>
                      {isChecked && <FiCheck size={13} className="apt-amenity-chip__check" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Galerie photos */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">5. Galerie Photos ({form.images.length})</h3>
              
              <div className="apt-images-uploader">
                <div className="apt-images-add-row">
                  <input
                    type="url"
                    className="apt-form-input"
                    placeholder="Coller l'URL d'une image (Unsplash, Cloudinary, etc.)"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                  />
                  <button type="button" className="apt-btn-secondary" onClick={handleAddImageUrl}>
                    <FiPlus size={14} /> Ajouter URL
                  </button>
                  
                  <label className="apt-btn-upload">
                    <FiUpload size={14} /> {uploading ? 'Téléversement...' : 'Importer fichier'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} hidden />
                  </label>
                </div>

                {form.images.length > 0 ? (
                  <div className="apt-images-grid">
                    {form.images.map((imgUrl, idx) => (
                      <div key={idx} className="apt-image-thumb">
                        <img src={imgUrl} alt={`Aperçu ${idx + 1}`} />
                        <span className="apt-image-thumb__index">{idx === 0 ? 'Couverture' : `#${idx + 1}`}</span>
                        <button
                          type="button"
                          className="apt-image-thumb__remove"
                          onClick={() => handleRemoveImage(idx)}
                          title="Supprimer la photo"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="apt-images-empty-note">
                    Aucune photo ajoutée pour l'instant. Ajoutez au moins une photo attrayante pour la couverture.
                  </p>
                )}
              </div>
            </div>

            {/* 6. Statuts & Publication */}
            <div className="apt-form-section">
              <h3 className="apt-form-section__title">6. Statut & Visibilité</h3>
              <div className="apt-toggles-row">
                <label className="apt-toggle-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleInputChange}
                  />
                  <div>
                    <strong>En ligne (Actif)</strong>
                    <p>Visible et réservable immédiatement par les clients sur le site</p>
                  </div>
                </label>

                <label className="apt-toggle-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleInputChange}
                  />
                  <div>
                    <strong>Coup de cœur (Featured)</strong>
                    <p>Afficher en avant avec badge spécial dans les premiers résultats</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="apt-modal-footer">
            <button type="button" className="apt-btn-cancel" onClick={onClose} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="apt-btn-save" disabled={saving}>
              {saving ? 'Enregistrement en cours...' : isEdit ? 'Enregistrer les modifications' : 'Créer l’hébergement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
