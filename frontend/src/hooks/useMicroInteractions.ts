import { useEffect, useRef } from 'react'

type RevealType = 'up' | 'left' | 'right' | 'scale'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  type?: RevealType
}

/**
 * Hook pour déclencher des animations dès qu'un élément devient visible au scroll
 * @param options - Configuration de l'IntersectionObserver
 * @returns ref à ajouter à l'élément à animer
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    type = 'up'
  } = options

  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add reveal class
          const classToAdd = {
            up: 'scroll-reveal',
            left: 'scroll-reveal-left',
            right: 'scroll-reveal-right',
            scale: 'scroll-reveal-scale'
          }[type]

          entry.target.classList.add(classToAdd)
          entry.target.classList.add('reveal')
          
          // Stop observing after animation is applied
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold,
      rootMargin
    })

    observer.observe(elementRef.current)

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [threshold, rootMargin, type])

  return elementRef
}

/**
 * Hook pour créer des ripple effects au clic
 */
export function useRipple() {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)

      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${e.clientX - rect.left}px`
      ripple.style.top = `${e.clientY - rect.top}px`

      element.appendChild(ripple)

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600)
    }

    element.addEventListener('click', handleClick)
    return () => element.removeEventListener('click', handleClick)
  }, [])

  return containerRef
}

/**
 * Hook pour gérer les animations de focus/blur sur les inputs
 */
export function useInputAnimation() {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

  useEffect(() => {
    const element = inputRef.current
    if (!element) return

    const handleFocus = () => {
      element.style.transform = 'translateY(-2px)'
    }

    const handleBlur = () => {
      element.style.transform = 'translateY(0)'
    }

    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)

    return () => {
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
    }
  }, [])

  return inputRef
}

/**
 * Hook pour stagger les animations d'une liste d'éléments
 */
export function useStaggerAnimation(
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string = '.item',
  staggerDelay: number = 0.1
) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll(itemSelector)
    items.forEach((item, index) => {
      const delay = index * staggerDelay
      const htmlItem = item as HTMLElement
      htmlItem.style.animation = `fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`
    })
  }, [itemSelector, staggerDelay])
}

export default useScrollReveal
