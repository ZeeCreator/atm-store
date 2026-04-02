'use client';

import { useState, useEffect } from 'react';
import { globalUptimeMonitor } from '@/lib/uptime';
import type { ConnectionStats } from '@/lib/uptime';

export default function UptimeMonitor() {
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [uptimeString, setUptimeString] = useState('0s');

  useEffect(() => {
    // Start global uptime monitor
    globalUptimeMonitor.start();

    // Update uptime string every second
    const updateUptimeInterval = setInterval(() => {
      setUptimeString(globalUptimeMonitor.formatUptime());
    }, 1000);

    // Get initial stats
    setStats(globalUptimeMonitor.getStats());

    // Update stats every 5 seconds
    const updateStatsInterval = setInterval(() => {
      setStats(globalUptimeMonitor.getStats());
    }, 5000);

    return () => {
      clearInterval(updateUptimeInterval);
      clearInterval(updateStatsInterval);
      globalUptimeMonitor.stop();
    };
  }, []);

  if (!stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/10 border-green-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'offline':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusBg(stats.status)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-white uppercase text-sm">
          <i className="fa-solid fa-heart-pulse mr-2"></i>
          System Status
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            stats.status === 'online' ? 'bg-green-500 animate-pulse' :
            stats.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs font-headline uppercase tracking-widest ${getStatusColor(stats.status)}`}>
            {stats.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            Uptime
          </p>
          <p className="text-lg font-headline font-bold text-white">
            {uptimeString}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            Uptime %
          </p>
          <p className={`text-lg font-headline font-bold ${
            stats.uptime >= 99 ? 'text-green-500' :
            stats.uptime >= 95 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {stats.uptime.toFixed(1)}%
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            Avg Response
          </p>
          <p className="text-lg font-headline font-bold text-white">
            {stats.averageResponseTime.toFixed(0)}ms
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            Checks
          </p>
          <p className="text-lg font-headline font-bold text-white">
            {stats.totalRequests}
          </p>
        </div>
      </div>

      {stats.failedRequests > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[10px] text-red-400 uppercase tracking-widest">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
            {stats.failedRequests} Failed Checks
          </p>
        </div>
      )}
    </div>
  );
}
