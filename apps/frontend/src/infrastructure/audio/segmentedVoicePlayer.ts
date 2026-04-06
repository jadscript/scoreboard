export type VoiceClipManifest = Record<string, { start: number; end: number }>

export type SegmentedVoicePlayerOptions = {
  audioUrl: string
  manifestUrl: string
}

export class SegmentedVoicePlayer {
  private readonly audioUrl: string
  private readonly manifestUrl: string
  private context: AudioContext | null = null
  private buffer: AudioBuffer | null = null
  private manifest: VoiceClipManifest | null = null
  private loadPromise: Promise<void> | null = null
  private playGeneration = 0
  private activeSource: AudioBufferSourceNode | null = null

  constructor(options: SegmentedVoicePlayerOptions) {
    this.audioUrl = options.audioUrl
    this.manifestUrl = options.manifestUrl
  }

  async load(): Promise<void> {
    if (this.loadPromise) return this.loadPromise
    this.loadPromise = this.loadInternal()
    return this.loadPromise
  }

  private async loadInternal(): Promise<void> {
    const [audioRes, manifestRes] = await Promise.all([
      fetch(this.audioUrl),
      fetch(this.manifestUrl),
    ])
    if (!audioRes.ok) throw new Error(`Voice audio failed: ${this.audioUrl}`)
    if (!manifestRes.ok) throw new Error(`Voice manifest failed: ${this.manifestUrl}`)

    const arrayBuffer = await audioRes.arrayBuffer()
    const json = (await manifestRes.json()) as VoiceClipManifest
    this.manifest = json

    const ctx = this.ensureContext()
    this.buffer = await new Promise<AudioBuffer>((resolve, reject) => {
      ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject)
    })
  }

  private ensureContext(): AudioContext {
    if (typeof globalThis.AudioContext === 'undefined') {
      throw new Error('Web Audio API not available')
    }
    if (!this.context) {
      this.context = new globalThis.AudioContext()
    }
    return this.context
  }

  async resumeContext(): Promise<void> {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  }

  isLoaded(): boolean {
    return this.buffer !== null && this.manifest !== null
  }

  playClip(key: string): void {
    this.playSequence([key])
  }

  playSequence(keys: string[]): void {
    if (!this.buffer || !this.manifest) return
    this.stopInternal()
    const gen = ++this.playGeneration
    const ctx = this.ensureContext()
    const buffer = this.buffer
    const manifest = this.manifest

    const playIndex = (i: number): void => {
      if (gen !== this.playGeneration) return
      if (i >= keys.length) {
        this.activeSource = null
        return
      }
      const key = keys[i]
      const slice = manifest[key]
      if (!slice || slice.end <= slice.start) {
        playIndex(i + 1)
        return
      }
      const src = ctx.createBufferSource()
      this.activeSource = src
      src.buffer = buffer
      src.connect(ctx.destination)
      const duration = slice.end - slice.start
      src.onended = () => {
        if (gen !== this.playGeneration) return
        playIndex(i + 1)
      }
      try {
        src.start(ctx.currentTime, slice.start, duration)
      } catch {
        this.activeSource = null
      }
    }

    playIndex(0)
  }

  stop(): void {
    this.stopInternal()
  }

  private stopInternal(): void {
    this.playGeneration += 1
    if (this.activeSource) {
      try {
        this.activeSource.stop()
      } catch {
        /* already stopped */
      }
      this.activeSource = null
    }
  }
}
