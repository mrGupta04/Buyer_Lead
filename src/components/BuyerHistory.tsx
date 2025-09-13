// components/BuyerHistory.tsx
'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  changedAt: string;
  changedBy: {
    name: string | null;
    email: string;
  };
  diff: Record<string, { old: any; new: any }>;
}

interface BuyerHistoryProps {
  buyerId: string;
}

export default function BuyerHistory({ buyerId }: BuyerHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/buyers/${buyerId}/history`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [buyerId]);
  
  if (loading) {
    return <div>Loading history...</div>;
  }
  
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }
  
  if (history.length === 0) {
    return <div>No history found</div>;
  }
  
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Changed by {item.changedBy.name || item.changedBy.email}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(item.changedAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="mt-2">
            {Object.entries(item.diff).map(([field, changes]) => (
              <div key={field} className="text-sm mt-1">
                <span className="font-medium capitalize">{field}</span>:{' '}
                <span className="text-red-600">{changes.old?.toString() || 'Empty'}</span> →{' '}
                <span className="text-green-600">{changes.new?.toString() || 'Empty'}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}