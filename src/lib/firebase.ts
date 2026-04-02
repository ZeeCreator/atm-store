// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAscBD3Q9Xg0dvECQlzD6G1murSz_aGA1w",
  authDomain: "enterprise-atmstore.firebaseapp.com",
  databaseURL: "https://enterprise-atmstore-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "enterprise-atmstore",
  storageBucket: "enterprise-atmstore.firebasestorage.app",
  messagingSenderId: "359527156801",
  appId: "1:359527156801:web:79f521d4e5497f4a2e0ac0"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, storage };
