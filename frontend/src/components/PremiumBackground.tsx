import { useEffect, useRef } from 'react'

export function PremiumBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create floating particles
    const particleCount = 30
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.top = Math.random() * 100 + '%'
      particle.style.width = Math.random() * 4 + 2 + 'px'
      particle.style.height = particle.style.width
      particle.style.animationDuration = Math.random() * 20 + 20 + 's'
      particle.style.animationDelay = Math.random() * 5 + 's'
      container.appendChild(particle)
    }

    return () => {
      container.innerHTML = ''
    }
  }, [])

  return (
    <div className="premium-background" ref={containerRef}>
      <div className="gradient-blur blur-1"></div>
      <div className="gradient-blur blur-2"></div>
      <div className="gradient-blur blur-3"></div>
      <div className="gradient-mesh"></div>
    </div>
  )
}
