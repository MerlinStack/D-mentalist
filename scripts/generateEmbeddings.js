/**
 * Precompute embeddings for every verse in the Bible (KJV) using MiniLM.
 *
 * Usage:
 *   node scripts/generateEmbeddings.js
 *
 * Requires:
 *   - public/bible/verses.json (full KJV Bible)
 *   - @xenova/transformers installed
 *
 * Output:
 *   - public/bible/embeddings.json (array of {book, chapter, verse, vector})
 */

import { pipeline } from '@xenova/transformers'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VERSES_PATH = path.resolve(__dirname, '../public/bible/verses.json')
const OUTPUT_PATH = path.resolve(__dirname, '../public/bible/embeddings.json')

async function generateEmbeddings() {
  if (!fs.existsSync(VERSES_PATH)) {
    console.error(`❌ verses.json not found at ${VERSES_PATH}`)
    console.error('   Download KJV Bible JSON first and place it at public/bible/verses.json')
    process.exit(1)
  }

  console.log('📖 Loading verses...')
  const verses = JSON.parse(fs.readFileSync(VERSES_PATH, 'utf8'))
  console.log(`   Loaded ${verses.length} verses`)

  console.log('🤖 Loading MiniLM model...')
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  })
  console.log('   Model loaded')

  console.log('🧠 Generating embeddings...')
  const embeddings = []
  const batchSize = 100
  const total = verses.length

  for (let i = 0; i < total; i += batchSize) {
    const batch = verses.slice(i, i + batchSize)
    const batchResults = []

    for (const verse of batch) {
      const text = `${verse.book} ${verse.chapter}:${verse.verse} ${verse.text}`
      const embedding = await extractor(text, { pooling: 'mean', normalize: true })
      batchResults.push({
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        vector: Array.from(embedding.data),
      })
    }

    embeddings.push(...batchResults)
    const progress = Math.min(i + batchSize, total)
    console.log(`   Progress: ${progress}/${total} (${Math.round(progress / total * 100)}%)`)
  }

  console.log('💾 Saving embeddings...')
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(embeddings))
  console.log(`   Saved ${embeddings.length} embeddings to ${OUTPUT_PATH}`)
  console.log('✅ Done!')
}

generateEmbeddings().catch(console.error)
