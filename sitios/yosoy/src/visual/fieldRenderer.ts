import type { EntityId, SceneId } from '../engine/types'

export type FieldParams = {
  entity: EntityId | null
  scene: SceneId
  intensity: number
  interrupting: boolean
  still: boolean
  contradiction: boolean
  glyphSource: string
  reduced: boolean
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  glyph: string
  life: number
  maxLife: number
  stuck: boolean
  rising: boolean
  size: number
  well: number
}

type Well = { x: number; y: number; mass: number }

const COLORS: Record<EntityId, { ink: string; deep: string; mist: string }> = {
  daat: { ink: '244, 236, 228', deep: '106, 18, 24', mist: '28, 8, 10' },
  bina: { ink: '244, 241, 251', deep: '110, 74, 138', mist: '18, 10, 28' },
  keter: { ink: '245, 242, 234', deep: '196, 176, 122', mist: '22, 18, 10' },
  yesod: { ink: '213, 226, 232', deep: '26, 106, 124', mist: '6, 22, 30' },
}

function fragments(source: string): string[] {
  const words = source
    .split(/\s+/)
    .map((word) => word.replace(/[«»“”]/g, ''))
    .filter((word) => word.length > 1)
  const letters = [...source.replace(/\s+/g, '')].filter((ch) => /[\p{L}]/u.test(ch))
  const bits = words.map((word) => word.slice(0, Math.min(5, word.length)))
  return bits.length + letters.length > 0 ? [...bits, ...letters] : ['yo', 'soy']
}

export class FieldRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private params: FieldParams
  private particles: Particle[] = []
  private wells: Well[] = []
  private raf = 0
  private last = 0
  private running = false
  private mobile = false
  private width = 0
  private height = 0
  private dpr = 1
  private visible = true
  private time = 0
  private interruptUntil = 0
  private glyphs: string[] = ['yo']
  private onVisibility: () => void
  private onResize: () => void

  constructor(canvas: HTMLCanvasElement, params: FieldParams) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D no disponible')
    this.ctx = ctx
    this.params = params
    this.onVisibility = () => {
      this.visible = document.visibilityState === 'visible'
      if (this.visible && this.running) {
        this.last = performance.now()
        this.loop(this.last)
      }
    }
    this.onResize = () => this.resize()
    document.addEventListener('visibilitychange', this.onVisibility)
    window.addEventListener('resize', this.onResize)
    this.resize()
    this.resetWells()
  }

  setParams(params: FieldParams): void {
    const entityChanged = params.entity !== this.params.entity
    const sceneChanged = params.scene !== this.params.scene
    const sourceChanged = params.glyphSource !== this.params.glyphSource
    if (sourceChanged && params.glyphSource) {
      for (const particle of this.particles) {
        if (particle.glyph && Math.random() < 0.22) {
          particle.stuck = true
          particle.vx = 0
          particle.vy = 0
          particle.maxLife = Math.max(particle.maxLife, 16)
        }
      }
    }
    this.params = params
    this.glyphs = fragments(params.glyphSource || 'necesito que alguien permanezca')
    if (params.interrupting) this.interruptUntil = this.time + 0.9
    if (entityChanged || sceneChanged) this.resetWells()
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.loop(this.last)
  }

  stop(): void {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  dispose(): void {
    this.stop()
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('resize', this.onResize)
    this.particles = []
  }

  private resize(): void {
    this.mobile = window.matchMedia('(max-width: 720px), (pointer: coarse)').matches
    this.dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1 : 1.6)
    const w = window.innerWidth
    const h = window.innerHeight
    this.width = w
    this.height = h
    this.canvas.width = Math.floor(w * this.dpr)
    this.canvas.height = Math.floor(h * this.dpr)
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private resetWells(): void {
    const w = this.width || window.innerWidth
    const h = this.height || window.innerHeight
    const entity = this.params.entity
    if (entity === 'daat') {
      this.wells = [
        { x: w * 0.5, y: h * 0.46, mass: 2200 },
        { x: w * 0.62, y: h * 0.7, mass: 900 },
      ]
    } else if (entity === 'bina') {
      this.wells = [
        { x: w * 0.34, y: h * 0.4, mass: 1200 },
        { x: w * 0.68, y: h * 0.58, mass: 1200 },
      ]
    } else if (entity === 'keter') {
      this.wells = [{ x: w * 0.5, y: h * 0.5, mass: 700 }]
    } else if (entity === 'yesod') {
      this.wells = [
        { x: w * 0.22, y: h * 0.55, mass: 1000 },
        { x: w * 0.8, y: h * 0.38, mass: 1400 },
      ]
    } else {
      this.wells = [{ x: w * 0.5, y: h * 0.72, mass: 500 }]
    }
  }

  private cap(): number {
    if (this.params.reduced) return 0
    const base = this.mobile ? 34 : 88
    if (this.params.still) return Math.floor(base * 0.35)
    if (this.params.scene === 'threshold') return Math.floor(base * 0.28)
    return Math.floor(base * (0.45 + this.params.intensity * 0.55))
  }

  private spawn(): void {
    if (this.particles.length >= this.cap()) return
    if (this.params.scene === 'threshold') {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.03,
        vy: 0.015 + Math.random() * 0.04,
        glyph: '',
        life: 0,
        maxLife: 12 + Math.random() * 10,
        stuck: Math.random() < 0.18,
        rising: false,
        size: 1 + Math.random() * 1.5,
        well: 0,
      })
      return
    }
    const glyph = this.glyphs[Math.floor(Math.random() * this.glyphs.length)] ?? '·'
    const rising = Math.random() < 0.28
    const stuck = Math.random() < 0.12
    const yesod = this.params.entity === 'yesod' && this.wells.length > 1
    const from = yesod ? this.wells[Math.floor(Math.random() * this.wells.length)] : null
    const toward = from ? (this.wells[0] === from ? 1 : 0) : Math.floor(Math.random() * this.wells.length)
    this.particles.push({
      x: from ? from.x + (Math.random() - 0.5) * 48 : Math.random() * this.width,
      y: from
        ? from.y + (Math.random() - 0.5) * 48
        : rising
          ? this.height * (0.65 + Math.random() * 0.3)
          : -20 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.18,
      vy: rising ? -0.22 - Math.random() * 0.18 : 0.22 + Math.random() * 0.35,
      glyph,
      life: 0,
      maxLife: stuck ? 18 + Math.random() * 14 : 6 + Math.random() * 8,
      stuck,
      rising,
      size: glyph.length > 1 ? 11 : 9 + Math.random() * 5,
      well: toward,
    })
  }

  private loop = (now: number): void => {
    if (!this.running) return
    if (!this.visible) return
    const dt = Math.min(0.05, (now - this.last) / 1000) || 0.016
    this.last = now
    this.time += dt
    if (this.params.reduced) {
      this.drawStill()
      this.raf = requestAnimationFrame(this.loop)
      return
    }
    this.step(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.loop)
  }

  private step(dt: number): void {
    const cap = this.cap()
    if (!this.params.still && this.particles.length < cap && Math.random() < 0.65) {
      this.spawn()
    }
    const entity = this.params.entity
    const interrupt = this.time < this.interruptUntil
    const still = this.params.still

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += dt
      if (p.life > p.maxLife && !p.stuck) {
        this.particles.splice(i, 1)
        continue
      }
      if (p.stuck) {
        p.x += Math.sin(this.time * 0.6 + p.y) * 0.04
        if (p.life > p.maxLife * 1.8) this.particles.splice(i, 1)
        continue
      }

      for (const well of this.wells) {
        const dx = well.x - p.x
        const dy = well.y - p.y
        const dist2 = dx * dx + dy * dy + 80
        const force = (well.mass * dt) / dist2
        p.vx += dx * force * 0.02
        p.vy += dy * force * 0.02
        if (dist2 < 1600) p.life += dt * 1.4
      }

      if (entity === 'daat') {
        p.vx += (this.width * 0.5 - p.x) * dt * 0.12
        p.vy += (this.height * 0.48 - p.y) * dt * 0.08
        if (interrupt && Math.random() < 0.04) p.x += (Math.random() - 0.5) * 18
      } else if (entity === 'bina') {
        p.vx += Math.sin(this.time * 0.7 + p.y * 0.01) * dt * 8
      } else if (entity === 'keter') {
        const gx = Math.round(p.x / 48) * 48
        const gy = Math.round(p.y / 48) * 48
        p.vx += (gx - p.x) * dt * 0.8
        p.vy += (gy - p.y) * dt * 0.8
      } else if (entity === 'yesod') {
        const target = this.wells[p.well] ?? this.wells[0]
        if (target) {
          p.vx += (target.x - p.x) * dt * 0.05
          p.vy += (target.y - p.y) * dt * 0.04
        }
        p.vx += Math.sin(p.y * 0.01 + this.time * 0.5) * dt * 10
        p.vy += Math.cos(p.x * 0.008 + this.time * 0.35) * dt * 5
      }

      if (p.rising && !still) {
        p.vy -= dt * 0.12
        if (p.vy < -0.45 && Math.random() < 0.01) {
          p.stuck = true
          p.vx = 0
          p.vy = 0
        }
      }

      if (still) {
        p.vx *= 0.9
        p.vy *= 0.9
      } else {
        p.vx *= 0.992
        p.vy *= 0.994
      }

      p.x += p.vx * 60 * dt
      p.y += p.vy * 60 * dt

      if (p.x < -40 || p.x > this.width + 40 || p.y > this.height + 50) {
        this.particles.splice(i, 1)
      }
    }

    while (this.particles.length > cap) this.particles.pop()
  }

  private palette() {
    return this.params.entity ? COLORS[this.params.entity] : COLORS.daat
  }

  private drawStill(): void {
    const { ctx, width: w, height: h } = this
    ctx.clearRect(0, 0, w, h)
    this.drawWells()
    if (this.params.entity === 'keter') this.drawGeometry()
    ctx.fillStyle = 'rgba(239, 232, 220, 0.08)'
    ctx.font = '12px "IBM Plex Mono", monospace'
    const marks = this.glyphs.slice(0, 6)
    marks.forEach((glyph, i) => {
      ctx.fillText(glyph, w * 0.18 + i * 48, h * 0.3 + (i % 3) * 70)
    })
  }

  private draw(): void {
    const { ctx, width: w, height: h } = this
    ctx.clearRect(0, 0, w, h)
    const interrupt = this.time < this.interruptUntil
    if (interrupt) {
      ctx.save()
      ctx.translate(w / 2, h / 2)
      ctx.scale(1.04, 0.97)
      ctx.translate(-w / 2, -h / 2)
    }
    this.drawMist()
    this.drawWells()
    if (this.params.entity === 'keter' || this.params.scene === 'archive') this.drawGeometry()
    if (this.params.entity === 'yesod') this.drawWaves()
    if (this.params.entity === 'daat') this.drawCracks(interrupt)
    this.drawGlyphs()
    if (this.params.entity === 'bina') this.drawEchoGlyphs()
    if (interrupt) ctx.restore()
  }

  private drawMist(): void {
    const p = this.palette()
    const g = this.ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.45,
      20,
      this.width * 0.5,
      this.height * 0.5,
      Math.max(this.width, this.height) * 0.7,
    )
    g.addColorStop(0, `rgba(${p.mist}, ${0.18 + this.params.intensity * 0.12})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    this.ctx.fillStyle = g
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  private drawWells(): void {
    for (const well of this.wells) {
      const radius = 40 + well.mass * 0.04
      const g = this.ctx.createRadialGradient(well.x, well.y, 4, well.x, well.y, radius)
      g.addColorStop(0, 'rgba(0,0,0,0.92)')
      g.addColorStop(0.5, 'rgba(0,0,0,0.35)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      this.ctx.fillStyle = g
      this.ctx.beginPath()
      this.ctx.arc(well.x, well.y, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  private drawGeometry(): void {
    const ctx = this.ctx
    const cx = this.width * 0.5
    const cy = this.height * 0.5
    ctx.save()
    ctx.strokeStyle = `rgba(196, 176, 122, ${0.18 + this.params.intensity * 0.15})`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.arc(cx, cy, Math.min(this.width, this.height) * 0.28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    const r = Math.min(this.width, this.height) * 0.24
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 3
      const cmd = i === 0 ? 'moveTo' : 'lineTo'
      ctx[cmd](cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.stroke()
    if (this.params.contradiction) {
      ctx.strokeStyle = 'rgba(196, 176, 122, 0.55)'
      ctx.beginPath()
      ctx.moveTo(cx - r * 0.2, cy + r * 0.85)
      ctx.lineTo(cx + r * 1.05, cy - r * 0.12)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawWaves(): void {
    const ctx = this.ctx
    ctx.save()
    ctx.strokeStyle = `rgba(26, 106, 124, ${0.16 + this.params.intensity * 0.12})`
    ctx.lineWidth = 0.8
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      const y = this.height * (0.35 + i * 0.1)
      for (let x = 0; x <= this.width; x += 14) {
        const yy =
          y +
          Math.sin(x * 0.012 + this.time * 0.35 + i) * (8 + i * 2) +
          Math.sin(x * 0.004 + this.time * 0.15) * 10
        if (x === 0) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawCracks(interrupt: boolean): void {
    if (!interrupt && this.params.intensity < 0.8) return
    const ctx = this.ctx
    ctx.save()
    ctx.strokeStyle = `rgba(106, 18, 24, ${interrupt ? 0.55 : 0.18})`
    ctx.lineWidth = 0.7
    const cx = this.width * 0.5
    const cy = this.height * 0.48
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (i - 1.5) * 90, cy + 40 + i * 28)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawGlyphs(): void {
    const ctx = this.ctx
    const p = this.palette()
    ctx.textBaseline = 'middle'
    for (const particle of this.particles) {
      const fade = 1 - particle.life / (particle.maxLife * (particle.stuck ? 1.8 : 1))
      const alpha = Math.max(
        0,
        Math.min(0.62, fade * (particle.stuck ? 0.55 : particle.glyph ? 0.32 : 0.22)),
      )
      if (!particle.glyph) {
        ctx.fillStyle = `rgba(239, 232, 220, ${alpha})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.45, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      ctx.fillStyle = `rgba(${p.ink}, ${alpha})`
      ctx.font = `${particle.stuck ? 500 : 400} ${particle.size}px "IBM Plex Mono", monospace`
      ctx.fillText(particle.glyph, particle.x, particle.y)
    }
  }

  private drawEchoGlyphs(): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha = 0.22
    ctx.fillStyle = 'rgba(183, 154, 212, 0.7)'
    ctx.font = '11px "IBM Plex Mono", monospace'
    for (const particle of this.particles) {
      if (particle.glyph.length < 2) continue
      ctx.fillText(particle.glyph, particle.x + 16, particle.y + 11)
    }
    ctx.restore()
  }
}
