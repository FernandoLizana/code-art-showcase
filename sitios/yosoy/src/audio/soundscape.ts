import type { EntityId, SceneId } from '../engine/types'

type Voice = {
  gains: GainNode[]
  stop: () => void
}

export class Soundscape {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private voices = new Map<EntityId, Voice>()

  apply(input: {
    enabled: boolean
    entity: EntityId | null
    intensity: number
    still: boolean
    scene: SceneId
  }): void {
    if (!input.enabled) {
      this.silence()
      return
    }
    this.ensure()
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    if (ctx.state === 'suspended') void ctx.resume()

    const target = input.still ? 0.035 : 0.05 + input.intensity * 0.07
    const sceneMul = input.scene === 'threshold' ? 0.35 : 1
    master.gain.setTargetAtTime(target * sceneMul, ctx.currentTime, 1.1)

    const next = input.entity
    for (const id of this.voices.keys()) {
      this.setVoice(id, next && id === next ? 1 : 0)
    }
  }

  dispose(): void {
    this.silence()
    for (const voice of this.voices.values()) voice.stop()
    this.voices.clear()
    if (this.ctx) void this.ctx.close()
    this.ctx = null
    this.master = null
  }

  private silence(): void {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25)
      if (this.ctx.state === 'running') void this.ctx.suspend()
    }
  }

  private ensure(): void {
    if (this.ctx) return
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -22
    compressor.knee.value = 18
    compressor.ratio.value = 4
    compressor.attack.value = 0.03
    compressor.release.value = 0.28
    master.connect(compressor)
    compressor.connect(ctx.destination)
    this.ctx = ctx
    this.master = master
    this.voices.set('daat', this.makeDaat(ctx, master))
    this.voices.set('bina', this.makeBina(ctx, master))
    this.voices.set('keter', this.makeKeter(ctx, master))
    this.voices.set('yesod', this.makeYesod(ctx, master))
  }

  private setVoice(id: EntityId, amount: number): void {
    const ctx = this.ctx
    const voice = this.voices.get(id)
    if (!ctx || !voice) return
    const fader = voice.gains[0]
    if (!fader) return
    fader.gain.setTargetAtTime(amount, ctx.currentTime, 1.15)
  }

  private makeNoise(ctx: AudioContext, kind: 'brown' | 'white'): AudioBuffer {
    const length = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      if (kind === 'brown') {
        last = (last + 0.018 * white) / 1.018
        data[i] = last * 3.4
      } else {
        data[i] = white * 0.5
      }
    }
    return buffer
  }

  private sourceLoop(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.start()
    return source
  }

  private makeDaat(ctx: AudioContext, master: GainNode): Voice {
    const fader = ctx.createGain()
    fader.gain.value = 0
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.2
    const oscGain = ctx.createGain()
    oscGain.gain.value = 0.045
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 180
    const shaper = ctx.createWaveShaper()
    shaper.curve = this.distortionCurve()
    const noise = this.sourceLoop(ctx, this.makeNoise(ctx, 'brown'))
    noise.connect(filter)
    filter.connect(shaper)
    shaper.connect(noiseGain)
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 43
    osc.start()
    osc.connect(oscGain)
    noiseGain.connect(fader)
    oscGain.connect(fader)
    fader.connect(master)
    return {
      gains: [fader],
      stop: () => {
        noise.stop()
        osc.stop()
      },
    }
  }

  private makeBina(ctx: AudioContext, master: GainNode): Voice {
    const fader = ctx.createGain()
    fader.gain.value = 0
    const delay1 = ctx.createDelay(1)
    delay1.delayTime.value = 0.29
    const delay2 = ctx.createDelay(1.5)
    delay2.delayTime.value = 0.67
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 184
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 187.4
    osc.start()
    osc2.start()
    const mix = ctx.createGain()
    mix.gain.value = 0.07
    osc.connect(mix)
    osc2.connect(mix)
    mix.connect(delay1)
    mix.connect(delay2)
    delay1.connect(fader)
    delay2.connect(fader)
    mix.connect(fader)
    fader.connect(master)
    return {
      gains: [fader],
      stop: () => {
        osc.stop()
        osc2.stop()
      },
    }
  }

  private makeKeter(ctx: AudioContext, master: GainNode): Voice {
    const fader = ctx.createGain()
    fader.gain.value = 0
    const amp = ctx.createGain()
    amp.gain.value = 0.045
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 528
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.02
    lfo.connect(lfoGain)
    lfoGain.connect(amp.gain)
    osc.connect(amp)
    amp.connect(fader)
    fader.connect(master)
    osc.start()
    lfo.start()
    return {
      gains: [fader],
      stop: () => {
        osc.stop()
        lfo.stop()
      },
    }
  }

  private makeYesod(ctx: AudioContext, master: GainNode): Voice {
    const fader = ctx.createGain()
    fader.gain.value = 0
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 420
    filter.Q.value = 1.4
    const delay = ctx.createDelay(1.2)
    delay.delayTime.value = 0.48
    const feedback = ctx.createGain()
    feedback.gain.value = 0.28
    const noise = this.sourceLoop(ctx, this.makeNoise(ctx, 'white'))
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.09
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(fader)
    noiseGain.connect(fader)
    fader.connect(master)
    return {
      gains: [fader],
      stop: () => {
        noise.stop()
      },
    }
  }

  private distortionCurve(): Float32Array<ArrayBuffer> {
    const n = 256
    const curve = new Float32Array(new ArrayBuffer(n * 4))
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1
      curve[i] = Math.tanh(x * 2.4) * 0.7
    }
    return curve
  }
}
