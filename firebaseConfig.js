import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Removed persistence for web compatibility
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCH7xMJcSiGnYJvMpWQXvG710L_9YIJCLs",
  authDomain: "greentrack-1a4f0.firebaseapp.com",
  projectId: "greentrack-1a4f0",
  storageBucket: "greentrack-1a4f0.firebasestorage.app",
  messagingSenderId: "60193107379",
  appId: "1:60193107379:web:6f1f8c1709e0706bd32fc6"
};

const app = initializeApp(firebaseConfig);

// Simple auth without persistence (works on web)
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;