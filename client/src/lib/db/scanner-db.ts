/**
 * IndexedDB wrapper for offline scanner functionality
 * Stores cached tickets, scan queue, and scanned ticket tracking
 */

interface CachedTicket {
  ticketId: string;
  ticketNumber: string;
  ticketType: string;
  status: 'valid' | 'cancelled' | 'refunded';
  eventId: string;
  holderName?: string;
  cachedAt: number;
}

interface QueuedScan {
  id: string;
  qrData: string;
  ticketId: string | null;
  scannedAt: number;
  deviceId: string;
  accessToken: string;
  result: 'success' | 'duplicate' | 'invalid' | 'expired' | 'cancelled';
  message: string;
  ticketNumber?: string;
  synced: boolean;
}

interface ScannedTicket {
  ticketId: string;
  scannedAt: number;
  offline: boolean;
}

const DB_NAME = 'ScannerDB';
const DB_VERSION = 1;

class ScannerDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Cached Tickets Store
        if (!db.objectStoreNames.contains('tickets')) {
          const ticketStore = db.createObjectStore('tickets', { keyPath: 'ticketId' });
          ticketStore.createIndex('eventId', 'eventId', { unique: false });
          ticketStore.createIndex('ticketNumber', 'ticketNumber', { unique: false });
        }

        // Scan Queue Store
        if (!db.objectStoreNames.contains('scanQueue')) {
          const queueStore = db.createObjectStore('scanQueue', { keyPath: 'id' });
          queueStore.createIndex('synced', 'synced', { unique: false });
          queueStore.createIndex('scannedAt', 'scannedAt', { unique: false });
        }

        // Scanned Tickets Store (for duplicate detection)
        if (!db.objectStoreNames.contains('scannedTickets')) {
          const scannedStore = db.createObjectStore('scannedTickets', { keyPath: 'ticketId' });
          scannedStore.createIndex('scannedAt', 'scannedAt', { unique: false });
        }
      };
    });
  }

  // ==================== TICKET CACHE ====================

  async cacheTickets(tickets: CachedTicket[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['tickets'], 'readwrite');
    const store = transaction.objectStore('tickets');

    // Clear existing tickets first
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add new tickets
    for (const ticket of tickets) {
      await new Promise<void>((resolve, reject) => {
        const request = store.add(ticket);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getTicketByNumber(ticketNumber: string): Promise<CachedTicket | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tickets'], 'readonly');
      const store = transaction.objectStore('tickets');
      const index = store.index('ticketNumber');
      const request = index.get(ticketNumber);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTickets(): Promise<CachedTicket[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tickets'], 'readonly');
      const store = transaction.objectStore('tickets');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearTicketCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tickets'], 'readwrite');
      const store = transaction.objectStore('tickets');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== SCAN QUEUE ====================

  async addToScanQueue(scan: QueuedScan): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanQueue'], 'readwrite');
      const store = transaction.objectStore('scanQueue');
      const request = store.add(scan);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedScans(): Promise<QueuedScan[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanQueue'], 'readonly');
      const store = transaction.objectStore('scanQueue');
      const request = store.getAll();

      request.onsuccess = () => {
        const allScans = request.result;
        const unsyncedScans = allScans.filter((scan: QueuedScan) => !scan.synced);
        resolve(unsyncedScans);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markScanAsSynced(scanId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanQueue'], 'readwrite');
      const store = transaction.objectStore('scanQueue');
      const getRequest = store.get(scanId);

      getRequest.onsuccess = () => {
        const scan = getRequest.result;
        if (scan) {
          scan.synced = true;
          const updateRequest = store.put(scan);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearSyncedScans(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const scans = await this.getUnsyncedScans();
    const syncedScans = (await this.getAllScans()).filter(s => s.synced);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanQueue'], 'readwrite');
      const store = transaction.objectStore('scanQueue');

      let completed = 0;
      const total = syncedScans.length;

      if (total === 0) {
        resolve();
        return;
      }

      for (const scan of syncedScans) {
        const request = store.delete(scan.id);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  async getAllScans(): Promise<QueuedScan[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanQueue'], 'readonly');
      const store = transaction.objectStore('scanQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== SCANNED TICKETS ====================

  async markTicketAsScanned(ticketId: string, offline: boolean = false): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const scannedTicket: ScannedTicket = {
      ticketId,
      scannedAt: Date.now(),
      offline
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scannedTickets'], 'readwrite');
      const store = transaction.objectStore('scannedTickets');
      const request = store.put(scannedTicket);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async isTicketScanned(ticketId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scannedTickets'], 'readonly');
      const store = transaction.objectStore('scannedTickets');
      const request = store.get(ticketId);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearScannedTickets(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scannedTickets'], 'readwrite');
      const store = transaction.objectStore('scannedTickets');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== UTILITY ====================

  async clearAll(): Promise<void> {
    await this.clearTicketCache();
    await this.clearScannedTickets();
    
    // Clear scan queue
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanQueue'], 'readwrite');
      const store = transaction.objectStore('scanQueue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const scannerDB = new ScannerDB();
export type { CachedTicket, QueuedScan, ScannedTicket };
