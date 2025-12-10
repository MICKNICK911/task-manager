// Firebase Configuration and Initialization
const FirebaseConfig = {
    firebaseConfig: {
        apiKey: "AIzaSyBIuRj51fQUCNREMT3JEZAyWjl7TsBU_08",
        authDomain: "my-task-manager-c8e32.firebaseapp.com",
        projectId: "my-task-manager-c8e32",
        storageBucket: "my-task-manager-c8e32.firebasestorage.app",
        messagingSenderId: "182865686068",
        appId: "1:182865686068:web:ef8716eb8edcc7749c6461"
    },

    initialize() {
        try {
            firebase.initializeApp(this.firebaseConfig);
            return {
                auth: firebase.auth(),
                db: firebase.firestore(),
                firestore: firebase.firestore
            };
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return null;
        }
    },

    getFirestoreFieldValue() {
        return firebase.firestore.FieldValue;
    }
};