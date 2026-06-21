import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const themeConfig = {
  dark: {
    label: 'Dark',
    backgroundColor: '#0f0f1a',
    textColor: '#f1f5f9',
    accentColor: '#8b5cf6',
    fontFamily: 'Playfair Display, serif',
  },
  light: {
    label: 'Light',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#6b3fa0',
    fontFamily: 'Playfair Display, serif',
  },
  warm: {
    label: 'Warm',
    backgroundColor: '#1c1917',
    textColor: '#fef3c7',
    accentColor: '#f59e0b',
    fontFamily: 'Playfair Display, serif',
  },
}

const fontSizeMap = {
  medium: 36,
  large: 48,
  xlarge: 64,
}

export const useProjectionStore = create(
  persist(
    (set, get) => ({
      currentVerse: null,
      theme: 'dark',
      fontSize: 'large',
      showReference: true,
      showTranslation: true,
      queue: [],

      projectVerse: (verse) => {
        const queue = get().queue
        set({ currentVerse: verse, queue })
      },

      clearProjection: () => set({ currentVerse: null, queue: [] }),

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setShowReference: (showReference) => set({ showReference }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),

      addToQueue: (verse) => {
        const queue = [...get().queue, { ...verse, queuedAt: Date.now() }]
        set({ queue: queue.slice(-10) })
      },

      removeFromQueue: (index) => {
        const queue = [...get().queue]
        queue.splice(index, 1)
        set({ queue })
      },

      projectNext: () => {
        const [next, ...rest] = get().queue
        set({ currentVerse: next || null, queue: rest })
      },
    }),
    {
      name: 'dmentalist-projection',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        showReference: state.showReference,
        showTranslation: state.showTranslation,
      }),
    }
  )
)

export function resolveTheme(name) {
  return themeConfig[name] || themeConfig.dark
}

export function resolveFontSize(name) {
  return fontSizeMap[name] || fontSizeMap.large
}
