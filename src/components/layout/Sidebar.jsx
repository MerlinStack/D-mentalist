import { useState } from 'react'
import { useScriptureStore } from '../../store/scriptureStore'
import TranslationSwitcher from '../verse/TranslationSwitcher'
import SoundModePanel from '../sound/SoundModePanel'

const SIDEBAR_KEY = 'dmentalist-sidebar-collapsed'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true')

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }

  const { searchHistory, setQuery, search } = useScriptureStore()

  return (
    <aside className={`shrink-0 border-r border-white/5 bg-surface/50 hidden lg:flex flex-col overflow-y-auto transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center border-b border-white/5 ${collapsed ? 'justify-center h-14' : 'justify-between px-4 h-14'}`}>
        {!collapsed && (
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Menu</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-lighter transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      <div className={`space-y-5 ${collapsed ? 'p-3' : 'p-4'}`}>
        {collapsed ? (
          <>
            <div className="flex flex-col items-center gap-1" title="Translation">
              <button
                className="w-8 h-8 rounded-lg text-[10px] font-bold bg-primary text-white flex items-center justify-center"
              >
                {useScriptureStore.getState().activeTranslation}
              </button>
            </div>

            {searchHistory.length > 0 && (
              <div className="flex flex-col items-center gap-1" title="Recent searches">
                {searchHistory.slice(0, 5).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s.query); search(s.query) }}
                    className="w-8 h-8 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-surface-lighter transition-colors flex items-center justify-center"
                    title={s.query}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            <SoundModePanel collapsed />
          </>
        ) : (
          <>
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Translation
              </h3>
              <TranslationSwitcher grid />
            </div>

            {searchHistory.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Recent Searches
                </h3>
                <div className="space-y-0.5">
                  {searchHistory.slice(0, 8).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(s.query); search(s.query) }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors truncate"
                    >
                      {s.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <SoundModePanel />
          </>
        )}
      </div>
    </aside>
  )
}
