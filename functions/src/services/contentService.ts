import * as admin from 'firebase-admin';

// Types (similar to src/types/* in the main app)
interface Field {
  id?: string;
  name: string;
  description: string;
  type: 'text' | 'boolean' | 'markdown' | 'media';
  required: boolean;
  appId: string;
  useAsTitle: boolean;
  order: number;
}

interface Model {
  id?: string;
  name: string;
  description: string;
  fields?: Field[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentItem {
  id?: string;
  modelId: string;
  data: Record<string, string | boolean | string[] | undefined>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Initialize Firebase Admin (mover aquí)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Collection names
const MODELS_COLLECTION = 'models';
const CONTENT_COLLECTION = 'content';

export async function getModels(): Promise<Model[]> {
  try {
    const querySnapshot = await db
      .collection(MODELS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Model[];
  } catch (error) {
    console.error('Error getting models:', error);
    throw new Error('Failed to retrieve models');
  }
}

export async function getModelById(modelId: string): Promise<Model | null> {
  try {
    const docRef = db.collection(MODELS_COLLECTION).doc(modelId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data()?.createdAt?.toDate(),
      updatedAt: docSnap.data()?.updatedAt?.toDate(),
    } as Model;
  } catch (error) {
    console.error('Error getting model by ID:', error);
    throw new Error('Failed to retrieve model');
  }
}

export async function getContentByModelId(
  modelId: string
): Promise<ContentItem[]> {
  try {
    const querySnapshot = await db
      .collection(CONTENT_COLLECTION)
      .where('modelId', '==', modelId)
      .orderBy('createdAt', 'desc')
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ContentItem[];
  } catch (error) {
    console.error('Error getting content by model ID:', error);
    throw new Error('Failed to retrieve content');
  }
}

export async function getContentItemById(
  contentId: string
): Promise<ContentItem | null> {
  try {
    const docRef = db.collection(CONTENT_COLLECTION).doc(contentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data()?.createdAt?.toDate(),
      updatedAt: docSnap.data()?.updatedAt?.toDate(),
    } as ContentItem;
  } catch (error) {
    console.error('Error getting content item by ID:', error);
    throw new Error('Failed to retrieve content item');
  }
}
