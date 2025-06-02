export interface AnalysisResult {
  bpm: number | null;
  beatVariance: number;
  patternVector: number[];
  confidence: number;
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

  // Downsample and compute RMS amplitude envelope for better beat detection
  const step = 512;
  const envelope: number[] = [];
  for (let i = 0; i < mixed.length; i += step) {
    let sum = 0;
    for (let j = i; j < i + step && j < mixed.length; j++) {
      sum += mixed[j] * mixed[j]; // RMS calculation
    }
    envelope.push(Math.sqrt(sum / step));
  }

  // Apply a simple filter to enhance beats
  const filtered = envelope.slice();
  for (let i = 2; i < filtered.length - 2; i++) {
    filtered[i] = -0.1 * filtered[i-2] + 0.15 * filtered[i-1] + 
                 0.9 * filtered[i] + 0.15 * filtered[i+1] - 0.1 * filtered[i+2];
  }

  // Compute half-wave rectified diff of envelope to enhance onsets
  const diff = [0];
  for (let i = 1; i < filtered.length; i++) {
    diff.push(Math.max(0, filtered[i] - filtered[i-1]));
  }

  // Autocorrelation for BPM detection with wider range
  const minLag = Math.round((60 / 220) * sampleRate / step); // 220 BPM
  const maxLag = Math.round((60 / 40) * sampleRate / step);  // 40 BPM
  
  let bestLag = 0;
  let bestCorr = -Infinity;
  let secondBestCorr = -Infinity;
  
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < diff.length - lag; i++) {
      corr += diff[i] * diff[i + lag];
    }
    
    // Normalize by lag to not favor longer periods
    corr = corr / lag;
    
    if (corr > bestCorr) {
      secondBestCorr = bestCorr;
      bestCorr = corr;
      bestLag = lag;
    } else if (corr > secondBestCorr) {
      secondBestCorr = corr;
    }
  }
  
  const stepTime = step / sampleRate;
  const bpm = bestLag ? 60 / (bestLag * stepTime) : null;
  
  // Confidence score based on ratio of best correlation to second best
  // A higher ratio means we're more confident in our BPM estimation
  const confidence = secondBestCorr > 0 ? bestCorr / secondBestCorr : 1;

  // Beat variance using simple deviation around bestLag
  let variance = 0;
  for (let i = 0; i < diff.length - bestLag; i++) {
    variance += Math.pow(diff[i] - diff[i + bestLag], 2);
  }
  variance /= diff.length - bestLag;

  // Normalize variance to a 0-1 scale for easier interpretation
  const normalizedVariance = Math.min(1, variance / Math.max(...diff));

  // Extract pattern vector based on beats
  // We'll try to extract a more meaningful pattern by finding beat locations
  const patternSize = 16; // 16 points for one bar assuming 4/4 time
  const beatPositions = findBeats(diff, bestLag);
  
  // Generate pattern vector from beats found
  const patternVector = extractPatternFromBeats(diff, beatPositions, patternSize);

  ctx.close();

  return { 
    bpm, 
    beatVariance: normalizedVariance, 
    patternVector,
    confidence
  };
}

// Find likely beat positions using peak picking
function findBeats(signal: number[], estimatedBeatLag: number): number[] {
  const beatPositions: number[] = [];
  const windowSize = Math.max(2, Math.floor(estimatedBeatLag * 0.1));
  
  for (let i = windowSize; i < signal.length - windowSize; i++) {
    const currentValue = signal[i];
    let isPeak = true;
    
    // Check if this is a local maximum
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && signal[j] > currentValue) {
        isPeak = false;
        break;
      }
    }
    
    // Also check if it's above a threshold to avoid noise
    const threshold = 0.3 * Math.max(...signal);
    if (isPeak && currentValue > threshold) {
      beatPositions.push(i);
    }
  }
  
  return beatPositions;
}

// Extract a normalized pattern from beat positions
function extractPatternFromBeats(signal: number[], beatPositions: number[], patternSize: number): number[] {
  const result: number[] = new Array(patternSize).fill(0);
  
  if (beatPositions.length === 0) {
    // Fallback if no clear beats found: use the whole signal
    const segmentLength = Math.floor(signal.length / patternSize);
    for (let i = 0; i < patternSize; i++) {
      let sum = 0;
      for (let j = 0; j < segmentLength && i * segmentLength + j < signal.length; j++) {
        sum += signal[i * segmentLength + j];
      }
      result[i] = sum / segmentLength;
    }
  } else {
    // Find a segment with most likely one bar (typically 4 beats in 4/4 time)
    const approxBeatsPerBar = 4;
    const approxBarLength = beatPositions.length >= approxBeatsPerBar 
      ? (beatPositions[approxBeatsPerBar] - beatPositions[0]) 
      : signal.length;
    
    // Sample the signal at equidistant points within this segment
    const barStart = beatPositions[0];
    const pointsPerPattern = patternSize;
    
    for (let i = 0; i < pointsPerPattern; i++) {
      const position = barStart + Math.floor((i / pointsPerPattern) * approxBarLength);
      if (position < signal.length) {
        result[i] = signal[position];
      }
    }
  }
  
  // Normalize the pattern
  const maxVal = Math.max(...result, 0.001);
  return result.map(v => v / maxVal);
}
