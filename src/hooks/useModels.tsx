import { useCallback, useEffect, useState } from 'react';

import { useSite } from '@/context/SiteContext';
import { modelService } from '@/lib/models';
import type { Model } from '@/types/model';

export function useModels() {
  const { currentSite } = useSite();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!currentSite?.id) {
      setModels([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const modelsData = await modelService.getBySite(currentSite.id);
      setModels(modelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  }, [currentSite?.id]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    refetch: fetchModels,
  };
}
