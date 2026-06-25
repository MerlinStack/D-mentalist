let pipeline = null

self.addEventListener('message', async (e) => {
  const { type, audioData } = e.data

  if (type === 'load') {
    const { pipeline: pipe } = await import('@xenova/transformers')
    pipeline = await pipe('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
      quantized: true,
    })
    self.postMessage({ type: 'loaded' })
    return
  }

  if (type === 'transcribe' && pipeline) {
    try {
      const output = await pipeline(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: false,
      })
      self.postMessage({
        type: 'result',
        text: output.text.trim(),
      })
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: err.message,
      })
    }
    return
  }

  if (type === 'transcribe_raw') {
    try {
      const { pipeline: pipe } = await import('@xenova/transformers')
      const p = await pipe('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        quantized: true,
      })
      const output = await p(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: false,
      })
      self.postMessage({
        type: 'result',
        text: output.text.trim(),
      })
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: err.message,
      })
    }
    return
  }
})
