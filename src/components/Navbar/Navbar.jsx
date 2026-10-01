import { useText } from '../../context/LanguageContext'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiUser, FiPhone, FiChevronDown, FiMenu, FiX, FiLogOut, FiGrid, FiClock } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import CurrencyToggle from '../CurrencyToggle/CurrencyToggle'
import './Navbar.css'

export default function Navbar() {
  const tr = useText()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const { user, openAuthModal, logout } = useAuth()
  const { lang, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const langRef = useRef(null)
  const isAdmin = user?.role === 'admin'

  const navLinks = [
    { key: 'accueil',      href: '/',              label: t('nav.accueil', 'Accueil') },
    { key: 'voitures',     href: '/voitures',      label: t('nav.voitures', 'Voitures') },
    { key: 'appartements', href: '/appartements',  label: t('nav.appartements', 'Hébergements') },
    { key: 'excursions',   href: '/excursions',    label: t('nav.excursions', 'Excursions') },
    { key: 'chauffeur',    href: '/transfer',      label: t('nav.chauffeur', 'Transfer') },
    { key: 'guide',        href: '/guide',         label: t('nav.guide', 'Guide') },
    { key: 'contact',      href: '/contact',       label: t('nav.contact', 'À Propos') },
  ]

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" title="African Rent Car">
          <img src="/logo.png" alt="African Rent Car" className="navbar__logo-img" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar__nav">
          {navLinks.map(link => (
            <Link
              key={link.key}
              to={link.href}
              className={`navbar__link ${location.pathname === link.href ? 'navbar__link--active' : ''}`}
            >
              {tr(link.label)}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="navbar__actions">
          {/* Currency Toggle */}
          <CurrencyToggle />

          {/* Language Selector Dropdown */}
          <div className="navbar__lang-wrap" ref={langRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="navbar__lang"
              onClick={() => setLangDropdownOpen(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <img
                src={lang === 'ar' ? '/Ar.png' : lang === 'en' ? '/En.svg' : '/Fr.png'}
                alt={tr(lang)}
                style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }}
              />
              <span>{tr(lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'Français')}</span>
              <FiChevronDown size={13} style={{ transform: langDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {langDropdownOpen && (
              <div
                className="navbar__lang-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #dad3c5',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(44,62,86,0.12)',
                  zIndex: 200,
                  overflow: 'hidden',
                  minWidth: 140,
                }}
              >
                <button
                  type="button"
                  className={`navbar__lang-opt ${lang === 'fr' ? 'active' : ''}`}
                  onClick={() => { setLanguage('fr'); setLangDropdownOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    border: 'none',
                    background: lang === 'fr' ? 'rgba(168,74,59,0.1)' : 'transparent',
                    color: lang === 'fr' ? '#A84A3B' : '#191c1f',
                    fontWeight: lang === 'fr' ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <img src="/Fr.png" alt={tr("Français")} style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
                  <span>{tr("Français")}</span>
                </button>
                <button
                  type="button"
                  className={`navbar__lang-opt ${lang === 'ar' ? 'active' : ''}`}
                  onClick={() => { setLanguage('ar'); setLangDropdownOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    border: 'none',
                    background: lang === 'ar' ? 'rgba(168,74,59,0.1)' : 'transparent',
                    color: lang === 'ar' ? '#A84A3B' : '#191c1f',
                    fontWeight: lang === 'ar' ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <img src="/Ar.png" alt="العربية" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
                  <span>العربية</span>
                </button>
                  <button
                  type="button"
                  className={`navbar__lang-opt ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => { setLanguage('en'); setLangDropdownOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    border: 'none',
                    background: lang === 'en' ? 'rgba(168,74,59,0.1)' : 'transparent',
                    color: lang === 'en' ? '#A84A3B' : '#191c1f',
                    fontWeight: lang === 'en' ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <img src="/En.svg" alt="English" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
                  <span>English</span>
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="navbar__user-menu">
              {isAdmin && (
                <Link to="/admin" className="navbar__admin-badge">
                  <FiGrid size={13} /> {t('nav.admin', 'Admin')}
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/historique"
                  className="navbar__admin-badge"
                  title={tr(t('nav.historique', 'Historique'))}
                  style={{ gap: 5 }}
                >
                  <FiClock size={13} /> {t('nav.historique', 'Historique')}
                </Link>
              )}
              <span className="navbar__user-name">
                <FiUser size={15} /> {tr(user.firstName || user.name || 'Client')}
              </span>
              <button
                className="navbar__user navbar__user--logout"
                onClick={handleLogout}
                title={tr(t('nav.logout', 'Déconnexion'))}
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="navbar__user" onClick={() => openAuthModal('login')} title={tr(t('nav.login', 'Se connecter'))}>
              <FiUser size={17} />
            </button>
          )}

          <a href="tel:+21627908060" className="navbar__phone">
            <FiPhone size={14} />
            <span>+216 27 908 060</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile">
          {(isAdmin
            ? [{ key: 'admin', label: t('nav.tableauDeBord', 'Dashboard'), href: '/admin' }, ...navLinks]
            : [...navLinks, { key: 'historique', label: `🕐 ${t('nav.historique', 'Historique')}`, href: '/historique' }]
          ).map(link => (
            <Link
              key={link.key}
              to={link.href}
              className="navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {tr(link.label)}
            </Link>
          ))}
          {user ? (
            <button
              className="navbar__mobile-link"
              onClick={() => { handleLogout(); setMobileOpen(false) }}
              style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <FiLogOut size={14} /> {t('nav.logout', 'Déconnexion')}
            </button>
          ) : (
            <button
              className="navbar__mobile-link"
              onClick={() => { openAuthModal('login'); setMobileOpen(false) }}
              style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <FiUser size={14} /> {t('nav.login', 'Se connecter')}
            </button>
          )}
          <a href="tel:+21627908060" className="navbar__mobile-phone">
            <FiPhone size={14} /> +216 27 908 060 / 20 834 429
          </a>
        </div>
      )}
    </header>
  )
}
