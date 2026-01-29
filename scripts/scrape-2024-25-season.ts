import 'dotenv/config'

// npx tsx scripts/scrape-2024-25-season.ts

async function scrape2024Season() {
  const startId = 12809
  const endId = 12874
// const startId = 12553
// const endId = 12439
  console.log(`Starting scrape from game ${startId} to ${endId}...`)
  console.log('This may take a while (10-20 minutes)...\n')

  const response = await fetch('http://localhost:3000/api/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'discover-and-save',
      startId,
      endId,
      concurrency: 5
    })
  })

  const result = await response.json()

  console.log('\n✓ Scrape completed!')
  console.log('Results:', JSON.stringify(result, null, 2))
}

scrape2024Season().catch(console.error)