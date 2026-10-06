import { ENTITIES } from '../content/entities'
import type { DirectorSnapshot } from '../engine/types'

export function MessageView({ snapshot }: { snapshot: DirectorSnapshot }) {
  const { message, residue, annotation, echo, interrupting, still } = snapshot
  if (!message && !residue) return null

  const shown = message?.text ? message : residue
  if (!shown?.text) return null

  const entity = shown.nameless ? null : ENTITIES[shown.entity]
  const live = `${entity ? `${entity.name}. ` : ''}${shown.text}`

  return (
    <div
      className={`stage-copy entity-${shown.entity} reveal-${shown.reveal}${interrupting ? ' is-interrupt' : ''}${still ? ' is-still' : ''}${shown.nameless ? ' is-nameless' : ''}`}
    >
      {residue && residue.id !== shown.id && residue.text ? (
        <p className="residue" aria-hidden="true" key={residue.id}>
          {residue.text}
        </p>
      ) : null}

      {entity ? (
        <p className="speaker">
          {entity.name}
          <span className="speaker-title"> · {entity.title}</span>
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>

      <p className="utterance" aria-hidden="true">
        {shown.text}
      </p>

      {shown.entity === 'bina' && echo ? (
        <p className="margin-echo" aria-hidden="true">
          {echo}
        </p>
      ) : null}

      {shown.entity === 'bina' ? (
        <p className="echo-layer" aria-hidden="true">
          {shown.text}
        </p>
      ) : null}

      {annotation ? (
        <p className={`annotation${interrupting && message?.annotationReplace === annotation ? ' is-other' : ''}`}>
          {annotation}
        </p>
      ) : null}
    </div>
  )
}
