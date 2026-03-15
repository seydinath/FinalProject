import { Router } from 'express'
import {
  getDomains,
  getCandidatesByDomain,
  searchCandidates,
  getCandidate,
  updateCandidate,
} from '../controllers/candidates'
import { validateObjectIdParam } from '../middleware/validation'

const router = Router()

router.get('/domains', getDomains)
router.get('/domain/:domainId', getCandidatesByDomain)
router.get('/search', searchCandidates)
router.get('/:candidateId', validateObjectIdParam('candidateId'), getCandidate)
router.patch('/:candidateId', validateObjectIdParam('candidateId'), updateCandidate)

export default router
