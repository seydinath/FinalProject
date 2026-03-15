import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'

interface LoginCharacterProps {
  showPassword: boolean
  isFocused: boolean
  isShaking: boolean
  isSad: boolean
  isHappy: boolean
}

export function LoginCharacter({ showPassword, isFocused, isShaking, isSad, isHappy }: LoginCharacterProps) {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0, normX: 0 })
  const [isBlinking, setIsBlinking] = useState(false)
  const [lookAwayOffset, setLookAwayOffset] = useState({ x: 0, y: 0, normX: 0 })
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
      const randomDelay = Math.random() * 3000 + 2000
      return setTimeout(() => {
        const isDouble = Math.random() < 0.3
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          if (isDouble) {
            setTimeout(() => {
              setIsBlinking(true)
              setTimeout(() => setIsBlinking(false), 130)
            }, 110)
          }
        }, 150)
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
    const target = showPassword ? { x: -15, y: -8, normX: -0.6 } : eyeOffset
    setLookAwayOffset(target)
  }, [showPassword, eyeOffset])

  const faceShift = lookAwayOffset.normX * 12
  const eyeGap = 45 - lookAwayOffset.normX * 10
  const leftEyeBase = 100 + faceShift - eyeGap / 2
  const rightEyeBase = 100 + faceShift + eyeGap / 2
  const leftEyeScale = 1 - lookAwayOffset.normX * 0.15
  const rightEyeScale = 1 + lookAwayOffset.normX * 0.15
  const mouthShift = faceShift * 0.8

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

  const mouthLx = 93 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)
  const mouthLy = showPassword ? lookAwayOffset.y * 0.5 : 0
  const mouthRx = 135 + mouthShift + (showPassword ? lookAwayOffset.x * 0.5 : 0)

  const mx = (mouthLx + mouthRx) / 2
  const my = mouthLy
  const mL = mouthLx
  const mR = mouthRx

  // Grand sourire heureux / moue triste / sourire normal
  const mouthPath = isHappy
    ? `M${mL - 4} ${172 + my} Q${mx} ${205 + my} ${mR + 4} ${172 + my}`
    : isSad
    ? `M${mL} ${185 + my} Q${mx} ${175 + my} ${mR} ${185 + my}`
    : `M${mL} ${175 + my} Q${mx} ${195 + my} ${mR} ${175 + my}`

  // Yeux plissés quand heureux, fermés quand clignement
  const eyeRy = isBlinking ? 1 : isHappy ? 4 : 10

  // Sourcils : montés (focused/happy) ou tristes (sad)
  const browLift = isFocused ? -8 : isHappy ? -10 : 0
  const leftBrowPath = isSad
    ? `M${leftEyeBase - 14} ${101} Q${leftEyeBase} ${108} ${leftEyeBase + 14} ${97}`
    : `M${leftEyeBase - 14} ${101 + browLift} Q${leftEyeBase} ${93 + browLift} ${leftEyeBase + 14} ${101 + browLift}`
  const rightBrowPath = isSad
    ? `M${rightEyeBase - 14} ${97} Q${rightEyeBase} ${108} ${rightEyeBase + 14} ${101}`
    : `M${rightEyeBase - 14} ${101 + browLift} Q${rightEyeBase} ${93 + browLift} ${rightEyeBase + 14} ${101 + browLift}`

  return (
    <motion.svg
      ref={characterRef}
      width="220"
      height="390"
      viewBox="0 0 260 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: isHappy ? [0, -18, 4, 0] : 0,
      }}
      transition={{
        opacity: { duration: 0.5, ease: 'easeOut' },
        y: isHappy
          ? { duration: 0.65, times: [0, 0.35, 0.7, 1], ease: ['easeOut', 'easeIn', 'easeOut'] }
          : { type: 'spring', stiffness: 120, damping: 14 },
      }}
    >
      {/* Balancement idle (respiration) */}
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity }}
      >
        {/* Corps */}
        <motion.path
          d={bodyPath}
          fill="#E8751A"
          stroke="#D4650F"
          strokeWidth="3"
          animate={{ d: bodyPath }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        />

        {/* Groupe visage : inclinaison + tremblement */}
        <motion.g
          animate={{
            x: eyeShift,
            y: eyeLift,
            rotate: isShaking ? [0, -5, 5, -5, 5, 0] : 0,
          }}
          transition={{
            x: { type: 'spring', stiffness: 180, damping: 18 },
            y: { type: 'spring', stiffness: 180, damping: 18 },
            rotate: { duration: 0.5 },
          }}
          style={{ originX: '50%', originY: '50%' }}
        >
          {/* Sourcils */}
          <motion.path
            d={leftBrowPath}
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={{ d: leftBrowPath }}
            transition={{ type: 'spring', stiffness: 150, damping: 18 }}
          />
          <motion.path
            d={rightBrowPath}
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={{ d: rightBrowPath }}
            transition={{ type: 'spring', stiffness: 150, damping: 18 }}
          />

          {/* Joues rosées (triste = rouge vif, heureux = rose doux) */}
          <motion.ellipse
            cx={leftEyeBase + lookAwayOffset.x * 0.4 - 4}
            cy={147 + lookAwayOffset.y * 0.3}
            rx={15}
            ry={7}
            fill="#FF5E8F"
            initial={{ opacity: 0 }}
            animate={{ opacity: isSad ? 0.5 : isHappy ? 0.35 : 0 }}
            transition={{ duration: 0.45 }}
          />
          <motion.ellipse
            cx={rightEyeBase + lookAwayOffset.x * 0.4 + 4}
            cy={147 + lookAwayOffset.y * 0.3}
            rx={15}
            ry={7}
            fill="#FF5E8F"
            initial={{ opacity: 0 }}
            animate={{ opacity: isSad ? 0.5 : isHappy ? 0.35 : 0 }}
            transition={{ duration: 0.45 }}
          />

          {/* Oeil gauche */}
          <motion.ellipse
            cx={leftEyeBase + lookAwayOffset.x * 0.5}
            cy={120 + lookAwayOffset.y * 0.5}
            rx={10 * leftEyeScale}
            ry={eyeRy}
            fill="#1a1a1a"
            animate={{
              cx: leftEyeBase + lookAwayOffset.x * 0.5,
              cy: 120 + lookAwayOffset.y * 0.5,
              ry: eyeRy,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
          {/* Oeil droit */}
          <motion.ellipse
            cx={rightEyeBase + lookAwayOffset.x * 0.5}
            cy={120 + lookAwayOffset.y * 0.5}
            rx={10 * rightEyeScale}
            ry={eyeRy}
            fill="#1a1a1a"
            animate={{
              cx: rightEyeBase + lookAwayOffset.x * 0.5,
              cy: 120 + lookAwayOffset.y * 0.5,
              ry: eyeRy,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
          {/* Reflets (masqués pendant le clignement) */}
          <motion.circle
            cx={leftEyeBase + lookAwayOffset.x * 0.5 - 3}
            cy={120 + lookAwayOffset.y * 0.5 - 3}
            r={3 * leftEyeScale}
            fill="#fff"
            animate={{
              cx: leftEyeBase + lookAwayOffset.x * 0.5 - 3,
              cy: 120 + lookAwayOffset.y * 0.5 - 3,
              opacity: isBlinking ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
          <motion.circle
            cx={rightEyeBase + lookAwayOffset.x * 0.5 - 3}
            cy={120 + lookAwayOffset.y * 0.5 - 3}
            r={3 * rightEyeScale}
            fill="#fff"
            animate={{
              cx: rightEyeBase + lookAwayOffset.x * 0.5 - 3,
              cy: 120 + lookAwayOffset.y * 0.5 - 3,
              opacity: isBlinking ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
          {/* Bouche */}
          <motion.path
            d={mouthPath}
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={{ d: mouthPath }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  )
}
