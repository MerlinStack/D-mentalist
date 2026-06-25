/**
 * Bible API layer using bible-api.com (free, no API key required).
 *
 * bible-api.com is a community-run service serving public-domain translations.
 * Rate limit is generous (~30 req/min). For production with copyrighted
 * translations (NIV, ESV) see src/data/versions.js for licensing notes.
 */

import { getApiCode } from '../data/versions'
import { parseScriptureReference } from '../utils/scriptureParser'

const BASE_URL = '/api/bible'

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'his','her','their','our','your','my','is','was','are','were','be','been',
  'being','have','has','had','do','does','did','will','would','could','should',
  'may','might','shall','so','that','this','these','those','it','its','he',
  'she','they','we','i','not','no','nor','as','if','then','than','when','who',
  'which','what','how','all','any','both','each','few','more','most','other',
  'some','such','into','through','during','before','after','above','below',
  'from','by','about','between','god','lord','said','unto','thee','thou',
  'thy','ye','him','them','us','me','mine','thine'
])

/**
 * Normalise bible-api.com response into our app's verse shape.
 */
function normaliseVerse(data, translation) {
  if (!data || !data.verses || data.verses.length === 0) return null

  return data.verses.map(v => {
    const ref = `${v.book_name} ${v.chapter}:${v.verse}`
    return {
      ref,
      reference: ref,
      book: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      translation,
    }
  })
}

/**
 * Fetch a single verse or verse range.
 *
 * @param {string} reference - "John 3:16", "Romans 8:28", "Romans 8:28-30"
 * @param {string} [translation='kjv'] - bible-api.com translation code
 * @returns {Promise<Array<{ref, book, chapter, verse, text, translation}>>}
 */
export async function fetchVerse(reference, translation = 'kjv') {
  const encoded = encodeURIComponent(reference)
  const url = `${BASE_URL}/${encoded}?translation=${translation}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Verse not found: ${reference} (${res.status})`)
  }

  const data = await res.json()
  const verses = normaliseVerse(data, translation)
  if (!verses || verses.length === 0) {
    throw new Error(`Empty response for: ${reference}`)
  }
  return verses
}

/**
 * Fetch multiple references in parallel.
 */
export async function fetchMultipleVerses(references, translation = 'kjv') {
  const unique = [...new Set(references)]
  const results = await Promise.allSettled(
    unique.map(ref => fetchVerse(ref, translation))
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
}

/**
 * Search verses by keyword or phrase.
 * Uses ?q= parameter (correct bible-api.com endpoint).
 * Extracts most distinctive keyword from long phrases automatically.
 *
 * @param {string} query  - Free-text search ("loved", "For God so loved the world")
 * @param {string} [translation='kjv']
 * @returns {Promise<Array>}
 */
export async function searchByKeyword(query, translation = 'kjv') {
  if (!query || !query.trim()) return []

  const words = query.trim().toLowerCase().split(/\s+/)

  // For long phrases, extract the most distinctive keyword
  // bible-api.com ?q= works best with 1-2 meaningful words
  const meaningful = words
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .sort((a, b) => b.length - a.length)

  const searchTerm = meaningful.length > 0 && words.length > 3
    ? meaningful[0]
    : query.trim()

  // ✅ FIXED: was ?search= which doesn't exist — correct param is ?q=
  const url = `${BASE_URL}/?q=${encodeURIComponent(searchTerm)}&translation=${translation}`

  try {
    const res = await fetch(url)
    if (!res.ok) return []

    const data = await res.json()
    const verses = normaliseVerse(data, translation)
    if (!verses) return []

    // Score against the ORIGINAL full query for relevance ranking
    const q = query.toLowerCase()
    const queryWords = words.filter(w => w.length > 2)

    return verses
      .map(v => {
        const text = v.text.toLowerCase()
        let score = 0
        for (const word of queryWords) {
          if (text.includes(word)) score += 0.3
          if (v.ref.toLowerCase().includes(word)) score += 0.5
        }
        const exact = q.trim()
        if (text.includes(exact)) score += 2.0
        return {
          ...v,
          relevance: Math.min((score / Math.max(queryWords.length, 1)) * 0.5, 1)
        }
      })
      .filter(v => v.relevance > 0.05)
      .sort((a, b) => b.relevance - a.relevance)
  } catch {
    return []
  }
}

/**
 * Fetch an entire chapter.
 * bible-api.com returns all verses when given "Book Chapter".
 *
 * @param {string} book    - "John"
 * @param {number} chapter - 3
 * @param {string} [translation='kjv']
 * @returns {Promise<Array>}
 */
export async function getChapter(book, chapter, translation = 'kjv') {
  const ref = `${book} ${chapter}`
  const encoded = encodeURIComponent(ref)
  const url = `${BASE_URL}/${encoded}?translation=${translation}`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return normaliseVerse(data, translation) || []
  } catch {
    return []
  }
}

/**
 * Resolve a text input (reference or keyword) to verses.
 * Parses text first; if it's a recognised reference, fetches by ref.
 * Otherwise falls back to keyword search.
 */
export async function resolveToVerses(text, translation = 'kjv') {
  const refs = parseScriptureReference(text)

  if (refs.length > 0) {
    const results = []
    for (const ref of refs) {
      const refStr = ref.verseEnd
        ? `${ref.book} ${ref.chapter}:${ref.verse}-${ref.verseEnd}`
        : ref.verse
          ? `${ref.book} ${ref.chapter}:${ref.verse}`
          : `${ref.book} ${ref.chapter}`

      try {
        const verses = await fetchVerse(refStr, translation)
        results.push(...verses)
      } catch {
        // try keyword search as fallback for this part
      }
    }
    return results
  }

  return searchByKeyword(text, translation)
}