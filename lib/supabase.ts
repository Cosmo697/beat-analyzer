import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BeatPatternRecord = {
  id: string;
  label: string;
  bpm: number | null;
  beat_variance: number;
  pattern_vector: number[] | string;
  created_at: string;
};

// Helper function to get patterns with parsed vectors
export async function getPatterns(): Promise<BeatPatternRecord[]> {
  const { data, error } = await supabase
    .from('beat_patterns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patterns:', error);
    throw error;
  }

  // Parse pattern vectors if they're stored as strings
  return data.map(pattern => ({
    ...pattern,
    pattern_vector: typeof pattern.pattern_vector === 'string'
      ? JSON.parse(pattern.pattern_vector)
      : pattern.pattern_vector
  }));
}

// Helper to get a single pattern by ID
export async function getPatternById(id: string): Promise<BeatPatternRecord | null> {
  const { data, error } = await supabase
    .from('beat_patterns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching pattern by ID:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    pattern_vector: typeof data.pattern_vector === 'string'
      ? JSON.parse(data.pattern_vector)
      : data.pattern_vector
  };
}

// Helper to delete a pattern
export async function deletePattern(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('beat_patterns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pattern:', error);
    return false;
  }

  return true;
}

// Helper to update a pattern's label
export async function updatePatternLabel(id: string, label: string): Promise<boolean> {
  const { error } = await supabase
    .from('beat_patterns')
    .update({ label })
    .eq('id', id);

  if (error) {
    console.error('Error updating pattern label:', error);
    return false;
  }

  return true;
}
