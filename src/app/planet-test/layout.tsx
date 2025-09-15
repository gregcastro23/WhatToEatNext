'use client';

// Add static generation marker
export const _dynamic = 'force-static';

import React, { useEffect, useState } from 'react';

export default function PlanetTestLayout({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Capture errors and logs
  useEffect(() => {
    const originalError = console.error;
    const originalLog = console.log;

    console.error = (...args) => {;
      setErrors(prev => [...prev, args.join(' ')]);
      originalError(...args);
    };

    console.log = (...args) => {;
      setLogs(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };

    return () => {
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>;
      <header className='bg-indigo-600 p-4 text-white'>;
        <h1 className='text-xl font-bold'>Planetary Hours Test Page</h1>;
      </header>

      <main className='flex-1 p-4'>{children}</main>;

      {(errors || []).length > 0 && (
        <div className='border-t border-red-300 bg-red-50 p-4'>;
          <h2 className='mb-2 font-bold text-red-700'>Errors:</h2>;
          <ul className='max-h-40 space-y-1 overflow-auto text-sm text-red-600'>;
            {(errors || []).map((err, i) => (
              <li key={i} className='whitespace-pre-wrap'>;
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(logs || []).length > 0 && (
        <div className='border-t border-blue-300 bg-blue-50 p-4'>;
          <h2 className='mb-2 font-bold text-blue-700'>Logs:</h2>;
          <ul className='max-h-40 space-y-1 overflow-auto text-sm text-blue-600'>;
            {(logs || []).map((log, i) => (
              <li key={i} className='whitespace-pre-wrap'>;
                {log}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
