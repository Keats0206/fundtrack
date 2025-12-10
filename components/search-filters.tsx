'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { companies, roleTypes } from '@/lib/mock-search-data';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  onCompanyChange: (company: string) => void;
  onRoleChange: (role: string) => void;
  onLocationChange: (location: string) => void;
  onShowOnlyUntrackedChange: (checked: boolean) => void;
}

export function SearchFilters({
  onCompanyChange,
  onRoleChange,
  onLocationChange,
  onShowOnlyUntrackedChange,
}: SearchFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select onValueChange={onCompanyChange}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company.toLowerCase()}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role Type</Label>
              <Select onValueChange={onRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map((role) => (
                    <SelectItem key={role} value={role.toLowerCase()}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., San Francisco"
                  className="pl-10"
                  onChange={(e) => onLocationChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="untracked"
                  onCheckedChange={onShowOnlyUntrackedChange}
                />
                <Label
                  htmlFor="untracked"
                  className="text-sm font-normal cursor-pointer"
                >
                  Only show untracked
                </Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

