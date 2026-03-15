import { ToastDemo } from '../components/ToastDemo'
import { useTheme } from '../utils/ThemeContext'

export function ToastTestPage() {
  const { isDark } = useTheme()

  return (
    <div className={`test-page ${isDark ? 'dark' : 'light'}`}>
      <style>{`
        .test-page {
          min-height: 100vh;
          padding-top: 70px;
        }

        .test-page.dark {
          background: #0f0f1e;
          color: white;
        }

        .test-page.light {
          background: #f5f5f7;
          color: black;
        }

        .test-header {
          text-align: center;
          padding: 2rem;
        }

        .test-header h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem;
        }

        .test-header p {
          opacity: 0.7;
          margin: 0;
        }
      `}</style>

      <div className="test-header">
        <h1>🔔 Toast Notifications Demo</h1>
        <p>Clique sur un bouton pour voir une notification</p>
      </div>

      <ToastDemo />
    </div>
  )
}
