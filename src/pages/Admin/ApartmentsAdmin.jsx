import { useState, useEffect } from 'react'
import {
  FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiSearch,
  FiHome, FiCalendar, FiDollarSign, FiUsers, FiCheck, FiX,
  FiAlertCircle, FiRefreshCw, FiEye, FiBarChart2, FiTrendingUp, FiTrendingDown,
  FiClock, FiStar, FiFilter, FiLayers, FiList, FiMapPin, FiPhone, FiMail
} from 'react-icons/fi'
import { apartmentsService } from '../../services/apartmentsService'
import { useCurrency } from '../../context/CurrencyContext'
import ApartmentModal from './ApartmentModal'
import './ApartmentsAdmin.css'

// ── Native Admin Helper Components (Identical to Voitures) ────────────────────
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
  )
}

function ResBadge({ status }) {
  const map = {
    recu:      { bg: 'rgba(59,130,246,.15)',  c: '#60a5fa', l: 'Reçu'      },
    confirmed: { bg: 'rgba(34,197,94,.12)',   c: '#4ade80', l: 'Confirmée' },
    pending:   { bg: 'rgba(245,158,11,.12)',  c: '#fbbf24', l: 'En attente'},
    cancelled: { bg: 'rgba(239,68,68,.12)',   c: '#f87171', l: 'Annulée'  },
    completed: { bg: 'rgba(139,92,246,.12)',  c: '#a78bfa', l: 'Terminée' },
  }
  const s = map[status] || { bg: 'rgba(255,255,255,.08)', c: '#9ca3af', l: status }
  return <span className="res-badge" style={{ background: s.bg, color: s.c }}>{s.l}</span>
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
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ── Calendar Helpers (Matches Voitures getWeekDays & dayStatus 1:1) ───────────
function getWeekDays(offsetDays = 0) {
  const out = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + offsetDays + i)
    const isToday = d.toDateString() === today.toDateString()
    out.push({
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      date: d,
      isToday,
      isPast: d < today,
    })
  }
  return out
}

function dayStatusApartment(apt, reservations, date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const next = new Date(d)
  next.setDate(d.getDate() + 1)

  const hit = (reservations || []).find(r => {
    if (r.status === 'cancelled') return false
    const aid = (r.apartment?._id || r.apartment)?.toString()
    if (aid !== apt._id?.toString()) return false
    const checkIn = new Date(r.checkInDate)
    checkIn.setHours(0, 0, 0, 0)
    const checkOut = new Date(r.checkOutDate)
    checkOut.setHours(0, 0, 0, 0)
    return checkIn < next && checkOut > d
  })

  if (!hit) {
    return {
      state: apt.isActive ? 'ok' : 'inactive',
      res: null,
      title: apt.isActive ? 'Disponible' : 'Hors ligne',
    }
  }

  const isPending = hit.status === 'pending' || hit.status === 'recu'
  return {
    state: isPending ? 'pending' : 'booked',
    res: hit,
    title: `${isPending ? 'En attente' : 'Loué'} — ${hit.user?.firstName || 'Client'} ${hit.user?.lastName || ''}`.trim(),
  }
}

export default function ApartmentsAdmin() {
  const { formatPrice } = useCurrency()
  const fmtMoney = (n) => (formatPrice ? formatPrice(n) : `${(n || 0).toLocaleString('fr-FR')} TND`)

  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'apartments' | 'reservations' | 'calendar'
  const [apartments, setApartments] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingAptId, setTogglingAptId] = useState(null)

  // Calendar state
  const [calOffset, setCalOffset] = useState(0)

  // Filters for Apartments
  const [aptSearch, setAptSearch] = useState('')
  const [aptFilterType, setAptFilterType] = useState('all')
  const [aptFilterStatus, setAptFilterStatus] = useState('all')

  // Filters for Reservations
  const [resSearch, setResSearch] = useState('')
  const [resFilterStatus, setResFilterStatus] = useState('all')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [resModal, setResModal] = useState(null) // Stay detail modal

  // Load data
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [aptsData, resData] = await Promise.all([
        apartmentsService.getAllAdmin(),
        apartmentsService.getReservations(),
      ])

      const aptList = Array.isArray(aptsData)
        ? aptsData
        : (Array.isArray(aptsData?.apartments)
            ? aptsData.apartments
            : (Array.isArray(aptsData?.data)
                ? aptsData.data
                : []))

      const resList = Array.isArray(resData)
        ? resData
        : (Array.isArray(resData?.reservations)
            ? resData.reservations
            : (Array.isArray(resData?.data)
                ? resData.data
                : []))

      setApartments(aptList)
      setReservations(resList)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Impossible de charger les données des hébergements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const safeApartments = Array.isArray(apartments) ? apartments : []
  const safeReservations = Array.isArray(reservations) ? reservations : []
  const DAYS = getWeekDays(calOffset)

  // Metrics
  const totalApartments = safeApartments.length
  const activeApartments = safeApartments.filter(a => a.isActive).length
  const featuredCount = safeApartments.filter(a => a.featured).length
  const villasCount = safeApartments.filter(a => a.type === 'Villa' || a.type?.includes('Dar')).length

  const totalReservations = safeReservations.length
  const confirmedCount = safeReservations.filter(r => r.status === 'confirmed').length
  const pendingCount = safeReservations.filter(r => r.status === 'pending' || r.status === 'recu').length
  const completedCount = safeReservations.filter(r => r.status === 'completed').length
  const cancelledCount = safeReservations.filter(r => r.status === 'cancelled').length

  const totalRevenue = safeReservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.totalTTC || r.totalPrice || 0), 0)

  // Upcoming stays sorted by check-in date
  const upcomingStays = [...safeReservations]
    .filter(r => r.status !== 'cancelled')
    .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate))

  // Filtered Apartments
  const filteredApartments = safeApartments.filter(a => {
    const matchSearch =
      (a.title || '').toLowerCase().includes(aptSearch.toLowerCase()) ||
      (a.city || '').toLowerCase().includes(aptSearch.toLowerCase()) ||
      (a.address || '').toLowerCase().includes(aptSearch.toLowerCase())

    const matchType = aptFilterType === 'all' || a.type === aptFilterType
    const matchStatus =
      aptFilterStatus === 'all' ||
      (aptFilterStatus === 'active' && a.isActive) ||
      (aptFilterStatus === 'inactive' && !a.isActive) ||
      (aptFilterStatus === 'featured' && a.featured)

    return matchSearch && matchType && matchStatus
  })

  // Filtered Reservations
  const filteredReservations = safeReservations.filter(r => {
    const clientName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase()
    const aptTitle = String(r.apartment?.title || '').toLowerCase()
    const code = String(r._id || '').toLowerCase()
    const q = resSearch.toLowerCase()

    const matchSearch = !q || clientName.includes(q) || aptTitle.includes(q) || code.includes(q)
    const matchStatus = resFilterStatus === 'all' || r.status === resFilterStatus

    return matchSearch && matchStatus
  })

  // Handlers
  const handleToggleActive = async (apt) => {
    setTogglingAptId(apt._id)
    try {
      const updated = await apartmentsService.toggleActive(apt._id)
      setApartments(prev => (Array.isArray(prev) ? prev : []).map(a => a._id === apt._id ? { ...a, isActive: updated.isActive } : a))
    } catch (err) {
      alert("Erreur lors de la modification de l'état : " + (err?.response?.data?.message || err.message))
    } finally {
      setTogglingAptId(null)
    }
  }

  const handleDelete = async (apt) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${apt.title}" ?`)) return
    try {
      await apartmentsService.delete(apt._id)
      setApartments(prev => (Array.isArray(prev) ? prev : []).filter(a => a._id !== apt._id))
    } catch (err) {
      alert("Erreur lors de la suppression : " + (err?.response?.data?.message || err.message))
    }
  }

  const handleUpdateResStatus = async (resId, newStatus) => {
    try {
      const updated = await apartmentsService.updateReservationStatus(resId, newStatus)
      setReservations(prev => (Array.isArray(prev) ? prev : []).map(r => r._id === resId ? { ...r, status: updated.status } : r))
      if (resModal && resModal._id === resId) {
        setResModal(prev => ({ ...prev, status: updated.status }))
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut : " + (err?.response?.data?.message || err.message))
    }
  }

  return (
    <div>
      {/* ── Sub Tabs Bar (Matches Voitures admin-tabs-bar 100%) ── */}
      <div className="admin-tabs-bar">
        {[
          ['dashboard', '📊 Dashboard'],
          ['apartments', '🏡 Hébergements'],
          ['reservations', '📋 Réservations'],
          ['calendar', '📅 Calendrier'],
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

      {/* ══════════ TAB 1: DASHBOARD ══════════ */}
      {activeTab === 'dashboard' && (
        <div className="dash-layout">
          {/* KPI row */}
          <div className="dash-kpi-row">
            <KpiCard
              icon={<FiDollarSign size={20}/>}
              label="Revenus Séjours"
              value={fmtMoney(totalRevenue)}
              sub={`Total confirmé : ${fmtMoney(totalRevenue)}`}
            />
            <KpiCard
              icon={<FiCalendar size={20}/>}
              label="Réservations Séjours"
              value={totalReservations}
              sub={`${confirmedCount} confirmées · ${pendingCount} en attente`}
            />
            <KpiCard
              icon={<FiBarChart2 size={20}/>}
              label="Taux en ligne"
              value={totalApartments ? `${Math.round((activeApartments / totalApartments) * 100)}%` : '0%'}
              sub={`${activeApartments} en ligne · ${totalApartments - activeApartments} hors ligne`}
            />
            <KpiCard
              icon={<FiHome size={20}/>}
              label="Total Hébergements"
              value={totalApartments}
              sub={`${villasCount} villas & dars · ${totalApartments} biens`}
            />
          </div>

          {/* Main Column */}
          <div className="dash-main">
            {/* Top / Popular Accommodations */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">🏆 Hébergements du catalogue</h3>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  onClick={() => setActiveTab('apartments')}
                >
                  Voir tout →
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>HÉBERGEMENT</th>
                      <th>TYPE</th>
                      <th>VILLE</th>
                      <th>TARIF / NUIT</th>
                      <th>CAPACITÉ</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeApartments.slice(0, 5).map((apt, i) => (
                      <tr key={apt._id} className="admin-table__row">
                        <td>
                          <div className="admin-table__vehicle">
                            <div className="admin-table__car-img">
                              {apt.images?.[0] ? <img src={apt.images[0]} alt={apt.title} /> : <span>🏡</span>}
                            </div>
                            <div>
                              <div className="admin-table__car-name">
                                {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{apt.title}
                              </div>
                              <div className="admin-table__car-year">{apt.address || apt.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="admin-table__category">{apt.type}</td>
                        <td style={{ color: 'var(--white-70)', fontSize: 12.5 }}>{apt.city}</td>
                        <td>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                            {fmtMoney(apt.pricePerNight)}
                          </span>
                        </td>
                        <td style={{ color: 'var(--white-70)', fontSize: 12 }}>
                          {apt.maxGuests} pers · {apt.bedrooms} ch
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: apt.isActive ? 'var(--success)' : 'var(--danger)',
                              background: apt.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              padding: '3px 8px',
                              borderRadius: 12
                            }}
                          >
                            {apt.isActive ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!safeApartments.length && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 28 }}>
                          Aucun hébergement enregistré.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breakdown by property type */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Statut & Répartition des hébergements</h3>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'En ligne', count: activeApartments, color: 'var(--success)' },
                  { label: 'Hors ligne', count: totalApartments - activeApartments, color: 'var(--danger)' },
                  { label: 'Coup de cœur', count: featuredCount, color: 'var(--gold)' },
                  { label: 'Villas', count: safeApartments.filter(a => a.type === 'Villa').length, color: '#2C3E56' },
                  { label: "Maisons d'hôtes (Dar)", count: safeApartments.filter(a => a.type?.includes('Dar')).length, color: '#a78bfa' },
                  { label: 'Appartements & Penthouses', count: safeApartments.filter(a => a.type === 'Appartement' || a.type === 'Penthouse').length, color: '#38bdf8' }
                ].map(({ label, count, color }) => (
                  <div key={label} className="dash-fleet-row">
                    <span className="dash-fleet-dot" style={{ background: color }} />
                    <span className="dash-fleet-label" style={{ width: 170 }}>{label}</span>
                    <div className="dash-fleet-bar-wrap">
                      <div
                        className="dash-fleet-bar"
                        style={{
                          width: totalApartments ? `${(count / totalApartments) * 100}%` : '0%',
                          background: color
                        }}
                      />
                    </div>
                    <span className="dash-fleet-count">{count} / {totalApartments}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Stays Activity */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Activité récente des séjours</h3>
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
                      <th>HÉBERGEMENT</th>
                      <th>DATES DU SÉJOUR</th>
                      <th>TOTAL</th>
                      <th>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeReservations.slice(0, 6).map(r => (
                      <tr key={r._id} className="admin-table__row">
                        <td>
                          <div className="admin-table__car-name">{r.user?.firstName || 'Client'} {r.user?.lastName || ''}</div>
                          <div className="admin-table__car-year">{r.user?.email || r.user?.phone || '—'}</div>
                        </td>
                        <td>
                          <div className="admin-table__car-name">{r.apartment?.title || '—'}</div>
                          <div className="admin-table__car-year">{r.apartment?.city || ''}</div>
                        </td>
                        <td style={{ fontSize: 11.5, color: 'var(--white-50)' }}>
                          {fmtDate(r.checkInDate)} → {fmtDate(r.checkOutDate)} ({r.totalNights} nuits)
                        </td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(r.totalTTC || r.totalPrice)}
                        </td>
                        <td>
                          <ResBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                    {!safeReservations.length && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 28 }}>
                          Aucune réservation de séjour enregistrée.
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
            {/* Upcoming Stays */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Prochains séjours</h3>
              </div>
              <div className="admin-reservations">
                {!upcomingStays.length ? (
                  <p style={{ textAlign: 'center', color: 'var(--white-30)', fontSize: 13, padding: '20px 16px' }}>
                    Aucun séjour prévu.
                  </p>
                ) : (
                  upcomingStays.slice(0, 8).map(r => {
                    const p = new Date(r.checkInDate)
                    return (
                      <div
                        key={r._id}
                        className="res-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setResModal(r)}
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
                          <span className="res-item__car">{r.apartment?.title || 'Hébergement'}</span>
                          <span className="res-item__dates">
                            {fmtMoney(r.totalTTC || r.totalPrice)} · {r.totalNights} nuits
                          </span>
                        </div>
                      </div>
                    )
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
                  onClick={() => { setSelectedApartment(null); setIsModalOpen(true); }}
                >
                  <FiPlus size={14} /> Ajouter un hébergement
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('calendar')}
                >
                  <FiClock size={14} /> Calendrier des Séjours
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('reservations')}
                >
                  <FiCalendar size={14} /> Réservations Séjours
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('apartments')}
                >
                  <FiHome size={14} /> Gérer les Hébergements
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 2: APARTMENTS LIST (Matches Vehicles Tab 100%) ══════════ */}
      {activeTab === 'apartments' && (
        <div className="admin-full">
          {/* Summary Row */}
          <div className="admin-summary-row">
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{totalApartments}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Total</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{activeApartments}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>En ligne</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{totalApartments - activeApartments}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Hors ligne</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{featuredCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Coup de cœur</div>
            </div>
            <div className="admin-summary-card">
              <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>{villasCount}</div>
              <div style={{ fontSize: 11, color: 'var(--white-50)', marginTop: 2 }}>Villas & Dars</div>
            </div>
          </div>

          {/* Main Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <h2 className="admin-card__title">
                  Hébergements <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30)' }}>({filteredApartments.length})</span>
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par titre, ville..."
                    value={aptSearch}
                    onChange={e => setAptSearch(e.target.value)}
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

                {/* Filter Type */}
                <select
                  value={aptFilterType}
                  onChange={e => setAptFilterType(e.target.value)}
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
                  <option value="all">Tous les types</option>
                  <option value="Villa">Villa</option>
                  <option value="Maison d'hôtes (Dar)">Maison d'hôtes (Dar)</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Studio">Studio</option>
                </select>

                {/* Filter Status */}
                <select
                  value={aptFilterStatus}
                  onChange={e => setAptFilterStatus(e.target.value)}
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
                onClick={() => { setSelectedApartment(null); setIsModalOpen(true); }}
              >
                <FiPlus size={14} /> Ajouter un hébergement
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>HÉBERGEMENT</th>
                    <th>TYPE</th>
                    <th>VILLE</th>
                    <th>TARIF / NUIT</th>
                    <th>CAPACITÉ</th>
                    <th>EN LIGNE</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApartments.map(apt => (
                    <tr key={apt._id} className="admin-table__row">
                      <td>
                        <div className="admin-table__vehicle">
                          <div className="admin-table__car-img">
                            {apt.images?.[0] ? <img src={apt.images[0]} alt={apt.title} /> : <span>🏡</span>}
                          </div>
                          <div>
                            <div className="admin-table__car-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {apt.title}
                              {apt.featured && (
                                <span style={{ fontSize: 10, color: 'var(--gold)', background: 'var(--gold-pale)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                  ★ STAR
                                </span>
                              )}
                            </div>
                            <div className="admin-table__car-year">{apt.address || apt.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table__category">{apt.type}</td>
                      <td style={{ color: 'var(--white-70)', fontSize: 12.5 }}>{apt.city}</td>
                      <td>
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(apt.pricePerNight)}
                        </span>
                        {apt.cleaningFee > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                            +{fmtMoney(apt.cleaningFee)} ménage
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--white-70)', fontSize: 12 }}>
                        {apt.maxGuests} pers · {apt.bedrooms} ch
                      </td>
                      <td>
                        <Toggle
                          active={apt.isActive}
                          disabled={togglingAptId === apt._id}
                          onChange={() => handleToggleActive(apt)}
                        />
                      </td>
                      <td>
                        <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                          <a
                            href={`/appartements/${apt._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-table__action"
                            title="Voir sur le site client"
                          >
                            <FiExternalLink size={13} />
                          </a>
                          <button
                            className="admin-table__action"
                            title="Modifier"
                            onClick={() => { setSelectedApartment(apt); setIsModalOpen(true); }}
                          >
                            <FiEdit2 size={13} /> Modifier
                          </button>
                          <button
                            className="admin-table__action admin-table__action--danger"
                            title="Supprimer"
                            onClick={() => handleDelete(apt)}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredApartments.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--white-30)', padding: 36 }}>
                        Aucun hébergement ne correspond aux filtres sélectionnés.
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
                  Réservations Séjours <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--white-30)' }}>({filteredReservations.length})</span>
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch size={13} style={{ position: 'absolute', left: 10, color: 'var(--white-30)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par client, séjour, code..."
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
                    <th>HÉBERGEMENT</th>
                    <th>DATES DU SÉJOUR</th>
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
                        <div className="admin-table__car-year">{res.user?.email || res.user?.phone || '—'}</div>
                      </td>
                      <td>
                        <div className="admin-table__car-name">{res.apartment?.title || '—'}</div>
                        <div className="admin-table__car-year">{res.apartment?.city || ''}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--white-70)' }}>
                        <div>{fmtDate(res.checkInDate)} → {fmtDate(res.checkOutDate)}</div>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>{res.totalNights} nuits</div>
                      </td>
                      <td style={{ color: 'var(--white-70)', fontSize: 12 }}>
                        {res.adults || 1} ad. {res.children > 0 ? `· ${res.children} enf.` : ''}
                      </td>
                      <td>
                        <div style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          {fmtMoney(res.totalTTC || res.totalPrice)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--white-30)' }}>
                          Caution: {fmtMoney(res.depositAmount || 200)}
                        </div>
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
                          onClick={() => setResModal(res)}
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

      {/* ══════════ TAB 4: CALENDAR (Matches Voitures Calendar 100%) ══════════ */}
      {activeTab === 'calendar' && (
        <div className="dash-layout">
          <div className="dash-main">
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
                    Disponibilités des Hébergements
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
                  { color: '#4ade80', label: 'Disponible' },
                  { color: '#f97316', label: 'En attente' },
                  { color: '#f87171', label: 'Loué / Confirmé' },
                  { color: '#6b7280', label: 'Inactif / Hors ligne' },
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
                  <div className="admin-avail-row__car-col" style={{ width: 220, minWidth: 220 }}>
                    <span style={{ fontSize: 10, color: 'var(--white-30)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                      Hébergement
                    </span>
                  </div>
                  {DAYS.map(d => {
                    const parts = d.date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()
                    const dateNum = d.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
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
                    )
                  })}
                </div>

                {/* Apartment Rows */}
                {safeApartments.map(apt => (
                  <div key={apt._id} className="admin-avail-row" style={{ opacity: apt.isActive ? 1 : 0.45 }}>
                    <div className="admin-avail-row__car-col" style={{ width: 220, minWidth: 220 }}>
                      <div className="admin-avail-row__car-img">
                        {apt.images?.[0] ? <img src={apt.images[0]} alt={apt.title}/> : <span style={{ fontSize: 16 }}>🏡</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, overflow: 'hidden' }}>
                        <span className="admin-avail-row__car-name" style={{ maxWidth: 140 }} title={apt.title}>
                          {apt.title}
                        </span>
                        <span style={{ fontSize: 10.5, color: 'var(--white-50)' }}>
                          {apt.city} · {apt.type}
                        </span>
                      </div>
                    </div>

                    {DAYS.map(d => {
                      const { state, res, title } = dayStatusApartment(apt, safeReservations, d.date)
                      const COLOR = {
                        ok:       { bg: 'transparent',            dot: '#4ade80' },
                        pending:  { bg: 'rgba(249,115,22,0.09)',  dot: '#f97316' },
                        booked:   { bg: 'rgba(248,113,113,0.09)', dot: '#f87171' },
                        inactive: { bg: 'rgba(107,114,128,0.07)', dot: '#6b7280' },
                      }
                      const c = COLOR[state] || COLOR.ok

                      return (
                        <div
                          key={d.label}
                          className="admin-avail-row__day"
                          title={title}
                          style={{
                            background: d.isToday ? (state === 'ok' ? 'rgba(168,74,59,0.05)' : c.bg) : c.bg,
                            borderLeft: d.isToday ? '2px solid var(--gold)' : undefined,
                            cursor: res ? 'pointer' : 'default',
                          }}
                          onClick={() => res && setResModal(res)}
                        >
                          {state === 'ok' && (
                            <span className="avail-icon avail-icon--ok">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2.8">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </span>
                          )}
                          {state === 'pending' && (
                            <span className="avail-icon avail-icon--pending">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2.5">
                                <circle cx="12" cy="12" r="9"/>
                                <path d="M12 7v5l3 3"/>
                              </svg>
                            </span>
                          )}
                          {state === 'booked' && (
                            <span className="avail-icon avail-icon--unavailable">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2.5">
                                <circle cx="12" cy="12" r="9"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                              </svg>
                            </span>
                          )}
                          {state === 'inactive' && (
                            <span className="avail-icon" style={{ background: 'rgba(107,114,128,0.12)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.dot} strokeWidth="2.5">
                                <circle cx="12" cy="12" r="9"/>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                              </svg>
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 18px', borderTop: '1px solid var(--black-5)', display: 'flex', gap: 20, fontSize: 11.5, color: 'var(--white-50)', flexWrap: 'wrap' }}>
                <span>🏡 {safeApartments.length} hébergements</span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ {activeApartments} en ligne</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>⏳ {safeReservations.filter(r => r.status === 'pending' || r.status === 'recu').length} en attente</span>
                <span style={{ color: '#f87171', fontWeight: 600 }}>🔴 {confirmedCount} confirmées</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="dash-side">
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Prochains séjours</h3>
              </div>
              <div className="admin-reservations">
                {!upcomingStays.length ? (
                  <p style={{ textAlign: 'center', color: 'var(--white-30)', fontSize: 13, padding: '20px 16px' }}>
                    Aucune réservation à venir.
                  </p>
                ) : (
                  upcomingStays.map(r => {
                    const p = new Date(r.checkInDate)
                    return (
                      <div
                        key={r._id}
                        className="res-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setResModal(r)}
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
                            <ResBadge status={r.status}/>
                          </div>
                          <span className="res-item__car">{r.apartment?.title || 'Hébergement'}</span>
                          <span className="res-item__dates">
                            {fmtDate(r.checkInDate)} → {fmtDate(r.checkOutDate)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Actions rapides</h3>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="admin-btn admin-btn--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setSelectedApartment(null); setIsModalOpen(true); }}
                >
                  <FiPlus size={14} /> Ajouter un hébergement
                </button>
                <button
                  className="admin-btn admin-btn--outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setActiveTab('reservations')}
                >
                  <FiCalendar size={14} /> Voir toutes les réservations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ STAY RESERVATION MODAL ══════════ */}
      {resModal && (
        <div className="vm-overlay" onClick={e => e.target === e.currentTarget && setResModal(null)}>
          <div className="vm-modal" style={{ maxWidth: 520 }}>
            <div className="vm-header">
              <div>
                <h2 className="vm-title">📋 Réservation Séjour #{resModal._id?.slice(-6).toUpperCase()}</h2>
                <p style={{ fontSize: 12, color: 'var(--white-50)', margin: '3px 0 0' }}>
                  Créée le {new Date(resModal.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button className="vm-close" onClick={() => setResModal(null)}><FiX size={18}/></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Accommodation */}
              <div style={{ background: 'var(--black-3)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                <div style={{ fontSize: 11, color: 'var(--white-50)', textTransform: 'uppercase', fontWeight: 700 }}>Hébergement réservé</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>{resModal.apartment?.title}</div>
                <div style={{ fontSize: 12, color: 'var(--white-70)' }}>{resModal.apartment?.city} · {resModal.apartment?.type}</div>
              </div>

              {/* Client */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--black-3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--white-50)', textTransform: 'uppercase' }}>Client</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>
                    {resModal.user?.firstName} {resModal.user?.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--white-70)' }}>{resModal.user?.email}</div>
                </div>

                <div style={{ background: 'var(--black-3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--white-50)', textTransform: 'uppercase' }}>Téléphone</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginTop: 2 }}>
                    {resModal.user?.phone || 'Non renseigné'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--white-70)' }}>
                    {resModal.adults || 1} adulte(s) {resModal.children ? `· ${resModal.children} enfant(s)` : ''}
                  </div>
                </div>
              </div>

              {/* Dates & Financials */}
              <div style={{ background: 'var(--black-3)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--black-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--white-50)' }}>Dates du séjour :</span>
                  <strong style={{ color: 'var(--white)' }}>
                    {fmtDate(resModal.checkInDate)} → {fmtDate(resModal.checkOutDate)} ({resModal.totalNights} nuits)
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--white-50)' }}>Total séjour TTC :</span>
                  <strong style={{ color: 'var(--gold)', fontSize: 14 }}>{fmtMoney(resModal.totalTTC || resModal.totalPrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--white-50)' }}>Caution requise :</span>
                  <strong style={{ color: 'var(--white-70)' }}>{fmtMoney(resModal.depositAmount || 200)}</strong>
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
                  value={resModal.status}
                  onChange={e => handleUpdateResStatus(resModal._id, e.target.value)}
                >
                  <option value="recu">📥 Reçu</option>
                  <option value="pending">⏳ En attente</option>
                  <option value="confirmed">✅ Confirmée</option>
                  <option value="completed">🏁 Terminée</option>
                  <option value="cancelled">❌ Annulée</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button className="admin-btn admin-btn--primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setResModal(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ APARTMENT MODAL ══════════ */}
      {isModalOpen && (
        <ApartmentModal
          apartment={selectedApartment}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedApartment(null)
          }}
          onSaved={() => {
            setIsModalOpen(false)
            setSelectedApartment(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}
