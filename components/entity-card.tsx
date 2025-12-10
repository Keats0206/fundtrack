'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrackedEntity } from '@/lib/types';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EntityCardProps {
  entity: TrackedEntity;
}

export function EntityCard({ entity }: EntityCardProps) {
  const getStealthColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getMomentumIcon = (score: number) => {
    if (score > 30) return <TrendingUp className="h-4 w-4" />;
    if (score < -30) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getMomentumColor = (score: number) => {
    if (score > 30) return 'text-green-600';
    if (score < -30) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entity.avatarUrl} alt={entity.name} />
            <AvatarFallback>{entity.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{entity.name}</h3>
              <Badge variant="outline" className="capitalize">
                {entity.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {entity.currentTitle || 'No title'}
            </p>
            {entity.company && (
              <p className="text-xs text-muted-foreground truncate">
                {entity.company}
              </p>
            )}
          </div>
          <a
            href={entity.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-lg p-3 ${getStealthColor(entity.stealthScore)}`}>
            <div className="text-xs font-medium mb-1">Stealth Score</div>
            <div className="text-2xl font-bold">{entity.stealthScore}</div>
          </div>
          <div className="rounded-lg p-3 bg-muted">
            <div className="text-xs font-medium mb-1">Momentum</div>
            <div className={`text-2xl font-bold flex items-center gap-1 ${getMomentumColor(entity.momentumScore)}`}>
              {getMomentumIcon(entity.momentumScore)}
              {entity.momentumScore > 0 ? '+' : ''}{entity.momentumScore}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

