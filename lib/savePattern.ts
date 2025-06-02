export interface PatternData {
  label: string;
  bpm: number | null;
  beatVariance: number;
  patternVector: number[];
}

export async function savePattern(data: PatternData) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/beat_patterns';
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([
      {
        label: data.label,
        bpm: data.bpm,
        beat_variance: data.beatVariance,
        pattern_vector: JSON.stringify(data.patternVector),
      },
    ]),
  });
  if (!res.ok) {
    throw new Error(`Failed to save pattern: ${res.status}`);
  }
}
