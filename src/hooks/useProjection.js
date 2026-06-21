import { useCallback, useRef, useEffect, useState } from 'react'
import { useProjectionStore } from '../store/projectionStore'

const CHANNEL = 'dmentalist-projection'

export function useProjection() {
  const store = useProjectionStore()
  const channelRef = useRef(null)
  const projectionWindowRef = useRef(null)

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL)
    return () => channelRef.current?.close()
  }, [])

  const send = useCallback((type, payload) => {
    channelRef.current?.postMessage({ type, ...payload })
  }, [])

  const openProjectionWindow = useCallback(() => {
    if (projectionWindowRef.current && !projectionWindowRef.current.closed) {
      projectionWindowRef.current.focus()
      return
    }
    const w = window.open(
      '/projection',
      'dmentalist-projection',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,personalbar=no,status=no'
    )
    projectionWindowRef.current = w
  }, [])

  const closeProjectionWindow = useCallback(() => {
    if (projectionWindowRef.current && !projectionWindowRef.current.closed) {
      projectionWindowRef.current.close()
    }
    projectionWindowRef.current = null
    store.clearProjection()
    send('CLEAR')
  }, [store, send])

  const projectVerse = useCallback((verse) => {
    store.projectVerse(verse)
    send('PROJECT_VERSE', {
      verse: {
        text: verse.text,
        reference: verse.ref || verse.reference,
        translation: verse.translation,
      },
    })
  }, [store, send])

  const clearProjection = useCallback(() => {
    store.clearProjection()
    send('CLEAR')
  }, [store, send])

  const projectNext = useCallback(() => {
    const next = store.queue[0]
    if (next) {
      store.projectNext()
      send('PROJECT_VERSE', {
        verse: {
          text: next.text,
          reference: next.ref || next.reference,
          translation: next.translation,
        },
      })
    }
  }, [store, send])

  const broadcastTheme = useCallback((theme) => {
    store.setTheme(theme)
    send('SET_THEME', { theme })
  }, [store, send])

  const broadcastFontSize = useCallback((fontSize) => {
    store.setFontSize(fontSize)
    send('SET_FONT_SIZE', { fontSize })
  }, [store, send])

  const broadcastShowReference = useCallback((showReference) => {
    store.setShowReference(showReference)
    send('SET_SHOW_REFERENCE', { showReference })
  }, [store, send])

  const broadcastShowTranslation = useCallback((showTranslation) => {
    store.setShowTranslation(showTranslation)
    send('SET_SHOW_TRANSLATION', { showTranslation })
  }, [store, send])

  return {
    currentVerse: store.currentVerse,
    queue: store.queue,
    theme: store.theme,
    fontSize: store.fontSize,
    showReference: store.showReference,
    showTranslation: store.showTranslation,
    projectVerse,
    addToQueue: store.addToQueue,
    projectNext,
    removeFromQueue: store.removeFromQueue,
    setTheme: broadcastTheme,
    setFontSize: broadcastFontSize,
    setShowReference: broadcastShowReference,
    setShowTranslation: broadcastShowTranslation,
    clearProjection,
    openProjectionWindow,
    closeProjectionWindow,
  }
}

export function useProjectionListener() {
  const [state, setState] = useState({
    currentVerse: null,
    theme: 'dark',
    fontSize: 'large',
    showReference: true,
    showTranslation: true,
    visible: false,
  })

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL)
    channel.onmessage = (e) => {
      const { type } = e.data
      switch (type) {
        case 'PROJECT_VERSE':
          setState((s) => ({
            ...s,
            currentVerse: e.data.verse,
            visible: true,
          }))
          break
        case 'CLEAR':
          setState((s) => ({ ...s, visible: false }))
          setTimeout(() => {
            setState((s) => s.visible ? s : { ...s, currentVerse: null })
          }, 500)
          break
        case 'SET_THEME':
          setState((s) => ({ ...s, theme: e.data.theme }))
          break
        case 'SET_FONT_SIZE':
          setState((s) => ({ ...s, fontSize: e.data.fontSize }))
          break
        case 'SET_SHOW_REFERENCE':
          setState((s) => ({ ...s, showReference: e.data.showReference }))
          break
        case 'SET_SHOW_TRANSLATION':
          setState((s) => ({ ...s, showTranslation: e.data.showTranslation }))
          break
      }
    }
    return () => channel.close()
  }, [])

  return state
}
