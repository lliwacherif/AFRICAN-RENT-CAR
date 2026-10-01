import { useText } from '../../context/LanguageContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin, FiSend, FiFacebook, FiInstagram, FiLinkedin, FiTwitter } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import './Footer.css'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const tr = useText()

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { t } = useLanguage()

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 4000)
  }

  const infoList = [
    t('footer.terms', 'Conditions générales'),
    t('footer.privacy', 'Politique de confidentialité'),
    t('footer.faq', 'FAQ'),
    t('footer.guide', 'Guide de location'),
  ]

  return (
    <footer className="footer">
      <div className="footer__top container">
        {/* Brand column */}
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__logo" title="African Rent Car">
            <img src="/logo.png" alt="African Rent Car" style={{ height: 58, objectFit: 'contain' }} />
          </Link>
          <p className="footer__brand-desc">
            {t('footer.brandDesc', 'Votre partenaire de confiance pour la location de voitures en Tunisie.')}
          </p>
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer__social" aria-label="Facebook"><FiFacebook size={16} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer__social" aria-label="Instagram"><FiInstagram size={16} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer__social" aria-label="Twitter"><FiTwitter size={16} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer__social" aria-label="LinkedIn"><FiLinkedin size={16} /></a>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.usefulLinks', 'Liens utiles')}</h4>
          <ul className="footer__links">
            <li><Link to="/" className="footer__link">{t('footer.home', 'Accueil')}</Link></li>
            <li><Link to="/voitures" className="footer__link">{t('footer.cars', 'Voitures')}</Link></li>
            <li><Link to="/voitures?sortBy=pricePerDay&sortOrder=asc" className="footer__link">{t('footer.offers', 'Offres spéciales')}</Link></li>
            <li><Link to="/voitures" className="footer__link">{t('footer.allCategories', 'Toutes les catégories')}</Link></li>
          </ul>
        </div>

        {/* Informations */}
        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.information', 'Informations')}</h4>
          <ul className="footer__links">
            {infoList.map(l => (
              <li key={l}><span className="footer__link footer__link--text">{tr(l)}</span></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.contact', 'Contact')}</h4>
          <ul className="footer__contact-list">
            <li className="footer__contact-item" style={{ alignItems: 'flex-start' }}>
              <FiPhone size={13} style={{ marginTop: 3 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <a href="tel:+21627908060" className="footer__link">+216 27 908 060</a>
                <a href="tel:+21620834429" className="footer__link">+216 20 834 429</a>
              </div>
            </li>
            <li className="footer__contact-item">
              <FiMail size={13} />
              <a href="mailto:bensalem.rentalcar@gmail.com" className="footer__link">bensalem.rentalcar@gmail.com</a>
            </li>
            <li className="footer__contact-item">
              <FiMapPin size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="footer__address">Avenue Habib Bourguiba<br />{tr("Bizerte 7000, Tunisie")}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.newsletter', 'Newsletter')}</h4>
          <p className="footer__newsletter-desc">{t('footer.newsletterDesc', 'Recevez nos offres et actualités')}</p>
          {sent ? (
            <p style={{ color: '#4ade80', fontSize: 13, marginTop: 8 }}>{t('footer.subscribedMsg', '✓ Merci, vous êtes abonné !')}</p>
          ) : (
            <form className="footer__newsletter" onSubmit={handleNewsletter}>
              <input
                type="email"
                className="footer__newsletter-input"
                placeholder={tr(t('footer.emailPlaceholder', 'Votre email'))}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="footer__newsletter-btn" aria-label={tr(t('footer.subscribeBtn', "S'abonner"))}>
                <FiSend size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p className="footer__copyright">© {tr(YEAR)} African Rent Car. {t('footer.copyright', 'Tous droits réservés.')}</p>
        </div>
      </div>
    </footer>
  )
}
