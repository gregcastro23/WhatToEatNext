'use client';

// Add static generation marker
export const dynamic = 'force-static';

import React, { useEffect, useState } from 'react';

export default function PlanetTestLayout({ children }: {
  children: React.ReactNode;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Capture errors and logs
  useEffect(() => {
    const originalError = console.error;
    const originalLog = console.log;

    console.error = (...args) => {
      setErrors(prev => [...prev, args?.join(' ')]);
      originalError(...args);
    };

    console.log = (...args) => {
      setLogs(prev => [...prev, args?.join(' ')]);
      originalLog(...args);
    };

    return () => {
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 text-white p-4">
        <h1 className="text-xl font-bold">Planetary Hours Test Page</h1>
      </header>
      
      <main className="flex-1 p-4">{children}</main>

      {(errors || []).length > 0 && (
        <div className="p-4 border-t border-red-300 bg-red-50">
          <h2 className="font-bold text-red-700 mb-2">Errors:</h2>
          <ul className="text-sm text-red-600 space-y-1 max-h-40 overflow-auto">
            {(errors || []).map((err, i) => (
              <li key={i} className="whitespace-pre-wrap">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(logs || []).length > 0 && (
        <div className="p-4 border-t border-blue-300 bg-blue-50">
          <h2 className="font-bold text-blue-700 mb-2">Logs:</h2>
          <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-auto">
            {(logs || []).map((log, i) => (
              <li key={i} className="whitespace-pre-wrap">
                {log}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 