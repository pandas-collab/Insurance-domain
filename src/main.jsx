import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[App Runtime Error]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '680px',
          margin: '40px auto',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '12px',
          color: '#9f1239',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Application Rendering Error</h2>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#881337', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected runtime error occurred while rendering this component.'}
          </p>
          <pre style={{
            background: '#ffe4e6',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            overflow: 'auto',
            maxHeight: '220px',
            color: '#be123c',
            border: '1px solid #fda4af'
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            Reload Preview
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)
