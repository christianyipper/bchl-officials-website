import 'dotenv/config'
import { Pool } from 'pg'

async function checkTableStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  try {
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Official'
      ORDER BY ordinal_position
    `)

    console.log('\nOfficial Table Columns:')
    console.log('======================\n')
    result.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(15)} ${col.data_type.padEnd(20)} ${col.column_default || ''}`)
    })
    console.log()

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkTableStructure()
