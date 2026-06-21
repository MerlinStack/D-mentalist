import { useScriptureStore } from '../../store/scriptureStore'
import { TRANSLATIONS, getApiCode } from '../../data/versions'

export default function TranslationSwitcher() {
  const { activeTranslation, setTranslation } = useScriptureStore()

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted">Translation:</span>
      <div className="flex bg-surface-lighter rounded-lg border border-white/10 p-0.5">
        {Object.entries(TRANSLATIONS).map(([id, t]) => (
          <button
            key={id}
            onClick={() => setTranslation(id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTranslation === id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t.short}
          </button>
        ))}
      </div>
    </div>
  )
}
