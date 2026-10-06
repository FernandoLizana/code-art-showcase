import { describe, expect, it } from 'vitest'
import type { Clock } from './clock'
import { SceneDirector } from './director'

class ManualClock implements Clock {
  nowMs = 0
  private seq = 1
  private timers = new Map<number, { fn: () => void; at: number }>()

  now(): number {
    return this.nowMs
  }

  setTimeout(fn: () => void, ms: number): number {
    const id = this.seq++
    this.timers.set(id, { fn, at: this.nowMs + ms })
    return id
  }

  clearTimeout(id: number): void {
    this.timers.delete(id)
  }

  get pendingCount(): number {
    return this.timers.size
  }

  advance(ms: number): void {
    this.nowMs += ms
    let guard = 0
    while (guard++ < 80) {
      let next: { id: number; fn: () => void; at: number } | null = null
      for (const [id, timer] of this.timers) {
        if (timer.at <= this.nowMs && (!next || timer.at < next.at)) {
          next = { id, fn: timer.fn, at: timer.at }
        }
      }
      if (!next) break
      this.timers.delete(next.id)
      next.fn()
    }
  }
}

describe('SceneDirector', () => {
  it('entra al primer contacto y revela la frase de Da’at después de la pausa', () => {
    const clock = new ManualClock()
    const director = new SceneDirector({ clock })
    director.enter()
    expect(director.getSnapshot().scene).toBe('first-contact')
    expect(director.getSnapshot().message).toBeNull()
    clock.advance(2800)
    const snap = director.getSnapshot()
    expect(snap.entity).toBe('daat')
    expect(snap.message?.text).toBe('No te conozco. Pero te odio.')
    expect(snap.playback).toBe('playing')
  })

  it('siguiente salta la espera y pasa de primer contacto a disputa', () => {
    const director = new SceneDirector({ clock: new ManualClock() })
    director.enter()
    for (let i = 0; i < 14; i++) director.next()
    expect(director.getSnapshot().scene).toBe('dispute')
  })

  it('pausa detiene el avance automático', () => {
    const clock = new ManualClock()
    const director = new SceneDirector({ clock })
    director.enter()
    clock.advance(2800)
    director.pause()
    expect(director.getSnapshot().playback).toBe('paused')
    const text = director.getSnapshot().message?.text
    clock.advance(20_000)
    expect(director.getSnapshot().message?.text).toBe(text)
    director.resume()
    clock.advance(20_000)
    expect(director.getSnapshot().message?.text).not.toBe(text)
  })

  it('elegir un canal cambia escena y entidad, y al terminar vuelve a la elección', () => {
    const director = new SceneDirector({ clock: new ManualClock() })
    director.goTo('channel-choice')
    director.chooseChannel('bina')
    expect(director.getSnapshot().scene).toBe('channel-bina')
    expect(director.getSnapshot().entity).toBe('bina')
    for (let i = 0; i < 20; i++) director.next()
    const snap = director.getSnapshot()
    expect(snap.scene).toBe('channel-choice')
    expect(snap.visitedChannels).toContain('bina')
  })

  it('destroy cancela temporizadores y no emite más', () => {
    const clock = new ManualClock()
    let emissions = 0
    const director = new SceneDirector({ clock })
    director.subscribe(() => {
      emissions += 1
    })
    director.enter()
    const before = emissions
    director.destroy()
    clock.advance(30_000)
    expect(clock.pendingCount).toBe(0)
    expect(emissions).toBe(before)
    expect(director.destroyedFlag).toBe(true)
  })

  it('cambiar de escena cancela la cola anterior', () => {
    const clock = new ManualClock()
    const director = new SceneDirector({ clock })
    director.enter()
    director.goTo('channel-keter')
    clock.advance(1400)
    const snap = director.getSnapshot()
    expect(snap.scene).toBe('channel-keter')
    expect(snap.entity).toBe('keter')
    expect(snap.message?.text).toMatch(/conservo los hechos/)
  })
})
