import { useEffect, useMemo, useRef, useState } from 'react'
import { SceneDirector } from '../engine/director'
import type { DirectorSnapshot, EntityId, SceneId } from '../engine/types'

const empty: DirectorSnapshot = {
  scene: 'threshold',
  entity: null,
  message: null,
  residue: null,
  annotation: null,
  echo: null,
  intensity: 0.08,
  playback: 'idle',
  interrupting: false,
  still: false,
  contradiction: false,
  interruptPriority: 0,
  visitedChannels: [],
  discoveredIds: [],
}

export function useDirector(options: {
  timingScale: number
  initialVisited: EntityId[]
  initialDiscovered: string[]
  onDiscover: (id: string) => void
  onVisitChannel: (id: EntityId) => void
  resetToken: number
}) {
  const [snapshot, setSnapshot] = useState<DirectorSnapshot>(empty)
  const directorRef = useRef<SceneDirector | null>(null)
  const hooksRef = useRef(options)

  useEffect(() => {
    hooksRef.current = options
  })

  useEffect(() => {
    const director = new SceneDirector({
      timingScale: hooksRef.current.timingScale,
      initialVisited: hooksRef.current.initialVisited,
      initialDiscovered: hooksRef.current.initialDiscovered,
      onDiscover: (id) => hooksRef.current.onDiscover(id),
      onVisitChannel: (id) => hooksRef.current.onVisitChannel(id),
    })
    directorRef.current = director
    setSnapshot(director.getSnapshot())
    const unsub = director.subscribe(setSnapshot)
    return () => {
      unsub()
      director.destroy()
      directorRef.current = null
    }
  }, [options.resetToken])

  useEffect(() => {
    directorRef.current?.setTimingScale(options.timingScale)
  }, [options.timingScale])

  return useMemo(
    () => ({
      snapshot,
      enter: () => directorRef.current?.enter(),
      pause: () => directorRef.current?.pause(),
      resume: () => directorRef.current?.resume(),
      next: () => directorRef.current?.next(),
      chooseChannel: (id: EntityId) => directorRef.current?.chooseChannel(id),
      goTo: (scene: SceneId) => directorRef.current?.goTo(scene),
    }),
    [snapshot],
  )
}
