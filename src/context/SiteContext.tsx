import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getUserSites } from '@/lib/siteService';
import type { Site } from '@/types/site';

interface SiteContextType {
  sites: Site[];
  currentSite: Site | null;
  setCurrentSite: (site: Site | null) => void;
  loading: boolean;
  error: string | null;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved site from localStorage
  useEffect(() => {
    const savedSiteId = localStorage.getItem('currentSite');
    if (savedSiteId && !currentSite) {
      // We'll set it after loading sites
      console.log('Saved site ID:', savedSiteId);
    }
  }, []);

  const handleSetCurrentSite = (site: Site | null) => {
    setCurrentSite(site);
    if (site?.id) {
      localStorage.setItem('currentSite', site.id);
    } else {
      localStorage.removeItem('currentSite');
    }
  };

  useEffect(() => {
    const loadSites = async () => {
      if (!user?.email) {
        setSites([]);
        setCurrentSite(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const userSites = await getUserSites(user.email);

        setSites(userSites);

        // Try to restore saved site first, otherwise set the first site
        const savedSiteId = localStorage.getItem('currentSite');
        if (savedSiteId && userSites.length > 0) {
          const savedSite = userSites.find((site) => site.id === savedSiteId);
          if (savedSite) {
            setCurrentSite(savedSite);
            return;
          }
        }

        // Set the first site as current if available
        if (userSites.length > 0) {
          setCurrentSite(userSites[0]);
        } else {
          setCurrentSite(null);
        }
      } catch (err) {
        console.error('Error loading sites:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sites');
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, [user?.email]);

  return (
    <SiteContext.Provider
      value={{
        sites,
        currentSite,
        setCurrentSite: handleSetCurrentSite,
        loading,
        error,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
