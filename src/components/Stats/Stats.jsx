import { useState, useEffect } from 'react'
import { vehiclesService } from '../../services/vehiclesService'
import { useLanguage } from '../../context/LanguageContext'
import './Stats.css'

const ICONS = {
  clients: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 26c0-4 3.6-7 8-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="22" cy="10" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M22 19c4.4 0 8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14 19c4.4 0 8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  vehicles: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M3 20H29M5 20L8 13C9 10.5 11 9 14 9H18C21 9 23 10.5 24 13L27 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="22.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="23" cy="22.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  agencies: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="12" width="24" height="16" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 12l14-8 14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="12" y="20" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="7" y="16" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="20" y="16" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  payment: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L6 8v8c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V8L16 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M11 16l3.5 3.5L21 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export default function Stats() {
  const { t } = useLanguage()
  const [counts, setCounts] = useState({ total: null, available: null })

  useEffect(() => {
    vehiclesService.getAll({ limit: 1, page: 1 })
      .then(data => setCounts({ total: data.pagination?.total ?? null }))
      .catch(() => {})
  }, [])

  const stats = [
    {
      id: 'clients',
      value: '+5 000',
      label: t('stats.clients', 'Clients satisfaits'),
      icon: ICONS.clients,
    },
    {
      id: 'vehicles',
      value: counts.total !== null ? `${counts.total}` : '—',
      label: t('stats.fleet', 'Véhicules dans notre flotte'),
      icon: ICONS.vehicles,
    },
    {
      id: 'agencies',
      value: '12',
      label: t('stats.agencies', 'Agences en Tunisie'),
      icon: ICONS.agencies,
    },
    {
      id: 'payment',
      value: '100%',
      label: t('stats.secured', 'Paiement sécurisé'),
      icon: ICONS.payment,
    },
  ]

  return (
    <section className="stats">
      <div className="stats__inner container">
        {stats.map(s => (
          <div key={s.id} className="stats__item">
            <div className="stats__icon">{s.icon}</div>
            <div className="stats__text">
              <span className="stats__value">{s.value}</span>
              <span className="stats__label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
