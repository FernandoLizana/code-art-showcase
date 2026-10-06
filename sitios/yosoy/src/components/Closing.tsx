type ClosingProps = {
  revealed: boolean
  onThreshold: () => void
  onArchive: () => void
}

export function ClosingActions({ revealed, onThreshold, onArchive }: ClosingProps) {
  if (!revealed) return null
  return (
    <div className="closing-actions">
      <button type="button" className="text-link" onClick={onThreshold}>
        volver al umbral
      </button>
      <button type="button" className="text-link" onClick={onArchive}>
        explorar los registros
      </button>
    </div>
  )
}
