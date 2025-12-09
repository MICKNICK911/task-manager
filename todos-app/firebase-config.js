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
window.database = database;