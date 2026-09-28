import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { vehiclesService } from '../../services/vehiclesService'
import { useLanguage } from '../../context/LanguageContext'
import { useCurrency } from '../../context/CurrencyContext'
import './CarCategories.css'

const CATEGORY_IMAGES = {
  'Économique': '/car_hyundai.png',
  'Compacte': '/car_vw_golf.png',
  'Berline': '/car_berline.png',
  'SUV': '/car_suv.png',
  'Luxe': '/car_luxe.png',
  'Monospace': '/car_citadine.png',
  'Utilitaire': '/car_utilitaire.png',
}

const CATEGORY_NAMES_AR = {
  'Économique': 'اقتصادية',
  'Compacte': 'مدمجة',
  'Berline': 'عائلية',
  'SUV': 'سيارات رياضية SUV',
  'Luxe': 'فاخرة',
  'Monospace': 'عائلية كبيرة',
  'Utilitaire': 'سيارات نفعية',
}

const CATEGORY_ORDER = ['Économique', 'Compacte', 'Berline', 'SUV', 'Luxe', 'Monospace', 'Utilitaire']

export default function CarCategories() {
  const sliderRef = useRef(null)
  const navigate = useNavigate()
  const { t, isRtl } = useLanguage()
  const { formatPrice } = useCurrency()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vehiclesService.getAll({ limit: 50, page: 1 })
      .then(data => {
        const vehicles = data.vehicles || []
        const map = {}
        for (const v of vehicles) {
          if (!map[v.category]) {
            map[v.category] = { minPrice: v.pricePerDay, image: v.images?.[0] || null }
          } else {
            if (v.pricePerDay < map[v.category].minPrice) map[v.category].minPrice = v.pricePerDay
            if (!map[v.category].image && v.images?.[0]) map[v.category].image = v.images[0]
          }
        }
        const cats = CATEGORY_ORDER
          .filter(name => map[name])
          .map(name => ({
            name,
            minPrice: map[name].minPrice,
            image: map[name].image || CATEGORY_IMAGES[name] || null,
          }))
        setCategories(cats)
      })
      .catch(() => {
        setCategories(CATEGORY_ORDER.map(name => ({ name, minPrice: null, image: CATEGORY_IMAGES[name] })))
      })
      .finally(() => setLoading(false))
  }, [])

  const scroll = (dir) => {
    if (sliderRef.current) {
      // In RTL mode, scrolling directions are reversed
      const delta = isRtl ? -dir * 220 : dir * 220
      sliderRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    }
  }

  return (
    <section className="categories" id="voitures">
      <div className="container">
        <div className="categories__header">
          <h2 className="categories__title">{t('categories.title', 'Nos catégories populaires')}</h2>
          <button
            className="categories__view-all"
            onClick={() => navigate('/voitures')}
          >
            {t('categories.viewAll', 'Voir toutes les voitures')}
          </button>
        </div>

        <div className="categories__slider-wrap">
          <button className="categories__arrow categories__arrow--left" onClick={() => scroll(-1)} aria-label={t('categories.prev', 'Précédent')}>
            <FiChevronLeft size={20} />
          </button>

          <div className="categories__slider" ref={sliderRef}>
            {loading
              ? [1,2,3,4,5].map(i => (
                  <div key={i} className="categories__card categories__card--skeleton" />
                ))
              : categories.map(cat => (
                  <div
                    key={cat.name}
                    className="categories__card"
                    onClick={() => navigate(`/voitures?category=${encodeURIComponent(cat.name)}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="categories__card-img-wrap">
                      {cat.image
                        ? <img src={cat.image} alt={cat.name} className="categories__card-img" />
                        : <span style={{ fontSize: 40 }}>🚗</span>
                      }
                    </div>
                    <div className="categories__card-info">
                      <h3 className="categories__card-name">
                        {isRtl ? (CATEGORY_NAMES_AR[cat.name] || cat.name) : cat.name}
                      </h3>
                      <p className="categories__card-price">
                        {cat.minPrice != null
                          ? `${t('categories.from', 'À partir de')} ${formatPrice(cat.minPrice, isRtl)} / ${t('searchResults.day', 'jour')}`
                          : t('categories.priceOnDemand', 'Prix sur demande')}
                      </p>
                    </div>
                  </div>
                ))
            }
          </div>

          <button className="categories__arrow categories__arrow--right" onClick={() => scroll(1)} aria-label={t('categories.next', 'Suivant')}>
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
