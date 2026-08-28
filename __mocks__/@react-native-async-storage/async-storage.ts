/**
 * AsyncStorage mock for Jest tests.
 */
const mockStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: jest.fn(async (key: string) => { delete mockStorage[key]; }),
  multiGet: jest.fn(async (keys: string[]) => keys.map(k => [k, mockStorage[k] ?? null])),
  clear: jest.fn(async () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
};

export default AsyncStorage;
