export type EntityType = 'founder' | 'company';

export type SignalType = 
  | 'title_change'
  | 'stealth_mode'
  | 'job_removal'
  | 'hiring_freeze'
  | 'team_departure'
  | 'open_to_work'
  | 'profile_private'
  | 'new_connection_spike'
  | 'post_deletion'
  | 'location_change';

export type SignalSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface TrackedEntity {
  id: string;
  type: EntityType;
  name: string;
  linkedinUrl: string;
  currentTitle?: string;
  company?: string;
  avatarUrl?: string;
  trackingSince: Date;
  lastChecked: Date;
  stealthScore: number; // 0-100
  momentumScore: number; // -100 to 100
}

export interface Signal {
  id: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  type: SignalType;
  severity: SignalSeverity;
  title: string;
  description: string;
  detectedAt: Date;
  previousValue?: string;
  currentValue?: string;
  confidence: number; // 0-100
  isRead: boolean;
}

export interface Alert {
  id: string;
  entityId: string;
  entityName: string;
  signals: Signal[];
  createdAt: Date;
  priority: number; // 0-100
  summary: string;
}

