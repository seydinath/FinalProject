type CandidateProfile = {
  location?: string
  skills?: string[]
  yearsOfExperience?: number
  availability?: string
}

type JobOfferInput = {
  location?: string
  requiredSkills?: string[]
  experienceRequired?: number
}

export type MatchResult = {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  reasons: string[]
  locationMatched: boolean
  experienceGap: number
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeSkills(values?: string[]): string[] {
  return (values || []).map((item) => normalize(String(item))).filter(Boolean)
}

function isSameLocation(candidateLocation?: string, jobLocation?: string): boolean {
  if (!candidateLocation || !jobLocation) return false

  const left = normalize(candidateLocation)
  const right = normalize(jobLocation)
  return left.includes(right) || right.includes(left)
}

function getAvailabilityScore(availability?: string): number {
  switch (availability) {
    case 'immediate':
      return 10
    case '2-weeks':
      return 8
    case '1-month':
      return 6
    case 'negotiable':
      return 7
    default:
      return 5
  }
}

export function calculateJobMatch(candidateProfile: CandidateProfile, jobOffer: JobOfferInput): MatchResult {
  const candidateSkills = normalizeSkills(candidateProfile.skills)
  const requiredSkills = normalizeSkills(jobOffer.requiredSkills)
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill))
  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.includes(skill))

  const candidateExperience = Number(candidateProfile.yearsOfExperience || 0)
  const experienceRequired = Number(jobOffer.experienceRequired || 0)
  const locationMatched = isSameLocation(candidateProfile.location, jobOffer.location)

  const skillsScore = requiredSkills.length === 0
    ? Math.min(candidateSkills.length * 4, 35)
    : (matchedSkills.length / requiredSkills.length) * 60

  const experienceScore = experienceRequired <= 0
    ? 20
    : Math.min(candidateExperience / experienceRequired, 1.25) * 20

  const locationScore = locationMatched ? 10 : 0
  const availabilityScore = getAvailabilityScore(candidateProfile.availability)

  const score = Math.max(0, Math.min(100, Math.round(skillsScore + experienceScore + locationScore + availabilityScore)))

  const reasons: string[] = []
  if (matchedSkills.length > 0) {
    reasons.push(`${matchedSkills.length} competence(s) requise(s) correspondent`)
  }
  if (candidateExperience >= experienceRequired) {
    reasons.push(`Experience suffisante (${candidateExperience} an(s))`)
  }
  if (locationMatched) {
    reasons.push('Localisation compatible avec le poste')
  }
  if ((candidateProfile.availability || '') === 'immediate') {
    reasons.push('Disponibilite immediate')
  }

  return {
    score,
    matchedSkills,
    missingSkills,
    reasons: reasons.slice(0, 3),
    locationMatched,
    experienceGap: Math.max(0, experienceRequired - candidateExperience),
  }
}
