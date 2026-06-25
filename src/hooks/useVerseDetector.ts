import { useCallback } from 'react'
import { useSoundStore } from '../store/soundStore'
import { parseScriptureReference } from '../utils/scriptureParser'
import { fetchVerse } from '../api/bible'

export function useVerseDetector() {
  const store = useSoundStore()

  const detectVerse = useCallback(async (text: string) => {
    if (store.lastDetectionTime && Date.now() - store.lastDetectionTime < 5000) return

    const refs = parseScriptureReference(text)
    if (refs.length > 0) {
      try {
        const ref = refs[0]
        const refStr = ref.verseEnd
          ? `${ref.book} ${ref.chapter}:${ref.verse}-${ref.verseEnd}`
          : ref.verse
            ? `${ref.book} ${ref.chapter}:${ref.verse}`
            : `${ref.book} ${ref.chapter}`
        const verse = await fetchVerse(refStr)
        store.setDetectedVerse({
          reference: verse.reference,
          text: verse.text,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          translation: 'KJV',
        })
        return
      } catch (error) {
        console.error('Error fetching verse from ref:', error)
      }
    }

    if (store.currentBook && store.currentChapter) {
      const match = text.match(/verse\s*(\d+)/i)
      if (match) {
        const verseNum = parseInt(match[1])
        try {
          const ref = `${store.currentBook} ${store.currentChapter}:${verseNum}`
          const verse = await fetchVerse(ref)
          store.setDetectedVerse({
            reference: verse.reference,
            text: verse.text,
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            translation: 'KJV',
          })
          return
        } catch (error) {
          console.error('Error fetching verse from context:', error)
        }
      }
    }
  }, [store])

  return { detectVerse }
}
