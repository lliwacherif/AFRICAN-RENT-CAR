import { useLanguage } from '../../context/LanguageContext'
import './Hero.css'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="hero" id="accueil">
      <div className="hero__bg">
        <img src="/hero_background.png" alt="Voitures de luxe en Tunisie" className="hero__bg-img" />
        <div className="hero__overlay" />
      </div>
      <div className="hero__content container">
        <h1 className="hero__title">
          {t('hero.titleLine1', 'Louez la voiture ')}
          <span>{t('hero.titleSpan', 'parfaite')}</span>
          <br />
          {t('hero.titleLine2', 'en Tunisie')}
        </h1>
        <p className="hero__subtitle">
          {t('hero.subtitle', 'Des voitures de qualité, un service premium et des tarifs compétitifs pour tous vos trajets.')}
        </p>
      </div>
    </section>
  )
}
