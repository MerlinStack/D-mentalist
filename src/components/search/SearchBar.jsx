import { useScriptureSearch } from '../../hooks/useScriptureSearch'
import { SEARCH_MODES } from '../../constants'
import { useState, useRef, useEffect } from 'react'

const modes = [
  { id: SEARCH_MODES.FUZZY, label: 'Quote' },
  { id: SEARCH_MODES.SEMANTIC, label: 'Theme' },
  { id: SEARCH_MODES.EXACT, label: 'Reference' },
]

const placeholders = [
  'For God so loved...',
  'Verse about anxiety',
  'Romans 8:28',
  'Love is patient...',
  'Search verses, type a quote, or describe a theme...',
]

export default function SearchBar() {
  const { query, setQuery, search, searchMode, setSearchMode, isSearching } = useScriptureSearch()
  const [localQuery, setLocalQuery] = useState(query)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  const handleSearch = () => {
    if (localQuery.trim() && !isSearching) search(localQuery.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            className={`w-full pl-12 pr-4 py-3.5 bg-surface-lighter border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm ${
              isSearching
                ? 'animate-border-pulse'
                : 'border-white/10 focus:border-primary/50'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
            {localQuery && (
              <button
                type="button"
                onClick={() => { setLocalQuery(''); setQuery('') }}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface/50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-xs text-text-muted bg-surface rounded border border-white/10">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center bg-surface-lighter rounded-xl border border-white/10 p-1">
          {modes.map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSearchMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                searchMode === mode.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !localQuery.trim()}
          className="px-5 py-3.5 bg-primary hover:bg-primary-light disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
        >
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Search'
          )}
        </button>
      </div>
    </div>
  )
}
