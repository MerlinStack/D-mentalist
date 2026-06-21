import { useState, useEffect } from 'react'
import { suggestRelatedVerse, getVerseInsights } from '../../api/anthropic'
import Badge from '../ui/Badge'

export default function CrossReferences({ verse }) {
  const [related, setRelated] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!verse) return
    setLoading(true)
    setRelated([])
    setInsights(null)

    Promise.all([
      suggestRelatedVerse(verse.ref),
      getVerseInsights(verse.ref, verse.text),
    ])
      .then(([xrefs, insight]) => {
        setRelated(xrefs)
        setInsights(insight)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [verse])

  if (!verse) return null

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 w-24 bg-surface-lighter rounded animate-pulse" />
        <div className="h-16 bg-surface-lighter/50 rounded-lg animate-pulse" />
      </div>
    )
  }

  const hasInsights = insights?.explanation || insights?.theme || insights?.context
  const hasXrefs = related.length > 0

  if (!hasInsights && !hasXrefs) return null

  return (
    <div className="space-y-4">
      {hasInsights && (
        <div className="space-y-2">
          {insights.theme && (
            <Badge variant="accent">{insights.theme}</Badge>
          )}
          {insights.explanation && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {insights.explanation}
            </p>
          )}
          {insights.context && (
            <p className="text-xs text-text-muted italic">
              {insights.context}
            </p>
          )}
        </div>
      )}

      {hasXrefs && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Cross References
          </h4>
          <div className="space-y-2">
            {related.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface-lighter/50 border border-white/5">
                <Badge variant="primary">{r.ref}</Badge>
                <p className="text-sm text-text-secondary mt-1">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
