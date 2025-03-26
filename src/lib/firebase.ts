import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, writeBatch, deleteDoc, onSnapshot, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { toast } from "@/lib/toast";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjIhtPiS3rlrVGKKQB8IfgYcgQEI2YFCo",
  authDomain: "taskocean-4b985.firebaseapp.com",
  projectId: "taskocean-4b985",
  storageBucket: "taskocean-4b985.firebasestorage.app",
  messagingSenderId: "1069302825598",
  appId: "1:1069302825598:web:bb91c64a65c23797808e2f",
  measurementId: "GG-GGGXGD3GZD"
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
