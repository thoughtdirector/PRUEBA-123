import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyA5uzg6JvTh-7n_PONh9vkegSrT60G3tjM",
    authDomain: "casaenelarbol-mvp-abril-2025.firebaseapp.com",
    databaseURL: "https://casaenelarbol-mvp-abril-2025-default-rtdb.firebaseio.com",
    projectId: "casaenelarbol-mvp-abril-2025",
    storageBucket: "casaenelarbol-mvp-abril-2025.firebasestorage.app",
    messagingSenderId: "804034573087",
    appId: "1:804034573087:web:63dde783dfa6e154a5362a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };