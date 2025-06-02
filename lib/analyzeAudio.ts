export interface AnalysisResult {
  bpm: number | null;
  beatVariance: number;
  patternVector: number[];
}

export async function analyzeAudio(file: File): Promise<AnalysisResult> {
  const Context =
    (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Context();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const sampleRate = audioBuffer.sampleRate;

  // Mix down to mono
  const length = audioBuffer.length;
  const mixed = new Float32Array(length);
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      mixed[i] += data[i];
    }
  }
  for (let i = 0; i < length; i++) mixed[i] /= audioBuffer.numberOfChannels;

  // Downsample to reduce computation
  const step = 512;
  const envelope: number[] = [];
  for (let i = 0; i < mixed.length; i += step) {
    let sum = 0;
    for (let j = i; j < i + step && j < mixed.length; j++) {
      sum += Math.abs(mixed[j]);
    }
    envelope.push(sum / step);
  }

  // Autocorrelation for BPM detection
  const minLag = Math.round((60 / 200) * sampleRate / step); // 200 BPM
  const maxLag = Math.round((60 / 60) * sampleRate / step);  // 60 BPM
  let bestLag = 0;
  let bestCorr = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < envelope.length - lag; i++) {
      corr += envelope[i] * envelope[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  const stepTime = step / sampleRate;
  const bpm = bestLag ? 60 / (bestLag * stepTime) : null;

  // Beat variance using simple deviation around bestLag
  let variance = 0;
  for (let i = 0; i < envelope.length - bestLag; i++) {
    variance += Math.pow(envelope[i] - envelope[i + bestLag], 2);
  }
  variance /= envelope.length - bestLag;

  // Simple pattern vector: first 16 normalized envelope values
  const patternSize = 16;
  const vec: number[] = [];
  const maxVal = Math.max(...envelope);
  for (let i = 0; i < patternSize; i++) {
    const idx = Math.floor((i / patternSize) * envelope.length);
    vec.push(envelope[idx] / (maxVal || 1));
  }

  ctx.close();

  return { bpm, beatVariance: variance, patternVector: vec };
}
