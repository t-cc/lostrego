import type { Site } from '@/types/site';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

/**
 * Get all accessible sites for a user from siteUser collection
 * @param userEmail User's email (document ID in user collection)
 * @returns Array of sites accessible by the user
 */
export async function getUserSites(userEmail: string): Promise<Site[]> {
  try {
    // Query siteUser collection for sites accessible by the user
    // Create the user document reference and query by reference
    const userRef = doc(db, 'user', userEmail);
    const siteUserQuery = query(
      collection(db, 'siteUser'),
      where('user', '==', userRef)
    );

    const siteUserSnapshot = await getDocs(siteUserQuery);

    if (siteUserSnapshot.empty) {
      return [];
    }

    // Get unique site reference objects and extract IDs
    const siteRefs = [
      ...new Set(siteUserSnapshot.docs.map((doc) => doc.data().site)),
    ];

    // Extract site IDs from DocumentReference objects
    const siteIds = siteRefs
      .map((ref) => {
        // If it's a DocumentReference object, get its id
        if (ref && typeof ref === 'object' && 'id' in ref) {
          return ref.id;
        }
        // If it's a string path like '/site/ID', extract the ID
        if (typeof ref === 'string' && ref.startsWith('/site/')) {
          return ref.replace('/site/', '');
        }
        // If it's already an ID string, use as is
        if (typeof ref === 'string') {
          return ref;
        }
        return null;
      })
      .filter((id): id is string => Boolean(id));

    // Fetch site details for each site ID
    const sites: Site[] = [];
    for (const siteId of siteIds) {
      const siteDoc = await getDoc(doc(db, 'site', siteId));
      if (siteDoc.exists()) {
        const siteData = siteDoc.data();
        sites.push({
          id: siteDoc.id,
          name: siteData.name,
          logo: siteData.logo,
          appId: siteData.appId,
        });
      }
    }

    // Sort sites by name
    return sites.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching user sites:', error);
    throw new Error('Failed to fetch user sites');
  }
}

/**
 * Get a specific site by ID
 * @param siteId Site document ID
 * @returns Site data or null if not found
 */
export async function getSiteById(siteId: string): Promise<Site | null> {
  try {
    const siteDoc = await getDoc(doc(db, 'site', siteId));

    if (!siteDoc.exists()) {
      return null;
    }

    const siteData = siteDoc.data();
    return {
      id: siteDoc.id,
      name: siteData.name,
      logo: siteData.logo,
    };
  } catch (error) {
    console.error('Error fetching site:', error);
    throw new Error('Failed to fetch site');
  }
}
