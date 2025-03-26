import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, writeBatch, deleteDoc, onSnapshot, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { toast } from "@/lib/toast";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, db, collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, writeBatch, deleteDoc, onSnapshot, addDoc, Timestamp, serverTimestamp };

// Firebase helper functions
export const createUserDocument = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
      });
      toast.success("Your profile has been created!");
    } catch (error) {
      console.error("Error creating user document:", error);
      toast.error("Could not create your profile");
    }
  }
  
  return userRef;
};
