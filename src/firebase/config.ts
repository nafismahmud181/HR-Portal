import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your Firebase configuration object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your_api_key_here',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your_project_id.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your_project_id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your_project_id.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your_messaging_sender_id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your_app_id'
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create a mock auth object for development
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: async () => { throw new Error('Firebase not configured'); },
    createUserWithEmailAndPassword: async () => { throw new Error('Firebase not configured'); },
    signOut: async () => { throw new Error('Firebase not configured'); },
    sendPasswordResetEmail: async () => { throw new Error('Firebase not configured'); },
    updateProfile: async () => { throw new Error('Firebase not configured'); }
  } as unknown as Auth;
  
  // Create a mock firestore object for development
  firestore = {} as unknown as Firestore;
}

export { auth, firestore, storage };
export default app;
