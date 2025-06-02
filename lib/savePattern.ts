import { supabase } from './supabase';

export interface PatternData {
  label: string;
  bpm: number | null;
  beatVariance: number;
  patternVector: number[];
}

// Calculate Euclidean distance between two vectors
export function vectorDistance(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  
  return Math.sqrt(sum);
}

// Find similar patterns based on Euclidean distance
export async function findSimilarPatterns(
  vector: number[],
  threshold: number = 0.3
): Promise<{id: string, label: string, similarity: number}[]> {
  try {
    const { data, error } = await supabase
      .from('beat_patterns')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    const similarities = data
      .map((pattern: any) => {
        // Parse pattern vector if it's stored as a string
        const patternVector = typeof pattern.pattern_vector === 'string' 
          ? JSON.parse(pattern.pattern_vector) 
          : pattern.pattern_vector;
        
        if (patternVector.length !== vector.length) {
          return null; // Skip if vectors have different lengths
        }
        
        const distance = vectorDistance(vector, patternVector);
        const similarity = 1 / (1 + distance); // Convert distance to similarity (0-1)
        
        return {
          id: pattern.id,
          label: pattern.label,
          similarity
        };
      })
      .filter((item): item is {id: string, label: string, similarity: number} => 
        item !== null && item.similarity >= threshold
      )
      .sort((a, b) => b.similarity - a.similarity);
    
    return similarities;
  } catch (error) {
    console.error('Error finding similar patterns:', error);
    return [];
  }
}

export async function savePattern(data: PatternData) {
  try {
    // Find similar patterns first
    const similarPatterns = await findSimilarPatterns(data.patternVector, 0.7);
    
    // If very similar pattern exists, consider using its label
    if (similarPatterns.length > 0 && similarPatterns[0].similarity > 0.9) {
      // If user didn't customize the label, use the similar pattern's label
      if (data.label.startsWith('Pattern ')) {
        data.label = similarPatterns[0].label;
      }
    }

    // Insert the new pattern
    const { error } = await supabase
      .from('beat_patterns')
      .insert({
        label: data.label,
        bpm: data.bpm,
        beat_variance: data.beatVariance,
        pattern_vector: JSON.stringify(data.patternVector),
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving pattern:', error);
    throw error;
  }
}
