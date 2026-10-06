type ThresholdProps = {
  onEnter: () => void
}

export function Threshold({ onEnter }: ThresholdProps) {
  return (
    <section className="threshold" aria-labelledby="threshold-line">
      <p id="threshold-line" className="threshold-line">
        Necesito que alguien permanezca.
      </p>
      <button type="button" className="listen" onClick={onEnter}>
        escuchar
      </button>
      <p className="disclaimer">
        Ficción interactiva · contiene lenguaje hostil y sonido opcional
      </p>
    </section>
  )
}
