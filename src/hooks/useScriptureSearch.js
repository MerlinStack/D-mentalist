import { useCallback, useEffect, useRef } from 'react'
import { useScriptureStore } from '../store/scriptureStore'
import { parseScriptureReference } from '../utils/scriptureParser'
import { fetchMultipleVerses } from '../api/bible'
import { identifyScripture } from '../api/anthropic'
import { getApiCode } from '../data/versions'

export function useScriptureSearch() {
  const store = useScriptureStore()
  const debounceRef = useRef(null)

  const search = useCallback(async (q) => {
    const query = q || store.query
    if (!query.trim()) return

    store.setQuery(query)
    store.setSearching(true)
    store.setSearchError(null)

    const translation = getApiCode(store.activeTranslation)

    try {
      // Step 1: Try direct reference parse ("John 3:16", "Romans 8:28")
      const parsed = parseScriptureReference(query)
      if (parsed.length > 0) {
        const refStrings = parsed.map(r =>
          r.verseEnd
            ? `${r.book} ${r.chapter}:${r.verse}-${r.verseEnd}`
            : r.verse
              ? `${r.book} ${r.chapter}:${r.verse}`
              : `${r.book} ${r.chapter}`
        )
        const verses = await fetchMultipleVerses(refStrings, translation)
        if (verses.length > 0) {
          store.setResults(verses)
          store.addToHistory(query)
          store.setSearching(false)
          return
        }
      }

      // Step 2: Claude AI semantic identification
      const aiData = await identifyScripture(query, translation)
      if (aiData.references.length > 0) {
        const verses = await fetchMultipleVerses(aiData.references, translation)
        const enriched = verses.map(v => ({ ...v, aiData }))
        store.setResults(enriched)
        store.addToHistory(query)
        store.setSearching(false)
        return
      }

      // Step 3: Nothing found
      store.setResults([])
      store.setSearchError('No verses found. Try a different phrase or reference.')
      store.setSearching(false)
    } catch (err) {
      store.setSearchError(err.message)
      store.setSearching(false)
    }
  }, [store])

  const debouncedSearch = useCallback((q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 300)
  }, [search])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return {
    query: store.query,
    setQuery: store.setQuery,
    results: store.results,
    activeVerse: store.activeVerse,
    setActiveVerse: store.setActiveVerse,
    searchMode: store.searchMode,
    setSearchMode: store.setSearchMode,
    isSearching: store.isSearching,
    searchError: store.searchError,
    search: debouncedSearch,
    searchImmediate: search,
    searchHistory: store.searchHistory,
    clearResults: store.clearResults,
    loadChapter: store.loadChapter,
  }
}
