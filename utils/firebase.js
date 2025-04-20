import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyC7QddNF9aW_ftUK8HNfO_Q6kP5BYqYA8c",
  authDomain: "health-metric-manager.firebaseapp.com",
  projectId: "health-metric-manager",
  storageBucket: "health-metric-manager.firebasestorage.app",
  messagingSenderId: "66432197845",
  appId: "1:66432197845:web:298aa6e8a53b6036fc6e5c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const functions = getFunctions(app);
