'use client';

/**
 * Editable config row. Holds only local draft/dirty UI state; the save is
 * delegated to the parent.
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import type { SystemConfig } from '../types';

export interface ConfigCardProps {
  config: SystemConfig;
  isUpdating: boolean;
  onSave: (key: string, value: string) => void;
}

export function ConfigCard({ config, isUpdating, onSave }: ConfigCardProps) {
  const [value, setValue] = useState(config.value);
  const isDirty = value !== config.value;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{config.key}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor={config.key}>Value</Label>
            <Input id={config.key} value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <Button onClick={() => onSave(config.key, value)} disabled={!isDirty || isUpdating}>
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
