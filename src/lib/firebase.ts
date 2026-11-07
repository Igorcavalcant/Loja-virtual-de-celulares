import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  type Auth
} from "firebase/auth";
// 1. IMPORTANTE: Adicionamos as importações do Firestore e Storage aqui
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const googleProvider = new GoogleAuthProvider();

// Inicializa o app globalmente para podermos usar no Auth, DB e Storage
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export function getFirebaseAuth(): Auth | null {
  if (!hasFirebaseConfig) {
    return null;
  }
  return getAuth(app);
}

// 2. IMPORTANTE: Exportamos o 'db' e o 'storage' usando o mesmo 'app' inicializado
export const db = getFirestore(app);
export const storage = getStorage(app);