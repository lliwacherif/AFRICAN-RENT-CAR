import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL REACT RENDER ERROR:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '800px',
          margin: '40px auto',
          background: '#ffffff',
          border: '2px solid #A84A3B',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(168, 74, 59, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2 style={{ color: '#A84A3B', margin: '0 0 12px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Une erreur inattendue est survenue
          </h2>
          <p style={{ color: '#4a525a', fontSize: '14px', marginBottom: '16px' }}>
            Détails techniques de l'erreur :
          </p>
          <pre style={{
            background: '#f8f7ee',
            border: '1px solid #ebe6dc',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            color: '#dc2626',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#A84A3B',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              🔄 Recharger la page
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
              style={{
                background: '#2C3E56',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              🏠 Réinitialiser et aller à l'accueil
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <LanguageProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </LanguageProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)

