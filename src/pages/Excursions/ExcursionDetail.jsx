import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiMapPin, FiClock, FiUsers, FiCheck, FiX,
  FiArrowLeft, FiShield, FiInfo, FiCompass, FiHeart
} from 'react-icons/fi'
import { excursionsService } from '../../services/excursionsService'
import { useAuth } from '../../context/AuthContext'
import { useCurrency } from '../../context/CurrencyContext'
import { useWishlist } from '../../context/WishlistContext'
import { Header } from '../../components/HomeModern/Header'
import { Footer } from '../../components/HomeModern/Footer'
import './ExcursionDetail.css'

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function isDayAllowed(d, availableDays) {
  if (!availableDays || availableDays.length === 0 || availableDays.includes('Tous les jours')) {
    return true;
  }
  const dayName = DAY_NAMES[d.getDay()];
  return availableDays.some(ad => ad.toLowerCase().includes(dayName));
}

function getNextAvailableDate(availableDays, fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1); // minimum tomorrow

  for (let i = 0; i < 90; i++) {
    if (isDayAllowed(d, availableDays)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    d.setDate(d.getDate() + 1);
  }
  return '';
}

function getUpcomingDatesList(availableDays, count = 30) {
  const results = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);

  for (let i = 0; i < 180 && results.length < count; i++) {
    if (isDayAllowed(d, availableDays)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const rawStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const fullLabel = rawStr.charAt(0).toUpperCase() + rawStr.slice(1);
      results.push({
        dateString,
        dateObj: new Date(d),
        label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }),
        fullLabel
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return results;
}

export default function ExcursionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuth()
  const { formatPrice } = useCurrency()
  const { isFavorite, toggleFavorite } = useWishlist()

  const [exc, setExc] = useState(null)
  const isFav = isFavorite(exc?._id || exc?.id || id)
  const [selectedImg, setSelectedImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Booking widget state
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [pickupLocation, setPickupLocation] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const upcomingDates = useMemo(() => {
    return getUpcomingDatesList(exc?.availableDays, 20);
  }, [exc?.availableDays]);

  useEffect(() => {
    setLoading(true)
    excursionsService.getOne(id)
      .then(data => {
        setExc(data)
        if (data?.availableDays) {
          const firstDate = getNextAvailableDate(data.availableDays)
          if (firstDate) setDate(firstDate)
        }
      })
      .catch(err => {
        console.error('Error loading excursion:', err)
        setError("Impossible de charger les détails de cette excursion.")
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (upcomingDates.length > 0) {
      if (!date || !upcomingDates.some(ud => ud.dateString === date)) {
        setDate(upcomingDates[0].dateString);
      }
    }
  }, [upcomingDates, date]);

  if (loading) {
    return (
      <div className="excd-page">
        <Header />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="apts-spinner" />
          <p style={{ color: '#8c8c9a', marginTop: 12 }}>Chargement de l'excursion...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !exc) {
    return (
      <div className="excd-page">
        <Header />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>Excursion introuvable</h2>
          <p style={{ color: '#8c8c9a', margin: '12px 0 24px' }}>{error || "Ce circuit n'existe pas ou n'est plus disponible."}</p>
          <button className="excd-btn-gold" onClick={() => navigate('/excursions')}>
            Retour aux excursions
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const pricePerAdult = exc.pricePerAdult
  const pricePerChild = exc.pricePerChild || Math.round(pricePerAdult * 0.6)
  const totalPrice = adults * pricePerAdult + children * pricePerChild

  const handleBook = async () => {
    if (!user) {
      openAuthModal('login')
      return
    }

    if (!date) {
      alert("Veuillez sélectionner une date de départ valide.");
      return
    }

    if (exc?.availableDays && exc.availableDays.length > 0 && !exc.availableDays.includes('Tous les jours')) {
      const parts = date.split('-');
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      if (!isDayAllowed(dObj, exc.availableDays)) {
        alert(`Cette excursion n'est programmée que le(s) : ${exc.availableDays.join(', ')}. Veuillez choisir une date autorisée.`);
        return
      }
    }

    setSubmitting(true)
    try {
      await excursionsService.reserve(id, {
        date,
        adults: Number(adults),
        children: Number(children),
        pickupLocation,
        specialRequests,
      })
      setBookingSuccess(true)
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la réservation de l'excursion.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="excd-page">
      <Header />

      <div className="container excd-container">
        {/* Back Link */}
        <button className="excd-back-link" onClick={() => navigate('/excursions')}>
          <FiArrowLeft size={16} /> Toutes les excursions
        </button>

        {/* Title & Badges */}
        <div className="excd-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div className="excd-type-row">
              <span className="excd-badge">{exc.category}</span>
              <span className="excd-meta-tag">
                <FiMapPin size={13} style={{ color: 'var(--gold)' }} /> Départ {exc.departureCity}
              </span>
              <span className="excd-meta-tag">
                <FiClock size={13} style={{ color: 'var(--gold)' }} /> {exc.duration}
              </span>
            </div>
            <h1 className="excd-title">{exc.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => exc && toggleFavorite(exc, 'excursion')}
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
            title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <FiHeart size={20} fill={isFav ? '#A84A3B' : 'none'} color={isFav ? '#A84A3B' : '#6b7280'} />
          </button>
        </div>

        {/* Gallery */}
        <div className="excd-gallery">
          <div className="excd-gallery__main">
            <img
              src={exc.images?.[selectedImg] || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200'}
              alt={exc.title}
              className="excd-gallery__main-img"
            />
          </div>
          {exc.images?.length > 1 && (
            <div className="excd-gallery__thumbs">
              {exc.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`excd-gallery__thumb-btn ${selectedImg === i ? 'active' : ''}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img src={img} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="excd-grid">
          {/* Left Column */}
          <div className="excd-left">
            {/* Quick Specs */}
            <div className="excd-specs-bar">
              <div className="excd-spec-item">
                <span className="excd-spec-val">{exc.duration}</span>
                <span className="excd-spec-lbl">Durée</span>
              </div>
              <div className="excd-spec-item">
                <span className="excd-spec-val">{exc.departureCity}</span>
                <span className="excd-spec-lbl">Ville de départ</span>
              </div>
              <div className="excd-spec-item">
                <span className="excd-spec-val">Max {exc.maxGroupSize} pers.</span>
                <span className="excd-spec-lbl">Taille du groupe</span>
              </div>
              <div className="excd-spec-item">
                <span className="excd-spec-val">
                  {exc.availableDays && exc.availableDays.length > 0
                    ? (exc.availableDays.includes('Tous les jours')
                        ? 'Tous les jours'
                        : exc.availableDays.join(', '))
                    : 'Sur demande'}
                </span>
                <span className="excd-spec-lbl">Jours de départ</span>
              </div>
            </div>

            {/* Description */}
            <div className="excd-section">
              <h2 className="excd-section-title">Présentation du circuit</h2>
              <p className="excd-description">{exc.description}</p>
            </div>

            {/* Detailed Itinerary */}
            {exc.itinerary?.length > 0 && (
              <div className="excd-section">
                <h2 className="excd-section-title">Programme de l'excursion</h2>
                <div className="excd-timeline">
                  {exc.itinerary.map((step, i) => (
                    <div key={i} className="excd-timeline-item">
                      <div className="excd-timeline-marker">{i + 1}</div>
                      <div className="excd-timeline-content">
                        <span className="excd-timeline-time">{step.dayOrTime}</span>
                        <h3 className="excd-timeline-title">{step.title}</h3>
                        <p className="excd-timeline-desc">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            <div className="excd-section">
              <h2 className="excd-section-title">Ce qui est inclus</h2>
              <div className="excd-inc-exc-grid">
                <div className="excd-inc-box">
                  <h3 className="excd-inc-box-title text-gold">Inclus</h3>
                  {exc.included?.map((item, i) => (
                    <div key={i} className="excd-inc-row">
                      <FiCheck size={14} className="text-gold" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {exc.excluded?.length > 0 && (
                  <div className="excd-exc-box">
                    <h3 className="excd-inc-box-title" style={{ color: '#ef4444' }}>Non inclus</h3>
                    {exc.excluded.map((item, i) => (
                      <div key={i} className="excd-exc-row">
                        <FiX size={14} style={{ color: '#ef4444' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Safety Guarantee */}
            <div className="excd-guarantee">
              <FiShield size={24} style={{ color: 'var(--gold)' }} />
              <div>
                <h4>Excursion certifiée &amp; sécurisée</h4>
                <p>Guides professionnels agréés par l'Office National du Tourisme Tunisien. Véhicules climatisés tout confort.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking */}
          <div className="excd-right">
            <div className="excd-booking-card">
              <div className="excd-booking-price-header">
                <div>
                  <span className="excd-booking-price">{formatPrice(pricePerAdult)}</span>
                  <span className="excd-booking-unit"> / adulte</span>
                </div>
                {pricePerChild > 0 && (
                  <span className="excd-child-rate">Enfant : {formatPrice(pricePerChild)}</span>
                )}
              </div>

              {bookingSuccess ? (
                <div className="excd-success-box">
                  <div className="excd-success-icon">✓</div>
                  <h3>Réservation confirmée !</h3>
                  <p>Votre place pour l'excursion du {date} a bien été enregistrée.</p>
                  <button
                    className="excd-btn-gold"
                    style={{ marginTop: 16, width: '100%' }}
                    onClick={() => navigate('/historique')}
                  >
                    Voir dans mon Historique
                  </button>
                </div>
              ) : (
                <div className="excd-form">
                  <div className="excd-field">
                    <label className="excd-label">Date de l'excursion</label>
                    <select
                      className="excd-select"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    >
                      {upcomingDates.length > 0 ? (
                        upcomingDates.map(ud => (
                          <option key={ud.dateString} value={ud.dateString}>
                            {ud.fullLabel}
                          </option>
                        ))
                      ) : (
                        <option value="">Aucune date disponible prochainement</option>
                      )}
                    </select>
                  </div>

                  <div className="excd-guests-row">
                    <div className="excd-field">
                      <label className="excd-label">Adultes</label>
                      <select
                        className="excd-select"
                        value={adults}
                        onChange={e => setAdults(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map(n => (
                          <option key={n} value={n}>{n} adulte{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="excd-field">
                      <label className="excd-label">Enfants (&lt; 12 ans)</label>
                      <select
                        className="excd-select"
                        value={children}
                        onChange={e => setChildren(Number(e.target.value))}
                      >
                        <option value="0">Aucun</option>
                        <option value="1">1 enfant</option>
                        <option value="2">2 enfants</option>
                        <option value="3">3 enfants</option>
                      </select>
                    </div>
                  </div>

                  <div className="excd-field">
                    <label className="excd-label">Hôtel ou lieu de prise en charge</label>
                    <input
                      type="text"
                      className="excd-input"
                      placeholder="ex: Hôtel Mövenpick Gammarth"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                    />
                  </div>

                  <div className="excd-field">
                    <label className="excd-label">Notes particulières (optionnel)</label>
                    <textarea
                      className="excd-textarea"
                      rows="2"
                      placeholder="Régime alimentaire, besoin d'un siège enfant..."
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  {/* Price breakdown */}
                  <div className="excd-breakdown">
                    <div className="excd-breakdown-row">
                      <span>{adults} × Adulte ({formatPrice(pricePerAdult)})</span>
                      <span>{formatPrice(adults * pricePerAdult)}</span>
                    </div>
                    {children > 0 && (
                      <div className="excd-breakdown-row">
                        <span>{children} × Enfant ({formatPrice(pricePerChild)})</span>
                        <span>{formatPrice(children * pricePerChild)}</span>
                      </div>
                    )}
                    <div className="excd-breakdown-row excd-breakdown-row--total">
                      <span>Total à régler</span>
                      <span className="text-gold">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="excd-btn-gold"
                    onClick={handleBook}
                    disabled={submitting}
                  >
                    {submitting ? 'Réservation en cours...' : user ? 'Réserver cette excursion' : 'Se connecter pour réserver'}
                  </button>

                  <p className="excd-guarantee-note">
                    <FiInfo size={12} /> Confirmation immédiate. Annulation gratuite jusqu'à 48h avant le départ.
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
