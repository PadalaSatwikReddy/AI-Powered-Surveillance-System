// js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCj3uj7IXueFFiT6ibBC84giTz8D64IE2w",
  authDomain: "poweredsurveillance2.firebaseapp.com",
  projectId: "poweredsurveillance2",
  storageBucket: "poweredsurveillance2.firebasestorage.app",
  messagingSenderId: "1086799617002",
  appId: "1:1086799617002:web:8bb7adb04aee2cc52df093",
  measurementId: "G-LCWJB0QDW9"
};

// Initialize Firebase using compat scripts
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
