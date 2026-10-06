import { useEffect, useRef } from 'react'
import { Soundscape } from '../audio/soundscape'
import type { EntityId, SceneId } from '../engine/types'

export function useSoundscape(state: {
  enabled: boolean
  entity: EntityId | null
  intensity: number
  still: boolean
  scene: SceneId
}): void {
  const ref = useRef<Soundscape | null>(null)

  const { enabled, entity, intensity, still, scene } = state

  useEffect(() => {
    const sound = new Soundscape()
    ref.current = sound
    return () => {
      sound.dispose()
      ref.current = null
    }
  }, [])

  useEffect(() => {
    ref.current?.apply({ enabled, entity, intensity, still, scene })
  }, [enabled, entity, intensity, still, scene])
}
