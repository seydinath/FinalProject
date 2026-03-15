import { useState } from 'react'
import { useLoadingState, useDelayedLoading } from '../hooks/useLoadingState'
import {
  SkeletonCard,
  SkeletonGrid,
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  ProgressBar
} from '../components/Loading'
import { useToast } from '../utils/ToastContext'
import '../styles/demo.css'

export function LoadingStatesDemo() {
  const { success } = useToast()
  const [showOverlay, setShowOverlay] = useState(false)
  
  // Demo 1: Simple Loading Button
  const buttonLoader = useLoadingState()
  const handleButtonClick = async () => {
    buttonLoader.startLoading()
    await new Promise(resolve => setTimeout(resolve, 2000))
    buttonLoader.stopLoading()
    success('Opération complétée! ✓')
  }

  // Demo 2: Progress Bar with Simulated Upload
  const uploadLoader = useLoadingState()
  const handleSimulateUpload = async () => {
    uploadLoader.startLoading()
    uploadLoader.setLoadingProgress(0)
    
    const intervals = [10, 25, 40, 60, 75, 85, 95, 100]
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      uploadLoader.setLoadingProgress(intervals[i])
    }
    
    uploadLoader.stopLoading()
    success('Fichier uploadé avec succès! 🎉')
  }

  // Demo 3: Skeleton Loading Delayed
  const skeletonLoader = useDelayedLoading(600)
  const handleLoadContent = () => {
    if (skeletonLoader.isLoading) return
    skeletonLoader.startLoading()
    setTimeout(() => skeletonLoader.stopLoading(), 2500)
  }

  // Demo 4: Multiple Spinners
  const multiLoader = useLoadingState()
  const handleMultiSubmit = async () => {
    multiLoader.startLoading()
    multiLoader.setLoadingProgress(0)
    
    // Simulate multi-step process
    await new Promise(resolve => setTimeout(resolve, 600))
    multiLoader.setLoadingProgress(33)
    
    await new Promise(resolve => setTimeout(resolve, 600))
    multiLoader.setLoadingProgress(66)
    
    await new Promise(resolve => setTimeout(resolve, 600))
    multiLoader.setLoadingProgress(100)
    multiLoader.stopLoading()
    success('Processus multi-étapes complété! ✓')
  }

  return (
    <div className="loading-states-demo">
      <header className="demo-header fade-in-up">
        <h1>⏳ Loading States Demo</h1>
        <p>Démonstration complète des États de Chargement</p>
      </header>

      <div className="demo-grid">
        {/* LOADING BUTTONS */}
        <section className="demo-section slide-in-left">
          <h2>1. Loading Buttons</h2>
          <div className="demo-content">
            <LoadingButton
              loading={buttonLoader.isLoading}
              onClick={handleButtonClick}
            >
              Cliquez pour charger (2s)
            </LoadingButton>
            <p className="demo-description">
              Simule une opération asynchrone avec spinner intégré
            </p>
          </div>
        </section>

        {/* SKELETON SCREENS */}
        <section className="demo-section slide-in-right">
          <h2>2. Skeleton Screens</h2>
          <div className="demo-content">
            <button 
              onClick={handleLoadContent}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                background: '#4ecdc4',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Charger le contenu
            </button>
            
            <div style={{ marginTop: '20px' }}>
              {skeletonLoader.showLoading ? (
                <SkeletonGrid count={2} />
              ) : (
                <div style={{ opacity: 0.7 }}>✓ Contenu chargé</div>
              )}
            </div>
            <p className="demo-description">
              Affiche les skeleton screens après 600ms de délai
            </p>
          </div>
        </section>

        {/* PROGRESS BARS */}
        <section className="demo-section scale-in">
          <h2>3. Progress Bars</h2>
          <div className="demo-content">
            <LoadingButton
              loading={uploadLoader.isLoading}
              onClick={handleSimulateUpload}
            >
              Simuler Upload (3s)
            </LoadingButton>
            
            {uploadLoader.isLoading && (
              <div style={{ marginTop: '20px' }}>
                <ProgressBar 
                  value={uploadLoader.progress} 
                  max={100} 
                  showLabel={true} 
                  animated={true}
                />
              </div>
            )}
            <p className="demo-description">
              Progress bar animée avec progression étapées
            </p>
          </div>
        </section>

        {/* SPINNERS */}
        <section className="demo-section fade-in-up">
          <h2>4. Spinners</h2>
          <div className="demo-content">
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '20px' }}>
              <div className="spinner-demo">
                <LoadingSpinner size="small" />
                <label>Small</label>
              </div>
              <div className="spinner-demo">
                <LoadingSpinner size="medium" />
                <label>Medium</label>
              </div>
              <div className="spinner-demo">
                <LoadingSpinner size="large" />
                <label>Large</label>
              </div>
            </div>
            <p className="demo-description">
              3 tailles différentes de spinners animés
            </p>
          </div>
        </section>

        {/* MULTI-STEP LOADING */}
        <section className="demo-section slide-in-right">
          <h2>5. Multi-Step Loading</h2>
          <div className="demo-content">
            <LoadingButton
              loading={multiLoader.isLoading}
              onClick={handleMultiSubmit}
            >
              Démarrer Processus (2s)
            </LoadingButton>
            
            {multiLoader.isLoading && (
              <div style={{ marginTop: '20px' }}>
                <ProgressBar 
                  value={multiLoader.progress} 
                  max={100} 
                  showLabel={true} 
                  animated={true}
                />
                <div className="progress-steps">
                  <div className={`step ${multiLoader.progress >= 33 ? 'done' : ''}`}>
                    <span>1. Init</span>
                  </div>
                  <div className={`step ${multiLoader.progress >= 66 ? 'done' : ''}`}>
                    <span>2. Process</span>
                  </div>
                  <div className={`step ${multiLoader.progress >= 100 ? 'done' : ''}`}>
                    <span>3. Finish</span>
                  </div>
                </div>
              </div>
            )}
            <p className="demo-description">
              Processus en 3 étapes avec progress bar et étapes visuelles
            </p>
          </div>
        </section>

        {/* SKELETON CARDS */}
        <section className="demo-section slide-in-left">
          <h2>6. Skeleton Cards</h2>
          <div className="demo-content">
            <SkeletonCard />
            <SkeletonCard />
            <p className="demo-description">
              Cartes skeleton pour lister les contenus
            </p>
          </div>
        </section>

        {/* LOADING OVERLAY */}
        <section className="demo-section fade-in-down">
          <h2>7. Loading Overlay</h2>
          <div className="demo-content">
            <LoadingButton
              loading={showOverlay}
              onClick={() => {
                setShowOverlay(true)
                setTimeout(() => setShowOverlay(false), 3000)
              }}
            >
              Montrer Overlay (3s)
            </LoadingButton>
            <p className="demo-description">
              Overlay de chargement fullscreen avec spinner
            </p>
          </div>
        </section>

        {/* SKELETON GRID */}
        <section className="demo-section bounce">
          <h2>8. Skeleton Grid</h2>
          <div className="demo-content">
            <SkeletonGrid count={3} />
            <p className="demo-description">
              Grille de skeleton cards responsives
            </p>
          </div>
        </section>
      </div>

      {/* USAGE EXAMPLES */}
      <section className="demo-usage">
        <h2>📖 Exemples d'Utilisation</h2>
        
        <div className="code-example">
          <h3>1. Hook useLoadingState</h3>
          <pre><code>{`const { isLoading, progress, startLoading, stopLoading, setLoadingProgress } = useLoadingState()

// Dans un composant:
const handleClick = async () => {
  startLoading()
  setLoadingProgress(25)
  // API call...
  stopLoading()
}`}</code></pre>
        </div>

        <div className="code-example">
          <h3>2. LoadingButton</h3>
          <pre><code>{`<LoadingButton loading={isLoading} onClick={handleSubmit}>
  Envoyer
</LoadingButton>`}</code></pre>
        </div>

        <div className="code-example">
          <h3>3. Skeleton Screens</h3>
          <pre><code>{`{isLoading ? (
  <SkeletonGrid count={4} />
) : (
  <JobsList jobs={jobs} />
)}`}</code></pre>
        </div>

        <div className="code-example">
          <h3>4. Progress Bar</h3>
          <pre><code>{`<ProgressBar 
  value={uploadProgress} 
  max={100} 
  showLabel={true} 
  animated={true}
/>`}</code></pre>
        </div>
      </section>

      {/* LOADING OVERLAY */}
      {showOverlay && (
        <LoadingOverlay text="Veuillez patienter..." />
      )}
    </div>
  )
}
