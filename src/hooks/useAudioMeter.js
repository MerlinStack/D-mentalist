import { useEffect, useRef, useState } from 'react'

/**
 * Real-time audio volume analyser.
 *
 * @param {MediaStream|null} stream — microphone stream from useSoundMode
 * @returns {number} audioLevel 0–100, updated ~30 fps
 */
export function useAudioMeter(stream) {
  const [level, setLevel] = useState(0)
  const ctxRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!stream) {
      setLevel(0)
      return
    }

    let cancelled = false
    const audioContext = new AudioContext()
    ctxRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      if (cancelled) return
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const avg = sum / dataArray.length
      const pct = Math.min(Math.round((avg / 255) * 100), 100)
      setLevel(pct)
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      audioContext.close()
    }
  }, [stream])

  return level
}
