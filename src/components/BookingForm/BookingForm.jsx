import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCalendar, FiUser, FiCheck, FiHome, FiCompass, FiMapPin, FiUsers } from 'react-icons/fi'
import { parcsService } from '../../services/vehiclesService'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import ParcSelect from '../ParcSelect/ParcSelect'
import './BookingForm.css'

const today = new Date().toISOString().split('T')[0]
const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

const POPULAR_CITIES = [
  'Toutes les villes',
  'Sidi Bou Said',
  'Hammamet',
  'Djerba',
  'La Marsa',
  'Tozeur',
  'Sousse',
  'Tabarka',
]

const EXCURSION_CATEGORIES = [
  'Toutes les catégories',
  'Sahara & Désert',
  'Culture & Histoire',
  'Randonnée & Nature',
  'Mer & Bateau',
]

export default function BookingForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('location') // 'location' | 'hebergement' | 'excursions'
  const [sameReturn, setSameReturn] = useState(true)
  const [parcs, setParcs] = useState([])

  // Car Form State
  const [form, setForm] = useState({
    location: '',
    parcId: '',
    pickupDate: today,
    dropoffDate: inSevenDays,
    driverAge: '',
  })

  // Apartment Form State
  const [aptForm, setAptForm] = useState({
    city: '',
    checkInDate: today,
    checkOutDate: inThreeDays,
    guests: '2',
  })

  // Excursion Form State
  const [excForm, setExcForm] = useState({
    category: '',
    departureCity: '',
    date: inThreeDays,
  })

  // Load parcs for car dropdown
  useEffect(() => {
    parcsService.getAll()
      .then(data => {
        setParcs(data || [])
        if (data?.length > 0 && !form.location) {
          setForm(prev => ({ ...prev, location: data[0].name, parcId: data[0]._id }))
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setCar = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const setApt = (field) => (e) => setAptForm(prev => ({ ...prev, [field]: e.target.value }))
  const setExc = (field) => (e) => setExcForm(prev => ({ ...prev, [field]: e.target.value }))

  const effectiveAge = user?.age ? String(user.age) : form.driverAge

  const handleSearchCars = () => {
    const params = new URLSearchParams({
      location: form.location,
      ...(form.parcId && { parcId: form.parcId }),
      pickupDate: form.pickupDate,
      dropoffDate: form.dropoffDate,
      driverAge: effectiveAge || '18',
    })
    navigate(`/voitures?${params.toString()}`)
  }

  const handleSearchApts = () => {
    const params = new URLSearchParams()
    if (aptForm.city && aptForm.city !== 'Toutes les villes') params.set('city', aptForm.city)
    if (aptForm.checkInDate) params.set('checkIn', aptForm.checkInDate)
    if (aptForm.checkOutDate) params.set('checkOut', aptForm.checkOutDate)
    if (aptForm.guests) params.set('guests', aptForm.guests)
    navigate(`/appartements?${params.toString()}`)
  }

  const handleSearchExcursions = () => {
    const params = new URLSearchParams()
    if (excForm.category && excForm.category !== 'Toutes les catégories') params.set('category', excForm.category)
    if (excForm.departureCity && excForm.departureCity !== 'Toutes les villes') params.set('city', excForm.departureCity)
    navigate(`/excursions?${params.toString()}`)
  }

  const minDropoff = form.pickupDate || today
  const minAptCheckout = aptForm.checkInDate || today

  return (
    <section className="booking">
      <div className="booking__card container">
        {/* Modern Tabs */}
        <div className="booking__tabs">
          <button
            type="button"
            className={`booking__tab ${activeTab === 'location' ? 'booking__tab--active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            🚗 {t('booking.carRental', 'Location de voiture')}
          </button>
          <button
            type="button"
            className={`booking__tab ${activeTab === 'hebergement' ? 'booking__tab--active' : ''}`}
            onClick={() => setActiveTab('hebergement')}
          >
            🏡 {t('booking.apartments', 'Hébergements & Stays')}
          </button>
          <button
            type="button"
            className={`booking__tab ${activeTab === 'excursions' ? 'booking__tab--active' : ''}`}
            onClick={() => setActiveTab('excursions')}
          >
            🐪 {t('booking.excursions', 'Circuits & Excursions')}
          </button>
        </div>

        {/* ── TAB 1: CAR RENTAL ────────────────────────────────────────── */}
        {activeTab === 'location' && (
          <div className="booking__form">
            <div className="booking__fields">
              <div className="booking__field booking__field--wide">
                <label className="booking__label">{t('booking.pickupLocation', 'Lieu de remise')}</label>
                <ParcSelect
                  parcs={parcs}
                  value={form.parcId}
                  onChange={(parcId, parcName) => {
                    setForm(prev => ({
                      ...prev,
                      parcId,
                      location: parcName,
                    }))
                  }}
                  placeholder={t('booking.selectParc', 'Sélectionnez un parc')}
                  variant="dark"
                />
              </div>

              <div className="booking__field">
                <label className="booking__label">{t('booking.pickupDate', 'Date de prise en charge')}</label>
                <div className="booking__input-wrap">
                  <input
                    type="date"
                    className="booking__input booking__input--date"
                    value={form.pickupDate}
                    min={today}
                    onChange={e => {
                      const v = e.target.value
                      setForm(prev => ({
                        ...prev,
                        pickupDate: v,
                        dropoffDate: prev.dropoffDate < v ? v : prev.dropoffDate,
                      }))
                    }}
                  />
                  <FiCalendar className="booking__input-icon-right" size={15} />
                </div>
              </div>

              <div className="booking__field">
                <label className="booking__label">{t('booking.dropoffDate', 'Date de restitution')}</label>
                <div className="booking__input-wrap">
                  <input
                    type="date"
                    className="booking__input booking__input--date"
                    value={form.dropoffDate}
                    min={minDropoff}
                    onChange={setCar('dropoffDate')}
                  />
                  <FiCalendar className="booking__input-icon-right" size={15} />
                </div>
              </div>

              <div className="booking__field booking__field--narrow">
                <label className="booking__label">{t('booking.driverAge', 'Âge du conducteur')}</label>
                <div className="booking__input-wrap">
                  <FiUser className="booking__input-icon" size={15} />
                  {user?.age ? (
                    <span className="booking__input" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
                      <span style={{ fontWeight: 600 }}>{user.age} {t('booking.years', 'ans')}</span>
                      <span style={{ fontSize: 10, color: '#f97316', background: '#fff7ed', borderRadius: 4, padding: '1px 5px', border: '1px solid #fed7aa' }}>{t('booking.accountLocked', '🔒 compte')}</span>
                    </span>
                  ) : (
                    <input
                      type="number"
                      className="booking__input"
                      value={form.driverAge}
                      min={18}
                      max={99}
                      onChange={setCar('driverAge')}
                      placeholder="ex: 25"
                    />
                  )}
                </div>
              </div>

              <div className="booking__field booking__field--btn">
                <label className="booking__label booking__label--hidden">{t('booking.search', 'Rechercher')}</label>
                <button className="booking__search-btn" onClick={handleSearchCars}>
                  {t('booking.search', 'Rechercher')}
                </button>
              </div>
            </div>

            <div className="booking__footer">
              <label className="booking__checkbox-label">
                <div
                  className={`booking__checkbox ${sameReturn ? 'booking__checkbox--checked' : ''}`}
                  onClick={() => setSameReturn(!sameReturn)}
                >
                  {sameReturn && <FiCheck size={11} color="#fff" />}
                </div>
                <span>{t('booking.sameReturn', 'Même lieu de restitution')}</span>
              </label>
            </div>
          </div>
        )}

        {/* ── TAB 2: APARTMENTS & VACATION STAYS ───────────────────────── */}
        {activeTab === 'hebergement' && (
          <div className="booking__form">
            <div className="booking__fields">
              <div className="booking__field booking__field--wide">
                <label className="booking__label">Destination en Tunisie</label>
                <div className="booking__input-wrap">
                  <FiMapPin className="booking__input-icon" size={15} />
                  <select
                    className="booking__input"
                    value={aptForm.city}
                    onChange={setApt('city')}
                    style={{ paddingLeft: 34 }}
                  >
                    <option value="">Toutes les destinations</option>
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="booking__field">
                <label className="booking__label">Date d'arrivée</label>
                <div className="booking__input-wrap">
                  <input
                    type="date"
                    className="booking__input booking__input--date"
                    value={aptForm.checkInDate}
                    min={today}
                    onChange={e => {
                      const v = e.target.value
                      setAptForm(prev => ({
                        ...prev,
                        checkInDate: v,
                        checkOutDate: prev.checkOutDate < v ? v : prev.checkOutDate,
                      }))
                    }}
                  />
                  <FiCalendar className="booking__input-icon-right" size={15} />
                </div>
              </div>

              <div className="booking__field">
                <label className="booking__label">Date de départ</label>
                <div className="booking__input-wrap">
                  <input
                    type="date"
                    className="booking__input booking__input--date"
                    value={aptForm.checkOutDate}
                    min={minAptCheckout}
                    onChange={setApt('checkOutDate')}
                  />
                  <FiCalendar className="booking__input-icon-right" size={15} />
                </div>
              </div>

              <div className="booking__field booking__field--narrow">
                <label className="booking__label">Voyageurs</label>
                <div className="booking__input-wrap">
                  <FiUsers className="booking__input-icon" size={15} />
                  <select
                    className="booking__input"
                    value={aptForm.guests}
                    onChange={setApt('guests')}
                    style={{ paddingLeft: 34 }}
                  >
                    <option value="1">1 pers</option>
                    <option value="2">2 pers</option>
                    <option value="3">3 pers</option>
                    <option value="4">4 pers</option>
                    <option value="6">6+ pers</option>
                  </select>
                </div>
              </div>

              <div className="booking__field booking__field--btn">
                <label className="booking__label booking__label--hidden">Explorer</label>
                <button className="booking__search-btn" onClick={handleSearchApts}>
                  Explorer
                </button>
              </div>
            </div>
            <div className="booking__footer" style={{ color: 'var(--white-70)', fontSize: 13, fontWeight: 500 }}>
              ✨ Dars traditionnels, villas avec piscine privée, penthouses vue mer dans toute la Tunisie.
            </div>
          </div>
        )}

        {/* ── TAB 3: FIELD TRIPS & EXCURSIONS ─────────────────────────── */}
        {activeTab === 'excursions' && (
          <div className="booking__form">
            <div className="booking__fields">
              <div className="booking__field booking__field--wide">
                <label className="booking__label">Thème du circuit / excursion</label>
                <div className="booking__input-wrap">
                  <FiCompass className="booking__input-icon" size={15} />
                  <select
                    className="booking__input"
                    value={excForm.category}
                    onChange={setExc('category')}
                    style={{ paddingLeft: 34 }}
                  >
                    {EXCURSION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="booking__field booking__field--wide">
                <label className="booking__label">Ville de départ</label>
                <div className="booking__input-wrap">
                  <FiMapPin className="booking__input-icon" size={15} />
                  <select
                    className="booking__input"
                    value={excForm.departureCity}
                    onChange={setExc('departureCity')}
                    style={{ paddingLeft: 34 }}
                  >
                    <option value="">Tous les départs (Tunis, Sousse, Djerba...)</option>
                    <option value="Tunis">Départ Tunis</option>
                    <option value="Sousse">Départ Sousse / Monastir</option>
                    <option value="Djerba">Départ Djerba</option>
                    <option value="Hammamet">Départ Hammamet</option>
                  </select>
                </div>
              </div>

              <div className="booking__field booking__field--btn">
                <label className="booking__label booking__label--hidden">Découvrir</label>
                <button className="booking__search-btn" onClick={handleSearchExcursions}>
                  Découvrir
                </button>
              </div>
            </div>
            <div className="booking__footer" style={{ color: '#a0a0ab', fontSize: 13 }}>
              🐪 Safaris désertiques, randonnées vertes à Tabarka, voiliers aux îles Kuriat et cités antiques.
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
