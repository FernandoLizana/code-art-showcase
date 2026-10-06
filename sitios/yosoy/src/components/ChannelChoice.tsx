import { ENTITIES, ENTITY_ORDER } from '../content/entities'
import type { EntityId } from '../engine/types'

type ChannelChoiceProps = {
  visited: EntityId[]
  onChoose: (id: EntityId) => void
  onArchive: () => void
  onClosing?: () => void
}

export function ChannelChoice({
  visited,
  onChoose,
  onArchive,
  onClosing,
}: ChannelChoiceProps) {
  const returned = visited.length > 0

  return (
    <div className="choice">
      <ul className="choice-list">
        {ENTITY_ORDER.map((id) => {
          const entity = ENTITIES[id]
          const heard = visited.includes(id)
          return (
            <li key={id}>
              <button
                type="button"
                className={`choice-btn entity-${id}${heard ? ' is-heard' : ''}`}
                onClick={() => onChoose(id)}
              >
                {entity.channelLabel}
                {heard ? <span className="heard"> ya oída</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
      {returned ? (
        <div className="choice-more">
          <button type="button" className="text-link" onClick={onArchive}>
            explorar los registros
          </button>
          {onClosing ? (
            <button type="button" className="text-link" onClick={onClosing}>
              dejar que esto se cierre
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
