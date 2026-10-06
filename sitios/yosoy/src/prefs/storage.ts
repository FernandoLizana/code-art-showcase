const STORAGE_KEY = 'yosoy.v1'

export type Prefs = {
  soundEnabled: boolean
  reducedEffects: boolean
  discoveredIds: string[]
  discoveredRecords: string[]
  visitedChannels: Array<'daat' | 'bina' | 'keter' | 'yesod'>
  censorGrowth: number
  reachedClosing: boolean
}

export const defaultPrefs = (): Prefs => ({
  soundEnabled: false,
  reducedEffects: false,
  discoveredIds: [],
  discoveredRecords: [],
  visitedChannels: [],
  censorGrowth: 0,
  reachedClosing: false,
})

export function loadPrefs(): Prefs {
  const base = defaultPrefs()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      ...base,
      ...parsed,
      discoveredIds: Array.isArray(parsed.discoveredIds) ? parsed.discoveredIds : [],
      discoveredRecords: Array.isArray(parsed.discoveredRecords)
        ? parsed.discoveredRecords
        : [],
      visitedChannels: Array.isArray(parsed.visitedChannels)
        ? parsed.visitedChannels.filter(
            (id): id is Prefs['visitedChannels'][number] =>
              id === 'daat' || id === 'bina' || id === 'keter' || id === 'yesod',
          )
        : [],
      censorGrowth: Number.isFinite(parsed.censorGrowth) ? Number(parsed.censorGrowth) : 0,
    }
  } catch {
    return base
  }
}

export function savePrefs(prefs: Prefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function clearPrefs(): void {
  localStorage.removeItem(STORAGE_KEY)
}
