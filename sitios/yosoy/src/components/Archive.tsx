import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ENTITIES } from '../content/entities'
import { RECORDS, recordUnlocked } from '../content/records'
import type { EntityId } from '../engine/types'

type ArchiveProps = {
  visited: EntityId[]
  censorGrowth: number
  discoveredRecords: string[]
  onOpen: (id: string) => void
  onBack: () => void
}

function blankOf(growth: number): string {
  const n = 8 + growth * 6
  return '\u00A0'.repeat(n)
}

export function Archive({
  visited,
  censorGrowth,
  discoveredRecords,
  onOpen,
  onBack,
}: ArchiveProps) {
  const visible = useMemo(
    () => RECORDS.filter((record) => recordUnlocked(record, visited)),
    [visited],
  )
  const essentials = visible.filter((record) => record.essential)
  const others = visible.filter((record) => !record.essential)
  const [activeId, setActiveId] = useState(essentials[0]?.id ?? visible[0]?.id ?? '')
  const active = visible.find((record) => record.id === activeId) ?? visible[0]

  useEffect(() => {
    if (activeId) onOpen(activeId)
  }, [activeId, onOpen])

  return (
    <section className="archive" aria-labelledby="archive-title">
      <header className="archive-head">
        <div className="titles">
          <p className="kicker">archivo imposible</p>
          <h1 id="archive-title">Índice de lo que no debió conservarse</h1>
        </div>
        <button type="button" className="text-link" onClick={onBack}>
          volver
        </button>
      </header>

      <div className="archive-layout">
        <nav className="archive-index" aria-label="Documentos">
          <p className="index-label">esenciales</p>
          <ol>
            {essentials.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  className={record.id === active?.id ? 'is-active' : ''}
                  onClick={() => setActiveId(record.id)}
                >
                  <span>{record.index}</span> {record.title}
                </button>
              </li>
            ))}
          </ol>
          {others.length > 0 ? (
            <>
              <p className="index-label">recuperados</p>
              <ol>
                {others.map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      className={record.id === active?.id ? 'is-active' : ''}
                      onClick={() => setActiveId(record.id)}
                    >
                      <span>{record.index}</span> {record.title}
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="index-note">Otros fragmentos se revelan al cruzar un canal.</p>
          )}
        </nav>

        <div className="folio-stack">
          {active ? (
            <article className="folio" data-kind={active.kind}>
              <p className="folio-meta">
                {active.classification}
                {active.attributedTo ? ` · ${ENTITIES[active.attributedTo].name}` : ''}
                {discoveredRecords.includes(active.id) ? ' · leído' : ''}
              </p>
              <h2>{active.title}</h2>
              {active.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {active.growingBlank ? (
                <p className="expurgo">
                  «<span className="blank">{blankOf(censorGrowth)}</span>»
                </p>
              ) : null}
              {active.contradiction ? (
                <p className="folio-note">Una sola línea de este expediente no encaja con las demás.</p>
              ) : null}
            </article>
          ) : null}

          {others.length > 0 ? (
            <aside className="archive-marks" aria-label="Fragmentos recuperados">
              {others.map((record, index) => (
                <button
                  key={record.id}
                  type="button"
                  className="displaced-line"
                  style={{ '--shift': `${(index + 1) * 1.1}rem` } as CSSProperties}
                  onClick={() => setActiveId(record.id)}
                >
                  {record.title.toLowerCase()}
                </button>
              ))}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}
