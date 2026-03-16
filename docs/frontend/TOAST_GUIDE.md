# ðŸ”” Toast Notifications System

## ðŸŽ¯ Installation & Setup

Le systÃ¨me de notifications est dÃ©jÃ  intÃ©grÃ© dans App.tsx. Voici comment l'utiliser:

### 1. **Import le hook**
```tsx
import { useToast } from '../utils/ToastContext'
```

### 2. **Utilise-le dans ton composant**
```tsx
function MonComposant() {
  const { success, error, info, warning } = useToast()
  
  return (
    <button onClick={() => success('âœ… SuccÃ¨s!')}>
      Tester
    </button>
  )
}
```

## ðŸ“š Utilisation

### Success
```tsx
const { success } = useToast()
success('OpÃ©ration rÃ©ussie!')
// Duration: 3000ms (par dÃ©faut)
success('OpÃ©ration rÃ©ussie!', 5000) // Duration custom
```

### Error
```tsx
const { error } = useToast()
error('Une erreur est survenue!')
// Duration: 4000ms (par dÃ©faut)
error('Erreur!', 5000)
```

### Info
```tsx
const { info } = useToast()
info('Nouvelle information')
// Duration: 3000ms
```

### Warning
```tsx
const { warning } = useToast()
warning('Attention!')
// Duration: 3500ms
```

## ðŸŽ¨ Types Disponibles

- **success** ðŸŸ¢ - OpÃ©ration rÃ©ussie (vert)
- **error** ðŸ”´ - Erreur ou problÃ¨me (rouge)
- **info** ðŸ”µ - Information (bleu)
- **warning** ðŸŸ¡ - Attention (orange)

## ðŸ“‹ Exemples RÃ©els

### Lors d'une soumission de formulaire
```tsx
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const response = await api.post('/data', formData)
    success('DonnÃ©es sauvegardÃ©es avec succÃ¨s!')
  } catch (err) {
    error('Erreur lors de la sauvegarde: ' + err.message)
  }
}
```

### Lors d'une action utilisateur
```tsx
const handleDelete = async (id) => {
  try {
    await api.delete(`/items/${id}`)
    success('Ã‰lÃ©ment supprimÃ©')
  } catch (err) {
    error('Impossible de supprimer')
  }
}
```

### Lors d'une authentification
```tsx
const handleLogin = async () => {
  try {
    login(email, password)
    success('Connexion rÃ©ussie! ðŸŽ‰')
  } catch (err) {
    error('Identifiants incorrects')
  }
}
```

## âš™ï¸ Configuration

### DurÃ©es par dÃ©faut (ms)
- success: 3000
- error: 4000
- info: 3000
- warning: 3500

### Personnaliser la durÃ©e
```tsx
success('Message court', 2000) // 2 secondes
error('Message long', 6000)    // 6 secondes
warning('Sans auto-dismiss', 0) // DurÃ©e infinie (utilisateur doit fermer)
```

## ðŸŽ¯ Best Practices

1. **Sois concis** - Messages courts et clairs
2. **Utilise des Ã©mojis** - Ajoute du feedback visuel
3. **Distingue les types** - success/error/info/warning appropriÃ©s
4. **Pas d'abus** - Ã‰vite trop de toasts simultanÃ©s
5. **User feedback** - Toujours confirmer les actions importantes

## ðŸ§ª Test

Une page de dÃ©monstration est disponible pour tester:
- Voir ToastTestPage.tsx
- Tous les types de notifications
- Animations et comportements

## ðŸ“± Responsive

- âœ… Mobile responsive
- âœ… PositionnÃ© en bas Ã  droite
- âœ… Stack automatique
- âœ… Close button sur desktop (cachÃ© sur mobile)

## ðŸŽ¨ Styling

Tous les styles sont dans `src/styles/toast.css`:
- Animation d'entrÃ©e/sortie
- Dark/Light mode
- Progress bar
- Responsive design

