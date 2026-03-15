require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)

  const db = mongoose.connection.db
  const email = 'legendino19@gmail.com'
  const passwordHash = await bcrypt.hash('DirtyDiana21022011', 10)
  const now = new Date()

  const result = await db.collection('users').updateOne(
    { email },
    {
      $set: {
        email,
        name: 'Legendino Admin',
        password: passwordHash,
        userType: 'admin',
        isAdmin: true,
        isVerified: true,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  )

  console.log(
    JSON.stringify({
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
    })
  )

  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(error)
  try {
    await mongoose.disconnect()
  } catch (_err) {
    // ignore disconnect errors
  }
  process.exit(1)
})
