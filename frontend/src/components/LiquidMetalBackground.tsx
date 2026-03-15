import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../utils/ThemeContext'

export function LiquidMetalBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const { isDark } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 3
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Liquid Metal Sphere
    const geometry = new THREE.IcosahedronGeometry(1.5, 64)
    const material = new THREE.MeshStandardMaterial({
      color: isDark ? 0xff6b35 : 0x4ecdc4,
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 1,
    })
    
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)
    sphereRef.current = sphere

    // Lighting
    const light1 = new THREE.PointLight(0xffffff, 1.5, 100)
    light1.position.set(5, 5, 5)
    scene.add(light1)

    const light2 = new THREE.PointLight(0xff6b35, 1, 50)
    light2.position.set(-5, -5, 5)
    scene.add(light2)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (sphereRef.current) {
        sphereRef.current.rotation.x += 0.001
        sphereRef.current.rotation.y += 0.002
        
        // Distortion effect
        if (sphereRef.current.geometry instanceof THREE.IcosahedronGeometry) {
          const positions = sphereRef.current.geometry.attributes.position.array as Float32Array
          const originalPositions = positions.slice()
          
          for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i]
            const y = originalPositions[i + 1]
            const z = originalPositions[i + 2]
            
            const wave = Math.sin(x * 5 + Date.now() * 0.001) * 0.1
            const wave2 = Math.cos(y * 5 + Date.now() * 0.0008) * 0.1
            
            positions[i] = x + wave
            positions[i + 1] = y + wave2
            positions[i + 2] = z + Math.sin(z * 5 + Date.now() * 0.0012) * 0.1
          }
          
          sphereRef.current.geometry.attributes.position.needsUpdate = true
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [isDark])

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
}
