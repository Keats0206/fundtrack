'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Plus, Zap, ExternalLink } from 'lucide-react';

export default function AdminPage() {
  const [fundName, setFundName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateAccessCode = () => {
    const code = fundName.toLowerCase().replace(/[^a-z0-9]/g, '');
    setAccessCode(code || 'newvc');
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/login`;
    const message = `Access your portfolio intelligence dashboard:\n\n🔗 ${url}\n🔑 Access Code: ${accessCode}\n\nPowered by MANTIS Portfolio Intelligence`;
    
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const configSnippet = `// Add to app/api/auth/login/route.ts
'${accessCode}': {
  id: '${accessCode}',
  name: '${fundName}',
  companies: ['all'], // or ['company-id-1', 'company-id-2']
},`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black tracking-tighter mantis-gradient-text">
                FUNDTRACK
              </div>
              <Badge variant="outline" className="font-semibold">Admin</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="h-1 mantis-gradient" />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Fund Manager</h1>
          <p className="text-muted-foreground">Create custom instances for different VCs and investors</p>
        </div>

        <div className="space-y-6">
          {/* Quick Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Setup: New Fund
              </CardTitle>
              <CardDescription>
                Generate access credentials for a new investor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fund Name</Label>
                  <Input
                    placeholder="e.g., Acme Ventures"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Access Code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., acme"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={generateAccessCode}>
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              {accessCode && fundName && (
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Step 1: Add this to <code className="text-xs">app/api/auth/login/route.ts</code> in the FUNDS object:
                    </Label>
                    <Textarea
                      value={configSnippet}
                      readOnly
                      className="font-mono text-xs h-24"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyShareLink} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy Share Message'}
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/login', '_blank')}>
                      Test Login
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Funds */}
          <Card>
            <CardHeader>
              <CardTitle>Active Funds</CardTitle>
              <CardDescription>Currently configured investor access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">Mantis VC</div>
                    <div className="text-xs text-muted-foreground">Access all companies</div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    mantis
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">Demo Fund</div>
                    <div className="text-xs text-muted-foreground">Access all companies</div>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                    demo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Customize company access and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Per-Fund Company Access</Label>
                <p className="text-xs text-muted-foreground">
                  By default, funds see all companies. To restrict access, replace <code>companies: ['all']</code> with specific IDs:
                </p>
                <Textarea
                  readOnly
                  value={`companies: ['company-id-1', 'company-id-2', 'company-id-3']`}
                  className="font-mono text-xs h-16"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Custom Branding (Coming Soon)</Label>
                <p className="text-xs text-muted-foreground">
                  • Custom logo per fund<br />
                  • Branded email templates<br />
                  • Custom domain mapping
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Deploy */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Quick Deploy Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>1. Add new fund:</strong> Copy config snippet above to <code>app/api/auth/login/route.ts</code>
              </div>
              <div>
                <strong>2. Share access:</strong> Send them the login URL + access code
              </div>
              <div>
                <strong>3. They're live!</strong> They can log in and see their portfolio
              </div>
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Pro tip:</strong> Each fund is isolated - they only see their companies. Perfect for demos and pitches!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

