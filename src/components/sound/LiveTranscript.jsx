import { useEffect, useRef } from 'react'

export default function LiveTranscript({ transcript, detectedVerse, isProcessing }) {
  const scrollRef = useRef(null)
  const lines = transcript.split('\n').filter(Boolean)
  const recent = lines.slice(-6)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [recent, detectedVerse])

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
        LIVE TRANSCRIPT
        {isProcessing && (
          <span className="inline-flex gap-0.5 ml-1">
            <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </h4>

      <div ref={scrollRef} className="max-h-36 overflow-y-auto space-y-0.5 text-sm custom-scrollbar">
        {recent.length === 0 && (
          <p className="text-text-muted italic text-xs p-2">Waiting for speech...</p>
        )}
        {recent.map((line, i) => {
          const isDetected = detectedVerse?.spokenAs &&
            line.toLowerCase().includes(detectedVerse.spokenAs.toLowerCase())
          return (
            <div
              key={i}
              className={`p-2 rounded-lg transition-colors ${
                isDetected
                  ? 'bg-accent/15 border-l-2 border-accent'
                  : 'bg-surface/50'
              }`}
            >
              <p className={isDetected ? 'text-accent font-medium' : 'text-text-primary'}>
                {line}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
