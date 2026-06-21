import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0A0F1E] overflow-hidden">
      {/* Subtle cross/light beam graphic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(79,107,255,0.08) 0%, rgba(79,107,255,0.04) 50%, transparent 70%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" style={{ transform: 'translateX(-50%) rotate(15deg)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-accent/10 via-accent/5 to-transparent" style={{ transform: 'translateX(-50%) rotate(-15deg)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">D</span>
              </div>
              <span className="text-lg font-display font-bold text-text-primary">D'mentalist</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app')}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign In
              </button>
              <Button size="sm" onClick={() => navigate('/app')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse-glow" />
            Now available for churches worldwide
          </div>

          <h1 className="text-5xl sm:text-7xl font-display font-bold text-text-primary mb-5 tracking-tight leading-tight">
            The Word.
            <br />
            <span className="text-accent">Instantly.</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered Scripture detection for live church services.
            <br />
            Type a quote, speak a theme, or let the mic do the work.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/app')}>
              Get Started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/projection')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See it live
            </Button>
          </div>
        </div>

        {/* App screenshot mockup */}
        <div className="relative mt-16 w-full max-w-5xl mx-auto px-4 animate-slide-up">
          <div className="rounded-2xl border border-white/10 bg-surface-light/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-surface/50">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-4 px-3 py-1 rounded-md bg-surface-lighter text-xs text-text-muted font-mono">
                app.dmentalist.com — Operator
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary/30" />
                    <div className="h-4 flex-1 rounded bg-surface-lighter" />
                    <div className="w-16 h-8 rounded-lg bg-primary/30" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { ref: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son...' },
                      { ref: 'Romans 8:28', text: 'And we know that all things work together for good to them that love God...' },
                      { ref: 'Psalm 23:4', text: 'Yea, though I walk through the valley of the shadow of death...' },
                    ].map((v, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${i === 0 ? 'border-accent/30 bg-accent/5 border-l-4 border-l-accent' : 'border-white/5 bg-surface-lighter/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-text-muted">{v.ref}</span>
                          {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">high</span>}
                        </div>
                        <p className="text-sm text-text-primary font-serif">{v.text}</p>
                        <div className="flex gap-2 mt-2">
                          <div className={`w-6 h-5 rounded ${i === 0 ? 'bg-primary/40' : 'bg-surface'}`} />
                          <div className={`w-6 h-5 rounded ${i === 0 ? 'bg-accent/30' : 'bg-surface'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col gap-4 w-48">
                  <div className="p-3 rounded-lg bg-surface-lighter/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                      <span className="text-xs font-semibold text-text-primary">Sound Mode</span>
                    </div>
                    <div className="flex items-end gap-1 h-10 mb-3">
                      {[20, 40, 60, 80, 100, 95, 75, 50, 30, 15].map((h, i) => (
                        <div key={i} className="w-2 rounded-sm bg-primary/60 transition-all" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="p-2 rounded bg-surface/50 text-xs text-text-muted italic leading-relaxed">
                      "…and we know that all things work together…"
                    </div>
                    <div className="mt-2 p-2 rounded bg-accent/10 border border-accent/20">
                      <span className="text-xs text-accent font-semibold">Romans 8:28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              emoji: '🔍',
              title: 'AI Scripture Search',
              desc: 'Type any partial quote. Get the exact verse.',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ),
              emoji: '🎤',
              title: 'Sound Mode',
              desc: 'The app listens. Verses appear automatically.',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              emoji: '📺',
              title: 'Instant Projection',
              desc: 'One click pushes to your church screen.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 sm:p-8 rounded-2xl border border-white/5 bg-surface-light/30 hover:bg-surface-light/60 hover:border-white/10 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary-light mb-5 group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {feature.emoji} {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 border-t border-white/5 bg-surface-light/20">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-6">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
            </svg>
          </div>
          <blockquote className="text-lg sm:text-xl text-text-primary font-serif italic leading-relaxed mb-6">
            "We use D'mentalist every Sunday. It catches verses from the pastor's sermon
            in real-time and projects them before he finishes the reference. Our
            congregation has never been more engaged with the Word."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-xs font-bold text-white">
              DM
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Daniel Martins</p>
              <p className="text-xs text-text-muted">Media Director, Calvary Worship Centre, Lagos</p>
            </div>
          </div>
          <p className="text-sm text-text-muted mt-8">
            Used in churches across Nigeria and beyond
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-display font-bold text-text-primary">D'mentalist</span>
            <span className="text-xs text-text-muted">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-text-muted">
            For the proclamation of the Gospel
          </p>
        </div>
      </footer>
    </div>
  )
}
