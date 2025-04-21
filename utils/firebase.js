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
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');

// Optional: Use local emulator if needed
// import { connectFunctionsEmulator } from 'firebase/functions';
// if (process.env.NODE_ENV === 'development') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export { app, auth, functions };

