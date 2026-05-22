import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCQB6wl39JOQRnTcS2sBaQ9ReOLHEw8Rec",
  authDomain: "roomsync-b10a6.firebaseapp.com",
  projectId: "roomsync-b10a6",
  storageBucket: "roomsync-b10a6.firebasestorage.app",
  messagingSenderId: "772591208003",
  appId: "1:772591208003:web:bd2e1abb8f54aec03676f6"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()