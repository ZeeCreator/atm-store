/**
 * Firebase Uptime Monitoring System
 * 
 * Tracks application uptime, connection status, and performance metrics
 */

import { ref, set, onValue, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

export interface UptimeRecord {
  timestamp: number;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  clientId: string;
  url: string;
}

export interface ConnectionStats {
  uptime: number;
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastHeartbeat: number | null;
  status: 'online' | 'offline' | 'degraded';
}

/**
 * Uptime Monitor Class
 */
export class UptimeMonitor {
  private clientId: string;
  private checkInterval: number = 5000; // 5 seconds
  private isMonitoring: boolean = false;
  private startTime: number = Date.now();
  private totalChecks: number = 0;
  private failedChecks: number = 0;
  private responseTimes: number[] = [];

  constructor() {
    this.clientId = `uptime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start monitoring uptime
   */
  async start(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = Date.now();

    // Initial check
    await this.performCheck();

    // Periodic checks
    this.startPeriodicChecks();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * Perform uptime check
   */
  private async performCheck(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Check Firebase connection using onValue instead of get
      // .info/connected doesn't work with get(), need to use onValue
      const statusRef = ref(db, '.info/connected');
      
      // Create a promise to get connection status
      const isConnected = await new Promise<boolean>((resolve) => {
        let unsub: (() => void) | null = null;
        
        const timeout = setTimeout(() => {
          if (unsub) unsub();
          resolve(false);
        }, 2000);
        
        unsub = onValue(statusRef, (snapshot) => {
          clearTimeout(timeout);
          resolve(snapshot.exists() && snapshot.val() === true);
          if (unsub) unsub();
        }, { onlyOnce: true });
      });

      const responseTime = performance.now() - startTime;
      this.responseTimes.push(responseTime);
      
      // Keep only last 100 response times
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift();
      }

      this.totalChecks++;

      if (!isConnected) {
        this.failedChecks++;
      }

      // Record uptime data
      await this.recordUptime({
        timestamp: Date.now(),
        status: isConnected ? 'online' : 'offline',
        responseTime,
        clientId: this.clientId,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      });

    } catch (error) {
      this.failedChecks++;
      console.warn('Uptime check failed:', error);
    }
  }

  /**
   * Record uptime data to Firebase
   */
  private async recordUptime(record: UptimeRecord): Promise<void> {
    try {
      const uptimeRef = ref(db, `system/uptime/${this.clientId}`);
      await set(uptimeRef, record);
    } catch (error) {
      console.warn('Failed to record uptime:', error);
    }
  }

  /**
   * Start periodic checks
   */
  private startPeriodicChecks(): void {
    const checkLoop = async () => {
      if (!this.isMonitoring) return;

      await this.performCheck();
      setTimeout(checkLoop, this.checkInterval);
    };

    checkLoop();
  }

  /**
   * Get current uptime statistics
   */
  getStats(): ConnectionStats {
    const uptime = this.totalChecks > 0 
      ? ((this.totalChecks - this.failedChecks) / this.totalChecks) * 100 
      : 100;

    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    return {
      uptime,
      totalRequests: this.totalChecks,
      failedRequests: this.failedChecks,
      averageResponseTime: avgResponseTime,
      lastHeartbeat: Date.now(),
      status: uptime >= 99 ? 'online' : uptime >= 95 ? 'degraded' : 'offline',
    };
  }

  /**
   * Get uptime duration in milliseconds
   */
  getUptimeDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Format uptime as human-readable string
   */
  formatUptime(): string {
    const duration = this.getUptimeDuration();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

/**
 * Global uptime monitor instance
 */
export const globalUptimeMonitor = new UptimeMonitor();

/**
 * Get connection stats from Firebase
 */
export async function getConnectionStats(): Promise<ConnectionStats | null> {
  try {
    const uptimeRef = ref(db, 'system/uptime');
    
    // Use promise wrapper for onValue
    const snapshot = await new Promise<any>((resolve, reject) => {
      let unsub: (() => void) | null = null;
      
      const timeout = setTimeout(() => {
        if (unsub) unsub();
        reject(new Error('Timeout getting connection stats'));
      }, 5000);
      
      unsub = onValue(uptimeRef, (snap) => {
        clearTimeout(timeout);
        resolve(snap);
        if (unsub) unsub();
      }, { onlyOnce: true });
    });
    
    if (!snapshot.exists()) {
      return null;
    }

    const uptimeData = snapshot.val();
    const clients = Object.values(uptimeData) as UptimeRecord[];
    
    if (clients.length === 0) {
      return null;
    }

    // Calculate aggregate stats
    const totalUptime = clients.reduce((sum, client) => {
      return sum + (client.status === 'online' ? 1 : 0);
    }, 0);

    const avgResponseTime = clients.reduce((sum, client) => {
      return sum + client.responseTime;
    }, 0) / clients.length;

    const latestTimestamp = Math.max(...clients.map(c => c.timestamp));
    const now = Date.now();
    const timeSinceLastHeartbeat = now - latestTimestamp;

    // Consider offline if no heartbeat in 30 seconds
    const status = timeSinceLastHeartbeat < 30000 ? 'online' : 'offline';

    return {
      uptime: (totalUptime / clients.length) * 100,
      totalRequests: clients.length,
      failedRequests: clients.filter(c => c.status === 'offline').length,
      averageResponseTime: avgResponseTime,
      lastHeartbeat: latestTimestamp,
      status,
    };
  } catch (error) {
    console.error('Failed to get connection stats:', error);
    return null;
  }
}

/**
 * Listen to real-time connection stats
 */
export function subscribeToConnectionStats(
  callback: (stats: ConnectionStats | null) => void
): () => void {
  const uptimeRef = ref(db, 'system/uptime');
  
  const unsubscribe = onValue(uptimeRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const uptimeData = snapshot.val();
    const clients = Object.values(uptimeData) as UptimeRecord[];
    
    if (clients.length === 0) {
      callback(null);
      return;
    }

    const totalUptime = clients.reduce((sum, client) => {
      return sum + (client.status === 'online' ? 1 : 0);
    }, 0);

    const avgResponseTime = clients.reduce((sum, client) => {
      return sum + client.responseTime;
    }, 0) / clients.length;

    const latestTimestamp = Math.max(...clients.map(c => c.timestamp));
    const now = Date.now();
    const timeSinceLastHeartbeat = now - latestTimestamp;

    const status = timeSinceLastHeartbeat < 30000 ? 'online' : 'offline';

    callback({
      uptime: (totalUptime / clients.length) * 100,
      totalRequests: clients.length,
      failedRequests: clients.filter(c => c.status === 'offline').length,
      averageResponseTime: avgResponseTime,
      lastHeartbeat: latestTimestamp,
      status,
    });
  });

  return unsubscribe;
}

/**
 * Clean up old uptime records (older than 1 hour)
 */
export async function cleanupOldUptimeRecords(): Promise<void> {
  try {
    const uptimeRef = ref(db, 'system/uptime');
    
    // Use promise wrapper for onValue
    const snapshot = await new Promise<any>((resolve, reject) => {
      let unsub: (() => void) | null = null;
      
      const timeout = setTimeout(() => {
        if (unsub) unsub();
        reject(new Error('Timeout getting uptime data'));
      }, 5000);
      
      unsub = onValue(uptimeRef, (snap) => {
        clearTimeout(timeout);
        resolve(snap);
        if (unsub) unsub();
      }, { onlyOnce: true });
    });
    
    if (!snapshot.exists()) return;

    const uptimeData = snapshot.val();
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour in milliseconds

    const cleanupPromises = Object.entries(uptimeData).map(([clientId, record]: [string, any]) => {
      if (record.timestamp < oneHourAgo) {
        return set(ref(db, `system/uptime/${clientId}`), null);
      }
      return Promise.resolve();
    });

    await Promise.all(cleanupPromises);
  } catch (error) {
    console.warn('Failed to cleanup old uptime records:', error);
  }
}
