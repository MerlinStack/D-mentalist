import { useCallback, useRef, useEffect, useState } from 'react'
import { useProjectionStore } from '../store/projectionStore'
import { useAuth } from './useAuth'
import { startServiceSession, logProjectedVerse } from '../lib/firestore'
const CHANNEL = 'dmentalist-projection'

function postMessageSafe(channel, message) {
  try {
    channel?.postMessage(message)
  } catch {
    // Browser extensions sometimes intercept BroadcastChannel messages
  }
}

// ✅ FIX: normalise verse so both ref and reference fields are always present
function normaliseVerse(verse) {
  return {
    ...verse,
    reference: verse.reference || verse.ref || '',
    ref:       verse.ref       || verse.reference || '',
  }
}

export function useProjection() {
  const store              = useProjectionStore()
  const channelRef         = useRef(null)
  const projectionWindowRef = useRef(null)
  const sessionIdRef       = useRef(null)
  const { user }           = useAuth()
  const sessionStartedRef  = useRef(false)

  // Start Firebase session when user logs in
  useEffect(() => {
    if (user && !sessionStartedRef.current) {
      sessionStartedRef.current = true
      startServiceSession(user.uid)
        .then((id) => { sessionIdRef.current = id })
        .catch(() => {})
    }
  }, [user])

  // BroadcastChannel setup — listen for READY from projection window
  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL)

    channelRef.current.addEventListener('message', (e) => {
      if (e.data.type !== 'READY') return
      const s = useProjectionStore.getState()
      if (s.currentVerse) {
        postMessageSafe(channelRef.current, {
          type:  'PROJECT_VERSE',
          verse: normaliseVerse(s.currentVerse),
        })
      }
      postMessageSafe(channelRef.current, { type: 'SET_THEME',           theme:           s.theme           })
      postMessageSafe(channelRef.current, { type: 'SET_FONT_SIZE',       fontSize:        s.fontSize        })
      postMessageSafe(channelRef.current, { type: 'SET_SHOW_REFERENCE',  showReference:   s.showReference   })
      postMessageSafe(channelRef.current, { type: 'SET_SHOW_TRANSLATION',showTranslation: s.showTranslation })
    })

    return () => channelRef.current?.close()
  }, [])

  const send = useCallback((type, payload = {}) => {
    postMessageSafe(channelRef.current, { type, ...payload })
  }, [])

  // ── Core: project a verse to BOTH displays simultaneously ─────────
  const projectVerse = useCallback((verse) => {
    const v = normaliseVerse(verse)

    // 1. Update store — sets isProjecting: true — triggers main content takeover
    store.projectVerse(v)

    // 2. Send to /projection window
    send('PROJECT_VERSE', { verse: v })

    // 3. Log to Firebase
    if (user && sessionIdRef.current) {
      logProjectedVerse(user.uid, sessionIdRef.current, v).catch(() => {})
    }
  }, [store, send, user])

  // ── Open projection window only (no verse yet) ────────────────────
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

  // ── Open window AND project verse ─────────────────────────────────
  const openAndProject = useCallback((verse) => {
    const v = normaliseVerse(verse)

    // Always update store immediately — main content area updates right away
    store.projectVerse(v)

    // Log to Firebase
    if (user && sessionIdRef.current) {
      logProjectedVerse(user.uid, sessionIdRef.current, v).catch(() => {})
    }

    if (!projectionWindowRef.current || projectionWindowRef.current.closed) {
      const w = window.open(
        '/projection',
        'dmentalist-projection',
        'width=1920,height=1080,menubar=no,toolbar=no,location=no,personalbar=no,status=no'
      )
      projectionWindowRef.current = w
      // The READY handshake in the effect above resends current verse automatically
      // No magic setTimeout needed
    } else {
      projectionWindowRef.current.focus()
      send('PROJECT_VERSE', { verse: v })
    }
  }, [store, send, user])

  const closeProjectionWindow = useCallback(() => {
    if (projectionWindowRef.current && !projectionWindowRef.current.closed) {
      projectionWindowRef.current.close()
    }
    projectionWindowRef.current = null
    store.clearProjection()
    send('CLEAR')
  }, [store, send])

  const clearProjection = useCallback(() => {
    store.clearProjection()   // sets isProjecting: false — search interface returns
    send('CLEAR')             // clears /projection window
  }, [store, send])

  const projectNext = useCallback(() => {
    const next = store.queue[0]
    if (!next) return
    const v = normaliseVerse(next)
    store.projectNext()                      // advances queue, sets currentVerse
    send('PROJECT_VERSE', { verse: v })
    if (user && sessionIdRef.current) {
      logProjectedVerse(user.uid, sessionIdRef.current, v).catch(() => {})
    }
  }, [store, send, user])

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
    currentVerse:      store.currentVerse,
    queue:             store.queue,
    theme:             store.theme,
    fontSize:          store.fontSize,
    showReference:     store.showReference,
    showTranslation:   store.showTranslation,
    isProjecting:      store.isProjecting,
    projectVerse,
    openAndProject,
    addToQueue:        store.addToQueue,
    projectNext,
    removeFromQueue:   store.removeFromQueue,
    setTheme:          broadcastTheme,
    setFontSize:       broadcastFontSize,
    setShowReference:  broadcastShowReference,
    setShowTranslation: broadcastShowTranslation,
    clearProjection,
    openProjectionWindow,
    closeProjectionWindow,
  }
}

export function useProjectionListener() {
  const [state, setState] = useState({
    currentVerse:    null,
    theme:           'dark',
    fontSize:        'large',
    showReference:   true,
    showTranslation: true,
    visible:         false,
  })

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL)

    const handleMessage = (e) => {
      const { type } = e.data
      if (!type) return

      if (type === 'PROJECT_VERSE') {
        setState((s) => ({ ...s, currentVerse: e.data.verse, visible: true }))
      } else if (type === 'CLEAR') {
        setState((s) => ({ ...s, visible: false }))
        setTimeout(() => {
          setState((s) => (s.visible ? s : { ...s, currentVerse: null }))
        }, 500)
      } else if (type === 'SET_THEME') {
        setState((s) => ({ ...s, theme: e.data.theme }))
      } else if (type === 'SET_FONT_SIZE') {
        setState((s) => ({ ...s, fontSize: e.data.fontSize }))
      } else if (type === 'SET_SHOW_REFERENCE') {
        setState((s) => ({ ...s, showReference: e.data.showReference }))
      } else if (type === 'SET_SHOW_TRANSLATION') {
        setState((s) => ({ ...s, showTranslation: e.data.showTranslation }))
      }
    }

    channel.addEventListener('message', handleMessage)

    // Signal ready after listener is registered
    setTimeout(() => {
      postMessageSafe(channel, { type: 'READY' })
    }, 100)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [])

  return state
}