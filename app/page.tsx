'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PatternVisualizer from '@/components/PatternVisualizer';
import Button from '@/components/Button';
import { getPatterns, BeatPatternRecord } from '@/lib/supabase';

export default function Dashboard() {
  const [patterns, setPatterns] = useState<BeatPatternRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'bpm' | 'label'>('date');
  const [filterBpm, setFilterBpm] = useState<[number, number] | null>(null);

  useEffect(() => {
    async function fetchPatterns() {
      try {
        setLoading(true);
        const data = await getPatterns();
        setPatterns(data);
      } catch (e) {
        console.error(e);
        setError('Failed to load beat patterns');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPatterns();
  }, []);

  // Sort patterns based on selected criteria
  const sortedPatterns = [...patterns].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'bpm') {
      const aBpm = a.bpm || 0;
      const bBpm = b.bpm || 0;
      return bBpm - aBpm;
    } else if (sortBy === 'label') {
      return a.label.localeCompare(b.label);
    }
    return 0;
  });

  // Apply BPM filter if set
  const filteredPatterns = filterBpm 
    ? sortedPatterns.filter(p => p.bpm && p.bpm >= filterBpm[0] && p.bpm <= filterBpm[1])
    : sortedPatterns;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Beat Fingerprint Dashboard</h1>
          <Link href="/beat-map" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <span>Analyze New Track</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">About Beat Fingerprinting</h2>
            <p className="mt-2 text-sm text-gray-500">
              This dashboard lets you analyze audio tracks to extract beat patterns and groove "fingerprints". 
              All processing happens locally in your browser - no audio files are uploaded or stored.
              Only the beat metadata (BPM, pattern vectors, and labels) are saved to the database.
            </p>
          </div>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Saved Beat Patterns</h2>
          <div className="flex flex-wrap gap-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'bpm' | 'label')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="bpm">Sort by BPM</option>
              <option value="label">Sort by Label</option>
            </select>
            
            <select 
              value={filterBpm ? 'custom' : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterBpm(null);
                } else if (e.target.value === '80-100') {
                  setFilterBpm([80, 100]);
                } else if (e.target.value === '100-120') {
                  setFilterBpm([100, 120]);
                } else if (e.target.value === '120-140') {
                  setFilterBpm([120, 140]);
                } else if (e.target.value === '140-160') {
                  setFilterBpm([140, 160]);
                }
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All BPM</option>
              <option value="80-100">80-100 BPM</option>
              <option value="100-120">100-120 BPM</option>
              <option value="120-140">120-140 BPM</option>
              <option value="140-160">140-160 BPM</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredPatterns.length === 0 ? (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {patterns.length === 0 ? (
                <>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No beat patterns yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by analyzing your first audio track to extract its beat pattern.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No patterns match your filter</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your filter settings.
                  </p>
                </>
              )}
              <div className="mt-6">
                <Link href="/beat-map">
                  <Button variant="primary">Analyze Audio Track</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatterns.map((pattern) => {
              // Ensure pattern vector is an array (it might be stored as a string)
              const patternVector = Array.isArray(pattern.pattern_vector) 
                ? pattern.pattern_vector 
                : JSON.parse(pattern.pattern_vector as string);
                
              return (
                <Link 
                  href={`/pattern/${pattern.id}`} 
                  key={pattern.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{pattern.label}</h3>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {pattern.bpm ? `${pattern.bpm.toFixed(1)} BPM` : 'Unknown BPM'}
                      </span>
                    </div>
                    
                    <div className="mt-4 h-24">
                      <PatternVisualizer patternVector={patternVector} />
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Beat variance: {pattern.beat_variance.toFixed(4)}</p>
                      <p>Created: {new Date(pattern.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Beat Fingerprint Dashboard © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}