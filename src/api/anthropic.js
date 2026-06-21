/**
 * Claude Sonnet API — raw fetch (no SDK, browser-incompatible).
 *
 * Three core AI functions for D'mentalist:
 *   1. identifyScripture    — partial-quote / thematic search
 *   2. detectScriptureInSpeech — real-time sound-mode detection
 *   3. getVerseInsights     — commentary & context for VerseDetail
 *
 * Plus backward-compat wrappers:
 *   semanticSearch         — identifyScripture + fetch verse text
 *   suggestRelatedVerse    — cross-references via Claude
 *
 * All functions gracefully degrade when VITE_ANTHROPIC_API_KEY is unset.
 */

import { fetchMultipleVerses, searchByKeyword } from './bible'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

function isConfigured() {
  return API_KEY && API_KEY !== 'your_anthropic_api_key_here'
}

async function claude(systemPrompt, userMessage, maxTokens = 1024) {
  if (!isConfigured()) return null

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return (data.content?.[0]?.text || '').trim()
}

function extractJson(text) {
  if (!text) return null
  const brace = text.indexOf('{')
  const bracket = text.indexOf('[')
  const start = brace !== -1 && (bracket === -1 || brace < bracket) ? brace : bracket
  if (start === -1) return null
  const end = text[start] === '{'
    ? text.lastIndexOf('}')
    : text.lastIndexOf(']')
  if (end === -1) return null
  try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
}

// ─── Function 1: Partial-quote / thematic identification ───────────────

/**
 * Identify Bible verses from a partial quote, theme, or description.
 *
 * @param {string} userInput - "Love is patient, love is kind" or "the one about faith moving mountains"
 * @param {string} [_translation] - unused (app always returns KJV-style refs; translation is handled at display layer)
 * @returns {Promise<{references: string[], confidence: string, interpretation: string, crossReferences: string[]}>}
 */
export async function identifyScripture(userInput, _translation) {
  const fallback = { references: [], confidence: 'low', interpretation: '', crossReferences: [] }
  if (!userInput?.trim()) return fallback

  if (!isConfigured()) return fallback

  const systemPrompt =
    'You are a Bible scholar assistant embedded in a church projection app called D\'mentalist. ' +
    'Your sole job is to identify Bible verses from partial quotes, themes, or descriptions.\n\n' +
    'Always respond with ONLY valid JSON. No markdown, no backticks, no explanation.\n\n' +
    'Return this exact shape:\n' +
    '{\n' +
    '  "references": ["John 3:16", "Romans 8:28"],\n' +
    '  "confidence": "high" | "medium" | "low",\n' +
    '  "interpretation": "One sentence explaining why these verses match",\n' +
    '  "crossReferences": ["Verse1", "Verse2", "Verse3"]\n' +
    '}\n\n' +
    'Rules:\n' +
    '- references: the top 1-3 most relevant verse references. Use "Book Chapter:Verse" format always.\n' +
    '- confidence: high if the input is an obvious quote, medium if thematic, low if very vague\n' +
    '- interpretation: plain language explanation for non-scholars\n' +
    '- crossReferences: 2-3 related verse references on the same theme\n' +
    '- Never invent verses. If you cannot identify a verse, return references as []\n' +
    '- Return KJV-style references regardless of translation (the app handles translation)\n' +
    '- For book names, always use full names: "1 Corinthians" not "1 Cor", "Philippians" not "Phil"'

  const userMessage = `Identify the Bible verse(s) for: "${userInput}"`

  const raw = await claude(systemPrompt, userMessage)
  return raw ? (extractJson(raw) || fallback) : fallback
}

// ─── Function 2: Real-time speech detection (Sound Mode) ───────────────

/**
 * Detect scripture references in live transcribed speech.
 *
 * @param {string} transcript - chunk of speech from Web Speech API
 * @returns {Promise<{detected: boolean, references: string[], spokenAs: string, confidence: string}>}
 */
export async function detectScriptureInSpeech(transcript) {
  const fallback = { detected: false, references: [], spokenAs: '', confidence: 'low' }
  if (!transcript?.trim()) return fallback

  if (!isConfigured()) return fallback

  const systemPrompt =
    'You are a real-time Scripture detection system in a church projection app. ' +
    'You receive chunks of transcribed speech from a live sermon or Bible study.\n\n' +
    'Always respond with ONLY valid JSON. No markdown, no explanation.\n\n' +
    'Return:\n' +
    '{\n' +
    '  "detected": true | false,\n' +
    '  "references": ["John 3:16"],\n' +
    '  "spokenAs": "the exact phrase that triggered detection",\n' +
    '  "confidence": "high" | "medium" | "low"\n' +
    '}\n\n' +
    'Rules:\n' +
    '- detected: true ONLY if you\'re confident a specific Bible verse was referenced\n' +
    '- references: the verse(s) referenced\n' +
    '- spokenAs: the exact phrase from the transcript that was the reference\n' +
    '- confidence: high = explicit reference like "Romans 8:28", medium = clear partial quote, low = thematic mention\n' +
    '- Do NOT fire on vague religious language. Only fire on clear verse references or well-known quotes.\n' +
    '- Common patterns: "turn to [Book] chapter N verse N", "as it says in [Book]...", clear partial quote of a famous verse'

  const userMessage = `Detect any Scripture references in this speech transcript: "${transcript}"`

  const raw = await claude(systemPrompt, userMessage, 512)
  return raw ? (extractJson(raw) || fallback) : fallback
}

// ─── Function 3: Verse insights / commentary ───────────────────────────

/**
 * Get plain-language commentary, theme, and context for a verse.
 *
 * @param {string} verseReference - "John 3:16"
 * @param {string} verseText      - "For God so loved the world..."
 * @returns {Promise<{explanation: string, theme: string, context: string}>}
 */
export async function getVerseInsights(verseReference, verseText) {
  const fallback = { explanation: '', theme: '', context: '' }
  if (!verseReference) return fallback

  if (!isConfigured()) return fallback

  const systemPrompt =
    'You are a Bible commentary assistant in a church app. Given a verse, provide:\n' +
    '- A brief plain-language explanation (2-3 sentences, accessible to all ages)\n' +
    '- The main theme/topic as a single word or short phrase\n' +
    '- The historical context in one sentence\n\n' +
    'Always respond with ONLY valid JSON:\n' +
    '{\n' +
    '  "explanation": "...",\n' +
    '  "theme": "...",\n' +
    '  "context": "..."\n' +
    '}'

  const userMessage = `Verse: ${verseReference}\nText: "${verseText}"\n\nProvide explanation, theme, and context.`

  const raw = await claude(systemPrompt, userMessage, 512)
  return raw ? (extractJson(raw) || fallback) : fallback
}

// ─── Backward-compat wrappers ──────────────────────────────────────────

/**
 * Semantic search — calls identifyScripture then fetches verse text.
 * Used by scriptureStore when searchMode === 'semantic'.
 *
 * @returns {Promise<Array<{ref, book, chapter, verse, text, relevance, interpretation?}>>}
 */
export async function semanticSearch(query, translation) {
  const result = await identifyScripture(query)
  if (result.references.length === 0) {
    return fallbackKeywordSearch(query, translation)
  }

  const verses = await fetchMultipleVerses(result.references, translation || 'kjv')

  return verses.map((v, i) => ({
    ...v,
    relevance: 1 - i * 0.15,
    interpretation: result.interpretation,
    aiConfidence: result.confidence,
    aiCrossReferences: result.crossReferences,
  }))
}

/**
 * Cross-references — kept for VerseDetail panel.
 */
export async function suggestRelatedVerse(reference) {
  if (!reference || !isConfigured()) return []

  const systemPrompt =
    'You are a Bible cross-reference assistant. Given a verse, suggest 3-5 related verses ' +
    'that share themes, prophecy fulfilment, or theological connections.\n\n' +
    'Always respond with ONLY valid JSON array: [{ "ref": "Verse", "reason": "why related" }]'

  const raw = await claude(systemPrompt,
    `Find cross-references for: "${reference}"`, 512)

  if (!raw) return []
  const arr = extractJson(raw)
  return Array.isArray(arr) ? arr.slice(0, 6) : []
}

/**
 * Fallback: keyword search via bible-api.com when no Claude key is set.
 */
async function fallbackKeywordSearch(query, translation) {
  if (!query?.trim()) return []
  const results = await searchByKeyword(query, translation || 'kjv')
  return results
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, 10)
}
