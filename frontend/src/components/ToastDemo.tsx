import { useToast } from '../utils/ToastContext'
import { useTheme } from '../utils/ThemeContext'

export function ToastDemo() {
  const { success, error, info, warning } = useToast()
  const { isDark, toggle } = useTheme()

  return (
    <div className={`toast-demo ${isDark ? 'dark' : 'light'}`}>
      <style>{`
        .toast-demo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 2rem;
          max-width: 800px;
          margin: 5rem auto;
        }

        .toast-demo.light {
          background: #f5f5f7;
        }

        .toast-demo.dark {
          background: #0f0f1e;
        }

        .demo-button {
          padding: 1rem;
          border: none;
          border-radius: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .demo-button-success {
          background: #10b981;
          color: white;
        }

        .demo-button-success:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .demo-button-error {
          background: #ef4444;
          color: white;
        }

        .demo-button-error:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .demo-button-info {
          background: #3b82f6;
          color: white;
        }

        .demo-button-info:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .demo-button-warning {
          background: #f59e0b;
          color: white;
        }

        .demo-button-warning:hover {
          background: #d97706;
          transform: translateY(-2px);
        }
      `}</style>

      <button 
        className="demo-button demo-button-success"
        onClick={() => success('✅ C\'est un succès!')}
      >
        Succès
      </button>

      <button 
        className="demo-button demo-button-error"
        onClick={() => error('❌ Erreur détectée!')}
      >
        Erreur
      </button>

      <button 
        className="demo-button demo-button-info"
        onClick={() => info('ℹ️ Information importante')}
      >
        Info
      </button>

      <button 
        className="demo-button demo-button-warning"
        onClick={() => warning('⚠️ Attention!')}
      >
        Alerte
      </button>

      <button 
        className="demo-button demo-button-success"
        onClick={() => {
          success('1️⃣ Premier')
          setTimeout(() => success('2️⃣ Deuxième'), 200)
          setTimeout(() => success('3️⃣ Troisième'), 400)
        }}
      >
        Multiples
      </button>

      <button 
        className="demo-button demo-button-info"
        onClick={toggle}
      >
        {isDark ? '☀️ Clair' : '🌙 Sombre'}
      </button>
    </div>
  )
}
