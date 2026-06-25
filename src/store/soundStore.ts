import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Verse } from '../api/bible'

interface SoundState {
  isListening: boolean
  transcript: string
  recentChunk: string
  detectedVerse: Verse | null
  confidence: number
  sensitivity: 'low' | 'medium' | 'high'
  isProcessing: boolean
  audioLevel: number
  currentBook: string | null
  currentChapter: number | null
  lastDetectionTime: number | null
  error: string | null
  aiMode: boolean
  whisperModelLoaded: boolean
  semanticModelLoaded: boolean
  setListening: (b: boolean) => void
  appendTranscript: (text: string) => void
  setTranscript: (t: string) => void
  setRecentChunk: (t: string) => void
  setDetectedVerse: (v: Verse | null) => void
  setAudioLevel: (n: number) => void
  setSensitivity: (s: 'low' | 'medium' | 'high') => void
  setProcessing: (b: boolean) => void
  setError: (e: string | null) => void
  setAiMode: (b: boolean) => void
  setWhisperModelLoaded: (b: boolean) => void
  setSemanticModelLoaded: (b: boolean) => void
  clearTranscript: () => void
  reset: () => void
}

const initialState = {
  isListening: false,
  transcript: '',
  recentChunk: '',
  detectedVerse: null,
  confidence: 0,
  sensitivity: 'medium' as const,
  isProcessing: false,
  audioLevel: 0,
  currentBook: null as string | null,
  currentChapter: null as number | null,
  lastDetectionTime: null as number | null,
  error: null as string | null,
  aiMode: false,
  whisperModelLoaded: false,
  semanticModelLoaded: false,
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      ...initialState,

      setListening: (isListening) => set({ isListening }),
      appendTranscript: (text) =>
        set((state) => {
          const lines = (state.transcript + ' ' + text).split('\n')
          const kept = lines.slice(-300).join('\n')
          return { transcript: kept, recentChunk: text }
        }),
      setTranscript: (transcript) => set({ transcript }),
      setRecentChunk: (recentChunk) => set({ recentChunk }),
      setDetectedVerse: (verse) => set({
        detectedVerse: verse,
        lastDetectionTime: verse ? Date.now() : null,
      }),
      setAudioLevel: (audioLevel) => set({ audioLevel }),
      setSensitivity: (sensitivity) => set({ sensitivity }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      setError: (error) => set({ error }),
      setAiMode: (aiMode) => set({ aiMode }),
      setWhisperModelLoaded: (whisperModelLoaded) => set({ whisperModelLoaded }),
      setSemanticModelLoaded: (semanticModelLoaded) => set({ semanticModelLoaded }),
      clearTranscript: () => set({ transcript: '', recentChunk: '' }),
      reset: () => set(initialState),
    }),
    {
      name: 'scriptureflow-sound',
      partialize: (state) => ({
        sensitivity: state.sensitivity,
        aiMode: state.aiMode,
      }),
    }
  )
)
