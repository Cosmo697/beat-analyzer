'use client';
import { useState } from 'react';
import { analyzeAudio, AnalysisResult } from '@/lib/analyzeAudio';
import { savePattern } from '@/lib/savePattern';

export default function BeatMapPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<string>('');

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
    </div>
  );
}
