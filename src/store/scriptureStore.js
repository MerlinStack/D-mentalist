import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getChapter } from '../api/bible'
import { getApiCode, DEFAULT_TRANSLATION } from '../data/versions'

const USAGE_KEY = 'dmentalist-usage'

function loadUsage() {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY)) || { searchesToday: 0, searchesWeek: 0, topQueries: [], dailyLog: {} }
  } catch {
    return { searchesToday: 0, searchesWeek: 0, topQueries: [], dailyLog: {} }
  }
}

function saveUsage(data) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(data))
}

export const useScriptureStore = create(
  persist(
    (set, get) => ({
      query: '',
      results: [],
      activeVerse: null,
      isSearching: false,
      searchError: null,
      searchHistory: [],
      activeTranslation: DEFAULT_TRANSLATION,
      searchMode: 'fuzzy',

      setQuery: (query) => set({ query }),
      setSearchMode: (searchMode) => set({ searchMode }),
      setSearching: (isSearching) => set({ isSearching }),
      setSearchError: (searchError) => set({ searchError }),
      setResults: (results) => set({ results }),

      setTranslation: (activeTranslation) => set({ activeTranslation }),

      setActiveVerse: (verse) => set({ activeVerse: verse }),

      addToHistory: (query) => {
        const history = [
          { query, timestamp: Date.now() },
          ...get().searchHistory.filter(h => h.query !== query),
        ].slice(0, 20)
        set({ searchHistory: history })

        const usage = loadUsage()
        const today = new Date().toISOString().split('T')[0]
        usage.dailyLog[today] = (usage.dailyLog[today] || 0) + 1
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        const weekDays = Object.entries(usage.dailyLog)
          .filter(([d]) => d >= weekKey)
        usage.searchesToday = usage.dailyLog[today] || 0
        usage.searchesWeek = weekDays.reduce((s, [, c]) => s + c, 0)

        const existing = usage.topQueries.find(q => q.query === query)
        if (existing) {
          existing.count++
        } else {
          usage.topQueries.push({ query, count: 1 })
        }
        usage.topQueries.sort((a, b) => b.count - a.count)
        usage.topQueries = usage.topQueries.slice(0, 20)
        saveUsage(usage)
      },

      clearHistory: () => set({ searchHistory: [] }),

      clearResults: () => set({ results: [], activeVerse: null, searchError: null }),

      loadChapter: async (book, chapter) => {
        const translation = getApiCode(get().activeTranslation)
        const chapterVerses = await getChapter(book, chapter, translation)
        set({ results: chapterVerses })
      },
    }),
    {
      name: 'dmentalist-v1',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        activeTranslation: state.activeTranslation,
      }),
    }
  )
)
