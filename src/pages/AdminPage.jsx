import { useState } from 'react'
import { useScriptureStore } from '../store/scriptureStore'
import { useSoundStore } from '../store/soundStore'
import { useProjectionStore } from '../store/projectionStore'
import { TRANSLATIONS, DEFAULT_TRANSLATION } from '../data/versions'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const USAGE_KEY = 'dmentalist-usage'

function loadUsage() {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY)) || { searchesToday: 0, searchesWeek: 0, topQueries: [], dailyLog: {} }
  } catch {
    return { searchesToday: 0, searchesWeek: 0, topQueries: [], dailyLog: {} }
  }
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('stats')

  const scripture = useScriptureStore()
  const sound = useSoundStore()
  const projection = useProjectionStore()

  // ----- Password gate -----
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD
  const handleLogin = (e) => {
    e.preventDefault()
    if (!adminPassword) {
      setAuthenticated(true)
      return
    }
    if (password === adminPassword) {
      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light mb-4 shadow-lg shadow-primary/30">
              <span className="text-2xl font-display font-bold text-white">D</span>
            </div>
            <h1 className="text-xl font-display font-bold text-text-primary">Admin</h1>
            <p className="text-sm text-text-muted mt-1">Enter admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Admin password"
                className="w-full px-4 py-3 bg-surface-lighter border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                autoFocus
              />
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>
            <Button type="submit" className="w-full justify-center">
              Sign In
            </Button>
          </form>
          {!adminPassword && (
            <p className="text-xs text-text-muted text-center mt-4">
              Set VITE_ADMIN_PASSWORD in .env to secure this page
            </p>
          )}
        </div>
      </div>
    )
  }

  const usage = loadUsage()

  const tabs = [
    { id: 'stats', label: 'Usage Stats' },
    { id: 'translations', label: 'Translations' },
    { id: 'sound', label: 'Sound Mode' },
    { id: 'projection', label: 'Projection' },
    { id: 'data', label: 'Data' },
  ]

  const clearAllData = () => {
    localStorage.removeItem('dmentalist-v1')
    localStorage.removeItem('dmentalist-sound')
    localStorage.removeItem('dmentalist-projection')
    localStorage.removeItem(USAGE_KEY)
    localStorage.removeItem('dmentalist-theme')
    scripture.clearHistory()
    scripture.clearResults()
    sound.reset()
    projection.clearProjection()
    projection.setTheme('dark')
    projection.setFontSize('large')
    projection.setShowReference(true)
    projection.setShowTranslation(true)
    sound.setSensitivity('medium')
    alert('All local data cleared. Page will reload.')
    window.location.reload()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Admin</h1>
            <p className="text-sm text-text-muted mt-0.5">Manage your D'mentalist configuration</p>
          </div>
          <Badge variant="success">Connected</Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface-lighter border border-white/5 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Usage Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-surface-lighter border border-white/5">
                <p className="text-xs text-text-muted uppercase tracking-wider">Searches Today</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{usage.searchesToday}</p>
              </div>
              <div className="p-5 rounded-xl bg-surface-lighter border border-white/5">
                <p className="text-xs text-text-muted uppercase tracking-wider">This Week</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{usage.searchesWeek}</p>
              </div>
              <div className="p-5 rounded-xl bg-surface-lighter border border-white/5">
                <p className="text-xs text-text-muted uppercase tracking-wider">History Size</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{scripture.searchHistory.length}</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-lighter border border-white/5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Most Searched Verses</h3>
              {usage.topQueries.length === 0 ? (
                <p className="text-sm text-text-muted">No searches yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {usage.topQueries.slice(0, 10).map((q, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface/50">
                      <span className="text-sm text-text-primary truncate">{q.query}</span>
                      <span className="text-xs text-text-muted ml-4 tabular-nums">{q.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Translation settings */}
        {activeTab === 'translations' && (
          <div className="p-5 rounded-xl bg-surface-lighter border border-white/5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Translation Settings</h3>
              <p className="text-xs text-text-muted mt-0.5">Select the active translation for searches</p>
            </div>
            <div className="space-y-2">
              {Object.entries(TRANSLATIONS).map(([id, t]) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    scripture.activeTranslation === id
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-white/5 bg-surface/50 hover:bg-surface-lighter'
                  }`}
                >
                  <input
                    type="radio"
                    name="translation"
                    checked={scripture.activeTranslation === id}
                    onChange={() => scripture.setTranslation(id)}
                    className="w-4 h-4 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{t.label}</span>
                      <Badge variant="default">{t.short}</Badge>
                    </div>
                    <p className="text-xs text-text-muted">
                      API: {t.apiCode}{' '}
                      {t.publicDomain
                        ? <span className="text-emerald-400">(Public Domain)</span>
                        : <span className="text-accent">(Licensed — fallback used)</span>
                      }
                    </p>
                  </div>
                  {scripture.activeTranslation === id && (
                    <Badge variant="primary">Active</Badge>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sound mode settings */}
        {activeTab === 'sound' && (
          <div className="p-5 rounded-xl bg-surface-lighter border border-white/5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Sound Mode Settings</h3>
              <p className="text-xs text-text-muted mt-0.5">Default detection sensitivity</p>
            </div>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(s => (
                <button
                  key={s}
                  onClick={() => sound.setSensitivity(s)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    sound.sensitivity === s
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-lighter'
                  }`}
                >
                  <div className="capitalize">{s}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {s === 'low' && 'Confirm all'}
                    {s === 'medium' && 'Auto high'}
                    {s === 'high' && 'Auto all'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Projection settings */}
        {activeTab === 'projection' && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-surface-lighter border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Projection Settings</h3>
                <p className="text-xs text-text-muted mt-0.5">Default theme and font size</p>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-2">Default Theme</label>
                <div className="flex gap-2">
                  {Object.entries(themeConfig).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => projection.setTheme(key)}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        projection.theme === key
                          ? 'border-primary'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                      style={{
                        backgroundColor: t.backgroundColor,
                        color: t.textColor,
                      }}
                    >
                      <span className="text-sm font-medium">{t.label}</span>
                      <div className="text-[10px] opacity-70 mt-0.5">Aa</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-2">Default Font Size</label>
                <div className="flex gap-2">
                  {['medium', 'large', 'xlarge'].map(s => (
                    <button
                      key={s}
                      onClick={() => projection.setFontSize(s)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        projection.fontSize === s
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-lighter'
                      }`}
                    >
                      <span className="capitalize">{s}</span>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {s === 'medium' && '36px'}
                        {s === 'large' && '48px'}
                        {s === 'xlarge' && '64px'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projection.showReference}
                    onChange={(e) => projection.setShowReference(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm text-text-primary">Show verse reference</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projection.showTranslation}
                    onChange={(e) => projection.setShowTranslation(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm text-text-primary">Show translation label</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Data section */}
        {activeTab === 'data' && (
          <div className="p-5 rounded-xl bg-surface-lighter border border-white/5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Data & Storage</h3>
              <p className="text-xs text-text-muted mt-0.5">Manage local application data</p>
            </div>
            <div className="space-y-2 text-sm text-text-secondary bg-surface/50 rounded-lg p-4">
              <p>All data is stored locally in your browser (localStorage).</p>
              <p>No external servers or databases are used.</p>
              <p>Clearing data will reset all settings, search history, and usage stats.</p>
            </div>
            <Button variant="danger" onClick={clearAllData}>
              Clear All Local Data
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Inline themeConfig for the theme previews
const themeConfig = {
  dark: { label: 'Dark', backgroundColor: '#0f0f1a', textColor: '#f1f5f9' },
  light: { label: 'Light', backgroundColor: '#f8fafc', textColor: '#0f172a' },
  warm: { label: 'Warm', backgroundColor: '#1c1917', textColor: '#fef3c7' },
}
