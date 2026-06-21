import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSoundStore = create(
  persist(
    (set, get) => ({
      isListening: false,
      transcript: '',
      recentChunk: '',
      detectedVerse: null,
      sensitivity: 'medium',
      isProcessing: false,
      audioLevel: 0,
      error: null,

      setListening: (isListening) => set({ isListening }),
      appendTranscript: (text) => {
        const current = get().transcript
        const lines = (current + '\n' + text).split('\n')
        const trimmed = lines.slice(-300).join('\n')
        set({ transcript: trimmed, recentChunk: text })
      },
      setRecentChunk: (recentChunk) => set({ recentChunk }),
      setDetectedVerse: (detectedVerse) => set({ detectedVerse }),
      setAudioLevel: (audioLevel) => set({ audioLevel }),
      setSensitivity: (sensitivity) => set({ sensitivity }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      setError: (error) => set({ error }),

      clearTranscript: () => set({
        transcript: '', recentChunk: '', detectedVerse: null,
      }),

      reset: () => set({
        isListening: false, transcript: '', recentChunk: '',
        detectedVerse: null, isProcessing: false, audioLevel: 0, error: null,
      }),
    }),
    {
      name: 'dmentalist-sound',
      partialize: (state) => ({ sensitivity: state.sensitivity }),
    }
  )
)
