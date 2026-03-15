import { useMemo } from 'react'

interface PasswordStrengthMeterProps {
  password: string
  showLabel?: boolean
  showMessage?: boolean
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

interface StrengthResult {
  level: StrengthLevel
  percentage: number
  message: string
  color: string
}

function calculatePasswordStrength(password: string): StrengthResult {
  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  // Count met criteria
  const metCriteria = Object.values(checks).filter(Boolean).length

  // Score based on length
  if (password.length >= 16) score += 2
  else if (password.length >= 12) score += 1.5
  else if (password.length >= 8) score += 1

  // Score based on character variety
  score += metCriteria * 0.8

  // Determine strength level
  let level: StrengthLevel = 'weak'
  let percentage = 0
  let message = 'Très faible'
  let color = '#ef4444'

  if (score < 2) {
    level = 'weak'
    percentage = 20
    message = 'Très faible'
    color = '#ef4444'
  } else if (score < 4) {
    level = 'fair'
    percentage = 40
    message = 'Faible'
    color = '#f97316'
  } else if (score < 6) {
    level = 'good'
    percentage = 70
    message = 'Bon'
    color = '#eab308'
  } else {
    level = 'strong'
    percentage = 100
    message = 'Très fort'
    color = '#22c55e'
  }

  return { level, percentage, message, color }
}

export function PasswordStrengthMeter({
  password,
  showLabel = true,
  showMessage = true,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  )

  if (!password) return null

  return (
    <div className="password-strength-meter">
      {showLabel && (
        <div className="strength-label">
          Force du mot de passe: <span className={`strength-text strength-${strength.level}`}>{strength.message}</span>
        </div>
      )}

      <div className="strength-bar-container">
        <div
          className="strength-bar"
          style={{
            width: `${strength.percentage}%`,
            backgroundColor: strength.color,
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>

      {showMessage && (
        <div className="strength-requirements">
          <RequirementItem
            met={password.length >= 8}
            text="Au moins 8 caractères"
          />
          <RequirementItem
            met={/[A-Z]/.test(password)}
            text="Une lettre majuscule"
          />
          <RequirementItem
            met={/[a-z]/.test(password)}
            text="Une lettre minuscule"
          />
          <RequirementItem
            met={/[0-9]/.test(password)}
            text="Un chiffre"
          />
          <RequirementItem
            met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
            text="Un caractère spécial"
          />
        </div>
      )}
    </div>
  )
}

interface RequirementItemProps {
  met: boolean
  text: string
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className={`requirement-item ${met ? 'met' : 'unmet'}`}>
      <span className="requirement-icon">{met ? '✓' : '○'}</span>
      <span className="requirement-text">{text}</span>
    </div>
  )
}

export default PasswordStrengthMeter
