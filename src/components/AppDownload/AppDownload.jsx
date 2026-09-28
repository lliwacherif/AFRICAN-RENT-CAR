import { useLanguage } from '../../context/LanguageContext'
import './AppDownload.css'

export default function AppDownload() {
  const { t } = useLanguage()

  return (
    <section className="appdownload">
      <div className="container">
        <div className="appdownload__inner">
          {/* Left content */}
          <div className="appdownload__left">
            <h2 className="appdownload__title">{t('appDownload.title', 'Téléchargez notre application')}</h2>
            <p className="appdownload__desc">
              {t('appDownload.desc', 'Réservez, gérez et profitez de vos locations où que vous soyez.')}
            </p>

            <div className="appdownload__buttons">
              <a href="#" className="appdownload__store-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="appdownload__store-text">
                  <span className="appdownload__store-sub">{t('appDownload.downloadOn', 'Télécharger sur')}</span>
                  <span className="appdownload__store-name">App Store</span>
                </div>
              </a>

              <a href="#" className="appdownload__store-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
                </svg>
                <div className="appdownload__store-text">
                  <span className="appdownload__store-sub">{t('appDownload.availableOn', 'Disponible sur')}</span>
                  <span className="appdownload__store-name">Google Play</span>
                </div>
              </a>
            </div>

            {/* QR Code */}
            <div className="appdownload__qr">
              <div className="appdownload__qr-box">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect width="64" height="64" fill="white"/>
                  <rect x="4" y="4" width="20" height="20" rx="2" stroke="#0d1b3e" strokeWidth="3" fill="none"/>
                  <rect x="9" y="9" width="10" height="10" rx="1" fill="#0d1b3e"/>
                  <rect x="40" y="4" width="20" height="20" rx="2" stroke="#0d1b3e" strokeWidth="3" fill="none"/>
                  <rect x="45" y="9" width="10" height="10" rx="1" fill="#0d1b3e"/>
                  <rect x="4" y="40" width="20" height="20" rx="2" stroke="#0d1b3e" strokeWidth="3" fill="none"/>
                  <rect x="9" y="45" width="10" height="10" rx="1" fill="#0d1b3e"/>
                  <rect x="28" y="4" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="34" y="4" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="28" y="10" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="28" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="34" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="40" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="46" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="52" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="28" y="34" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="40" y="34" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="52" y="34" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="28" y="40" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="34" y="40" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="46" y="40" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="28" y="46" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="40" y="46" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="46" y="46" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="52" y="46" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="28" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="34" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="46" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="52" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="4" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="10" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="16" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="22" y="28" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="16" y="34" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="4" y="34" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="10" y="40" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="22" y="40" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="4" y="46" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="16" y="46" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="4" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="10" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="22" y="52" width="4" height="4" fill="#0d1b3e"/>
                  <rect x="34" y="16" width="4" height="4" fill="#0d1b3e"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Phone mockups */}
          <div className="appdownload__right">
            <img
              src="/app_mockup.png"
              alt="Application mobile African Rent Car"
              className="appdownload__mockup"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
