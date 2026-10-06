import type { Playback, SceneId } from '../engine/types'

type ControlsProps = {
  scene: SceneId
  playback: Playback
  soundEnabled: boolean
  reducedEffects: boolean
  onSound: () => void
  onPauseToggle: () => void
  onNext: () => void
  onReduce: () => void
  onReading: () => void
  onArchive: () => void
  onThreshold: () => void
}

export function Controls({
  scene,
  playback,
  soundEnabled,
  reducedEffects,
  onSound,
  onPauseToggle,
  onNext,
  onReduce,
  onReading,
  onArchive,
  onThreshold,
}: ControlsProps) {
  const active = scene !== 'threshold'
  const paused = playback === 'paused'

  return (
    <nav className="controls" aria-label="Controles de lectura">
      <button type="button" onClick={onSound} aria-pressed={soundEnabled}>
        sonido {soundEnabled ? 'on' : 'off'}
      </button>
      <button type="button" onClick={onPauseToggle} disabled={!active}>
        {paused ? 'reanudar' : 'pausar'}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!active || scene === 'archive'}
      >
        siguiente
      </button>
      <button type="button" onClick={onReduce} aria-pressed={reducedEffects}>
        reducir efectos
      </button>
      <button type="button" onClick={onReading}>
        lectura
      </button>
      <button type="button" onClick={onArchive}>
        archivo
      </button>
      <button type="button" onClick={onThreshold} disabled={scene === 'threshold'}>
        umbral
      </button>
    </nav>
  )
}
