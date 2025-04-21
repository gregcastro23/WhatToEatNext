import { DataLoader, dataTransformers, createDataLoader, loadJsonData } from '../dataLoader';
import { cache } from '../cache';
import { AppError } from '../errorHandling';

// Mock dependencies
jest.mock('../cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('DataLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadData', () => {
    test('should load data from source when not in cache', async () => {
      const loader = new DataLoader<string[]>();
      const mockSource = jest.fn().mockResolvedValue(['item1', 'item2']);
      
      const result = await loader.loadData(mockSource);
      
      expect(result.data).toEqual(['item1', 'item2']);
      expect(result.source).toBe('remote');
      expect(result.transformed).toBe(true);
      expect(mockSource).toHaveBeenCalledTimes(1);
    });

    test('should return data from cache when available', async () => {
      (cache.get as jest.Mock).mockReturnValue(['cached1', 'cached2']);
      
      const loader = new DataLoader<string[]>({
        cacheKey: 'test-key'
      });
      const mockSource = jest.fn().mockResolvedValue(['item1', 'item2']);
      
      const result = await loader.loadData(mockSource);
      
      expect(result.data).toEqual(['cached1', 'cached2']);
      expect(result.source).toBe('cache');
      expect(result.transformed).toBe(false);
      expect(mockSource).not.toHaveBeenCalled();
    });

    test('should use fallback when source fails', async () => {
      const loader = new DataLoader<string[]>({
        fallback: ['fallback1', 'fallback2'],
        retry: { attempts: 2, delay: 10 }
      });
      const mockSource = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const result = await loader.loadData(mockSource);
      
      expect(result.data).toEqual(['fallback1', 'fallback2']);
      expect(result.source).toBe('fallback');
      expect(result.transformed).toBe(false);
      expect(mockSource).toHaveBeenCalledTimes(2); // Retry once
      expect(result.error).toBeDefined();
    });

    test('should throw when validation fails', async () => {
      const loader = new DataLoader<string[]>({
        validator: (data) => Array.isArray(data) && data.length > 3
      });
      const mockSource = jest.fn().mockResolvedValue(['item1', 'item2']);
      
      await expect(loader.loadData(mockSource)).rejects.toThrow('Data validation failed');
    });

    test('should transform data correctly', async () => {
      const loader = new DataLoader<number[]>({
        transformer: (data) => (data as string[]).map(item => item.length)
      });
      const mockSource = jest.fn().mockResolvedValue(['item1', 'item2', 'item3']);
      
      const result = await loader.loadData(mockSource);
      
      expect(result.data).toEqual([5, 5, 5]); // Length of each string
      expect(result.transformed).toBe(true);
    });

    test('should retry on failure', async () => {
      const loader = new DataLoader<string[]>({
        retry: { attempts: 3, delay: 10 }
      });
      
      // First call fails, second succeeds
      const mockSource = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce(['success']);
      
      const result = await loader.loadData(mockSource);
      
      expect(mockSource).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(['success']);
    });

    test('should throw when no fallback is provided and source fails', async () => {
      const loader = new DataLoader<string[]>({
        throwOnError: true,
        retry: { attempts: 1, delay: 10 }
      });
      const mockSource = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(loader.loadData(mockSource)).rejects.toThrow('Test error');
    });
  });
});

describe('dataTransformers', () => {
  describe('arrayToRecord', () => {
    test('should convert array to record using key function', () => {
      const array = [
        { id: 'a1', value: 'first' },
        { id: 'b2', value: 'second' }
      ];
      
      const result = dataTransformers.arrayToRecord(array, item => item.id);
      
      expect(result).toEqual({
        a1: { id: 'a1', value: 'first' },
        b2: { id: 'b2', value: 'second' }
      });
    });
  });

  describe('normalizeString', () => {
    test('should trim and lowercase strings', () => {
      expect(dataTransformers.normalizeString(' TeSt ')).toBe('test');
    });

    test('should convert non-string values to string', () => {
      expect(dataTransformers.normalizeString(123)).toBe('123');
      expect(dataTransformers.normalizeString(null)).toBe('');
      expect(dataTransformers.normalizeString(undefined)).toBe('');
    });
  });

  describe('normalizeNumber', () => {
    test('should return number values as is', () => {
      expect(dataTransformers.normalizeNumber(123)).toBe(123);
    });

    test('should parse string numbers', () => {
      expect(dataTransformers.normalizeNumber('123')).toBe(123);
    });

    test('should use fallback for invalid values', () => {
      expect(dataTransformers.normalizeNumber('abc')).toBe(0);
      expect(dataTransformers.normalizeNumber('abc', 10)).toBe(10);
      expect(dataTransformers.normalizeNumber(null, 5)).toBe(5);
    });
  });

  describe('normalizeBoolean', () => {
    test('should return boolean values as is', () => {
      expect(dataTransformers.normalizeBoolean(true)).toBe(true);
      expect(dataTransformers.normalizeBoolean(false)).toBe(false);
    });

    test('should convert string true values', () => {
      expect(dataTransformers.normalizeBoolean('true')).toBe(true);
      expect(dataTransformers.normalizeBoolean('yes')).toBe(true);
      expect(dataTransformers.normalizeBoolean('1')).toBe(true);
    });

    test('should convert other values to false', () => {
      expect(dataTransformers.normalizeBoolean('false')).toBe(false);
      expect(dataTransformers.normalizeBoolean('no')).toBe(false);
      expect(dataTransformers.normalizeBoolean(0)).toBe(false);
      expect(dataTransformers.normalizeBoolean(null)).toBe(false);
    });
  });

  describe('deepClone', () => {
    test('should create a deep copy of an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = dataTransformers.deepClone(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });
  });

  describe('removeNullish', () => {
    test('should remove null and undefined values', () => {
      const obj = {
        a: 1,
        b: null,
        c: undefined,
        d: 0,
        e: ''
      };
      
      expect(dataTransformers.removeNullish(obj)).toEqual({
        a: 1,
        d: 0,
        e: ''
      });
    });
  });

  describe('applyDefaults', () => {
    test('should apply defaults for missing properties', () => {
      const obj = {
        name: 'test',
        age: null
      };
      
      const defaults = {
        name: 'default',
        age: 30,
        active: true
      };
      
      expect(dataTransformers.applyDefaults(obj, defaults)).toEqual({
        name: 'test',
        age: 30,
        active: true
      });
    });
  });
});

describe('createDataLoader', () => {
  test('should create a new DataLoader instance with options', () => {
    const options = {
      cacheKey: 'test',
      fallback: ['test']
    };
    
    const loader = createDataLoader(options);
    
    expect(loader).toBeInstanceOf(DataLoader);
  });
});

describe('loadJsonData', () => {
  test('should load and parse JSON from fetch response', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' })
    });
    
    const result = await loadJsonData(mockFetch);
    
    expect(result.data).toEqual({ data: 'test' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('should throw AppError when fetch fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });
    
    await expect(loadJsonData(mockFetch)).rejects.toThrow('Failed to fetch data: Not Found');
  });
}); 