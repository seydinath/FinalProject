import { useEffect, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { PremiumBackground } from '../components/PremiumBackground'
import { getMe, updateProfile, uploadCv, type UserProfile } from '../services/authService'

export function JobSeekerProfilePage() {
  const { language } = useLanguage()
  const { isDark } = useTheme()
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    headline: '',
    bio: '',
    phone: '',
    location: '',
    skills: [],
    yearsOfExperience: 0,
    expectations: '',
    languages: [],
    availability: 'negotiable',
    desiredDomain: '',
    cvUrl: '',
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [languagesInput, setLanguagesInput] = useState('')

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      const me = await getMe()
      if (me) {
        setName(me.name)
        setEmail(me.email)
        setProfile({
          headline: me.profile?.headline || '',
          bio: me.profile?.bio || '',
          phone: me.profile?.phone || '',
          location: me.profile?.location || '',
          skills: me.profile?.skills || [],
          yearsOfExperience: me.profile?.yearsOfExperience || 0,
          expectations: me.profile?.expectations || '',
          languages: me.profile?.languages || [],
          availability: me.profile?.availability || 'negotiable',
          desiredDomain: me.profile?.desiredDomain || '',
          cvUrl: me.profile?.cvUrl || '',
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const updated = await updateProfile(profile)
    if (updated?.profile) {
      setProfile(updated.profile)
      setEditMode(false)
    }
    setSaving(false)
  }

  const handleCvUpload = async (file?: File) => {
    if (!file) return
    setSaving(true)
    const response = await uploadCv(file)
    if (response?.user?.profile?.cvUrl) {
      setProfile((prev) => ({ ...prev, cvUrl: response.user.profile?.cvUrl || '' }))
    }
    setSaving(false)
  }

  const updateField = (field: keyof UserProfile, value: string | number | string[]) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className={`job-seeker-profile-page ${isDark ? 'dark' : 'light'}`}>
        <PremiumBackground />
        <div className="profile-container">
          <p>Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`job-seeker-profile-page ${isDark ? 'dark' : 'light'}`}>
      <PremiumBackground />

      <div className="profile-container">
        <div className="profile-header-section">
          <h1>{language === 'fr' ? 'Mon Profil' : 'My Profile'}</h1>
          <button
            className={`btn-edit ${editMode ? 'editing' : ''}`}
            onClick={() => setEditMode(!editMode)}
            disabled={saving}
          >
            {editMode ? (language === 'fr' ? 'Annuler' : 'Cancel') : (language === 'fr' ? 'Modifier' : 'Edit')}
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-header-info">
            <div className="avatar">👨‍💼</div>
            <div className="info-display">
              <h2>{name || 'User'}</h2>
              <p className="title">{profile.headline || (language === 'fr' ? 'Titre non renseigné' : 'No title set')}</p>
              <p>{email}</p>
            </div>
          </div>

          <div className="profile-section">
            <h3>{language === 'fr' ? 'Informations de Contact' : 'Contact Information'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Titre</label>
                <input
                  className="input-field"
                  value={profile.headline || ''}
                  onChange={(e) => updateField('headline', e.target.value)}
                  disabled={!editMode || saving}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  className="input-field"
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  disabled={!editMode || saving}
                />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input
                  className="input-field"
                  value={profile.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  disabled={!editMode || saving}
                />
              </div>
              <div className="form-group">
                <label>Années d'expérience</label>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={profile.yearsOfExperience || 0}
                  onChange={(e) => updateField('yearsOfExperience', Number(e.target.value || 0))}
                  disabled={!editMode || saving}
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Bio</h3>
            <textarea
              className="textarea-field"
              rows={4}
              value={profile.bio || ''}
              onChange={(e) => updateField('bio', e.target.value)}
              disabled={!editMode || saving}
            />
          </div>

          <div className="profile-section">
            <h3>Compétences</h3>
            <input
              className="input-field"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && skillsInput.trim()) {
                  e.preventDefault()
                  const next = Array.from(new Set([...(profile.skills || []), ...skillsInput.split(',').map((s) => s.trim()).filter(Boolean)]))
                  updateField('skills', next)
                  setSkillsInput('')
                }
              }}
              placeholder="React, Node.js, MongoDB"
              disabled={!editMode || saving}
            />
            <div className="skills-display">
              {(profile.skills || []).map((skill) => (
                <span key={skill} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h3>Langues</h3>
            <input
              className="input-field"
              value={languagesInput}
              onChange={(e) => setLanguagesInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && languagesInput.trim()) {
                  e.preventDefault()
                  const next = Array.from(new Set([...(profile.languages || []), ...languagesInput.split(',').map((s) => s.trim()).filter(Boolean)]))
                  updateField('languages', next)
                  setLanguagesInput('')
                }
              }}
              placeholder="Français, English"
              disabled={!editMode || saving}
            />
            <div className="skills-display">
              {(profile.languages || []).map((lang) => (
                <span key={lang} className="skill-badge">{lang}</span>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h3>CV</h3>
            <div className="cv-upload-section">
              <label className="cv-upload-label">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleCvUpload(e.target.files?.[0])}
                  disabled={!editMode || saving}
                />
                <span className="upload-button">{saving ? 'Chargement...' : 'Sélectionner un CV'}</span>
              </label>
              {profile.cvUrl ? (
                <p>
                  CV actuel: <a href={`http://localhost:5000${profile.cvUrl}`} target="_blank" rel="noreferrer">ouvrir</a>
                </p>
              ) : (
                <p className="no-cv">Aucun CV uploadé</p>
              )}
            </div>
          </div>

          {editMode && (
            <div className="profile-actions">
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button className="btn-cancel" onClick={() => setEditMode(false)} disabled={saving}>
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
