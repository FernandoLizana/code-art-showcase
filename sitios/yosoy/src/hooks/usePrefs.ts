import { useCallback, useState } from 'react'
import type { EntityId } from '../engine/types'
import {
  clearPrefs,
  defaultPrefs,
  loadPrefs,
  savePrefs,
  type Prefs,
} from '../prefs/storage'

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())

  const commit = useCallback((next: Prefs) => {
    savePrefs(next)
    setPrefs(next)
  }, [])

  const setSoundEnabled = useCallback(
    (soundEnabled: boolean) => {
      commit({ ...prefs, soundEnabled })
    },
    [commit, prefs],
  )

  const setReducedEffects = useCallback(
    (reducedEffects: boolean) => {
      commit({ ...prefs, reducedEffects })
    },
    [commit, prefs],
  )

  const discoverMessage = useCallback((id: string) => {
    setPrefs((prev) => {
      if (prev.discoveredIds.includes(id)) return prev
      const next = { ...prev, discoveredIds: [...prev.discoveredIds, id] }
      savePrefs(next)
      return next
    })
  }, [])

  const discoverRecord = useCallback((id: string) => {
    setPrefs((prev) => {
      const records = prev.discoveredRecords.includes(id)
        ? prev.discoveredRecords
        : [...prev.discoveredRecords, id]
      const growth = id === 'expurgo' ? prev.censorGrowth + 1 : prev.censorGrowth
      const next = { ...prev, discoveredRecords: records, censorGrowth: growth }
      savePrefs(next)
      return next
    })
  }, [])

  const visitChannel = useCallback((id: EntityId) => {
    setPrefs((prev) => {
      if (prev.visitedChannels.includes(id)) return prev
      const next = { ...prev, visitedChannels: [...prev.visitedChannels, id] }
      savePrefs(next)
      return next
    })
  }, [])

  const markClosing = useCallback(() => {
    setPrefs((prev) => {
      if (prev.reachedClosing) return prev
      const next = { ...prev, reachedClosing: true }
      savePrefs(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    clearPrefs()
    setPrefs(defaultPrefs())
  }, [])

  return {
    prefs,
    setSoundEnabled,
    setReducedEffects,
    discoverMessage,
    discoverRecord,
    visitChannel,
    markClosing,
    reset,
  }
}
