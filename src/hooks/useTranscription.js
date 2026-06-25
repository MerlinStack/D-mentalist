import { useRef, useCallback, useState } from 'react'

let whisperWorker = null

function getWorker() {
  if (!whisperWorker) {
    whisperWorker = new Worker(
      new URL('../workers/whisper.worker.js', import.meta.url),
      { type: 'module' }
    )
  }
  return whisperWorker
}

export function useTranscription() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const resolveRef = useRef(null)

  const loadModel = useCallback(() => {
    return new Promise((resolve) => {
      const worker = getWorker()
      worker.addEventListener('message', function handler(e) {
        if (e.data.type === 'loaded') {
          setIsModelLoaded(true)
          worker.removeEventListener('message', handler)
          resolve(true)
        }
        if (e.data.type === 'error') {
          worker.removeEventListener('message', handler)
          resolve(false)
        }
      })
      worker.postMessage({ type: 'load' })
    })
  }, [])

  const transcribe = useCallback((audioBlob) => {
    return new Promise((resolve, reject) => {
      setIsTranscribing(true)
      const worker = getWorker()
      resolveRef.current = { resolve, reject }

      const handler = (e) => {
        if (e.data.type === 'result') {
          setTranscript(e.data.text)
          setIsTranscribing(false)
          worker.removeEventListener('message', handler)
          resolve(e.data.text)
        }
        if (e.data.type === 'error') {
          setIsTranscribing(false)
          worker.removeEventListener('message', handler)
          reject(new Error(e.data.error))
        }
      }
      worker.addEventListener('message', handler)
      worker.postMessage({ type: 'transcribe_raw', audioData: audioBlob })
    })
  }, [])

  return {
    isModelLoaded,
    isTranscribing,
    transcript,
    loadModel,
    transcribe,
  }
}
