import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Zap, Crown, Building2, Download, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    color: 'text-slate-600',
    features: ['Up to 3 workspaces', 'Unlimited boards', 'Up to 5 members per workspace', 'Basic analytics', 'Community support'],
    current: true,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per user / month',
    icon: Crown,
    color: 'text-violet-600',
    features: ['Unlimited workspaces', 'Unlimited members', 'Advanced analytics & charts', 'Templates library', 'Calendar view', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$29',
    period: 'per user / month',
    icon: Building2,
    color: 'text-blue-600',
    features: ['Everything in Pro', 'SSO & SAML', 'Advanced permissions (RBAC)', 'Audit logs', 'Dedicated account manager', '99.9% uptime SLA'],
  },
];

const INVOICES = [
  { id: 'INV-2026-003', date: 'Oct 1, 2026', amount: '$48.00', status: 'Paid', plan: 'Pro (4 seats)' },
  { id: 'INV-2026-002', date: 'Sep 1, 2026', amount: '$48.00', status: 'Paid', plan: 'Pro (4 seats)' },
  { id: 'INV-2026-001', date: 'Aug 1, 2026', amount: '$36.00', status: 'Paid', plan: 'Pro (3 seats)' },
];

export default function Billing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader icon={CreditCard} title="Billing & Subscription" description="Manage your plan, view payment history, and upgrade your account." />

      {/* Current plan */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">Pro Plan</h2>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-sm text-muted-foreground">$12/user/month · 4 seats · Renews Nov 1, 2026</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Manage Seats</Button>
            <Button variant="outline" size="sm">Cancel Plan</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Monthly Cost</p>
            <p className="text-lg font-bold">$48.00</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seats Used</p>
            <p className="text-lg font-bold">4 / 4</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Billing Date</p>
            <p className="text-lg font-bold">Nov 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <h2 className="font-semibold mb-4">Available Plans</h2>
      <div className="flex gap-2 mb-4">
        {['monthly', 'yearly'].map((cycle) => (
          <button
            key={cycle}
            onClick={() => setBillingCycle(cycle)}
            className={cn('px-4 py-1.5 text-sm font-medium rounded-lg border capitalize transition-colors', billingCycle === cycle ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}
          >
            {cycle}
            {cycle === 'yearly' && <span className="ml-1.5 text-xs text-emerald-500">Save 20%</span>}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn('rounded-xl border bg-card p-5 flex flex-col relative', plan.popular ? 'border-primary shadow-md' : 'border-border', plan.current && 'opacity-75')}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', plan.color, 'bg-muted')}>
              <plan.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">/{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'} disabled={plan.current} className="w-full">
              {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <h2 className="font-semibold mb-4">Payment History</h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Invoice</span>
          <span>Date</span>
          <span>Plan</span>
          <span className="text-right">Amount</span>
        </div>
        {INVOICES.map((inv, i) => (
          <div key={inv.id} className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-3 items-center', i !== 0 && 'border-t border-border')}>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{inv.id}</span>
            </div>
            <span className="text-sm text-muted-foreground">{inv.date}</span>
            <span className="text-sm text-muted-foreground hidden sm:block">{inv.plan}</span>
            <div className="flex items-center justify-end gap-3">
              <span className="text-sm font-semibold">{inv.amount}</span>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{inv.status}</span>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}