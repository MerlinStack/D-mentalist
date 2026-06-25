import { useEffect, useState, useCallback } from 'react'
import { useProjectionStore } from '../store/projectionStore'
import { useProjection } from '../hooks/useProjection'
import { useSoundStore } from '../store/soundStore'
import { useScriptureStore } from '../store/scriptureStore'
import { useSoundMode } from '../hooks/useSoundMode'
import { useAISoundMode } from '../hooks/useAISoundMode'

import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import SearchBar from '../components/search/SearchBar'
import SearchResults from '../components/search/SearchResults'
import ProjectionBar from '../components/projection/ProjectionBar'
import ScriptureOverlay from '../components/sound/ScriptureOverlay'
import AudioControls from '../components/sound/AudioControls'
import ConfidenceDisplay from '../components/sound/ConfidenceDisplay'

export default function OperatorPage() {
  const isProjecting = useProjectionStore((s) => s.isProjecting)
  const currentVerse = useProjectionStore((s) => s.currentVerse)
  const { clearProjection, projectNext, projectVerse } = useProjection()

  const isListening = useSoundStore((s) => s.isListening)
  const aiMode = useSoundStore((s) => s.aiMode)
  const setAiMode = useSoundStore((s) => s.setAiMode)
  const whisperModelLoaded = useSoundStore((s) => s.whisperModelLoaded)
  const semanticModelLoaded = useSoundStore((s) => s.semanticModelLoaded)

  const browserSound = useSoundMode()
  const aiSound = useAISoundMode()

  const { activeVerse } = useScriptureStore()
  const [showResults, setShowResults] = useState(false)

  const queueLength = useProjectionStore((s) => s.queue.length)
  const lastDetectionTime = useScriptureStore((s) => s.lastDetectionTime)
  const confidence = useScriptureStore((s) => s.confidence)

  const activeSound = aiMode ? aiSound : browserSound

  const toggleSoundMode = useCallback(() => {
    if (activeSound.isListening) {
      activeSound.stopListening()
    } else {
      activeSound.startListening()
    }
  }, [activeSound])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (isInput && e.key !== 'Escape') return

      switch (e.key) {
        case 'Escape':
          clearProjection()
          setShowResults(false)
          break
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) setShowResults(s => !s)
          break
        case 'n':
        case 'N':
          if (queueLength > 0 && !isProjecting) projectNext()
          break
        case ' ':
          if (activeVerse && !isInput) {
            e.preventDefault()
            projectVerse(activeVerse)
          }
          break
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) toggleSoundMode()
          break
        case 'a':
        case 'A':
          if (!e.ctrlKey && !e.metaKey) setAiMode(!aiMode)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearProjection, projectNext, projectVerse, activeVerse, toggleSoundMode, queueLength, isProjecting, aiMode, setAiMode])

  return (
    <div className="flex flex-col h-screen bg-[#0A0F1E] text-slate-200 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 relative flex flex-col overflow-hidden p-6 gap-4">

          <div className="shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-serif font-bold text-white">
                Scripture Workspace
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-xs text-slate-400">AI Mode</span>
                  <button
                    onClick={() => setAiMode(!aiMode)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      aiMode ? 'bg-violet-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        aiMode ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                {aiMode && (whisperModelLoaded || semanticModelLoaded) && (
                  <div className="flex gap-1">
                    {whisperModelLoaded && (
                      <span className="px-2 py-1 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Whisper
                      </span>
                    )}
                    {semanticModelLoaded && (
                      <span className="px-2 py-1 rounded text-[10px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        MiniLM
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setShowResults(s => !s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                    showResults
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {showResults ? 'Hide Results' : 'Show Results'}
                  <kbd className="ml-1.5 text-[10px] opacity-60">R</kbd>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SearchBar />
              </div>
              {!aiMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSoundMode}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      isListening
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    Sound Mode
                    <kbd className="ml-1 text-[10px] opacity-60">S</kbd>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 space-y-2">
            <ScriptureOverlay />
            {lastDetectionTime && confidence > 0 && (
              <div className="flex items-center gap-2">
                <ConfidenceDisplay />
              </div>
            )}
          </div>

          {showResults && (
            <div className="shrink-0 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-xs font-mono tracking-wider uppercase text-slate-500 mb-3">
                Search Results
              </p>
              <SearchResults />
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center bg-black rounded-2xl border border-slate-800 relative overflow-hidden min-h-0">
            {isProjecting && currentVerse ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-8 md:px-16 lg:px-24 space-y-6">
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">
                    Live Broadcast
                  </span>
                </div>

                <p className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-relaxed italic max-w-5xl">
                  &ldquo;{currentVerse.text || currentVerse.body}&rdquo;
                </p>

                <span className="text-xl md:text-2xl font-medium text-slate-400 font-serif tracking-wide">
                  — {currentVerse.ref || currentVerse.reference}
                </span>

                {currentVerse.translation && (
                  <span className="text-xs uppercase tracking-widest text-slate-500 border border-slate-700 px-3 py-1 rounded-full">
                    {currentVerse.translation}
                  </span>
                )}

                <button
                  onClick={clearProjection}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-semibold border border-rose-500/20 transition-all"
                >
                  Drop Display <kbd className="ml-1 opacity-60">Esc</kbd>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 px-8">
                {isListening ? (
                  <>
                    <div className="relative mx-auto w-fit mb-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                      <div className="w-4 h-4 bg-emerald-500 rounded-full relative" />
                    </div>
                    <p className="text-xl font-medium text-slate-300">
                      {aiMode ? 'AI Mode Active' : 'Sound Mode Active'} &amp; Listening...
                    </p>
                    <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      {aiMode
                        ? 'Whisper STT + MiniLM semantic search active. Audio is processed locally.'
                        : 'Speak or preach. Detected verses will appear here and on the projector automatically.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 bg-slate-600 rounded-full mx-auto mb-2" />
                    <p className="text-xl font-medium text-slate-500">
                      Ready
                    </p>
                    <p className="text-sm text-slate-700 max-w-sm mx-auto leading-relaxed">
                      Enable {aiMode ? 'AI' : 'Sound'} Mode to begin auto-detection, or search for a verse above.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {aiMode && isListening && (
            <div className="shrink-0">
              <AudioControls
                audioLevel={aiSound.audioLevel}
                onStart={aiSound.startListening}
                onStop={aiSound.stopListening}
              />
            </div>
          )}

        </main>
      </div>

      <ProjectionBar />
    </div>
  )
}
