'use client';
import { useState, useEffect } from 'react';
import { analyzeAudio, AnalysisResult } from '@/lib/analyzeAudio';
import { savePattern, findSimilarPatterns } from '@/lib/savePattern';
import Link from 'next/link';
import Button from '@/components/Button';
import FileUploader from '@/components/FileUploader';
import PatternVisualizer from '@/components/PatternVisualizer';

interface SimilarPattern {
  id: string;
  label: string;
  similarity: number;
}

export default function BeatMapPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [similarPatterns, setSimilarPatterns] = useState<SimilarPattern[]>([]);
  const [suggestedLabel, setSuggestedLabel] = useState<string>('');

  // Find similar patterns when analysis is complete
  useEffect(() => {
    async function checkSimilarPatterns() {
      if (!result) return;
      
      try {
        const similar = await findSimilarPatterns(result.patternVector, 0.6);
        setSimilarPatterns(similar);
        
        // Suggest a label based on the most similar pattern
        if (similar.length > 0 && similar[0].similarity > 0.7) {
          setSuggestedLabel(similar[0].label);
          setCustomLabel(similar[0].label);
        } else {
          // Create a new label
          setSuggestedLabel('');
          setCustomLabel(`Pattern ${new Date().toISOString().slice(0, 10)}`);
        }
      } catch (e) {
        console.error('Failed to find similar patterns:', e);
      }
    }
    
    checkSimilarPatterns();
  }, [result]);

  const handleFileSelected = (file: File) => {
    setFile(file);
    setResult(null);
    setStatus('');
    setSimilarPatterns([]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setStatus('Analyzing audio file...');
    try {
      const res = await analyzeAudio(file);
      setResult(res);
      setStatus(`Analysis complete. ${res.bpm ? `Detected BPM: ${res.bpm.toFixed(1)}` : 'Unable to detect BPM.'}`);
    } catch (e) {
      console.error(e);
      setStatus('Failed to analyze audio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    setStatus('Saving pattern to database...');
    try {
      await savePattern({
        label: customLabel || 'Unnamed Pattern',
        bpm: result.bpm,
        beatVariance: result.beatVariance,
        patternVector: result.patternVector,
      });
      setStatus('Beat pattern saved successfully!');
      
      // Clear form after successful save
      setTimeout(() => {
        setFile(null);
        setResult(null);
        setCustomLabel('');
        setSimilarPatterns([]);
      }, 2000);
    } catch (e) {
      console.error(e);
      setStatus('Failed to save pattern');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Beat Analysis</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Upload Audio File</h2>
          
          <FileUploader onFileSelected={handleFileSelected} />
          
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={handleAnalyze} 
              disabled={!file || isAnalyzing}
              loading={isAnalyzing}
            >
              Analyze Beat Pattern
            </Button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">BPM</h3>
                <p className="text-3xl font-bold text-blue-600">{result.bpm?.toFixed(1) || 'Unknown'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Beat Variance</h3>
                <p className="text-3xl font-bold text-blue-600">{result.beatVariance.toFixed(4)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Detection Confidence</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {result.confidence > 0.8 ? 'High' : 
                   result.confidence > 0.5 ? 'Medium' : 'Low'}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Beat Pattern Visualization</h3>
              <PatternVisualizer patternVector={result.patternVector} height={180} />
            </div>
            
            {similarPatterns.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Similar Patterns</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    This beat pattern is similar to {similarPatterns.length} existing pattern{similarPatterns.length > 1 ? 's' : ''}:
                  </p>
                  <ul className="space-y-2">
                    {similarPatterns.slice(0, 3).map(pattern => (
                      <li key={pattern.id} className="flex justify-between items-center">
                        <span className="font-medium">{pattern.label}</span>
                        <span className="text-sm">
                          {Math.round(pattern.similarity * 100)}% similar
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Pattern Label</h3>
              
              {suggestedLabel && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    This pattern is similar to the existing label: <strong>{suggestedLabel}</strong>
                  </p>
                </div>
              )}
              
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign a Label
                </label>
                <input
                  type="text"
                  id="label"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g., House Groove, Trap Beat, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleSave} 
                variant="success"
                loading={isSaving}
                disabled={isSaving}
              >
                Save Beat Pattern
              </Button>
            </div>
          </div>
        )}
        
        {status && (
          <div className={`p-4 mb-6 rounded-md ${
            status.includes('Failed') ? 'bg-red-50 text-red-700' :
            status.includes('saved') ? 'bg-green-50 text-green-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
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
