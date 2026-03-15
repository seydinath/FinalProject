# ⏳ LOADING STATES - GUIDE D'INTÉGRATION

## Vue d'ensemble

Les **Loading States** ont été entièrement intégrés dans le projet avec 3 composants clés:

### 🎯 Composants Principaux

1. **Skeleton Screens** - Placeholder pendant le chargement  
2. **Spinners Animés** - Plusieurs tailles disponibles
3. **Progress Bars** - Suivi de la progression avec animations

---

## 📁 Fichiers Créés

### Hooks
- **`hooks/useLoadingState.ts`** - Hook personnalisé pour gérer les états de chargement
  - `useLoadingState()` - Gestion simple du loading
  - `useApiLoader()` - Hook pour les appels API
  - `useDelayedLoading()` - Affiche le spinner après délai (évite le flickering)

### Composants
Les composants étaient déjà dans `Loading.tsx` mais sont maintenant utilisés:
- `SkeletonLoader` - Skeleton unique  
- `SkeletonCard` - Skeleton pour cartes
- `SkeletonGrid` - Grille de skeletons responsives
- `LoadingSpinner` - Spinner simple (small/medium/large)
- `LoadingOverlay` - Overlay fullscreen au-dessus de tout
- `LoadingButton` - Bouton avec spinner intégré
- `ProgressBar` - Barre de progression animée

### Pages Démonstratives
- **`pages/LoadingStatesDemo.tsx`** - Page complète avec 8 démos interactives
- **`styles/demo.css`** - Styles pour la page de démo

### Intégrations dans Pages Existantes
- **`components/JobsList.tsx`** - Skeleton screens + Progress bar au chargement
- **`pages/AuthPage.tsx`** - LoadingButton sur le formulaire

---

## 🚀 Utilisation Rapide

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
  <div>Contenu chargé</div>
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

### 6. Delayed Loading (pour éviter le flickering)

```tsx
import { useDelayedLoading } from '@/hooks/useLoadingState'

function MyComponent() {
  const { showLoading, startLoading, stopLoading } = useDelayedLoading(500)

  return showLoading && <LoadingSpinner />
}
```

---

## 📊 Intégrations Actuelles

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

## 🎨 Cas d'Usage Courants

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
      <button onClick={load}>Charger les données</button>
      {isLoading && <SkeletonGrid count={4} />}
      {error && <div>{error}</div>}
      {data && <JobsList jobs={data} />}
    </>
  )
}
```

### Processus Multi-Étapes
```tsx
const loader = useLoadingState()

const handleMultiStep = async () => {
  loader.startLoading()
  
  // Étape 1: Validation
  loader.setLoadingProgress(33)
  await validateData()
  
  // Étape 2: Traitement
  loader.setLoadingProgress(66)
  await processData()
  
  // Étape 3: Sauvegarde
  loader.setLoadingProgress(100)
  await saveData()
  
  loader.stopLoading()
}

return (
  <>
    <ProgressBar value={loader.progress} animated={true} />
    {loader.progress >= 33 && <span>✓ Étape 1</span>}
    {loader.progress >= 66 && <span>✓ Étape 2</span>}
    {loader.progress >= 100 && <span>✓ Étape 3</span>}
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
      success('Formulaire envoyé avec succès!')
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

## 🎯 Configuration des Hooks

### useLoadingState Options
```tsx
const loader = useLoadingState({
  delay: 300,        // Délai avant de montrer le loading (en ms)
  minDuration: 300   // Durée minimale avant de pouvoir arrêter (en ms)
})
```

### useDelayedLoading Options
```tsx
const { showLoading } = useDelayedLoading(500) // 500ms de délai
```

---

## 🎨 CSS Variables pour Styles

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

## 📱 Responsive

Tous les composants sont 100% responsives:
- Les skeletons grids ajustent les colonnes
- Les spinners restent visibles sur mobile
- Les progress bars sont full-width
- Les boutons sont tactiles

---

## ✅ Checklist d'Intégration

Quand vous intégrez les loading states:

- ✅ Utiliser `useLoadingState` pour les états simples
- ✅ Utiliser `useDelayedLoading` si le chargement est souvent < 500ms
- ✅ Afficher `SkeletonGrid` au lieu de contenu vide
- ✅ Montrer `ProgressBar` pour les uploads/exports
- ✅ Utiliser `LoadingButton` pour les formulaires
- ✅ Combiner avec `useToast` pour les notifications
- ✅ Penser à l'accessibilité (aria-busy, etc.)
- ✅ Éviter le flickering avec delayed loading

---

## 🔍 Page de Démo

Pour voir tous les exemples en action, visiter:
- **Route:** `/loading-demo` (à ajouter dans App.tsx après)
- **Fichier:** `LoadingStatesDemo.tsx`

La page contient 8 démos interactives:
1. Loading Buttons
2. Skeleton Screens  
3. Progress Bars
4. Spinners (3 tailles)
5. Multi-Step Loading
6. Skeleton Cards
7. Loading Overlay
8. Skeleton Grid

---

## 📈 Performance

- ✅ Skeleton screens réduisent le CLS (Cumulative Layout Shift)
- ✅ Progress bars donnent un feedback immédiat
- ✅ Delayed loading évite le flickering inutile
- ✅ CSS animations performantes (GPU-accelerated)
- ✅ Composants légers avec animations CSS pures

---

## 🚀 Prochaines Intégrations

À intégrer dans d'autres pages:
- `DashboardPage` - Loading pour charger les options
- `TalentSearchPage` - Skeleton grid pour les résultats de recherche  
- `JobSeekerProfilePage` - Progress bar pour l'upload CV
- API calls réels - Remplacer les délais simulés par de vrais calls
