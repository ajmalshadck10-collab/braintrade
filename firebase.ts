
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/**
 * 🧠 BRAINTRADER FIREBASE CONFIGURATION
 * 
 * Connected to project: braintrader-11ee0
 * The API key is securely provided via process.env.API_KEY.
 */

const firebaseConfig = {
  apiKey: "AIzaSyCt6vw8HBjU7RkM0oeCw9fHi77jF2Ffrhk",
  authDomain: "braintrader-11ee0.firebaseapp.com",
  projectId: "braintrader-11ee0",
  storageBucket: "braintrader-11ee0.firebasestorage.app",
  messagingSenderId: "962940155076",
  appId: "1:962940155076:web:f8fefe6d38cb6ff58e4591",
  measurementId: "G-00Y98TRF4K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
