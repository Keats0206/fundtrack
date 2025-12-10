'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Signal } from '@/lib/types';
import { getSignalIcon, getSeverityColor } from '@/lib/mock-data';
import { formatDistanceToNow, format } from 'date-fns';

interface SignalTimelineProps {
  entityId: string;
  entityName: string;
  signals: Signal[];
}

export function SignalTimeline({ entityName, signals }: SignalTimelineProps) {
  const sortedSignals = [...signals].sort(
    (a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Timeline for {entityName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border" />

          {sortedSignals.map((signal, index) => (
            <div key={signal.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-primary text-2xl">
                {getSignalIcon(signal.type)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{signal.title}</span>
                      <Badge variant={getSeverityColor(signal.severity) as any}>
                        {signal.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {signal.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                    <div>{format(signal.detectedAt, 'MMM d, yyyy')}</div>
                    <div>{formatDistanceToNow(signal.detectedAt, { addSuffix: true })}</div>
                  </div>
                </div>

                {signal.previousValue && signal.currentValue && (
                  <div className="text-xs p-2 rounded bg-muted">
                    <span className="line-through text-muted-foreground">
                      {signal.previousValue}
                    </span>
                    {' → '}
                    <span className="font-medium">{signal.currentValue}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Confidence: {signal.confidence}%
                  </span>
                  {!signal.isRead && (
                    <Badge variant="outline" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sortedSignals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No signals detected yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

