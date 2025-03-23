import { useEffect, useState } from 'react';
import { AstrologicalService, PlanetaryAlignment } from '@/services/AstrologicalService';

interface TestResult {
  positions: PlanetaryAlignment;
  retrogradeStatus: Record<string, boolean>;
  sources: Record<string, string>;
}

export default function AstrologicalTest() {
  const [results, setResults] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const runTest = async (testDate: Date) => {
    setLoading(true);
    setError(null);
    try {
      const testResults = await AstrologicalService.testCalculations(testDate);
      setResults(testResults);
    } catch (err) {
      console.error('Error running test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest(new Date());
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const testDate = new Date(date);
    runTest(testDate);
  };

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
          >
            Run Test
          </button>
        </div>
      </form>

      {loading && <div className="text-gray-600">Loading calculations...</div>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {results && !loading && (
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
                        {results.sources[planet as keyof typeof results.sources] || 'Unknown'}
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
            >
              Verify API Positions
            </button>
            <button
              onClick={() => AstrologicalService.testAPIs()}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Test APIs
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 