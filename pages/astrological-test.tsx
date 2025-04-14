import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AstrologicalService, PlanetaryAlignment } from '@/services/AstrologicalService';

type TestResult = {
  positions: PlanetaryAlignment;
  retrogradeStatus: Record<string, boolean>;
  sources: Record<string, string>;
}

// Remove the external pre-fetch logic as it didn't resolve the issue
// let initialDataPromise: Promise<TestResult> | null = null;
// function getInitialData() { ... }

export default function AstrologicalTest() {
  // Initialize loading state to true since we fetch on mount
  const [results, setResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true); // Start loading
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false); // Ref to ensure effect runs only once

  // Stable function for running tests on demand (e.g., form submit)
  const runTest = useCallback(async (testDate: Date) => {
    // Prevent concurrent runs if already loading
    if (loading) {
      console.log("runTest skipped: already loading");
      return;
    }
    console.log("runTest started for date:", testDate);
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const testResults = await AstrologicalService.testCalculations(testDate);
      console.log("runTest received results");
      setResults(testResults);
    } catch (err) {
      console.error('Error running test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults(null); // Clear results on error
    } finally {
      console.log("runTest finished");
      setLoading(false);
    }
  }, [loading]); // Dependency: only need current loading state check

  // Initial data loading effect
  useEffect(() => {
    // This ref ensures the core async logic runs only once
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log("Initial load effect started (runs once)");

      let isMounted = true; // Flag to check if component is still mounted

      // Fetch initial data (using today's date)
      AstrologicalService.testCalculations(new Date())
        .then(data => {
          console.log("Initial load received data");
          if (isMounted) {
            console.log("Initial load setting results");
            setResults(data);
            setError(null); // Clear error state if successful
          } else {
            console.log("Initial load skipped setting results: unmounted");
          }
        })
        .catch(err => {
          console.error('Error loading initial data:', err);
          if (isMounted) {
            console.log("Initial load setting error");
            setError(err instanceof Error ? err.message : 'Unknown error');
            setResults(null); // Clear results on error
          } else {
            console.log("Initial load skipped setting error: unmounted");
          }
        })
        .finally(() => {
          if (isMounted) {
            console.log("Initial load finished, setting loading false");
            setLoading(false); // Set loading false *after* fetch completes
          } else {
            console.log("Initial load finished, skipped setting loading: unmounted");
          }
        });

      // Cleanup function to set isMounted flag
      return () => {
        console.log("Initial load effect cleanup");
        isMounted = false;
      };
    } else {
      // This log should not appear in production or after the first mount in dev
      console.log("Initial load effect skipped: already initialized");
    }
    // Empty dependency array ensures this effect runs only once on mount
  }, []); // No dependencies, runs once

  // Stable handler for date input change
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  }, []);

  // Stable handler for form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with date:", date);
    const testDate = new Date(date);
    // Validate date before running the test
    if (!isNaN(testDate.getTime())) {
      runTest(testDate);
    } else {
      console.error("Invalid date selected:", date);
      setError("Invalid date selected. Please choose a valid date.");
    }
  }, [date, runTest]); // Dependencies: date value and the stable runTest function

  // Log component renders
  console.log(`AstrologicalTest component rendered. Loading: ${loading}, Has Results: ${!!results}, Has Error: ${!!error}`);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Astrological Calculations Test</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-end gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Test Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Run Test'}
          </button>
        </div>
      </form>

      {loading && <div className="text-gray-600">Loading calculations...</div>}
      
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {results && !loading && !error && (
        <div className="grid gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Planetary Positions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Planet</th>
                    <th className="py-2 px-4 border text-left">Sign</th>
                    <th className="py-2 px-4 border text-left">Position</th>
                    <th className="py-2 px-4 border text-left">Retrograde</th>
                    <th className="py-2 px-4 border text-left">Data Source</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.positions).map(([planet, position]) => (
                    <tr key={planet} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border capitalize">{planet}</td>
                      <td className="py-2 px-4 border capitalize">{position.sign}</td>
                      <td className="py-2 px-4 border">
                        {position.degree}° {position.minutes}' 
                        <span className="text-gray-500 ml-1">
                          ({position.exactLongitude.toFixed(2)}°)
                        </span>
                      </td>
                      <td className={`py-2 px-4 border ${position.isRetrograde ? 'text-red-500 font-medium' : ''}`}>
                        {position.isRetrograde ? 'Yes' : 'No'}
                      </td>
                      <td className="py-2 px-4 border">
                        {results.sources[planet] || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Additional Tests</h2>
            <button
              onClick={() => AstrologicalService.verifyPlanetaryPositions()}
              className="bg-green-500 text-white px-4 py-2 rounded mr-4"
              disabled={loading}
            >
              Verify API Positions
            </button>
            <button
              onClick={() => AstrologicalService.testAPIs()}
              className="bg-purple-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Test APIs
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 