
// A utility to encode raw PCM audio data into a WAV file (Blob).

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  
  // FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, 1, true); // Audio format (1 for PCM)
  view.setUint16(22, 1, true); // Number of channels (1 for mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  
  // Data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

/**
 * A class to handle recording audio and encoding it to WAV format.
 * This avoids using MediaRecorder which often defaults to webm, a format
 * not supported by Safari.
 */
export class WavAudioRecorder {
  private audioContext: AudioContext;
  private scriptProcessor: ScriptProcessorNode;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private recording = false;
  private buffer: Float32Array[] = [];
  private bufferLength = 0;
  private sampleRate: number;

  constructor(stream: MediaStream) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.sampleRate = this.audioContext.sampleRate;
    this.audioSource = this.audioContext.createMediaStreamSource(stream);
    
    // Use a buffer size of 0 to let the browser choose the best buffer size.
    this.scriptProcessor = this.audioContext.createScriptProcessor(0, 1, 1);

    this.scriptProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (this.recording) {
        const inputData = e.inputBuffer.getChannelData(0);
        const bufferCopy = new Float32Array(inputData);
        this.buffer.push(bufferCopy);
        this.bufferLength += bufferCopy.length;
      }
    };

    this.audioSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  public start() {
    this.recording = true;
  }

  public stop(): Promise<Blob> {
    this.recording = false;
    
    const mergedBuffer = new Float32Array(this.bufferLength);
    let offset = 0;
    for (const buffer of this.buffer) {
      mergedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    const wavBlob = encodeWAV(mergedBuffer, this.sampleRate);

    // Cleanup
    this.audioSource?.disconnect();
    this.scriptProcessor.disconnect();
    this.audioContext.close();

    return Promise.resolve(wavBlob);
  }

  public getAudioContext(): AudioContext {
    return this.audioContext;
  }

  public getAudioSource(): MediaStreamAudioSourceNode | null {
    return this.audioSource;
  }
}
