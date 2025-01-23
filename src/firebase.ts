import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDWexKhjjq8ykmadMlJnUKI4UyahSzFRqA",
  authDomain: "drugs-jam.firebaseapp.com",
  projectId: "drugs-jam",
  storageBucket: "drugs-jam.firebasestorage.app",
  messagingSenderId: "643202010921",
  appId: "1:643202010921:web:1fe44a83886daac159f138",
  measurementId: "G-1P1J1C343K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configure Firestore
const initializeFirestore = async () => {
  try {
    // Désactiver la persistance pour le moment pour éviter les erreurs de précondition
    // await enableIndexedDbPersistence(db, {
    //   cacheSizeBytes: CACHE_SIZE_UNLIMITED
    // });
    console.log('Firestore initialized');
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence available in one tab only');
    } else if (err.code === 'unimplemented') {
      console.log('Persistence not supported by browser');
    }
  }
};

initializeFirestore();