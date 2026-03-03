// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";          // <-- добавить
import { getFirestore } from "firebase/firestore"; // <-- добавить
// import { getAnalytics } from "firebase/analytics"; // можно удалить, если не нужна аналитика

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAApLFtDT2C8PtR1swS2ksqVkhXm_9rJXg",
  authDomain: "test-37175.firebaseapp.com",
  projectId: "test-37175",
  storageBucket: "test-37175.firebasestorage.app",
  messagingSenderId: "881513229102",
  appId: "1:881513229102:web:a103fd48dff19a06b9a8bf",
  measurementId: "G-F14VVVFM6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // закомментируй, если analytics не нужна

// Экспортируем нужные сервисы
export const auth = getAuth(app);
export const db = getFirestore(app);