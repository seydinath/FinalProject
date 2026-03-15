# 🔔 Toast Notifications System

## 🎯 Installation & Setup

Le système de notifications est déjà intégré dans App.tsx. Voici comment l'utiliser:

### 1. **Import le hook**
```tsx
import { useToast } from '../utils/ToastContext'
```

### 2. **Utilise-le dans ton composant**
```tsx
function MonComposant() {
  const { success, error, info, warning } = useToast()
  
  return (
    <button onClick={() => success('✅ Succès!')}>
      Tester
    </button>
  )
}
```

## 📚 Utilisation

### Success
```tsx
const { success } = useToast()
success('Opération réussie!')
// Duration: 3000ms (par défaut)
success('Opération réussie!', 5000) // Duration custom
```

### Error
```tsx
const { error } = useToast()
error('Une erreur est survenue!')
// Duration: 4000ms (par défaut)
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

## 🎨 Types Disponibles

- **success** 🟢 - Opération réussie (vert)
- **error** 🔴 - Erreur ou problème (rouge)
- **info** 🔵 - Information (bleu)
- **warning** 🟡 - Attention (orange)

## 📋 Exemples Réels

### Lors d'une soumission de formulaire
```tsx
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const response = await api.post('/data', formData)
    success('Données sauvegardées avec succès!')
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
    success('Élément supprimé')
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
    success('Connexion réussie! 🎉')
  } catch (err) {
    error('Identifiants incorrects')
  }
}
```

## ⚙️ Configuration

### Durées par défaut (ms)
- success: 3000
- error: 4000
- info: 3000
- warning: 3500

### Personnaliser la durée
```tsx
success('Message court', 2000) // 2 secondes
error('Message long', 6000)    // 6 secondes
warning('Sans auto-dismiss', 0) // Durée infinie (utilisateur doit fermer)
```

## 🎯 Best Practices

1. **Sois concis** - Messages courts et clairs
2. **Utilise des émojis** - Ajoute du feedback visuel
3. **Distingue les types** - success/error/info/warning appropriés
4. **Pas d'abus** - Évite trop de toasts simultanés
5. **User feedback** - Toujours confirmer les actions importantes

## 🧪 Test

Une page de démonstration est disponible pour tester:
- Voir ToastTestPage.tsx
- Tous les types de notifications
- Animations et comportements

## 📱 Responsive

- ✅ Mobile responsive
- ✅ Positionné en bas à droite
- ✅ Stack automatique
- ✅ Close button sur desktop (caché sur mobile)

## 🎨 Styling

Tous les styles sont dans `src/styles/toast.css`:
- Animation d'entrée/sortie
- Dark/Light mode
- Progress bar
- Responsive design
