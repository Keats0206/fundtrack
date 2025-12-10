'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { getSignalIcon, getSeverityColor } from '@/lib/mock-data';

interface AlertFeedProps {
  alerts: Alert[];
}

export function AlertFeed({ alerts }: AlertFeedProps) {
  const sortedAlerts = [...alerts].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-4">
      {sortedAlerts.map((alert) => (
        <Card key={alert.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>{alert.entityName}</span>
                  <Badge variant="outline" className="font-normal">
                    Priority: {alert.priority}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {alert.summary}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alert.signals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="text-2xl mt-0.5">{getSignalIcon(signal.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{signal.title}</span>
                      <Badge variant={getSeverityColor(signal.severity) as any}>
                        {signal.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {signal.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {signal.description}
                    </p>
                    {signal.previousValue && signal.currentValue && (
                      <div className="mt-2 text-xs">
                        <span className="line-through text-muted-foreground">
                          {signal.previousValue}
                        </span>
                        {' → '}
                        <span className="font-medium">{signal.currentValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

