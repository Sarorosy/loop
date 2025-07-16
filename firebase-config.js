// src/firebase-config.js

import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';


const firebaseConfig = {
  apiKey: "AIzaSyDUY9r6GGobs7j3GsZCYcdGuO5oASXlNIw",
  authDomain: "loop-panel.firebaseapp.com",
  projectId: "loop-panel",
  storageBucket: "loop-panel.firebasestorage.app",
  messagingSenderId: "475433001458",
  appId: "1:475433001458:web:f1a123f3d932fedf690b6b",
  measurementId: "G-L39TK519NR"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

