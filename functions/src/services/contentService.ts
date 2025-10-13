import * as admin from 'firebase-admin';

// Types (similar to src/types/* in the main app)
interface Field {
  id?: string;
  name: string;
  description: string;
  type: 'text' | 'boolean' | 'markdown' | 'media' | 'datetime';
  required: boolean;
  appId: string;
  useAsTitle: boolean;
  order: number;
}

interface Model {
  id?: string;
  name: string;
  description: string;
  appId?: string;
  site?: FirebaseFirestore.DocumentReference;
  fields?: Field[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContentItem {
  id?: string;
  modelId: string;
  site?: FirebaseFirestore.DocumentReference;
  data: Record<string, string | boolean | string[] | undefined>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Firebase Admin will automatically use GOOGLE_APPLICATION_CREDENTIALS env var if set
  // or use default credentials in production
  admin.initializeApp();
  console.log('Firebase Admin initialized');
}

const db = admin.firestore();

// Collection names
const MODELS_COLLECTION = 'models';
const CONTENT_COLLECTION = 'content';
const SITES_COLLECTION = 'site';

// Helper function to get site reference by appId
async function getSiteReference(
  siteAppId: string
): Promise<FirebaseFirestore.DocumentReference> {
  const siteQuery = await db
    .collection(SITES_COLLECTION)
    .where('appId', '==', siteAppId)
    .limit(1)
    .get();
  if (siteQuery.empty) {
    throw new Error(`Site with appId '${siteAppId}' not found`);
  }

  return siteQuery.docs[0].ref;
}

export async function getModels(siteAppId: string): Promise<Model[]> {
  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection(MODELS_COLLECTION);

    const siteRef = await getSiteReference(siteAppId);
    query = query.where('site', '==', siteRef);

    const querySnapshot = await query.orderBy('createdAt', 'desc').get();

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

export async function getModelByAppId(
  modelAppId: string,
  siteAppId: string
): Promise<Model | null> {
  try {
    const siteRef = await getSiteReference(siteAppId);

    const query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db
      .collection(MODELS_COLLECTION)
      .where('appId', '==', modelAppId)
      .where('site', '==', siteRef);

    const querySnapshot = await query.limit(1).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];

    const model = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Model;

    return model;
  } catch (error) {
    console.error('Error getting model by appId:', error);
    throw new Error('Failed to retrieve model by appId');
  }
}

export async function getContentByModelId(
  modelRef: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: ContentItem[]; hasNext: boolean }> {
  try {
    const baseQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db
        .collection(CONTENT_COLLECTION)
        .where('modelId', '==', modelRef)
        .orderBy('createdAt', 'desc');

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0
        ? Math.min(Math.floor(pageSize), 100)
        : 20;
    const offset = (safePage - 1) * safePageSize;

    const querySnapshot = await baseQuery
      .offset(offset)
      .limit(safePageSize + 1)
      .get();

    const docs = querySnapshot.docs;
    const hasNext = docs.length > safePageSize;
    const pageDocs = hasNext ? docs.slice(0, safePageSize) : docs;

    const items = pageDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ContentItem[];

    return { items, hasNext };
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
