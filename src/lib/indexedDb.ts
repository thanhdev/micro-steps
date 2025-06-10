
import type { StoreState } from './types';

const DB_NAME = 'microsteps-db';
const STORE_NAME = 'store';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB is not available in this environment.');
      resolve(null); // Resolve with null if IndexedDB is not available
      return;
    }

    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      resolve(null); // Resolve with null on error too, or reject if preferred
    };
  });
};

export const saveState = async (state: StoreState): Promise<void> => {
  try {
    const database = await openDatabase();
    if (!database) {
      console.warn('Cannot save state: IndexedDB not available.');
      return; // Do nothing if DB is not available
    }
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(state, 'currentState');

    request.onsuccess = () => {
      console.log('State saved to IndexedDB');
    };

    request.onerror = (event) => {
      console.error('Error saving state to IndexedDB:', (event.target as IDBRequest).error);
    };
  } catch (error) {
    console.error('Error in saveState:', error);
  }
};

export const loadState = async (): Promise<StoreState | null> => {
  try {
    const database = await openDatabase();
    if (!database) {
      console.warn('Cannot load state: IndexedDB not available.');
      return null; // Return null if DB is not available
    }
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get('currentState');

    return new Promise((resolve) => {
      request.onsuccess = (event) => {
        const loadedData = (event.target as IDBRequest).result as StoreState | null;
        console.log('State loaded from IndexedDB:', loadedData);
        resolve(loadedData);
      };

      request.onerror = (event) => {
        console.error('Error loading state from IndexedDB:', (event.target as IDBRequest).error);
        resolve(null); // Resolve with null on error
      };
    });
  } catch (error) {
    console.error('Error in loadState:', error);
    return null;
  }
};

