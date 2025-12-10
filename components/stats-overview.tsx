'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackedEntity, Signal } from '@/lib/types';
import { Activity, AlertCircle, Eye, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  entities: TrackedEntity[];
  signals: Signal[];
}

export function StatsOverview({ entities, signals }: StatsOverviewProps) {
  const unreadSignals = signals.filter(s => !s.isRead).length;
  const criticalSignals = signals.filter(s => s.severity === 'critical').length;
  const highStealthEntities = entities.filter(e => e.stealthScore >= 70).length;
  const avgStealthScore = Math.round(
    entities.reduce((sum, e) => sum + e.stealthScore, 0) / entities.length
  );

  const stats = [
    {
      title: 'Tracked Entities',
      value: entities.length,
      icon: Eye,
      description: `${entities.filter(e => e.type === 'founder').length} founders, ${entities.filter(e => e.type === 'company').length} companies`,
    },
    {
      title: 'Active Signals',
      value: unreadSignals,
      icon: Activity,
      description: `${criticalSignals} critical alerts`,
      highlight: unreadSignals > 0,
    },
    {
      title: 'High Stealth Activity',
      value: highStealthEntities,
      icon: AlertCircle,
      description: 'Entities with 70+ stealth score',
      highlight: highStealthEntities > 0,
    },
    {
      title: 'Avg Stealth Score',
      value: avgStealthScore,
      icon: TrendingUp,
      description: 'Across all tracked entities',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={stat.highlight ? 'border-orange-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

