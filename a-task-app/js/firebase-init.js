// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIuRj51fQUCNREMT3JEZAyWjl7TsBU_08",
    authDomain: "my-task-manager-c8e32.firebaseapp.com",
    projectId: "my-task-manager-c8e32",
    storageBucket: "my-task-manager-c8e32.firebasestorage.app",
    messagingSenderId: "182865686068",
    appId: "1:182865686068:web:ef8716eb8edcc7749c6461"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;