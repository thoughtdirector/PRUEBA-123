import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyA5uzg6JvTh-7n_PONh9vkegSrT60G3tjM",
    authDomain: "casaenelarbol-mvp-abril-2025.firebaseapp.com",
    databaseURL: "https://casaenelarbol-mvp-abril-2025-default-rtdb.firebaseio.com",
    projectId: "casaenelarbol-mvp-abril-2025",
    storageBucket: "casaenelarbol-mvp-abril-2025.firebaseapp.com",
    messagingSenderId: "804034573087",
    appId: "1:804034573087:web:63dde783dfa6e154a5362a"
};

console.log("Inicializando Firebase con config:", firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("Firebase Realtime Database inicializado");

export { app, db };