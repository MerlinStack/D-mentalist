import { useRef, useCallback, useEffect, useState } from 'react'
import { useSoundStore } from '../store/soundStore'
import { useScriptureStore } from '../store/scriptureStore'
import { useProjectionStore } from '../store/projectionStore'
import { detectScriptureInSpeech, identifyScripture } from '../api/anthropic'
import { SOUND_MODE_TRIGGER_WORDS } from '../constants'
import { searchByKeyword, fetchMultipleVerses } from '../api/bible'
import { getApiCode } from '../data/versions'

const $s = () => useSoundStore.getState()

export function useSoundMode() {
  const isListening = useSoundStore(s => s.isListening)
  const sensitivity = useSoundStore(s => s.sensitivity)
  const isProcessing = useSoundStore(s => s.isProcessing)
  const detectedVerse = useSoundStore(s => s.detectedVerse)
  const error = useSoundStore(s => s.error)
  const setSensitivity = useSoundStore(s => s.setSensitivity)

  const scripture = useScriptureStore()

  const recognitionRef = useRef(null)
  const detectionTimerRef = useRef(null)
  const streamRef = useRef(null)
  const channelRef = useRef(null)
  const [stream, setStream] = useState(null)

  useEffect(() => {
    channelRef.current = new BroadcastChannel('dmentalist-projection')
    return () => channelRef.current?.close()
  }, [])

  const triggerSearch = useCallback(async (query) => {
    const translation = getApiCode(scripture.activeTranslation)
    const aiData = await identifyScripture(query, translation)
    if (aiData.references.length > 0) {
      const verses = await fetchMultipleVerses(aiData.references, translation)
      scripture.setResults(verses.map(v => ({ ...v, aiData })))
      scripture.addToHistory(query)
      if (verses.length > 0) {
        const data = {
          text: verses[0].text,
          reference: verses[0].ref,
          translation: verses[0].translation,
        }
        useProjectionStore.getState().projectVerse(data)
        channelRef.current?.postMessage({ type: 'PROJECT_VERSE', verse: data })
      }
    }
  }, [scripture])

  const cleanup = useCallback(() => {
    if (detectionTimerRef.current) {
      clearTimeout(detectionTimerRef.current)
      detectionTimerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
      recognitionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = micStream
      setStream(micStream)

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        $s().setError('Sound Mode requires Chrome or Edge.')
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript
          }
        }
        if (final) {
          const trimmed = final.trim()
          $s().appendTranscript(trimmed)
          debouncedDetection(trimmed)
        }
      }

      recognition.onerror = () => {
        $s().setError('Speech recognition error')
        cleanup()
      }

      recognition.onend = () => {
        if ($s().isListening) {
          try { recognition.start() } catch {}
        }
      }

      recognition.start()
      recognitionRef.current = recognition
      $s().setListening(true)
      $s().setError(null)
    } catch {
      $s().setError('Microphone access denied')
    }
  }, [cleanup])

  const stopListening = useCallback(() => {
    cleanup()
    $s().setListening(false)
    $s().setProcessing(false)
    $s().setAudioLevel(0)
  }, [cleanup])

  const debouncedDetection = useCallback((text) => {
    if (detectionTimerRef.current) {
      clearTimeout(detectionTimerRef.current)
    }

    detectionTimerRef.current = setTimeout(async () => {
      const chunk = text.trim()
      if (chunk.length < 10) return

      $s().setProcessing(true)

      const result = await detectScriptureInSpeech(chunk)

      if (result?.detected) {
        const sens = $s().sensitivity
        const confidence = result.confidence

        const shouldProject =
          sens === 'high' ||
          (sens === 'medium' && confidence !== 'low') ||
          (sens === 'low' && confidence === 'high')

        if (shouldProject) {
          $s().setDetectedVerse(result)
          if (result.references?.length > 0) {
            triggerSearch(result.references[0])
          }
        } else {
          $s().setDetectedVerse({ ...result, pendingConfirmation: true })
        }
        $s().setProcessing(false)
        return
      }

      const lower = chunk.toLowerCase()
      const hasTrigger = SOUND_MODE_TRIGGER_WORDS.some(w => lower.includes(w))

      if (hasTrigger) {
        const searchText = lower.replace(
          new RegExp(SOUND_MODE_TRIGGER_WORDS.join('|'), 'g'), ''
        ).trim()
        if (searchText) {
          const results = await searchByKeyword(searchText)
          if (results.length > 0) {
            $s().setDetectedVerse({
              detected: true,
              references: [results[0].ref],
              spokenAs: chunk,
              confidence: 'medium',
              pendingConfirmation: true,
            })
            triggerSearch(searchText)
          }
        }
      }

      $s().setProcessing(false)
    }, 1500)
  }, [triggerSearch])

  useEffect(() => {
    return () => {
      cleanup()
      useSoundStore.getState().setListening(false)
      useSoundStore.getState().setProcessing(false)
      useSoundStore.getState().setAudioLevel(0)
    }
  }, [cleanup])

  return {
    stream,
    isListening,
    sensitivity,
    isProcessing,
    detectedVerse,
    error,
    startListening,
    stopListening,
    setSensitivity,
  }
}
