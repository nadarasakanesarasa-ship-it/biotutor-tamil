
import { initializeApp, getApps, getApp } from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';

import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-south1');

export const googleProvider = new GoogleAuthProvider();

// Bootstrap admin configuration
export const BOOTSTRAP_ADMIN_EMAIL =
  'nadarasakanesarasa@gmail.com';

// Operation types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Firestore error information
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;

  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;

    providerInfo?: {
      providerId?: string;
      email?: string | null;
    }[];
  };
}

// Firestore error handler
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error
      ? error.message
      : String(error),

    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,

      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },

    operationType,
    path,
  };

  console.error(
    'Firestore Error:',
    JSON.stringify(errInfo)
  );

  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore connection
async function testConnection() {
  try {
    await getDocFromServer(
      doc(db, 'test', 'connection')
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.warn(
        'Please check your Firebase configuration or internet connection.'
      );
    }
  }
}

testConnection();

console.log(
  'BioTutor Tamil: Connected to Firebase Production Services'
);
