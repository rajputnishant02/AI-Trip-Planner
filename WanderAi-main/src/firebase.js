import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBADnIBVdQTynn3UFQOF-gIwfEXoD7o_Bo",
  authDomain: "wanderai-ae65d.firebaseapp.com",
  projectId: "wanderai-ae65d",
  storageBucket: "wanderai-ae65d.firebasestorage.app",
  messagingSenderId: "132478512464",
  appId: "1:132478512464:web:c86e255c116cf6e17bd055",
  measurementId: "G-ZNPC7DN734"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;