'use client';

/**
 * System configuration screen: configs grouped into tabs by category.
 */
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { extractErrorMessage } from '@/lib/api-error';
import { ConfigCard } from './ConfigCard';
import { useGroupedConfigs, useUpdateConfig } from '../hooks/useConfig';

export function ConfigManager() {
  const { grouped, categories, isLoading } = useGroupedConfigs();
  const updateConfig = useUpdateConfig();

  const handleSave = (key: string, value: string) => {
    updateConfig.mutate(
      { key, value },
      {
        onSuccess: () => toast.success('Configuration updated successfully'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update configuration')),
      }
    );
  };

  if (isLoading) return <div>Loading configuration...</div>;

  const hasCategories = categories.length > 0;
  const tabs = hasCategories ? categories : ['general'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground">Manage global system settings and parameters.</p>
        </div>
      </div>

      <Tabs defaultValue={tabs[0]}>
        <TabsList className="mb-4">
          {tabs.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {hasCategories ? (
          categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-6">
                {grouped[category].map((config) => (
                  <ConfigCard
                    key={config.key}
                    config={config}
                    onSave={handleSave}
                    isUpdating={updateConfig.isPending}
                  />
                ))}
              </div>
            </TabsContent>
          ))
        ) : (
          <TabsContent value="general">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No configurations found. Initialize the system to see settings here.
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
