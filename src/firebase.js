import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});
export const db = getFirestore(app);

// Firebase Cloud Messaging setup
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  // FCM not supported in this browser
}
export { messaging };

// Save the user's FCM token to Firestore so Cloud Functions can send them push notifications
export async function saveFcmToken(user) {
  if (!messaging || !user) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // Get the FCM token — uses the firebase-messaging-sw.js service worker
    const token = await getToken(messaging, {
      vapidKey: window.__REKINDLE_VAPID_KEY__ || ""
    });
    if (!token) return;

    // Save token to Firestore under fcmTokens collection
    const tokenDocId = `${user.uid}_${token.slice(-8)}`;
    await setDoc(doc(db, "fcmTokens", tokenDocId), {
      uid: user.uid,
      token: token,
      name: user.displayName || user.email || "",
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    // Silently fail — FCM is a nice-to-have, app works without it
    console.log("FCM token save skipped:", e.message);
  }
}

// Handle foreground messages (when app is open)
export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
