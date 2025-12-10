'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackedEntity } from '@/lib/types';

interface StealthScoreChartProps {
  entities: TrackedEntity[];
}

export function StealthScoreChart({ entities }: StealthScoreChartProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Alert';
    if (score >= 40) return 'Moderate';
    return 'Low Risk';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const sortedEntities = [...entities].sort((a, b) => b.stealthScore - a.stealthScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stealth Score Distribution</CardTitle>
        <CardDescription>
          Ranked by likelihood of stealth startup formation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEntities.map((entity) => (
          <div key={entity.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{entity.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {getScoreLabel(entity.stealthScore)}
                </span>
                <span className="font-bold">{entity.stealthScore}</span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getScoreColor(entity.stealthScore)} transition-all`}
                style={{ width: `${entity.stealthScore}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

