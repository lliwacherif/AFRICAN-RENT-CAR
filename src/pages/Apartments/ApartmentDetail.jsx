import { useText } from '../../context/LanguageContext'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiMapPin, FiCalendar, FiUsers, FiCheck, FiArrowLeft,
  FiShield, FiInfo, FiWifi, FiTv, FiDroplet, FiShare2, FiHeart
} from 'react-icons/fi'
import { apartmentsService } from '../../services/apartmentsService'
import { useAuth } from '../../context/AuthContext'
import { useCurrency } from '../../context/CurrencyContext'
import { useWishlist } from '../../context/WishlistContext'
import { Header } from '../../components/HomeModern/Header'
import { Footer } from '../../components/HomeModern/Footer'
import './ApartmentDetail.css'

const today = new Date().toISOString().split('T')[0]
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

export default function ApartmentDetail() {
  const tr = useText()

  const { id } = useParams()
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuth()
  const { formatPrice } = useCurrency()
  const { isFavorite, toggleFavorite } = useWishlist()

  const [apt, setApt] = useState(null)
  const isFav = isFavorite(apt?._id || apt?.id || id)
  const [selectedImg, setSelectedImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Booking widget state
  const [checkInDate, setCheckInDate] = useState(today)
  const [checkOutDate, setCheckOutDate] = useState(inThreeDays)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    setLoading(true)
    apartmentsService.getOne(id)
      .then(data => setApt(data))
      .catch(err => {
        console.error('Error loading apartment:', err)
        setError("Impossible de charger les détails de cet hébergement.")
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="aptd-page">
        <Header />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="apts-spinner" />
          <p style={{ color: '#8c8c9a', marginTop: 12 }}>{tr("Chargement de votre séjour d'exception...")}</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !apt) {
    return (
      <div className="aptd-page">
        <Header />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>{tr("Hébergement introuvable")}</h2>
          <p style={{ color: '#8c8c9a', margin: '12px 0 24px' }}>{tr(error || "Ce séjour n'existe pas ou n'est plus disponible.")}</p>
          <button className="aptd-btn-gold" onClick={() => navigate('/appartements')}>
            {tr("Retour aux hébergements")}
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  // Calculate pricing breakdown
  const start = new Date(checkInDate)
  const end = new Date(checkOutDate)
  const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
  const subtotalHT = nights * apt.pricePerNight
  const cleaning = apt.cleaningFee || 0
  const tva = Math.round((subtotalHT + cleaning) * 0.07 * 100) / 100
  const totalTTC = Math.round((subtotalHT + cleaning + tva) * 100) / 100

  const handleBook = async () => {
    if (!user) {
      openAuthModal('login')
      return
    }

    setSubmitting(true)
    try {
      await apartmentsService.reserve(id, {
        checkInDate,
        checkOutDate,
        adults: Number(adults),
        children: Number(children),
        specialRequests,
      })
      setBookingSuccess(true)
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la réservation de l'hébergement.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="aptd-page">
      <Header />

      <div className="container aptd-container">
        {/* Back Link */}
        <button className="aptd-back-link" onClick={() => navigate('/appartements')}>
          <FiArrowLeft size={16} /> {tr("Tous les hébergements")}
        </button>

        {/* Title Header */}
        <div className="aptd-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div className="aptd-type-row">
              <span className="aptd-badge">{tr(apt.type)}</span>
              <span className="aptd-city">
                <FiMapPin size={13} style={{ color: 'var(--gold)' }} /> {tr(apt.address || apt.city)}
              </span>
            </div>
            <h1 className="aptd-title">{tr(apt.title)}</h1>
          </div>
          <button
            type="button"
            onClick={() => apt && toggleFavorite(apt, 'apartment')}
            style={{
              background: '#fff',
              border: '1.5px solid var(--black-5, #dad3c5)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title={tr(isFav ? "Retirer des favoris" : "Ajouter aux favoris")}
          >
            <FiHeart size={20} fill={isFav ? '#A84A3B' : 'none'} color={isFav ? '#A84A3B' : '#6b7280'} />
          </button>
        </div>

        {/* Gallery */}
        <div className="aptd-gallery">
          <div className="aptd-gallery__main">
            <img
              src={apt.images?.[selectedImg] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'}
              alt={tr(apt.title)}
              className="aptd-gallery__main-img"
            />
          </div>
          {apt.images?.length > 1 && (
            <div className="aptd-gallery__thumbs">
              {apt.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`aptd-gallery__thumb-btn ${selectedImg === i ? 'active' : ''}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img src={img} alt={tr(`Photo ${i + 1}`)} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="aptd-grid">
          {/* Left Column: Details */}
          <div className="aptd-left">
            {/* Quick Specs */}
            <div className="aptd-specs-bar">
              <div className="aptd-spec-item">
                <span className="aptd-spec-val">{tr(apt.maxGuests)}</span>
                <span className="aptd-spec-lbl">{tr("Voyageurs max")}</span>
              </div>
              <div className="aptd-spec-item">
                <span className="aptd-spec-val">{tr(apt.bedrooms)}</span>
                <span className="aptd-spec-lbl">{tr("Chambres")}</span>
              </div>
              <div className="aptd-spec-item">
                <span className="aptd-spec-val">{tr(apt.bedsCount)}</span>
                <span className="aptd-spec-lbl">{tr("Lits")}</span>
              </div>
              <div className="aptd-spec-item">
                <span className="aptd-spec-val">{tr(apt.bathrooms)}</span>
                <span className="aptd-spec-lbl">{tr("Salles de bain")}</span>
              </div>
              {apt.surfaceM2 && (
                <div className="aptd-spec-item">
                  <span className="aptd-spec-val">{tr(apt.surfaceM2)} m²</span>
                  <span className="aptd-spec-lbl">{tr("Superficie")}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="aptd-section">
              <h2 className="aptd-section-title">{tr("À propos de ce logement")}</h2>
              <p className="aptd-description">{tr(apt.description)}</p>
            </div>

            {/* Amenities */}
            <div className="aptd-section">
              <h2 className="aptd-section-title">{tr("Équipements inclus")}</h2>
              <div className="aptd-amenities-grid">
                {apt.amenities?.wifi && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Wifi haut débit")}</div>}
                {apt.amenities?.ac && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Climatisation réversible")}</div>}
                {apt.amenities?.pool && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Piscine privée ou partagée")}</div>}
                {apt.amenities?.seaView && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Vue imprenable sur la mer")}</div>}
                {apt.amenities?.parking && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Place de parking réservée")}</div>}
                {apt.amenities?.kitchen && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Cuisine équipée (four, frigo, plaques)")}</div>}
                {apt.amenities?.tv && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Téléviseur Smart TV")}</div>}
                {apt.amenities?.washingMachine && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Lave-linge")}</div>}
                {apt.amenities?.terrace && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Terrasse / Patio aménagé")}</div>}
                {apt.amenities?.heating && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Chauffage central")}</div>}
                {apt.amenities?.elevator && <div className="aptd-amenity"><FiCheck className="text-gold" /> {tr("Ascenseur dans l'immeuble")}</div>}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="aptd-guarantee">
              <FiShield size={24} style={{ color: 'var(--gold)' }} />
              <div>
                <h4>{tr("Garantie Confort & Sérénité")}</h4>
                <p>{tr("Logement vérifié et préparé avec soin. Accueil personnalisé à votre arrivée et assistance 7j/7.")}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="aptd-right">
            <div className="aptd-booking-card">
              <div className="aptd-booking-price-header">
                <div>
                  <span className="aptd-booking-price">{formatPrice(apt.pricePerNight)}</span>
                  <span className="aptd-booking-unit"> {tr("/ nuitée")}</span>
                </div>
                <span className="aptd-min-nights">Min. {tr(apt.minNights || 1)} {tr("nuit(s)")}</span>
              </div>

              {bookingSuccess ? (
                <div className="aptd-success-box">
                  <div className="aptd-success-icon">✓</div>
                  <h3>{tr("Demande de réservation reçue !")}</h3>
                  <p>{tr("Votre réservation pour")} {tr(nights)} {tr("nuit(s) a été enregistrée avec succès.")}</p>
                  <button
                    className="aptd-btn-gold"
                    style={{ marginTop: 16, width: '100%' }}
                    onClick={() => navigate('/historique')}
                  >
                    {tr("Voir dans mon Historique")}
                  </button>
                </div>
              ) : (
                <div className="aptd-form">
                  <div className="aptd-dates-row">
                    <div className="aptd-field">
                      <label className="aptd-label">{tr("Arrivée")}</label>
                      <input
                        type="date"
                        className="aptd-input"
                        min={today}
                        value={checkInDate}
                        onChange={e => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div className="aptd-field">
                      <label className="aptd-label">{tr("Départ")}</label>
                      <input
                        type="date"
                        className="aptd-input"
                        min={checkInDate}
                        value={checkOutDate}
                        onChange={e => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="aptd-guests-row">
                    <div className="aptd-field">
                      <label className="aptd-label">{tr("Adultes")}</label>
                      <select
                        className="aptd-select"
                        value={adults}
                        onChange={e => setAdults(Number(e.target.value))}
                      >
                        {[...Array(apt.maxGuests)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{tr(i + 1)} {tr("adulte")}{tr(i > 0 ? 's' : '')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="aptd-field">
                      <label className="aptd-label">{tr("Enfants")}</label>
                      <select
                        className="aptd-select"
                        value={children}
                        onChange={e => setChildren(Number(e.target.value))}
                      >
                        <option value="0">{tr("Aucun")}</option>
                        <option value="1">{tr("1 enfant")}</option>
                        <option value="2">{tr("2 enfants")}</option>
                        <option value="3">{tr("3 enfants")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="aptd-field">
                    <label className="aptd-label">{tr("Demande particulière (optionnel)")}</label>
                    <textarea
                      className="aptd-textarea"
                      rows="2"
                      placeholder={tr("Heure d'arrivée estimée, besoin d'un lit bébé...")}
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="aptd-breakdown">
                    <div className="aptd-breakdown-row">
                      <span>{formatPrice(apt.pricePerNight)} × {tr(nights)} {tr("nuits")}</span>
                      <span>{formatPrice(subtotalHT)}</span>
                    </div>
                    {cleaning > 0 && (
                      <div className="aptd-breakdown-row">
                        <span>{tr("Frais de ménage & linge")}</span>
                        <span>{formatPrice(cleaning)}</span>
                      </div>
                    )}
                    <div className="aptd-breakdown-row">
                      <span>{tr("Taxes & TVA touristique (7%)")}</span>
                      <span>{formatPrice(tva)}</span>
                    </div>
                    <div className="aptd-breakdown-row aptd-breakdown-row--total">
                      <span>{tr("Total TTC")}</span>
                      <span className="text-gold">{formatPrice(totalTTC)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="aptd-btn-gold"
                    onClick={handleBook}
                    disabled={submitting}
                  >
                    {tr(submitting ? 'Confirmation...' : user ? 'Réserver ce séjour' : 'Se connecter pour réserver')}
                  </button>

                  <p className="aptd-deposit-note">
                    <FiInfo size={12} /> {tr("Caution remboursable à l'arrivée :")} {formatPrice(apt.depositAmount || 200)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
