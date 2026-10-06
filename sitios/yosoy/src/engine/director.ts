import { messagesFor } from '../content/script'
import { realtimeClock, type Clock } from './clock'
import type {
  DirectorHooks,
  DirectorSnapshot,
  EntityId,
  Message,
  Playback,
  SceneId,
} from './types'

type PendingKind = 'present' | 'advance' | 'annotate' | 'still'

type Pending = {
  kind: PendingKind
  delay: number
  startedAt: number
}

type DirectorOptions = {
  clock?: Clock
  timingScale?: number
  initialVisited?: EntityId[]
  initialDiscovered?: string[]
} & DirectorHooks

const CHANNEL_SCENE: Record<EntityId, SceneId> = {
  daat: 'channel-daat',
  bina: 'channel-bina',
  keter: 'channel-keter',
  yesod: 'channel-yesod',
}

const CHANNEL_FROM_SCENE: Partial<Record<SceneId, EntityId>> = {
  'channel-daat': 'daat',
  'channel-bina': 'bina',
  'channel-keter': 'keter',
  'channel-yesod': 'yesod',
}

export class SceneDirector {
  private clock: Clock
  private timingScale: number
  private hooks: DirectorHooks
  private destroyed = false
  private listeners = new Set<(snapshot: DirectorSnapshot) => void>()
  private scene: SceneId = 'threshold'
  private entity: EntityId | null = null
  private queue: Message[] = []
  private cursor = -1
  private message: Message | null = null
  private residue: Message | null = null
  private annotation: string | null = null
  private echo: string | null = null
  private intensity = 0.08
  private playback: Playback = 'idle'
  private interrupting = false
  private still = false
  private contradiction = false
  private interruptPriority = 0
  private visitedChannels: EntityId[]
  private discoveredIds: string[]
  private timer: number | null = null
  private pending: Pending | null = null

  constructor(options: DirectorOptions = {}) {
    this.clock = options.clock ?? realtimeClock
    this.timingScale = options.timingScale ?? 1
    this.hooks = {
      onDiscover: options.onDiscover,
      onVisitChannel: options.onVisitChannel,
    }
    this.visitedChannels = [...(options.initialVisited ?? [])]
    this.discoveredIds = [...(options.initialDiscovered ?? [])]
  }

  subscribe(listener: (snapshot: DirectorSnapshot) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot(): DirectorSnapshot {
    return {
      scene: this.scene,
      entity: this.entity,
      message: this.message,
      residue: this.residue,
      annotation: this.annotation,
      echo: this.echo,
      intensity: this.intensity,
      playback: this.playback,
      interrupting: this.interrupting,
      still: this.still,
      contradiction: this.contradiction,
      interruptPriority: this.interruptPriority,
      visitedChannels: [...this.visitedChannels],
      discoveredIds: [...this.discoveredIds],
    }
  }

  setTimingScale(scale: number): void {
    this.timingScale = scale
  }

  enter(): void {
    this.beginScene('first-contact')
  }

  goTo(scene: SceneId): void {
    this.beginScene(scene)
  }

  chooseChannel(id: EntityId): void {
    this.beginScene(CHANNEL_SCENE[id])
  }

  pause(): void {
    if (this.destroyed || this.playback !== 'playing') return
    if (this.pending && this.timer !== null) {
      const elapsed = this.clock.now() - this.pending.startedAt
      this.pending.delay = Math.max(60, this.pending.delay - elapsed)
    }
    this.clearTimer()
    this.playback = 'paused'
    this.emit()
  }

  resume(): void {
    if (this.destroyed || this.playback !== 'paused') return
    this.playback = 'playing'
    if (this.pending) {
      this.arm(this.pending.kind, this.pending.delay)
    }
    this.emit()
  }

  next(): void {
    if (this.destroyed) return
    if (this.scene === 'threshold' || this.scene === 'archive') return
    if (this.playback === 'paused') this.playback = 'playing'
    this.clearTimer()
    this.pending = null
    if (this.cursor < 0 || !this.message) {
      this.presentNext()
      return
    }
    this.finishAdvance()
  }

  destroy(): void {
    this.destroyed = true
    this.clearTimer()
    this.pending = null
    this.listeners.clear()
    this.playback = 'idle'
  }

  get destroyedFlag(): boolean {
    return this.destroyed
  }

  private beginScene(scene: SceneId): void {
    if (this.destroyed) return
    this.clearTimer()
    this.pending = null
    this.scene = scene
    this.queue = messagesFor(scene, { visitedChannels: this.visitedChannels })
    this.cursor = -1
    this.message = null
    this.residue = null
    this.annotation = null
    this.echo = null
    this.interrupting = false
    this.still = false
    this.contradiction = scene === 'archive'
    this.interruptPriority = 0

    if (scene === 'threshold') {
      this.entity = null
      this.intensity = 0.08
      this.playback = 'idle'
      this.emit()
      return
    }

    if (scene === 'archive') {
      this.entity = 'keter'
      this.intensity = 0.24
      this.playback = 'waiting'
      this.emit()
      return
    }

    this.entity = this.queue[0]?.entity ?? CHANNEL_FROM_SCENE[scene] ?? null
    this.intensity = 0.16
    this.playback = 'playing'
    this.emit()
    const first = this.queue[0]
    this.arm('present', first ? this.scaled(first.delayBefore) : 400)
  }

  private presentNext(): void {
    if (this.destroyed) return
    const nextIndex = this.cursor + 1
    const next = this.queue[nextIndex]
    if (!next) {
      this.completeScene()
      return
    }
    this.cursor = nextIndex
    this.present(next)
  }

  private present(next: Message): void {
    if (!next.keepText && next.text) {
      this.residue = this.message
      this.message = next
    } else if (next.text) {
      this.residue = this.message
      this.message = next
    }

    this.entity = next.nameless ? this.entity : next.entity
    this.intensity = next.intensity
    this.interrupting = Boolean(next.interrupt)
    this.still = next.reveal === 'still'
    this.contradiction = Boolean(next.contradiction)
    this.interruptPriority = next.interruptPriority
    this.echo = next.alt ?? null
    this.annotation = next.annotation ?? null
    this.playback = 'playing'

    if (next.text) this.discover(next.id)

    if (next.annotationReplace) {
      this.arm('annotate', this.scaled(1300))
      this.emit()
      return
    }

    this.queueHold(next)
    this.emit()
  }

  private queueHold(message: Message): void {
    if (message.hold <= 0) {
      this.pending = null
      this.playback = 'waiting'
      if (this.isChannelScene(this.scene)) {
        this.markChannel(this.scene)
      }
      return
    }
    this.arm('advance', this.scaled(message.hold))
  }

  private replaceAnnotation(): void {
    const current = this.queue[this.cursor]
    if (!current?.annotationReplace) return
    this.annotation = current.annotationReplace
    this.echo = current.annotationReplace
    this.interrupting = true
    this.queueHold(current)
    this.emit()
  }

  private advance(): void {
    const current = this.queue[this.cursor]
    if (current?.stillAfter) {
      this.still = true
      this.interrupting = false
      this.intensity = Math.min(this.intensity, 0.16)
      this.arm('still', this.scaled(1600))
      this.emit()
      return
    }
    this.finishAdvance()
  }

  private finishAdvance(): void {
    this.interrupting = false
    this.annotation = null
    this.presentNext()
  }

  private completeScene(): void {
    if (this.isChannelScene(this.scene)) {
      this.markChannel(this.scene)
      this.beginScene('channel-choice')
      return
    }
    if (this.scene === 'first-contact') {
      this.beginScene('dispute')
      return
    }
    if (this.scene === 'dispute') {
      this.beginScene('channel-choice')
      return
    }
    this.playback = 'waiting'
    this.pending = null
    this.emit()
  }

  private isChannelScene(scene: SceneId): boolean {
    return scene in CHANNEL_FROM_SCENE
  }

  private markChannel(scene: SceneId): void {
    const id = CHANNEL_FROM_SCENE[scene]
    if (!id) return
    if (!this.visitedChannels.includes(id)) {
      this.visitedChannels = [...this.visitedChannels, id]
      this.hooks.onVisitChannel?.(id)
    }
  }

  private discover(id: string): void {
    if (this.discoveredIds.includes(id)) return
    this.discoveredIds = [...this.discoveredIds, id]
    this.hooks.onDiscover?.(id)
  }

  private scaled(ms: number): number {
    return Math.max(40, Math.round(ms * this.timingScale))
  }

  private arm(kind: PendingKind, delay: number): void {
    this.clearTimer()
    this.pending = { kind, delay, startedAt: this.clock.now() }
    this.timer = this.clock.setTimeout(() => {
      this.timer = null
      this.runPending()
    }, delay)
  }

  private runPending(): void {
    if (this.destroyed || this.playback === 'paused') return
    const kind = this.pending?.kind
    this.pending = null
    if (kind === 'present') this.presentNext()
    else if (kind === 'advance') this.advance()
    else if (kind === 'annotate') this.replaceAnnotation()
    else if (kind === 'still') this.finishAdvance()
  }

  private clearTimer(): void {
    if (this.timer === null) return
    this.clock.clearTimeout(this.timer)
    this.timer = null
  }

  private emit(): void {
    if (this.destroyed) return
    const snapshot = this.getSnapshot()
    for (const listener of this.listeners) listener(snapshot)
  }
}
