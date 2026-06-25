import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const themeConfig = {
  dark: {
    label: 'Dark',
    backgroundColor: '#0F0F0F',
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
  large:  48,
  xlarge: 64,
}

export const useProjectionStore = create(
  persist(
    (set, get) => ({
      currentVerse:    null,
      theme:           'dark',
      fontSize:        'large',
      showReference:   true,
      showTranslation: true,
      queue:           [],
      isProjecting:    false,

      // ✅ FIX: normalise verse shape here so reference is always present
      projectVerse: (verse) => {
        const normalised = {
          ...verse,
          reference: verse.reference || verse.ref || '',
          ref:       verse.ref       || verse.reference || '',
        }
        const queue = get().queue
        set({ currentVerse: normalised, queue, isProjecting: true })
      },

      clearProjection: () => set({
        currentVerse: null,
        queue:        [],
        isProjecting: false,
      }),

      setIsProjecting: (val) => set({ isProjecting: val }),

      setTheme:           (theme)           => set({ theme }),
      setFontSize:        (fontSize)        => set({ fontSize }),
      setShowReference:   (showReference)   => set({ showReference }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),

      addToQueue: (verse) => {
        const normalised = {
          ...verse,
          reference: verse.reference || verse.ref || '',
          ref:       verse.ref       || verse.reference || '',
          queuedAt:  Date.now(),
        }
        const queue = [...get().queue, normalised]
        set({ queue: queue.slice(-10) })
      },

      removeFromQueue: (index) => {
        const queue = [...get().queue]
        queue.splice(index, 1)
        set({ queue })
      },

      projectNext: () => {
        const [next, ...rest] = get().queue
        if (next) {
          set({ currentVerse: next, queue: rest, isProjecting: true })
        } else {
          set({ currentVerse: null, queue: [], isProjecting: false })
        }
      },
    }),
    {
      name: 'dmentalist-projection',
      partialize: (state) => ({
        theme:           state.theme,
        fontSize:        state.fontSize,
        showReference:   state.showReference,
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