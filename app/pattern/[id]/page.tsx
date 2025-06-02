'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PatternVisualizer from '@/components/PatternVisualizer';
import Button from '@/components/Button';
import { getPatternById, updatePatternLabel, deletePattern, BeatPatternRecord } from '@/lib/supabase';

export default function PatternDetailPage() {
  const params = useParams();
  const patternId = params.id as string;
  
  const [pattern, setPattern] = useState<BeatPatternRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function loadPattern() {
      try {
        setLoading(true);
        const data = await getPatternById(patternId);
        if (data) {
          setPattern(data);
          setNewLabel(data.label);
        } else {
          setError('Pattern not found');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load pattern details');
      } finally {
        setLoading(false);
      }
    }

    if (patternId) {
      loadPattern();
    }
  }, [patternId]);

  const handleSaveLabel = async () => {
    if (!pattern || !newLabel.trim()) return;
    
    setIsSaving(true);
    try {
      const success = await updatePatternLabel(pattern.id, newLabel);
      if (success) {
        setPattern({
          ...pattern,
          label: newLabel
        });
        setEditingLabel(false);
      } else {
        throw new Error('Failed to update label');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to update label');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePattern = async () => {
    if (!pattern || !confirm('Are you sure you want to delete this pattern?')) return;
    
    setIsSaving(true);
    try {
      const success = await deletePattern(pattern.id);
      if (success) {
        window.location.href = '/';
      } else {
        throw new Error('Failed to delete pattern');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to delete pattern');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Loading Pattern...</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !pattern) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Pattern not found'}
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Create an array representation if the pattern vector is a string
  const patternVector = Array.isArray(pattern.pattern_vector) 
    ? pattern.pattern_vector 
    : JSON.parse(pattern.pattern_vector as string);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Pattern Details</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            {editingLabel ? (
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter pattern label"
                />
                <div className="mt-2 flex space-x-2">
                  <Button
                    onClick={handleSaveLabel}
                    variant="success"
                    size="small"
                    loading={isSaving}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingLabel(false);
                      setNewLabel(pattern.label);
                    }}
                    variant="secondary"
                    size="small"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {pattern.label}
                </h2>
                <button 
                  onClick={() => setEditingLabel(true)}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit Label
                </button>
              </div>
            )}
            
            <div>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {pattern.bpm ? `${pattern.bpm.toFixed(1)} BPM` : 'Unknown BPM'}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Beat Pattern</h3>
              <PatternVisualizer patternVector={patternVector} height={180} />
            </div>
            
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(pattern.created_at).toLocaleString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Beat Variance</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {pattern.beat_variance.toFixed(6)}
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Pattern Vector</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded overflow-auto">
                  [{patternVector.map(v => typeof v === 'number' ? v.toFixed(4) : v).join(', ')}]
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <Button
              onClick={handleDeletePattern}
              variant="danger"
              loading={isSaving}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              }
            >
              Delete Pattern
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
