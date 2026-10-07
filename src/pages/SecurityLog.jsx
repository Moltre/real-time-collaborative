import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Shield, Smartphone, Monitor, Globe, Clock, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function parseUA() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/')) browser = 'Safari';

  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  const isMobile = /Android|iPhone|iPad/i.test(ua);
  return { browser, os, isMobile };
}

const RECENT_SESSIONS = [
  { device: 'Chrome · macOS', location: 'Bengaluru, IN', ip: '203.0.113.42', time: '2 hours ago', current: true },
  { device: 'Safari · iOS', location: 'Bengaluru, IN', ip: '203.0.113.42', time: 'Yesterday, 18:24', current: false },
  { device: 'Firefox · Windows', location: 'Mumbai, IN', ip: '198.51.100.7', time: '3 days ago', current: false },
  { device: 'Chrome · Android', location: 'Delhi, IN', ip: '198.51.100.88', time: 'Last week', current: false },
];

export default function SecurityLog() {
  const [current, setCurrent] = useState({ browser: 'Browser', os: 'Unknown', isMobile: false });

  useEffect(() => {
    setCurrent(parseUA());
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Shield} title="Security Log" description="Recent login sessions and active devices for your account." />

      {/* Current session */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="font-semibold text-sm">This device is active</p>
            <p className="text-xs text-muted-foreground">
              {current.browser} · {current.os} · {current.isMobile ? 'Mobile' : 'Desktop'}
            </p>
          </div>
        </div>
      </div>

      {/* Active devices */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          {current.isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          Active Devices
        </h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {RECENT_SESSIONS.map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', s.current ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                  {s.device.includes('iOS') || s.device.includes('Android') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{s.location}</span>
                    <span>·</span>
                    <span>IP {s.ip}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                  </p>
                </div>
                {s.current ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Current</span>
                ) : (
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security tips */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Security Recommendations</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span>Use a unique password and update it regularly.</li>
          <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span>Revoke any session you do not recognize.</li>
          <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span>Log out from shared or public devices when finished.</li>
        </ul>
      </div>
    </div>
  );
}