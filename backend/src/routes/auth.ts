import { Router, Response } from 'express'
import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { User } from '../models/User'
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { createRateLimiter } from '../middleware/rateLimit'

const router = Router()
const authWriteLimiter = createRateLimiter({
  windowSizeSeconds: 60,
  maxRequests: 20,
})

const uploadDir = path.join(process.cwd(), 'uploads', 'cv')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const authReq = req as AuthRequest
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${authReq.userId || 'anon'}-${Date.now()}-${safeName}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'))
    }
    cb(null, true)
  }
})

// ✅ Register - Créer un nouveau compte
router.post('/register', authWriteLimiter, validateBody([
  { field: 'email', type: 'string', required: true, minLength: 5, maxLength: 120 },
  { field: 'password', type: 'string', required: true, minLength: 6, maxLength: 128, trim: false },
  { field: 'name', type: 'string', required: true, minLength: 2, maxLength: 80 },
  { field: 'userType', type: 'string', required: true, enum: ['recruiter', 'job_seeker', 'admin'] },
]), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, userType } = req.body

    // Validation
    if (!email || !password || !name || !userType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Créer l'utilisateur
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      userType,
      isVerified: false,
    })

    await user.save()

    // Générer le token
    const token = generateToken(user._id.toString())

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// ✅ Login - Connexion utilisateur
router.post('/login', authWriteLimiter, validateBody([
  { field: 'email', type: 'string', required: true, minLength: 5, maxLength: 120 },
  { field: 'password', type: 'string', required: true, minLength: 6, maxLength: 128, trim: false },
]), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Chercher l'utilisateur (+ récupérer le mot de passe caché)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcryptjs.compare(password, user.password || '')
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Générer le token
    const token = generateToken(user._id.toString())

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Login with Google OAuth
router.post('/google-login', authWriteLimiter, validateBody([
  { field: 'googleId', type: 'string', required: true, minLength: 5, maxLength: 255 },
  { field: 'email', type: 'string', required: true, minLength: 5, maxLength: 120 },
  { field: 'name', type: 'string', required: true, minLength: 2, maxLength: 80 },
]), async (req: AuthRequest, res: Response) => {
  try {
    const { googleId, email, name, avatar, userType } = req.body

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    let user = await User.findOne({ googleId })

    if (!user) {
      user = new User({
        googleId,
        email,
        name,
        avatar,
        userType: userType || 'job_seeker',
        isVerified: true,
      })
      await user.save()
    }

    const token = generateToken(user._id.toString())

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Google login error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(new mongoose.Types.ObjectId(req.userId))

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
          profile: user.profile,
        }
      })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update profile
router.patch('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { profile } = req.body
    const safeProfile = {
      headline: profile?.headline || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      skills: Array.isArray(profile?.skills) ? profile.skills : [],
      yearsOfExperience: Number(profile?.yearsOfExperience || 0),
      expectations: profile?.expectations || '',
      languages: Array.isArray(profile?.languages) ? profile.languages : [],
      availability: profile?.availability || 'negotiable',
      desiredDomain: profile?.desiredDomain || '',
      cvUrl: profile?.cvUrl || '',
    }

    const user = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.userId),
      { profile: safeProfile },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        profile: user.profile,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.post('/profile/cv', authenticateToken, upload.single('cv'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CV file is required' })
    }

    const cvUrl = `/uploads/cv/${req.file.filename}`

    const user = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.userId),
      { $set: { 'profile.cvUrl': cvUrl } },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'CV uploaded successfully',
      cvUrl,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        profile: user.profile,
      }
    })
  } catch (error: any) {
    console.error('CV upload error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload CV' })
  }
})

export default router
