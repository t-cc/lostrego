import type { ContentItem } from '@/types/content';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

const COLLECTION_NAME = 'content';

export const contentService = {
  async getAll(): Promise<ContentItem[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ContentItem[];
    } catch (error) {
      console.error('Error getting content:', error);
      throw error;
    }
  },

  async getByModelId(modelId: string): Promise<ContentItem[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('modelId', '==', modelId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ContentItem[];
    } catch (error) {
      console.error('Error getting content by model id:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ContentItem | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as ContentItem;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting content:', error);
      throw error;
    }
  },

  async create(content: Omit<ContentItem, 'id'>): Promise<ContentItem> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...content,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

      return {
        id: docRef.id,
        ...content,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<ContentItem>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },
};
