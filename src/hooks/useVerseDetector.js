import { useRef, useCallback, useState } from 'react'
import { useScriptureStore } from '../store/scriptureStore'
import { parseScriptureReference, formatReference, normaliseBook } from '../utils/scriptureParser'

const REGEX_DEBOUNCE = 2000
const SEMANTIC_DEBOUNCE = 3000
const CONTEXT_TIMEOUT = 30000

let semanticWorker = null
let cachedEmbeddings = null

function getSemanticWorker() {
  if (!semanticWorker) {
    semanticWorker = new Worker(
      new URL('../workers/semantic.worker.js', import.meta.url),
      { type: 'module' }
    )
  }
  return semanticWorker
}

export function useVerseDetector() {
  const [isSemanticLoaded, setIsSemanticLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const contextRef = useRef({ book: null, chapter: null, timestamp: 0 })
  const regexTimerRef = useRef(null)
  const semanticTimerRef = useRef(null)

  const loadSemanticModel = useCallback(async () => {
    const worker = getSemanticWorker()
    await new Promise((resolve) => {
      const handler = (e) => {
        if (e.data.type === 'loaded') {
          setIsSemanticLoaded(true)
          worker.removeEventListener('message', handler)
          resolve(true)
        }
        if (e.data.type === 'error') {
          worker.removeEventListener('message', handler)
          resolve(false)
        }
      }
      worker.addEventListener('message', handler)
      worker.postMessage({ type: 'load' })
    })

    if (!cachedEmbeddings) {
      try {
        const res = await fetch('/bible/embeddings.json')
        if (res.ok) {
          cachedEmbeddings = await res.json()
          worker.postMessage({ type: 'loadEmbeddings', embeddings: cachedEmbeddings })
          await new Promise((resolve) => {
            const handler = (e) => {
              if (e.data.type === 'embeddingsLoaded') {
                worker.removeEventListener('message', handler)
                resolve()
              }
            }
            worker.addEventListener('message', handler)
          })
        }
      } catch {
        console.warn('No embeddings.json found — semantic search disabled')
      }
    }
  }, [])

  const detect = useCallback((text) => {
    const store = useScriptureStore.getState()
    store.setTranscript(text)
    store.setListening(true)

    if (regexTimerRef.current) clearTimeout(regexTimerRef.current)
    if (semanticTimerRef.current) clearTimeout(semanticTimerRef.current)

    regexTimerRef.current = setTimeout(() => {
      runRegexStage(text)
    }, 100)
  }, [])

  function runRegexStage(text) {
    const refs = parseScriptureReference(text)

    if (refs.length > 0) {
      const ref = refs[0]
      const reference = formatReference(ref.book, ref.chapter, ref.verse, ref.verseEnd)
      const store = useScriptureStore.getState()

      contextRef.current = {
        book: ref.book,
        chapter: ref.chapter,
        timestamp: Date.now(),
      }

      store.setDetectionResult({
        verse: {
          ref: reference,
          reference,
          book: ref.book,
          chapter: ref.chapter,
          verse: ref.verse,
        },
        book: ref.book,
        chapter: ref.chapter,
        confidence: 100,
        source: 'regex',
      })
      return
    }

    regexTimerRef.current = setTimeout(() => {
      runContextStage(text)
    }, 500)
  }

  function runContextStage(text) {
    const ctx = contextRef.current
    const now = Date.now()
    const isContextFresh = (now - ctx.timestamp) < CONTEXT_TIMEOUT

    const chapterMatch = text.match(/chapter\s+(\d+)/i)
    const verseMatch = text.match(/verse\s+(\d+)/i)
    const bookMatch = text.match(/(\d?\s*[A-Za-z]+)\s+(?:chapter\s+)?(\d+)/i)

    let detected = null

    if (isContextFresh && verseMatch && ctx.book && ctx.chapter) {
      detected = {
        book: ctx.book,
        chapter: ctx.chapter,
        verse: parseInt(verseMatch[1]),
      }
    } else if (bookMatch) {
      const book = normaliseBook(bookMatch[1])
      if (book) {
        const chapterNum = parseInt(bookMatch[2])
        contextRef.current = { book, chapter: chapterNum, timestamp: now }

        if (!verseMatch) {
          detected = { book, chapter: chapterNum, verse: undefined }
        } else if (verseMatch) {
          detected = { book, chapter: chapterNum, verse: parseInt(verseMatch[1]) }
        }
      }
    }

    if (detected) {
      const store = useScriptureStore.getState()
      const reference = detected.verse
        ? formatReference(detected.book, detected.chapter, detected.verse)
        : formatReference(detected.book, detected.chapter)

      store.setDetectionResult({
        verse: {
          ref: reference,
          reference,
          book: detected.book,
          chapter: detected.chapter,
          verse: detected.verse,
        },
        book: detected.book,
        chapter: detected.chapter,
        confidence: 90,
        source: 'context',
      })
      return
    }

    semanticTimerRef.current = setTimeout(() => {
      runSemanticStage(text)
    }, 500)
  }

  async function runSemanticStage(text) {
    if (!cachedEmbeddings || !isSemanticLoaded) return

    setIsSearching(true)
    const store = useScriptureStore.getState()

    try {
      const worker = getSemanticWorker()
      const matches = await new Promise((resolve, reject) => {
        const handler = (e) => {
          if (e.data.type === 'result') {
            worker.removeEventListener('message', handler)
            resolve(e.data.matches)
          }
          if (e.data.type === 'error') {
            worker.removeEventListener('message', handler)
            reject(new Error(e.data.error))
          }
        }
        worker.addEventListener('message', handler)
        worker.postMessage({ type: 'search', transcript: text })
      })

      if (matches && matches.length > 0 && matches[0].score > 0.5) {
        const best = matches[0]
        store.setDetectionResult({
          verse: {
            ref: best.reference,
            reference: best.reference,
            book: best.book,
            chapter: best.chapter,
            verse: best.verse,
            text: best.text,
          },
          book: best.book,
          chapter: best.chapter,
          confidence: Math.round(best.score * 100),
          source: 'semantic',
        })
      }
    } catch (err) {
      console.error('Semantic search failed:', err)
    }

    setIsSearching(false)
  }

  return {
    isSemanticLoaded,
    isSearching,
    detect,
    loadSemanticModel,
  }
}
