import { useEffect, useRef, useState, useCallback } from 'react'

interface EmbeddingRecord {
  book: string
  chapter: number
  verse: number
  vector: number[]
}

interface SearchMatch extends EmbeddingRecord {
  score: number
  index: number
}

export function useSemanticWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/semantic.worker', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (event) => {
      const { type, error } = event.data
      if (type === 'loaded') {
        setIsLoaded(true)
      }
      if (type === 'error') {
        console.error('Semantic worker error:', error)
      }
    }

    workerRef.current.postMessage({ type: 'load' })

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const searchSemantic = useCallback((query: string): Promise<SearchMatch[]> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Semantic worker not created'))
        return
      }

      const handler = (event: MessageEvent) => {
        const { type, matches, error } = event.data
        if (type === 'results') {
          workerRef.current?.removeEventListener('message', handler)
          resolve(matches || [])
        }
        if (type === 'error') {
          workerRef.current?.removeEventListener('message', handler)
          reject(new Error(error))
        }
      }

      workerRef.current.addEventListener('message', handler)
      workerRef.current.postMessage({ type: 'search', payload: query })

      setTimeout(() => {
        workerRef.current?.removeEventListener('message', handler)
        reject(new Error('Semantic search timeout'))
      }, 10000)
    })
  }, [])

  const loadEmbeddings = useCallback((embeddings: EmbeddingRecord[]) => {
    workerRef.current?.postMessage({
      type: 'loadEmbeddings',
      payload: { embeddings },
    })
  }, [])

  return { searchSemantic, loadEmbeddings, isLoaded }
}
