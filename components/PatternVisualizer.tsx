'use client';

import React from 'react';

interface PatternVisualizerProps {
  patternVector: number[];
  height?: number;
  color?: string;
  barWidth?: number;
  spacing?: number;
}

const PatternVisualizer: React.FC<PatternVisualizerProps> = ({
  patternVector,
  height = 120,
  color = '#3B82F6', // blue-500
  barWidth = 4,
  spacing = 2
}) => {
  if (!patternVector || patternVector.length === 0) {
    return (
      <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-sm">No pattern data</p>
      </div>
    );
  }

  return (
    <div 
      className="flex items-end justify-center rounded-lg bg-gray-50"
      style={{ height: `${height}px` }}
    >
      {patternVector.map((value, i) => (
        <div 
          key={i} 
          style={{
            width: `${barWidth}px`,
            marginLeft: `${spacing}px`,
            marginRight: `${spacing}px`,
            height: `${Math.max(4, value * (height - 10))}px`,
            backgroundColor: color,
            transition: 'height 0.3s ease'
          }}
          className="rounded-t"
        />
      ))}
    </div>
  );
};

export default PatternVisualizer;
