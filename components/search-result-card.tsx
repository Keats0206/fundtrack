'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchProfile } from '@/lib/mock-search-data';
import { Plus, Check, ExternalLink, MapPin, Users, Clock } from 'lucide-react';

interface SearchResultCardProps {
  profile: SearchProfile;
  onAddToTracker: (profile: SearchProfile) => void;
}

export function SearchResultCard({ profile, onAddToTracker }: SearchResultCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  {profile.isTracked && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Tracked
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {profile.title}
                </p>
                <p className="text-sm text-muted-foreground">{profile.company}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAddToTracker(profile)}
                  disabled={profile.isTracked}
                  className="gap-2"
                >
                  {profile.isTracked ? (
                    <>
                      <Check className="h-4 w-4" />
                      Tracked
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add to Tracker
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {profile.connections.toLocaleString()} connections
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {profile.yearsAtCompany} years at company
              </div>
            </div>

            {profile.recentActivity.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Recent Activity:
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.recentActivity.map((activity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

