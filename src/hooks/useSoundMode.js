import { useRef, useCallback, useEffect, useState } from 'react'
import { useSoundStore } from '../store/soundStore'
import { useScriptureStore } from '../store/scriptureStore'
import { useProjectionStore } from '../store/projectionStore'
import { SOUND_MODE_TRIGGER_WORDS } from '../constants'
import { searchByKeyword, fetchMultipleVerses } from '../api/bible'
import { getApiCode } from '../data/versions'

const $s = () => useSoundStore.getState()

function normalise(verse) {
  const ref = verse.ref || verse.reference || ''
  return { ...verse, ref, reference: ref }
}

export function useSoundMode() {
  const isListening   = useSoundStore(s => s.isListening)
  const sensitivity   = useSoundStore(s => s.sensitivity)
  const isProcessing  = useSoundStore(s => s.isProcessing)
  const detectedVerse = useSoundStore(s => s.detectedVerse)
  const error         = useSoundStore(s => s.error)
  const setSensitivity = useSoundStore(s => s.setSensitivity)

  const scriptureStore    = useScriptureStore()
  const recognitionRef    = useRef(null)
  const detectionTimerRef = useRef(null)
  const streamRef         = useRef(null)
  const channelRef        = useRef(null)
  const [stream, setStream] = useState(null)

  useEffect(() => {
    channelRef.current = new BroadcastChannel('dmentalist-projection')
    return () => channelRef.current?.close()
  }, [])

  const fetchAndProject = useCallback(async (references) => {
    if (!references?.length) return

    const translation = getApiCode(scriptureStore.activeTranslation)

    try {
      const verses = await fetchMultipleVerses(references, translation)
      if (!verses.length) return

      const verse = normalise(verses[0])

      scriptureStore.setResults(verses.map(normalise))
      scriptureStore.setQuery(verse.ref)
      scriptureStore.addToHistory(verse.ref)

      useProjectionStore.getState().projectVerse(verse)

      channelRef.current?.postMessage({
        type:  'PROJECT_VERSE',
        verse,
      })

    } catch (err) {
      console.error('fetchAndProject failed:', err)
    }
  }, [scriptureStore])

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

  const debouncedDetection = useCallback((text) => {
    if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current)

    detectionTimerRef.current = setTimeout(async () => {
      const chunk = text.trim()
      if (chunk.length < 8) return

      $s().setProcessing(true)

      try {
        const lower      = chunk.toLowerCase()
        const hasTrigger = SOUND_MODE_TRIGGER_WORDS.some(w => lower.includes(w))

        if (hasTrigger) {
          const searchText = lower
            .replace(new RegExp(SOUND_MODE_TRIGGER_WORDS.join('|'), 'gi'), '')
            .trim()

          if (searchText.length > 3) {
            const results = await searchByKeyword(searchText)
            if (results.length) {
              const verse = normalise(results[0])
              const shouldAutoProject = sensitivity === 'high' || sensitivity === 'medium'

              $s().setDetectedVerse({
                detected:            true,
                references:          [verse.ref],
                spokenAs:            chunk,
                confidence:          'medium',
                pendingConfirmation: !shouldAutoProject,
              })

              if (shouldAutoProject) {
                await fetchAndProject([verse.ref])
              }
            }
          }
        }

      } catch (err) {
        console.error('Sound mode detection error:', err)
      }

      $s().setProcessing(false)
    }, 1500)
  }, [fetchAndProject, sensitivity])

  const startListening = useCallback(async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      $s().setError('Sound Mode requires Chrome or Edge.')
      return
    }

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = micStream
      setStream(micStream)

      const recognition           = new SpeechRecognition()
      recognition.continuous      = true
      recognition.interimResults  = true
      recognition.lang            = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
        }
        if (final.trim()) {
          $s().appendTranscript(final.trim())
          debouncedDetection(final.trim())
        }
      }

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error)
        if (e.error === 'not-allowed' || e.error === 'audio-capture') {
          $s().setError(`Microphone error: ${e.error}`)
          cleanup()
          $s().setListening(false)
        }
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
      $s().setDetectedVerse(null)

    } catch {
      $s().setError('Microphone access denied. Allow mic access and try again.')
    }
  }, [cleanup, debouncedDetection])

  const stopListening = useCallback(() => {
    cleanup()
    $s().setListening(false)
    $s().setProcessing(false)
    $s().setAudioLevel(0)
    $s().setDetectedVerse(null)
  }, [cleanup])

  useEffect(() => {
    return () => {
      cleanup()
      $s().setListening(false)
      $s().setProcessing(false)
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
