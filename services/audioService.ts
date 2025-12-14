
// Audio Service using Web Audio API for procedural Sci-Fi sounds
// Enhanced for realism: Uses noise buffers and filters to avoid "beepy" 8-bit sounds.

class AudioServiceController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    this.enabled = localStorage.getItem('fitnova_sound_enabled') !== 'false';
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Chain: Compressor -> Gain -> Destination
      // Compressor helps glue sounds together and prevents clipping on chords
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; 
      this.masterGain.connect(this.compressor);

      // Create White Noise Buffer (1 second is enough for UI sounds)
      const bufferSize = this.ctx.sampleRate; 
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5; // Soften raw noise
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('fitnova_sound_enabled', String(enabled));
  }

  public isEnabled() {
    return this.enabled;
  }

  // --- INTERNAL GENERATORS ---

  // Helper: Play a burst of filtered noise
  private playNoise(duration: number, filterFreq: number, volume: number, type: 'lowpass' | 'highpass' | 'bandpass' = 'lowpass') {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    if(type === 'bandpass') filter.Q.value = 1;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }

  // Helper: Play a simple tone with envelope
  private playTone(freq: number, type: OscillatorType, duration: number, volume: number, slideTo?: number) {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
      }
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
  }

  // --- SOUND FX ---

  // 1. Hover: Very subtle, "static" tick. No tonal beep.
  public playHover() {
    if (!this.enabled) return;
    this.init();
    // High-pass noise click (like a Geiger counter tick)
    this.playNoise(0.03, 3000, 0.05, 'highpass');
  }

  // 2. Click: Mechanical switch sound. Thud + Metallic click.
  public playClick() {
    if (!this.enabled) return;
    this.init();
    // Low frequency thud (body)
    this.playTone(150, 'sine', 0.1, 0.2, 50);
    // Metallic impact (transient)
    this.playNoise(0.05, 1500, 0.08, 'bandpass');
  }

  // 3. Success: Cinematic "Chord Swell". Not an arcade chime.
  public playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Major 9th chord components
    const freqs = [440, 554.37, 659.25, 880, 1108.73]; 
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(5000, now + 0.5); // "Opening" filter effect
    filter.connect(this.masterGain);

    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        
        osc.type = 'sawtooth'; // Richer harmonics
        osc.frequency.value = f;
        // Slight detune for analog feel
        osc.detune.value = (Math.random() * 20) - 10; 

        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.03, now + 0.1); // Slow attack
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Long release

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(now);
        osc.stop(now + 1.6);
    });
  }

  // 4. Error: Dissonant, low-tech buzz.
  public playError() {
    if (!this.enabled) return;
    this.init();
    // Two detuned sawtooths creating a rough texture
    this.playTone(100, 'sawtooth', 0.3, 0.15);
    this.playTone(105, 'sawtooth', 0.3, 0.15); // 5Hz beat frequency
  }

  // 5. Level Up: Massive Impact + Shine
  public playLevelUp() {
    if (!this.enabled) return;
    this.init();
    // Sub-bass impact
    this.playTone(60, 'sine', 1.5, 0.6, 30);
    // Noise wash
    this.playNoise(1.0, 500, 0.2, 'lowpass');
    // Overlay success chord
    setTimeout(() => this.playSuccess(), 200);
  }

  // 6. Typing: Subtle, filtered mechanical keyboard feel
  public playTyping() {
    if (!this.enabled) return;
    this.init();
    // Randomize pitch slightly for realism
    const filterFreq = 1000 + Math.random() * 500;
    this.playNoise(0.03, filterFreq, 0.04, 'bandpass');
  }
}

export const AudioService = new AudioServiceController();
