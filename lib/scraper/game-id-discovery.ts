import { testGameId } from './scraper'

export interface GameIdRange {
  start: number
  end: number
  found: number[]
  notFound: number[]
}

/**
 * Discovers valid game IDs by testing a range of IDs
 * @param startId Starting game ID
 * @param endId Ending game ID
 * @param concurrency Number of concurrent requests
 * @returns Array of valid game IDs
 */
export async function discoverGameIds(
  startId: number,
  endId: number,
  concurrency: number = 5
): Promise<GameIdRange> {
  const found: number[] = []
  const notFound: number[] = []
  const ids = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i)

  console.log(`Discovering game IDs from ${startId} to ${endId}...`)

  // Process in batches
  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency)
    const results = await Promise.all(
      batch.map(async (id) => {
        const isValid = await testGameId(id)
        return { id, isValid }
      })
    )

    results.forEach(({ id, isValid }) => {
      if (isValid) {
        found.push(id)
        console.log(`✓ Found valid game ID: ${id}`)
      } else {
        notFound.push(id)
      }
    })

    // Progress indicator
    console.log(`Progress: ${Math.min(i + concurrency, ids.length)}/${ids.length} IDs checked`)
  }

  console.log(`Discovery complete. Found ${found.length} valid games out of ${ids.length} IDs checked.`)

  return {
    start: startId,
    end: endId,
    found,
    notFound
  }
}

/**
 * Discovers game IDs starting from a seed ID and expanding outward
 * Useful when you know one valid game ID but not the full range
 */
export async function discoverGameIdsFromSeed(
  seedId: number,
  maxDistance: number = 100,
  concurrency: number = 5
): Promise<number[]> {
  const validIds: Set<number> = new Set()

  // Test the seed first
  if (await testGameId(seedId)) {
    validIds.add(seedId)
  }

  // Expand outward
  for (let distance = 1; distance <= maxDistance; distance += concurrency) {
    const idsToTest: number[] = []

    // Add IDs in both directions
    for (let i = 0; i < concurrency; i++) {
      const offset = distance + i
      idsToTest.push(seedId + offset, seedId - offset)
    }

    const results = await Promise.all(
      idsToTest.map(async (id) => {
        if (id < 0) return { id, isValid: false }
        const isValid = await testGameId(id)
        return { id, isValid }
      })
    )

    results.forEach(({ id, isValid }) => {
      if (isValid) {
        validIds.add(id)
        console.log(`✓ Found valid game ID: ${id}`)
      }
    })
  }

  return Array.from(validIds).sort((a, b) => a - b)
}
