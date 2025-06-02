'use client';
import { useState, useEffect } from 'react';
import { analyzeAudio, AnalysisResult } from '@/lib/analyzeAudio';
import { savePattern } from '@/lib/savePattern';
import { fetchPatterns, StoredPattern } from '@/lib/fetchPatterns';

export default function BeatMapPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<string>('');
  const [patterns, setPatterns] = useState<StoredPattern[]>([]);

  const loadPatterns = async () => {
    try {
      const data = await fetchPatterns();
      setPatterns(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPatterns();
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('Analyzing...');
    try {
      const res = await analyzeAudio(file);
      setResult(res);
      setStatus('Analysis complete');
    } catch (e) {
      console.error(e);
      setStatus('Failed to analyze');
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setStatus('Saving...');
    try {
      await savePattern({
        label: 'Pattern',
        bpm: result.bpm,
        beatVariance: result.beatVariance,
        patternVector: result.patternVector,
      });
      await loadPatterns();
      setStatus('Saved to Supabase');
    } catch (e) {
      console.error(e);
      setStatus('Failed to save');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Beat Map</h1>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleAnalyze} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50" disabled={!file}>
        Analyze
      </button>
      {result && (
        <div className="p-2 border rounded">
          <p>BPM: {result.bpm?.toFixed(2)}</p>
          <p>Variance: {result.beatVariance.toFixed(4)}</p>
          <p className="break-all">Vector: [{result.patternVector.map((v) => v.toFixed(2)).join(', ')}]</p>
        </div>
      )}
      {result && (
        <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
          Save to Supabase
        </button>
      )}
      <p className="h-6">{status}</p>
      <div className="mt-4">
        <h2 className="font-semibold mb-2">Saved Patterns</h2>
        {patterns.length === 0 ? (
          <p className="text-sm text-gray-500">No patterns stored</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-2">Label</th>
                <th className="py-1 pr-2">BPM</th>
                <th className="py-1 pr-2">Variance</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-1 pr-2">{p.label}</td>
                  <td className="py-1 pr-2">{p.bpm?.toFixed(2)}</td>
                  <td className="py-1 pr-2">{p.beat_variance.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
