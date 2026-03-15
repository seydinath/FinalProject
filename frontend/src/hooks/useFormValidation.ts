import { useState, useCallback } from 'react'

export type ValidationRule = (value: string) => string | null

export interface FormField {
  value: string
  error: string | null
  touched: boolean
  dirty: boolean
}

export interface FormState {
  [key: string]: FormField
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

interface UseFormValidationOptions {
  rules?: ValidationRules
  onSubmit?: (values: Record<string, string>) => void | Promise<void>
}

/**
 * Hook pour gérer la validation de formulaires en temps réel
 */
export function useFormValidation(initialValues: Record<string, string>, options: UseFormValidationOptions = {}) {
  const { rules = {}, onSubmit } = options
  
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {}
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
        dirty: false
      }
    })
    return state
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Valide un champ spécifique
   */
  const validateField = useCallback((fieldName: string, value: string): string | null => {
    const fieldRules = rules[fieldName]
    if (!fieldRules) return null

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }, [rules])

  /**
   * Change la valeur d'un champ et valide
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        dirty: true,
        error: validateField(name, value)
      }
    }))
  }, [validateField])

  /**
   * Marque un champ comme "touché" et valide
   */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target

    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name].value)
      }
    }))
  }, [validateField])

  /**
   * Met à jour la valeur d'un champ sans validation
   */
  const setFieldValue = useCallback((fieldName: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        dirty: true
      }
    }))
  }, [])

  /**
   * Met à jour l'erreur d'un champ
   */
  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error
      }
    }))
  }, [])

  /**
   * Marque tous les champs comme "touchés"
   */
  const touchAll = useCallback(() => {
    setFormState(prev => {
      const newState = { ...prev }
      Object.keys(newState).forEach(key => {
        newState[key] = { ...newState[key], touched: true }
      })
      return newState
    })
  }, [])

  /**
   * Réinitialise le formulaire
   */
  const reset = useCallback(() => {
    setFormState(prev => {
      const newState: FormState = {}
      Object.keys(prev).forEach(key => {
        newState[key] = {
          value: initialValues[key],
          error: null,
          touched: false,
          dirty: false
        }
      })
      return newState
    })
  }, [initialValues])

  /**
   * Vérifie si le formulaire est valide
   */
  const isValid = useCallback(() => {
    return Object.values(formState).every(field => !field.error)
  }, [formState])

  /**
   * Obtient toutes les valeurs du formulaire
   */
  const getValues = useCallback((): Record<string, string> => {
    const values: Record<string, string> = {}
    Object.keys(formState).forEach(key => {
      values[key] = formState[key].value
    })
    return values
  }, [formState])

  /**
   * Soumet le formulaire
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault()
    }

    touchAll()

    // Valider tous les champs
    let hasErrors = false
    const newState = { ...formState }

    Object.keys(formState).forEach(fieldName => {
      const error = validateField(fieldName, formState[fieldName].value)
      if (error) {
        hasErrors = true
        newState[fieldName] = { ...newState[fieldName], error }
      }
    })

    if (hasErrors) {
      return
    }

    if (onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(getValues())
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [formState, validateField, touchAll, onSubmit, getValues])

  return {
    formState,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    isValid,
    getValues,
    touchAll,
    isSubmitting
  }
}

export default useFormValidation
