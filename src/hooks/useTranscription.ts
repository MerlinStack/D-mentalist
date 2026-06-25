import { useEffect, useRef, useState, useCallback } from 'react'
import { useSoundStore } from '../store/soundStore'

export function useTranscription() {
  const [transcript, setTranscript] = useState('')
  const workerRef = useRef<Worker | null>(null)
  const isLoadedRef = useRef(false)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/whisper.worker', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (event) => {
      const { type, result, text, error } = event.data

      if (type === 'loaded') {
        isLoadedRef.current = true
        useSoundStore.getState().setWhisperModelLoaded(true)
      }

      if (type === 'transcript' || type === 'result') {
        const t = text || result?.text || ''
        setTranscript(t)
        useSoundStore.getState().appendTranscript(t)
      }

      if (type === 'error') {
        console.error('Whisper worker error:', error)
      }
    }

    workerRef.current.postMessage({ type: 'load' })

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const startTranscription = useCallback((audioChunk: Blob) => {
    if (!workerRef.current || !isLoadedRef.current) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      workerRef.current?.postMessage({
        type: 'transcribe_raw',
        payload: arrayBuffer,
      })
    }
    reader.readAsArrayBuffer(audioChunk)
  }, [])

  const stopTranscription = useCallback(() => {
    // Worker stays alive, just stop sending data
  }, [])

  const loadModel = useCallback(() => {
    if (workerRef.current && !isLoadedRef.current) {
      workerRef.current.postMessage({ type: 'load' })
    }
  }, [])

  return { startTranscription, stopTranscription, transcript, loadModel, isModelLoaded: isLoadedRef.current }
}
