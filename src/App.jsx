import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal/AuthModal'
import './index.css'
import './App.css'
import Home from './pages/Home/Home'
import SearchResults from './pages/SearchResults/SearchResults'
import VehicleDetail from './pages/VehicleDetail/VehicleDetail'
import Admin from './pages/Admin/Admin'
import Historique from './pages/Historique/Historique'
import VerifyEmail from './pages/VerifyEmail/VerifyEmail'
import Guide from './pages/Guide/Guide'
import Contact from './pages/Contact/Contact'
import ApartmentsList from './pages/Apartments/ApartmentsList'
import ApartmentDetail from './pages/Apartments/ApartmentDetail'
import ExcursionsList from './pages/Excursions/ExcursionsList'
import ExcursionDetail from './pages/Excursions/ExcursionDetail'
import Chauffeur from './pages/Chauffeur/Chauffeur'
import Wishlist from './pages/Wishlist/Wishlist'
import { WishlistProvider } from './context/WishlistContext'

/** Must be rendered inside AuthProvider */
function AdminRoute() {
  const { user, loading, openAuthModal } = useAuth()
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black, #fffff0)',
        color: 'var(--gold, #A84A3B)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Chargement de l'espace administration...</p>
        </div>
      </div>
    )
  }
  if (!user || user.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black, #fffff0)',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1.5px solid var(--black-5, #dad3c5)',
          borderRadius: '16px',
          padding: '36px 32px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(44, 62, 86, 0.08)'
        }}>
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ color: 'var(--blue, #2C3E56)', margin: '0 0 8px', fontSize: '20px', fontWeight: 800 }}>
            Accès Administrateur Requis
          </h2>
          <p style={{ color: 'var(--white-70, #4a525a)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
            {user
              ? `Le compte connecté (${user.email}) ne dispose pas des droits d'administrateur.`
              : "Veuillez vous connecter avec un compte administrateur pour accéder à cette interface."}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => openAuthModal('login')}
              style={{
                background: 'var(--gold, #A84A3B)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(168, 74, 59, 0.3)'
              }}
            >
              🔐 Se connecter en tant qu'administrateur
            </button>
            <a
              href="/"
              style={{
                color: 'var(--blue, #2C3E56)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '8px'
              }}
            >
              ← Retour au site public
            </a>
          </div>
        </div>
      </div>
    )
  }
  return <Admin />
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voitures" element={<SearchResults />} />
        <Route path="/voitures/:id" element={<VehicleDetail />} />
        <Route path="/appartements" element={<ApartmentsList />} />
        <Route path="/appartements/:id" element={<ApartmentDetail />} />
        <Route path="/excursions" element={<ExcursionsList />} />
        <Route path="/excursions/:id" element={<ExcursionDetail />} />
        <Route path="/transfer" element={<Chauffeur />} />
        <Route path="/chauffeur" element={<Navigate to="/transfer" replace />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/historique" element={<PrivateRoute><Historique /></PrivateRoute>} />
        <Route path="/favoris" element={<Wishlist />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModal />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
