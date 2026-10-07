import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Activity, CheckCircle2, AlertTriangle, Clock, Server } from 'lucide-react';

const SERVICES = [
  { name: 'Web Application', status: 'operational', uptime: '99.98%', latency: '42ms' },
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', latency: '28ms' },
  { name: 'Database', status: 'operational', uptime: '99.97%', latency: '12ms' },
  { name: 'Authentication', status: 'operational', uptime: '100%', latency: '35ms' },
  { name: 'File Storage', status: 'operational', uptime: '99.95%', latency: '85ms' },
  { name: 'Email Delivery', status: 'degraded', uptime: '99.82%', latency: '340ms' },
  { name: 'Realtime Sync', status: 'operational', uptime: '99.93%', latency: '55ms' },
  { name: 'Mobile Push', status: 'operational', uptime: '99.91%', latency: '120ms' },
];

const INCIDENTS = [
  {
    date: 'Oct 02, 2026',
    title: 'Email delivery delays',
    severity: 'minor',
    status: 'monitoring',
    description: 'Some outgoing notification emails are experiencing delays of up to 5 minutes. We are monitoring the situation.',
  },
  {
    date: 'Sep 28, 2026',
    title: 'Scheduled database maintenance completed',
    severity: 'maintenance',
    status: 'resolved',
    description: 'Database performance optimization was completed successfully. No further action required.',
  },
];

const SCHEDULED = [
  {
    date: 'Oct 10, 2026 · 02:00–04:00 UTC',
    title: 'API Gateway upgrade',
    description: 'Brief intermittent API errors may occur during the upgrade window. Expected downtime: under 5 minutes.',
  },
];

const STATUS_STYLES = {
  operational: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Operational' },
  degraded: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Degraded' },
  maintenance: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Maintenance' },
};

export default function SystemStatus() {
  const [overallStatus, setOverallStatus] = useState('operational');

  useEffect(() => {
    const hasDegraded = SERVICES.some((s) => s.status === 'degraded');
    setOverallStatus(hasDegraded ? 'degraded' : 'operational');
  }, []);

  const overall = STATUS_STYLES[overallStatus];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Activity} title="System Status" description="Real-time operational health of the platform." />

      {/* Overall banner */}
      <div className={`rounded-xl border p-5 mb-6 flex items-center gap-3 ${overall.bg}`}>
        <overall.icon className={`w-6 h-6 ${overall.color}`} />
        <div>
          <p className="font-semibold text-sm">
            {overallStatus === 'operational'
              ? 'All Systems Operational'
              : 'Some Systems Experiencing Issues'}
          </p>
          <p className="text-xs text-muted-foreground">
            {overallStatus === 'operational'
              ? 'All core services are running normally.'
              : 'We are aware of the issue and working on a fix.'}
          </p>
        </div>
      </div>

      {/* Service list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
          <Server className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Service Status</h3>
        </div>
        <div className="divide-y divide-border">
          {SERVICES.map((svc) => {
            const style = STATUS_STYLES[svc.status];
            return (
              <div key={svc.name} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <style.icon className={`w-4 h-4 ${style.color}`} />
                  <span className="text-sm font-medium">{svc.name}</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Uptime: <span className="font-medium text-foreground">{svc.uptime}</span></span>
                  <span className="hidden sm:inline">Latency: <span className="font-medium text-foreground">{svc.latency}</span></span>
                  <span className={`font-medium ${style.color}`}>{style.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled maintenance */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Scheduled Maintenance</h3>
        <div className="space-y-3">
          {SCHEDULED.map((m, i) => (
            <div key={i} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{m.title}</p>
                <span className="text-xs text-muted-foreground">{m.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent incidents */}
      <div>
        <h3 className="font-semibold mb-3">Recent Incidents</h3>
        <div className="space-y-3">
          {INCIDENTS.map((inc, i) => {
            const style = STATUS_STYLES[inc.severity === 'maintenance' ? 'maintenance' : inc.severity === 'minor' ? 'degraded' : 'operational'];
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <style.icon className={`w-4 h-4 ${style.color}`} />
                    <p className="text-sm font-semibold">{inc.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{inc.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{inc.description}</p>
                <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>
                  {inc.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}