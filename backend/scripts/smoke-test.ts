import request from 'supertest'

type TestResult = {
  name: string
  ok: boolean
  details?: string
}

async function run(): Promise<void> {
  const hardTimeout = setTimeout(() => {
    console.error('Smoke test timed out after 30s')
    process.exit(1)
  }, 30000)

  process.env.NODE_ENV = 'test'
  const { app } = await import('../src/server')

  const results: TestResult[] = []

  try {
    console.log('Running smoke checks...')
    console.log('Checking /health...')
    const healthResponse = await request(app).get('/health')
    results.push({
      name: 'GET /health returns 200',
      ok: healthResponse.status === 200 && healthResponse.body?.status === 'OK',
      details: `status=${healthResponse.status}, body.status=${healthResponse.body?.status}`,
    })

    console.log('Checking unknown route...')
    const unknownRoute = await request(app).get('/does-not-exist')
    results.push({
      name: 'Unknown route returns 404 JSON',
      ok: unknownRoute.status === 404 && typeof unknownRoute.body?.error === 'string',
      details: `status=${unknownRoute.status}, body.error=${unknownRoute.body?.error}`,
    })

    console.log('Checking input validation /auth/register...')
    const invalidRegister = await request(app)
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'incomplete@example.com' })

    results.push({
      name: 'POST /auth/register validates required fields',
      ok: invalidRegister.status === 400 && typeof invalidRegister.body?.error === 'string',
      details: `status=${invalidRegister.status}, body.error=${invalidRegister.body?.error}`,
    })
  } finally {
    // no-op: supertest handles request lifecycle without explicit server management
  }

  const failed = results.filter((result) => !result.ok)

  for (const result of results) {
    const label = result.ok ? 'PASS' : 'FAIL'
    console.log(`[${label}] ${result.name}${result.details ? ` -> ${result.details}` : ''}`)
  }

  if (failed.length > 0) {
    process.exitCode = 1
    throw new Error(`Smoke test failed: ${failed.length} failing check(s)`)
  }

  clearTimeout(hardTimeout)
  process.exit(0)
}

run().catch((error) => {
  console.error('Smoke test execution error:', error)
  process.exit(1)
})
