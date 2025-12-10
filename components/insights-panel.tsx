'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Signal, TrackedEntity } from '@/lib/types';
import { TrendingUp, AlertTriangle, Eye, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  entities: TrackedEntity[];
  signals: Signal[];
}

export function InsightsPanel({ entities, signals }: InsightsPanelProps) {
  // Calculate insights
  const recentSignals = signals.filter(
    (s) => Date.now() - s.detectedAt.getTime() < 24 * 60 * 60 * 1000
  );

  const highStealthEntities = entities.filter((e) => e.stealthScore >= 70);
  const stealthFounders = highStealthEntities.filter((e) => e.type === 'founder');

  const signalsByType = signals.reduce((acc, signal) => {
    acc[signal.type] = (acc[signal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSignalType = Object.entries(signalsByType).sort(
    ([, a], [, b]) => b - a
  )[0];

  const insights = [
    {
      icon: TrendingUp,
      title: '24hr Signal Activity',
      description: `${recentSignals.length} new signals detected in the last 24 hours`,
      variant: recentSignals.length > 5 ? 'default' : 'secondary',
    },
    {
      icon: AlertTriangle,
      title: 'High-Priority Targets',
      description: `${stealthFounders.length} founders showing strong stealth indicators`,
      variant: stealthFounders.length > 0 ? 'destructive' : 'secondary',
    },
    {
      icon: Eye,
      title: 'Most Common Signal',
      description: topSignalType
        ? `${topSignalType[0].replace(/_/g, ' ')} (${topSignalType[1]} occurrences)`
        : 'No signals yet',
      variant: 'default',
    },
  ];

  const recommendations = [];

  if (stealthFounders.length > 0) {
    recommendations.push({
      entity: stealthFounders[0].name,
      action: 'Immediate outreach recommended',
      reason: `Stealth score of ${stealthFounders[0].stealthScore} indicates likely startup formation`,
    });
  }

  const negativeEntities = entities.filter((e) => e.momentumScore < -30);
  if (negativeEntities.length > 0) {
    recommendations.push({
      entity: negativeEntities[0].name,
      action: 'Monitor for acquisition or pivot',
      reason: `Negative momentum (${negativeEntities[0].momentumScore}) suggests organizational changes`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              <CardTitle>AI Recommendations</CardTitle>
            </div>
            <CardDescription>
              Actionable insights based on signal patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => (
              <Alert key={index}>
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {rec.entity} • {rec.action}
                    </div>
                    <div className="text-sm text-muted-foreground">{rec.reason}</div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

