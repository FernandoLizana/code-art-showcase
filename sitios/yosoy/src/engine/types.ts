export type EntityId = 'daat' | 'bina' | 'keter' | 'yesod'

export type SceneId =
  | 'threshold'
  | 'first-contact'
  | 'dispute'
  | 'channel-choice'
  | 'channel-daat'
  | 'channel-bina'
  | 'channel-keter'
  | 'channel-yesod'
  | 'archive'
  | 'closing'

export type RevealMode =
  | 'hold'
  | 'fade'
  | 'fracture'
  | 'echo'
  | 'align'
  | 'drift'
  | 'still'

export type Playback = 'idle' | 'playing' | 'paused' | 'waiting'

export type Message = {
  id: string
  entity: EntityId
  text: string
  delayBefore: number
  hold: number
  reveal: RevealMode
  intensity: number
  interruptPriority: number
  annotation?: string
  annotationReplace?: string
  alt?: string
  interrupt?: boolean
  keepText?: boolean
  stillAfter?: boolean
  contradiction?: boolean
  nameless?: boolean
}

export type DirectorSnapshot = {
  scene: SceneId
  entity: EntityId | null
  message: Message | null
  residue: Message | null
  annotation: string | null
  echo: string | null
  intensity: number
  playback: Playback
  interrupting: boolean
  still: boolean
  contradiction: boolean
  interruptPriority: number
  visitedChannels: EntityId[]
  discoveredIds: string[]
}

export type DirectorHooks = {
  onDiscover?: (id: string) => void
  onVisitChannel?: (id: EntityId) => void
}
