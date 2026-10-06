import { useMemo } from 'react'
import { ENTITIES } from '../content/entities'
import { MESSAGE_BY_ID } from '../content/script'
import type { EntityId } from '../engine/types'

type ReadingViewProps = {
  discoveredIds: string[]
  onClose: () => void
  onReset: () => void
}

type ReadingEntry = {
  id: string
  entity: EntityId | null
  text: string
}

export function ReadingView({ discoveredIds, onClose, onReset }: ReadingViewProps) {
  const entries = useMemo(() => {
    const seen = new Set<string>()
    const list: ReadingEntry[] = []
    for (const id of discoveredIds) {
      const message = MESSAGE_BY_ID[id]
      if (!message?.text) continue
      if (message.nameless) {
        if (seen.has(message.text)) continue
        seen.add(message.text)
        list.push({ id, entity: null, text: message.text })
        continue
      }
      const key = `${message.entity}:${message.text}`
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ id, entity: message.entity, text: message.text })
    }
    return list
  }, [discoveredIds])

  return (
    <div className="reading" role="dialog" aria-modal="true" aria-labelledby="reading-title">
      <div className="reading-panel">
        <header>
          <p className="kicker">vista de lectura</p>
          <h2 id="reading-title">Lo que lograron decir</h2>
          <button type="button" className="text-link" onClick={onClose}>
            cerrar
          </button>
        </header>
        {entries.length === 0 ? (
          <p className="reading-empty">Aún no hay frases conservadas en este aparato.</p>
        ) : (
          <ol className="reading-list">
            {entries.map((entry) => (
              <li key={entry.id} className={entry.entity ? `entity-${entry.entity}` : ''}>
                <span className="reading-speaker">
                  {entry.entity ? ENTITIES[entry.entity].name : '—'}
                </span>
                <span>{entry.text}</span>
              </li>
            ))}
          </ol>
        )}
        <button type="button" className="text-link reset" onClick={onReset}>
          olvidar lo que este aparato recuerda
        </button>
      </div>
    </div>
  )
}
