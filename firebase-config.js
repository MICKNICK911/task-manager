// Firebase configuration - Replace with your actual config from Firebase Console
const firebaseConfig = {
 apiKey: "AIzaSyBIuRj51fQUCNREMT3JEZAyWjl7TsBU_08",
 authDomain: "my-task-manager-c8e32.firebaseapp.com",
 databaseURL: "https://my-task-manager-c8e32-default-rtdb.firebaseio.com",
 projectId: "my-task-manager-c8e32",
 storageBucket: "my-task-manager-c8e32.firebasestorage.app",
 messagingSenderId: "182865686068",
 appId: "1:182865686068:web:ef8716eb8edcc7749c6461"
};


// Get config from environment variables or use development config
/*const firebaseConfig = window.location.hostname === 'localhost' 
    ? {
        // Development config
        apiKey: "DEV_API_KEY",
        authDomain: "dev-project.firebaseapp.com",
        databaseURL: "https://dev-project.firebaseio.com",
        projectId: "dev-project",
        storageBucket: "dev-project.appspot.com",
        messagingSenderId: "DEV_SENDER_ID",
        appId: "DEV_APP_ID"
    }
    : {
        // Production config - will be set via Netlify environment variables
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };*/


// Initialize Firebase
/*firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();*/

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();          // Authentication service
const database = firebase.database();  // Realtime Database service

// Make services available globally
window.auth = auth;
window.db = database;