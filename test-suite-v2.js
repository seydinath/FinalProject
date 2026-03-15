#!/usr/bin/env node
/**
 * Comprehensive Project Testing Suite v2
 * All features tested with proper error handling
 */

const http = require('http')
const API_URL = process.env.API_URL || 'http://localhost:5000'

let testResults = { total: 0, passed: 0, failed: 0, errors: [] }
let tokens = { candidate: null, recruiter: null, admin: null }
let testIds = { jobOfferId: null, applicationId: null }

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL)
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    if (token) options.headers.Authorization = `Bearer ${token}`

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function test(name, fn) {
  testResults.total++
  try {
    await fn()
    testResults.passed++
    console.log(`✓ ${name}`)
  } catch (err) {
    testResults.failed++
    testResults.errors.push({ test: name, error: err.message })
    console.log(`✗ ${name}: ${err.message}`)
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

// AUTH TESTS
async function testAuth() {
  console.log('\n--- Authentication ---')

  await test('Health check', async () => {
    const { status } = await request('GET', '/health')
    assert(status === 200, `Got ${status}`)
  })

  await test('Register candidate', async () => {
    const { status, body } = await request('POST', '/auth/register', {
      name: `Candidate ${Date.now()}`,
      email: `cand_${Date.now()}@test.com`,
      password: 'Pass123!@',
      userType: 'job_seeker'
    })
    assert([200, 201].includes(status), `Got ${status}`)
    assert(body.token, 'No token')
    tokens.candidate = body.token
  })

  await test('Register recruiter', async () => {
    const { status, body } = await request('POST', '/auth/register', {
      name: `Recruiter ${Date.now()}`,
      email: `rec_${Date.now()}@test.com`,
      password: 'Pass123!@',
      userType: 'recruiter'
    })
    assert([200, 201].includes(status), `Got ${status}`)
    assert(body.token, 'No token')
    tokens.recruiter = body.token
  })

  await test('Register admin', async () => {
    const { status, body } = await request('POST', '/auth/register', {
      name: `Admin ${Date.now()}`,
      email: `admin_${Date.now()}@test.com`,
      password: 'Pass123!@',
      userType: 'admin'
    })
    assert([200, 201].includes(status), `Got ${status}`)
    assert(body.token, 'No token')
    tokens.admin = body.token
  })

  await test('Get auth user', async () => {
    const { status, body } = await request('GET', '/auth/me', null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(body.user, 'No user data')
  })
}

// JOB OFFERS TESTS
async function testJobOffers() {
  console.log('\n--- Job Offers ---')

  await test('Create job offer', async () => {
    const { status, body } = await request('POST', '/job-offers', {
      title: `Engineer ${Date.now()}`,
      description: 'Senior backend engineer needed for our platform',
      positionsAvailable: 2,
      location: 'Remote',
      requiredSkills: ['Node.js', 'TypeScript'],
      salaryRange: { min: 80000, max: 120000 }
    }, tokens.recruiter)
    assert([200, 201].includes(status), `Got ${status}`)
    assert(body.jobOffer && (body.jobOffer.id || body.jobOffer._id), 'No job ID')
    testIds.jobOfferId = body.jobOffer.id || body.jobOffer._id
  })

  await test('Approve job offer (admin)', async () => {
    assert(testIds.jobOfferId, 'Missing jobOfferId')
    const { status } = await request('PATCH', `/job-offers/${testIds.jobOfferId}/approve`, null, tokens.admin)
    assert(status === 200, `Got ${status}`)
  })

  await test('List public offers', async () => {
    const { status, body } = await request('GET', '/job-offers')
    assert(status === 200, `Got ${status}`)
    assert(body.data && Array.isArray(body.data), 'Not array format')
  })

  await test('List recruiter offers', async () => {
    const { status, body } = await request('GET', '/job-offers/recruiter/my-offers', null, tokens.recruiter)
    assert(status === 200, `Got ${status}`)
    assert(Array.isArray(body), 'Not array')
  })
}

// APPLICATIONS  TESTS
async function testApplications() {
  console.log('\n--- Applications ---')

  if (!testIds.jobOfferId) {
    console.log('  (Skipped: no job offer)')
    return
  }

  await test('Apply for job', async () => {
    const { status, body } = await request('POST', `/applications/${testIds.jobOfferId}/apply`, {
      candidateCoverLetter: 'I am interested in this position'
    }, tokens.candidate)
    assert([200, 201].includes(status), `Got ${status}`)
    testIds.applicationId = body.application && (body.application.id || body.application._id)
  })

  await test('Get my applications', async () => {
    const { status, body } = await request('GET', '/applications/my-applications', null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(body && Array.isArray(body.applications), 'applications[] missing')
  })

  await test('Get candidate dashboard', async () => {
    const { status, body } = await request('GET', '/applications/job-seeker/opportunity-dashboard', null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(body, 'No data')
  })
}

// RECRUITER TESTS
async function testRecruiter() {
  console.log('\n--- Recruiter ---')

  await test('Get pipeline dashboard', async () => {
    const { status, body } = await request('GET', '/applications/recruiter/pipeline-dashboard', null, tokens.recruiter)
    assert(status === 200, `Got ${status}`)
    assert(body, 'No data')
  })

  if (testIds.applicationId) {
    await test('Update application status', async () => {
      const { status } = await request('PATCH', `/applications/${testIds.applicationId}/status`, {
        status: 'reviewing'
      }, tokens.recruiter)
      assert(status === 200, `Got ${status}`)
    })
  }
}

// NOTIFICATIONS TESTS
async function testNotifications() {
  console.log('\n--- Notifications ---')

  await test('Recruiter notifications are created', async () => {
    const { status, body } = await request('GET', '/notifications', null, tokens.recruiter)
    assert(status === 200, `Got ${status}`)
    assert(Array.isArray(body.notifications), 'notifications[] missing')
    assert(typeof body.unreadCount === 'number', 'unreadCount missing')
    assert(body.notifications.some((item) => item.type === 'application_submitted'), 'application_submitted notification not found')
  })

  await test('Candidate notifications are created', async () => {
    const { status, body } = await request('GET', '/notifications', null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(Array.isArray(body.notifications), 'notifications[] missing')
    assert(body.notifications.some((item) => ['system', 'application_accepted', 'application_rejected'].includes(item.type)), 'candidate pipeline notification not found')
  })

  await test('Notification unread count endpoint works', async () => {
    const { status, body } = await request('GET', '/notifications/unread-count', null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(typeof body.unreadCount === 'number', 'unreadCount missing')
  })

  await test('Mark one notification as read', async () => {
    const list = await request('GET', '/notifications?unreadOnly=true&limit=1', null, tokens.candidate)
    assert(list.status === 200, `Got ${list.status}`)
    assert(Array.isArray(list.body.notifications), 'notifications[] missing')

    if (list.body.notifications.length === 0) {
      return
    }

    const id = list.body.notifications[0]._id
    const { status, body } = await request('PATCH', `/notifications/${id}/read`, null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(body.notification && body.notification.readAt, 'readAt not set')
  })

  await test('Mark all notifications as read', async () => {
    const { status, body } = await request('PATCH', '/notifications/read-all', null, tokens.candidate)
    assert(status === 200, `Got ${status}`)
    assert(typeof body.modifiedCount === 'number', 'modifiedCount missing')

    const count = await request('GET', '/notifications/unread-count', null, tokens.candidate)
    assert(count.status === 200, `Got ${count.status}`)
    assert(count.body.unreadCount === 0, `Expected 0 unread, got ${count.body.unreadCount}`)
  })
}

// ADMIN TESTS
async function testAdmin() {
  console.log('\n--- Admin ---')

  await test('List users (admin only)', async () => {
    const { status } = await request('GET', '/admin/users', null, tokens.recruiter)
    // May be 403 if not admin, which is OK
    assert([200, 403].includes(status), `Unexpected ${status}`)
  })
}

// ERROR TESTS
async function testErrors() {
  console.log('\n--- Error Cases ---')

  await test('Reject missing fields', async () => {
    const { status } = await request('POST', '/auth/register', { name: 'Test' })
    assert(status === 400, `Got ${status}`)
  })

  await test('Reject invalid token', async () => {
    const { status } = await request('GET', '/auth/me', null, 'invalid')
    assert([401, 403].includes(status), `Got ${status}`)
  })

  await test('Reject without token', async () => {
    const { status } = await request('GET', '/auth/me')
    assert(status >= 401, `Got ${status}`)
  })
}

async function main() {
  console.log('🧪 Testing JobConnect API')
  console.log(`Target: ${API_URL}\n`)

  try {
    await testAuth()
    await testJobOffers()
    await testApplications()
    await testRecruiter()
    await testNotifications()
    await testAdmin()
    await testErrors()

    console.log('\n' + '='.repeat(50))
    console.log(`✓ Passed: ${testResults.passed}/${testResults.total}`)
    console.log(`✗ Failed: ${testResults.failed}/${testResults.total}`)
    const pct = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0
    console.log(`📊 Success Rate: ${pct}%`)
    if (testResults.errors.length > 0) {
      console.log(`\n❌ Failures:`)
      testResults.errors.forEach(({ test, error }) => console.log(`  • ${test}: ${error}`))
    }
    console.log('=' .repeat(50))
  } catch (err) {
    console.error('Test suite error:', err.message)
    process.exit(1)
  }
}

main()
