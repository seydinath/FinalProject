import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'

function App() {
  const [showPassword, setShowPassword] = useState(false)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0, normX: 0 })
  const [isFocused, setIsFocused] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [lookAwayOffset, setLookAwayOffset] = useState({ x: 0, y: 0, normX: 0 })
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isSad, setIsSad] = useState(false)
  const characterRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!characterRef.current) return
      const rect = characterRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height * 0.38

      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxOffset = 8

      const x = (dx / Math.max(distance, 1)) * Math.min(distance / 40, maxOffset)
      const y = (dy / Math.max(distance, 1)) * Math.min(distance / 40, maxOffset)
      const normX = Math.max(-1, Math.min(1, dx / 300))

      setEyeOffset({ x, y, normX })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const scheduleBlink = () => {
      const randomDelay = Math.random() * 3000 + 2000 // 2-5 seconds
      return setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 150) // blink duration
      }, randomDelay)
    }

    let timeoutId = scheduleBlink()
    const intervalId = setInterval(() => {
      timeoutId = scheduleBlink()
    }, 5000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const targetOffset = showPassword ? { x: -15, y: -8, normX: -0.6 } : eyeOffset
    setLookAwayOffset(targetOffset)
  }, [showPassword, eyeOffset])

  const faceShift = lookAwayOffset.normX * 12
  const eyeGap = 45 - lookAwayOffset.normX * 10
  const leftEyeBase = 100 + faceShift - eyeGap / 2
  const rightEyeBase = 100 + faceShift + eyeGap / 2
  const leftEyeScale = 1 - lookAwayOffset.normX * 0.15
  const rightEyeScale = 1 + lookAwayOffset.normX * 0.15
  const mouthShift = faceShift * 0.8

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const bend = isFocused ? 60 : 0
  const topShift = isFocused ? 50 : 0
  const eyeLift = isFocused ? -30 : 0
  const eyeShift = isFocused ? 25 : 0

  const left = 33
  const right = 167
  const top = 30
  const bottom = 430

  const bodyPath = `
    M ${left + topShift} ${top}
    L ${right + topShift} ${top}
    C ${right} ${top + 60} ${right - bend * 0.4} ${(top + bottom) / 2} ${right} ${bottom}
    L ${left} ${bottom}
    C ${left - bend * 0.4} ${bottom - 60} ${left - bend * 0.3} ${(top + bottom) / 2} ${left + topShift} ${top}
    Z
  `

  return (
    <div className="flex w-screen h-screen">
      <div className="w-1/2 h-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
        <svg 
          ref={characterRef} 
          width="260" 
          height="460" 
          viewBox="0 0 260 460" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d={bodyPath}
            fill="#E8751A"
            stroke="#D4650F"
            strokeWidth="3"
            animate={{ d: bodyPath }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          />
          <motion.g
            animate={{ 
              x: eyeShift, 
              y: eyeLift,
              rotate: isShaking ? [0, -5, 5, -5, 5, 0] : 0
            }}
            transition={{ 
              x: { type: 'spring', stiffness: 180, damping: 18 },
              y: { type: 'spring', stiffness: 180, damping: 18 },
              rotate: { duration: 0.5 }
            }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <motion.ellipse 
              cx={leftEyeBase + lookAwayOffset.x * 0.5} 
              cy={120 + lookAwayOffset.y * 0.5} 
              rx={10 * leftEyeScale} 
              ry={isBlinking ? 1 : 10} 
              fill="#1a1a1a"
              animate={{ cx: leftEyeBase + lookAwayOffset.x * 0.5, cy: 120 + lookAwayOffset.y * 0.5 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            <motion.ellipse 
              cx={rightEyeBase + lookAwayOffset.x * 0.5} 
              cy={120 + lookAwayOffset.y * 0.5} 
              rx={10 * rightEyeScale} 
              ry={isBlinking ? 1 : 10} 
              fill="#1a1a1a"
              animate={{ cx: rightEyeBase + lookAwayOffset.x * 0.5, cy: 120 + lookAwayOffset.y * 0.5 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            <motion.circle 
              cx={leftEyeBase + lookAwayOffset.x * 0.5 - 3} 
              cy={120 + lookAwayOffset.y * 0.5 - 3} 
              r={3 * leftEyeScale} 
              fill="#fff"
              animate={{ cx: leftEyeBase + lookAwayOffset.x * 0.5 - 3, cy: 120 + lookAwayOffset.y * 0.5 - 3 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            <motion.circle 
              cx={rightEyeBase + lookAwayOffset.x * 0.5 - 3} 
              cy={120 + lookAwayOffset.y * 0.5 - 3} 
              r={3 * rightEyeScale} 
              fill="#fff"
              animate={{ cx: rightEyeBase + lookAwayOffset.x * 0.5 - 3, cy: 120 + lookAwayOffset.y * 0.5 - 3 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            <motion.path 
              d={isSad ? 
                `M${93 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${185 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} Q${112 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${175 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} ${135 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${185 + (showPassword ? lookAwayOffset.y * 0.5 : 0)}` :
                `M${93 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${175 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} Q${112 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${195 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} ${135 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${175 + (showPassword ? lookAwayOffset.y * 0.5 : 0)}`
              } 
              stroke="#1a1a1a" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none"
              animate={{ 
                d: isSad ? 
                  `M${93 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${185 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} Q${112 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${175 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} ${135 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${185 + (showPassword ? lookAwayOffset.y * 0.5 : 0)}` :
                  `M${93 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${175 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} Q${112 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${195 + (showPassword ? lookAwayOffset.y * 0.5 : 0)} ${135 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)} ${175 + (showPassword ? lookAwayOffset.y * 0.5 : 0)}`
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          </motion.g>
        </svg>
      </div>

      <div className="w-1/2 h-full bg-[#131313] flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <h1 className="text-white text-3xl font-semibold tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-[#666] text-sm mb-10">
            Enter your credentials to access your account.
          </p>

          <div className="mb-5">
            <label
              htmlFor="username"
              className="block text-[#888] text-xs font-medium uppercase tracking-wider mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="off"
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-5 py-3 text-white text-sm font-[inherit] placeholder:text-[#444] outline-none focus:border-[#444] transition-colors"
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-[#888] text-xs font-medium uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="off"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`w-full appearance-none bg-[#1a1a1a] border ${error ? 'border-red-500' : 'border-[#2a2a2a]'} rounded-full px-5 py-3 pr-12 text-white text-sm font-[inherit] placeholder:text-[#444] outline-none focus:border-[#444] transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#555] hover:text-white transition-colors cursor-pointer p-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2 ml-5">{error}</p>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.preventDefault()
              if (password !== 'password') {
                setError('Incorrect password')
                setIsShaking(true)
                setIsSad(true)
                setTimeout(() => {
                  setIsShaking(false)
                  setIsSad(false)
                }, 1500)
              }
            }}
            className="w-full bg-white text-black font-medium text-sm rounded-full py-3 border-none hover:bg-[#e0e0e0] transition-colors cursor-pointer"
          >
            Sign In
          </button>

          <p className="text-center text-[#555] text-xs mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-white hover:underline no-underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
