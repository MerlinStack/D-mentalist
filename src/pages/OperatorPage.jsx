import { useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import { useScriptureStore } from '../store/scriptureStore'
import { useSoundStore } from '../store/soundStore'
import { useSoundMode } from '../hooks/useSoundMode'
import { useProjection } from '../hooks/useProjection'
import SearchBar from '../components/search/SearchBar'
import SearchResults from '../components/search/SearchResults'
import VerseDetail from '../components/verse/VerseDetail'
import ProjectionBar from '../components/projection/ProjectionBar'
import SoundModePanel from '../components/sound/SoundModePanel'
import TranslationSwitcher from '../components/verse/TranslationSwitcher'

export default function OperatorPage() {
  const { results, searchHistory, setActiveVerse, setQuery, search } = useScriptureStore()
  const { startListening, stopListening, isListening } = useSoundMode()
  const { openProjectionWindow, clearProjection } = useProjection()
  const soundStore = useSoundStore()

  useEffect(() => {
    const handle = (e) => {
      const meta = e.ctrlKey || e.metaKey

      if (meta && e.key === 'k') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
        return
      }

      if (meta && e.key === 'm') {
        e.preventDefault()
        if (isListening) stopListening()
        else startListening()
        return
      }

      if (meta && e.key === 'p') {
        e.preventDefault()
        openProjectionWindow()
        return
      }

      if (meta && e.key === 'l') {
        e.preventDefault()
        clearProjection()
        return
      }

      if (e.key === 'Escape') {
        soundStore.setDetectedVerse(null)
        return
      }

      if (/^[1-9]$/.test(e.key) && !meta && !e.altKey && !e.shiftKey) {
        const idx = parseInt(e.key, 10) - 1
        if (idx < results.length) {
          setActiveVerse(results[idx])
          document.getElementById('search-input')?.focus()
        }
        return
      }
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [results, isListening, startListening, stopListening, openProjectionWindow, clearProjection, soundStore, setActiveVerse])

  return (
    <AppShell>
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-white/5 bg-surface/50 hidden lg:flex flex-col overflow-y-auto">
          <div className="p-4 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Translation
              </h3>
              <TranslationSwitcher />
            </div>

            {searchHistory.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Recent Searches
                </h3>
                <div className="space-y-0.5">
                  {searchHistory.slice(0, 8).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(s.query); search(s.query) }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors truncate"
                    >
                      {s.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <SoundModePanel />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 pb-0">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-display font-bold text-text-primary">Scripture Search</h1>
              <p className="text-sm text-text-muted mt-1">Search by reference, keyword, or partial quote</p>
              <div className="mt-4">
                <SearchBar />
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden mt-4">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-w-3xl mx-auto">
                <SearchResults />
              </div>
            </div>
            <div className="w-96 shrink-0 border-l border-white/5 overflow-y-auto hidden xl:block">
              <VerseDetail />
            </div>
          </div>
        </div>
      </div>

      <ProjectionBar />
    </div>
    </AppShell>
  )
}
