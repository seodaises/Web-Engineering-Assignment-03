// Firebase configuration for RoomSync Profiles
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Paste YOUR config object from Firebase console here
const firebaseConfig = {
  apiKey: "AIzaSyCQB6wl39JOQRnTcS2sBaQ9ReOLHEw8Rec",
  authDomain: "roomsync-b10a6.firebaseapp.com",
  projectId: "roomsync-b10a6",
  storageBucket: "roomsync-b10a6.firebasestorage.app",
  messagingSenderId: "772591208003",
  appId: "1:772591208003:web:bd2e1abb8f54aec03676f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore and export it for use in components
export const db = getFirestore(app)