let pipeline = null
let verseEmbeddings = null

self.addEventListener('message', async (e) => {
  const { type, transcript, embeddings } = e.data

  if (type === 'load') {
    try {
      const { pipeline: pipe } = await import('@xenova/transformers')
      pipeline = await pipe('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      })
      self.postMessage({ type: 'loaded' })
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message })
    }
    return
  }

  if (type === 'loadEmbeddings') {
    verseEmbeddings = embeddings
    self.postMessage({ type: 'embeddingsLoaded' })
    return
  }

  if (type === 'search' && pipeline && verseEmbeddings) {
    try {
      const output = await pipeline(transcript, {
        pooling: 'mean',
        normalize: true,
      })
      const transcriptVector = Array.from(output.data)

      const scored = verseEmbeddings.map((entry) => ({
        book: entry.book,
        chapter: entry.chapter,
        verse: entry.verse,
        text: entry.text,
        reference: `${entry.book} ${entry.chapter}:${entry.verse}`,
        score: cosineSimilarity(transcriptVector, entry.vector),
      }))
      scored.sort((a, b) => b.score - a.score)

      self.postMessage({
        type: 'result',
        matches: scored.slice(0, 3),
      })
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message })
    }
    return
  }
})

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}
