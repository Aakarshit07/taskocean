import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, writeBatch, deleteDoc, onSnapshot, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { toast } from "@/lib/toast";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAj-PUUbh69eW3MVc1B3zLGQh_pOmJxE6M",
  authDomain: "taskmanager-lovable.firebaseapp.com",
  projectId: "taskmanager-lovable",
  storageBucket: "taskmanager-lovable.appspot.com",
  messagingSenderId: "517773188119",
  appId: "1:517773188119:web:e7db74f5ccff2af9f5fa21"
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
