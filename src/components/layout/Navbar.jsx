import { NavLink } from 'react-router-dom'
import { useSoundMode } from '../../hooks/useSoundMode'
import { useProjection } from '../../hooks/useProjection'

export default function Navbar() {
  const { isListening, startListening, stopListening } = useSoundMode()
  const { openProjectionWindow } = useProjection()

  return (
    <nav className="sticky top-0 z-40 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">D</span>
            </div>
            <span className="text-base font-display font-bold text-text-primary hidden sm:block">
              D'mentalist
            </span>
          </NavLink>

          <div className="flex items-center gap-1.5">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isListening
                  ? 'bg-accent/20 text-accent shadow-sm shadow-accent/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">
                {isListening ? 'Sound On' : 'Sound Mode'}
              </span>
              {isListening && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              )}
            </button>

            <button
              onClick={openProjectionWindow}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Open Projector</span>
            </button>

            <NavLink
              to="/admin"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
