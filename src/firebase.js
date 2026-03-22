import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-9l__I_L_NnqDSS-w7AFbw-Ir328Qdz4",
  authDomain: "rekindlestudents-72055.firebaseapp.com",
  projectId: "rekindlestudents-72055",
  storageBucket: "rekindlestudents-72055.firebasestorage.app",
  messagingSenderId: "40182856629",
  appId: "1:40182856629:web:6f2a0cff3958dd966d37fc",
  measurementId: "G-KHWNY39BYQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
