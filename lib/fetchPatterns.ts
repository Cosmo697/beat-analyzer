export interface StoredPattern {
  id: string;
  label: string;
  bpm: number | null;
  beat_variance: number;
  pattern_vector: number[];
  created_at: string;
}

export async function fetchPatterns(): Promise<StoredPattern[]> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/beat_patterns?select=*`;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const res = await fetch(url, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch patterns: ${res.status}`);
  }
  const data: Record<string, unknown>[] = await res.json();
  return data.map((item) => ({
    id: item.id as string,
    label: item.label as string,
    bpm: item.bpm as number | null,
    beat_variance: item.beat_variance as number,
    pattern_vector: item.pattern_vector
      ? JSON.parse(item.pattern_vector as string)
      : [],
    created_at: item.created_at as string,
  }));
}
