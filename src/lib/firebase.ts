// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'studio-6932348480-db54c',
  appId: '1:319348302499:web:357944862e069b04661516',
  apiKey: 'AIzaSyDgyDh1iRJ_-ofN_ChzPVXZjxSjqB-zYtM',
  authDomain: 'studio-6932348480-db54c.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '319348302499',
  storageBucket: 'studio-6932348480-db54c.appspot.com',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
