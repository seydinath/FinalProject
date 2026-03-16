# â³ LOADING STATES - GUIDE D'INTÃ‰GRATION

## Vue d'ensemble

Les **Loading States** ont Ã©tÃ© entiÃ¨rement intÃ©grÃ©s dans le projet avec 3 composants clÃ©s:

### ðŸŽ¯ Composants Principaux

1. **Skeleton Screens** - Placeholder pendant le chargement  
2. **Spinners AnimÃ©s** - Plusieurs tailles disponibles
3. **Progress Bars** - Suivi de la progression avec animations

---

## ðŸ“ Fichiers CrÃ©Ã©s

### Hooks
- **`hooks/useLoadingState.ts`** - Hook personnalisÃ© pour gÃ©rer les Ã©tats de chargement
  - `useLoadingState()` - Gestion simple du loading
  - `useApiLoader()` - Hook pour les appels API
  - `useDelayedLoading()` - Affiche le spinner aprÃ¨s dÃ©lai (Ã©vite le flickering)

### Composants
Les composants Ã©taient dÃ©jÃ  dans `Loading.tsx` mais sont maintenant utilisÃ©s:
- `SkeletonLoader` - Skeleton unique  
- `SkeletonCard` - Skeleton pour cartes
- `SkeletonGrid` - Grille de skeletons responsives
- `LoadingSpinner` - Spinner simple (small/medium/large)
- `LoadingOverlay` - Overlay fullscreen au-dessus de tout
- `LoadingButton` - Bouton avec spinner intÃ©grÃ©
- `ProgressBar` - Barre de progression animÃ©e

### Pages DÃ©monstratives
- **`pages/LoadingStatesDemo.tsx`** - Page complÃ¨te avec 8 dÃ©mos interactives
- **`styles/demo.css`** - Styles pour la page de dÃ©mo

### IntÃ©grations dans Pages Existantes
- **`components/JobsList.tsx`** - Skeleton screens + Progress bar au chargement
- **`pages/AuthPage.tsx`** - LoadingButton sur le formulaire

---

## ðŸš€ Utilisation Rapide

### 1. Hook useLoadingState

```tsx
import { useLoadingState } from '@/hooks/useLoadingState'

function MyComponent() {
  const { 
    isLoading,      // boolean
    progress,       // 0-100
    startLoading,   // () => void
    stopLoading,    // () => void
    setLoadingProgress   // (value: number) => void
  } = useLoadingState({ delay: 300, minDuration: 300 })

  const handleClick = async () => {
    startLoading()
    setLoadingProgress(25)
    // API call...
    setLoadingProgress(75)
    stopLoading()
  }

  return <button onClick={handleClick}>Click</button>
}
```

### 2. LoadingButton

```tsx
import { LoadingButton } from '@/components/Loading'

<LoadingButton loading={isLoading} onClick={handleSubmit}>
  Envoyer
</LoadingButton>
```

### 3. Skeleton Screens

```tsx
import { SkeletonGrid, SkeletonCard } from '@/components/Loading'

{isLoading ? (
  <SkeletonGrid count={4} />
) : (
  <div>Contenu chargÃ©</div>
)}
```

### 4. Progress Bar

```tsx
import { ProgressBar } from '@/components/Loading'

<ProgressBar 
  value={progress} 
  max={100} 
  showLabel={true}
  animated={true}
/>
```

### 5. Spinner Seul

```tsx
import { LoadingSpinner } from '@/components/Loading'

<LoadingSpinner size="large" text="Chargement..." />
```

### 6. Delayed Loading (pour Ã©viter le flickering)

```tsx
import { useDelayedLoading } from '@/hooks/useLoadingState'

function MyComponent() {
  const { showLoading, startLoading, stopLoading } = useDelayedLoading(500)

  return showLoading && <LoadingSpinner />
}
```

---

## ðŸ“Š IntÃ©grations Actuelles

### JobsList
```tsx
// Skeleton screens pendant le chargement
{isLoading ? (
  <>
    <ProgressBar value={progress} />
    <SkeletonGrid count={4} />
  </>
) : (
  <div className="jobs-grid">
    {/* Jobs */}
  </div>
)}
```

### AuthPage
```tsx
// Bouton avec loading state
<LoadingButton loading={isLoading} className="btn-submit">
  {isLogin ? t('nav.signIn') : t('signup.create')}
</LoadingButton>
```

---

## ðŸŽ¨ Cas d'Usage Courants

### Upload de Fichier
```tsx
const loader = useLoadingState()
const [file, setFile] = useState<File | null>(null)

const handleUpload = async () => {
  loader.startLoading()
  
  // Uploads par chunks
  const chunks = Math.ceil(file!.size / CHUNK_SIZE)
  for (let i = 0; i < chunks; i++) {
    await uploadChunk(i)
    loader.setLoadingProgress((i / chunks) * 100)
  }
  
  loader.stopLoading()
}

return (
  <>
    {loader.isLoading && (
      <ProgressBar value={loader.progress} showLabel={true} />
    )}
    <LoadingButton loading={loader.isLoading} onClick={handleUpload}>
      Uploader
    </LoadingButton>
  </>
)
```

### Appel API
```tsx
async function MyComponent() {
  const { isLoading, data, error, load } = useApiLoader(
    async () => {
      const res = await fetch('/api/jobs')
      return res.json()
    }
  )

  return (
    <>
      <button onClick={load}>Charger les donnÃ©es</button>
      {isLoading && <SkeletonGrid count={4} />}
      {error && <div>{error}</div>}
      {data && <JobsList jobs={data} />}
    </>
  )
}
```

### Processus Multi-Ã‰tapes
```tsx
const loader = useLoadingState()

const handleMultiStep = async () => {
  loader.startLoading()
  
  // Ã‰tape 1: Validation
  loader.setLoadingProgress(33)
  await validateData()
  
  // Ã‰tape 2: Traitement
  loader.setLoadingProgress(66)
  await processData()
  
  // Ã‰tape 3: Sauvegarde
  loader.setLoadingProgress(100)
  await saveData()
  
  loader.stopLoading()
}

return (
  <>
    <ProgressBar value={loader.progress} animated={true} />
    {loader.progress >= 33 && <span>âœ“ Ã‰tape 1</span>}
    {loader.progress >= 66 && <span>âœ“ Ã‰tape 2</span>}
    {loader.progress >= 100 && <span>âœ“ Ã‰tape 3</span>}
  </>
)
```

### Avec Toast Notifications
```tsx
import { useToast } from '@/utils/ToastContext'

function MyForm() {
  const { success, error } = useToast()
  const loader = useLoadingState()

  const handleSubmit = async () => {
    loader.startLoading()
    try {
      await submitForm()
      loader.stopLoading()
      success('Formulaire envoyÃ© avec succÃ¨s!')
    } catch (err) {
      loader.setLoadingError('Erreur lors de l\'envoi')
      error('Une erreur est survenue')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* champs */}
        <LoadingButton loading={loader.isLoading}>
          Envoyer
        </LoadingButton>
      </form>
      {loader.error && <div className="error">{loader.error}</div>}
    </>
  )
}
```

---

## ðŸŽ¯ Configuration des Hooks

### useLoadingState Options
```tsx
const loader = useLoadingState({
  delay: 300,        // DÃ©lai avant de montrer le loading (en ms)
  minDuration: 300   // DurÃ©e minimale avant de pouvoir arrÃªter (en ms)
})
```

### useDelayedLoading Options
```tsx
const { showLoading } = useDelayedLoading(500) // 500ms de dÃ©lai
```

---

## ðŸŽ¨ CSS Variables pour Styles

```css
/* Voir dark-mode-colors.css */
--color-primary: #4ecdc4
--shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.15)

/* Animations */
@keyframes shimmer { ... }
@keyframes spin { ... }
@keyframes progressFlow { ... }
```

---

## ðŸ“± Responsive

Tous les composants sont 100% responsives:
- Les skeletons grids ajustent les colonnes
- Les spinners restent visibles sur mobile
- Les progress bars sont full-width
- Les boutons sont tactiles

---

## âœ… Checklist d'IntÃ©gration

Quand vous intÃ©grez les loading states:

- âœ… Utiliser `useLoadingState` pour les Ã©tats simples
- âœ… Utiliser `useDelayedLoading` si le chargement est souvent < 500ms
- âœ… Afficher `SkeletonGrid` au lieu de contenu vide
- âœ… Montrer `ProgressBar` pour les uploads/exports
- âœ… Utiliser `LoadingButton` pour les formulaires
- âœ… Combiner avec `useToast` pour les notifications
- âœ… Penser Ã  l'accessibilitÃ© (aria-busy, etc.)
- âœ… Ã‰viter le flickering avec delayed loading

---

## ðŸ” Page de DÃ©mo

Pour voir tous les exemples en action, visiter:
- **Route:** `/loading-demo` (Ã  ajouter dans App.tsx aprÃ¨s)
- **Fichier:** `LoadingStatesDemo.tsx`

La page contient 8 dÃ©mos interactives:
1. Loading Buttons
2. Skeleton Screens  
3. Progress Bars
4. Spinners (3 tailles)
5. Multi-Step Loading
6. Skeleton Cards
7. Loading Overlay
8. Skeleton Grid

---

## ðŸ“ˆ Performance

- âœ… Skeleton screens rÃ©duisent le CLS (Cumulative Layout Shift)
- âœ… Progress bars donnent un feedback immÃ©diat
- âœ… Delayed loading Ã©vite le flickering inutile
- âœ… CSS animations performantes (GPU-accelerated)
- âœ… Composants lÃ©gers avec animations CSS pures

---

## ðŸš€ Prochaines IntÃ©grations

Ã€ intÃ©grer dans d'autres pages:
- `DashboardPage` - Loading pour charger les options
- `TalentSearchPage` - Skeleton grid pour les rÃ©sultats de recherche  
- `JobSeekerProfilePage` - Progress bar pour l'upload CV
- API calls rÃ©els - Remplacer les dÃ©lais simulÃ©s par de vrais calls

