import { StoreState } from './types';

const DB_NAME = 'microsteps-db';
const STORE_NAME = 'store';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject('Error opening IndexedDB');
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveState = async (state: StoreState): Promise<void> => {
  try {
    const database = await openDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(state, 'currentState');

    request.onsuccess = () => {
      // console.log('State saved to IndexedDB');
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
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get('currentState');

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as StoreState | null);
      };

      request.onerror = (event) => {
        console.error('Error loading state from IndexedDB:', (event.target as IDBRequest).error);
        reject('Error loading state from IndexedDB');
      };
    });
  } catch (error) {
    console.error('Error in loadState:', error);
    return null;
  }
};