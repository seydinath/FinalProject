import { useEffect } from 'react'

/**
 * Hook pour initialiser les animations reveal au scroll
 * Observe tous les éléments avec classe scroll-reveal* et ajoute la classe 'reveal' au scroll
 */
export function useGlobalScrollReveals() {
  useEffect(() => {
    // Create intersection observer for scroll reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    // Find all scroll-reveal elements
    const scrollRevealElements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    )

    scrollRevealElements.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      scrollRevealElements.forEach((element) => {
        observer.unobserve(element)
      })
    }
  }, [])
}

export default useGlobalScrollReveals
