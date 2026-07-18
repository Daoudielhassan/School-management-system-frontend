'use client';

/**
 * System configuration screen: configs grouped into tabs by category.
 */
import { toast } from 'react-toastify';
import { SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
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
        onSuccess: () => toast.success('Configuration mise à jour'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update configuration')),
      }
    );
  };

  const hasCategories = categories.length > 0;
  const tabs = hasCategories ? categories : ['general'];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SlidersHorizontal}
        title="Configuration"
        description="Gérez les paramètres globaux du système"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-100 h-24" />
          ))}
        </div>
      ) : (
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
                Aucune configuration trouvée. Initialisez le système pour voir les paramètres ici.
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      )}
    </div>
  );
}
