import { useState } from 'react'
import { useSoundMode } from '../../hooks/useSoundMode'
import { useAudioMeter } from '../../hooks/useAudioMeter'
import { useSoundStore } from '../../store/soundStore'
import { useProjection } from '../../hooks/useProjection'
import AudioMeter from './AudioMeter'
import LiveTranscript from './LiveTranscript'
import Button from '../ui/Button'

const SENSITIVITY_OPTS = ['low', 'medium', 'high']

const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export default function SoundModePanel() {
  const {
    stream, isListening, sensitivity, isProcessing,
    detectedVerse, error,
    startListening, stopListening, setSensitivity,
  } = useSoundMode()

  const { transcript } = useSoundStore()
  const audioLevel = useAudioMeter(stream)
  const { projectVerse } = useProjection()

  return (
    <div className="rounded-xl border border-white/5 bg-surface-lighter/50 overflow-hidden">
      {isMobile && (
        <div className="px-4 pt-3">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent">
            Sound Mode is optimized for desktop Chrome and Edge. Mobile browsers may not support speech recognition.
          </div>
        </div>
      )}
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="text-sm font-semibold text-text-primary">Sound Mode</span>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
          <Button
            size="sm"
            variant={isListening ? 'danger' : 'primary'}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? 'OFF' : 'ON'}
          </Button>
        </div>
      </div>

      {isListening && (
        <div className="px-4 pb-4 space-y-4">
          {/* Volume meter */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <AudioMeter level={audioLevel} />
            </div>
            <span className="text-xs font-mono text-text-muted w-8 text-right tabular-nums">
              {Math.round(audioLevel)}%
            </span>
          </div>

          {/* Transcript */}
          <LiveTranscript
            transcript={transcript}
            detectedVerse={detectedVerse}
            isProcessing={isProcessing}
          />

          {/* Detection notification */}
          {detectedVerse?.detected && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-slide-up">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-light font-semibold">
                    Detected: {detectedVerse.references?.[0]}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wide ${
                    detectedVerse.confidence === 'high' ? 'text-emerald-400' :
                    detectedVerse.confidence === 'medium' ? 'text-accent' : 'text-text-muted'
                  }`}>
                    {detectedVerse.confidence}
                  </span>
                </div>
              </div>
              <p className="text-xs text-text-secondary italic mb-2">
                "{detectedVerse.spokenAs}"
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => detectedVerse.references?.[0] && projectVerse({ text: detectedVerse.spokenAs, ref: detectedVerse.references[0], translation: '' })}
                >
                  Project
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {}}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-muted">Sensitivity</label>
              <span className="text-xs text-text-primary font-medium capitalize">{sensitivity}</span>
            </div>
            <div className="flex gap-1">
              {SENSITIVITY_OPTS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSensitivity(opt)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sensitivity === opt
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-lighter'
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
