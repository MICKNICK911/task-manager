// ===== Firebase Configuration =====
// IMPORTANT: Replace these values with your Firebase project configuration
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

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence with error handling
db.enablePersistence().catch((err) => {
    console.warn('Firebase persistence failed:', err.code);
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence.');
    }
});

// ===== Constants and Configuration =====
const STORAGE_KEY = 'studentResultsData_v2';
const FIREBASE_COLLECTION = 'student_results';
const VERSION = '2.1';
const GUEST_USER_ID = 'guest_user';

// Default CAT columns configuration
const DEFAULT_CAT_COLUMNS = Object.freeze([
    { id: 'cat1', name: 'CAT1', maxScore: 15 },
    { id: 'cat2', name: 'CAT2', maxScore: 20 },
    { id: 'cat3', name: 'CAT3', maxScore: 15 }
]);

// Sample student names for initial table
const INITIAL_STUDENTS = Object.freeze([
    "Student 1", "Student 2", "Student 3", "Student 4", "Student 5", 
    "Student 6", "Student 7", "Student 8", "Student 9", "Student 10"
]);

// Grading remarks configuration
const REMARKS_CONFIG = Object.freeze([
    { min: 90, text: 'Distinction', class: 'remarks-excellent' },
    { min: 80, text: 'Excellent', class: 'remarks-excellent' },
    { min: 70, text: 'Very Good', class: 'remarks-very-good' },
    { min: 60, text: 'Good', class: 'remarks-good' },
    { min: 50, text: 'Pass', class: 'remarks-pass' },
    { min: 0, text: 'Fail', class: 'remarks-fail' }
]);

// ===== Core Application Class =====
class StudentResultsManager {
    constructor() {
        this.tables = [];
        this.tableCounter = 1;
        this.saveTimeout = null;
        this.firebaseSaveTimeout = null;
        this.confirmCallback = null;
        this.currentUser = null;
        this.isGuest = true;
        this.isOnline = navigator.onLine;
        this.firebaseListener = null;
        this.lastFirebaseSync = 0;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupDOMReferences();
        this.setupEventListeners();
        this.setupNetworkListener();
        this.setCurrentYear();
        this.setupFirebaseAuth();
    }
    
    setupDOMReferences() {
        // Login screen
        this.loginScreen = document.getElementById('loginScreen');
        this.mainApp = document.getElementById('mainApp');
        
        // Login form elements
        this.loginForm = document.getElementById('loginForm');
        this.signupModal = document.getElementById('signupModal');
        this.resetPasswordModal = document.getElementById('resetPasswordModal');
        this.signupForm = document.getElementById('signupForm');
        this.resetPasswordForm = document.getElementById('resetPasswordForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        this.forgotPasswordLink = document.getElementById('forgotPassword');
        this.signupBtn = document.getElementById('signupBtn');
        this.guestBtn = document.getElementById('guestBtn');
        this.loginBtn = document.getElementById('loginBtn');
        this.cancelSignup = document.getElementById('cancelSignup');
        this.cancelReset = document.getElementById('cancelReset');
        this.sendResetBtn = document.getElementById('sendResetBtn');
        this.createAccountBtn = document.getElementById('createAccountBtn');
        
        // User info elements
        this.userAvatar = document.getElementById('userAvatar');
        this.userEmail = document.getElementById('userEmail');
        this.syncStatus = document.getElementById('syncStatus');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.userType = document.getElementById('userType');
        this.storageLocation = document.getElementById('storageLocation');
        
        // Cloud buttons
        this.cloudSyncBtn = document.getElementById('cloudSyncBtn');
        this.loadFromCloudBtn = document.getElementById('loadFromCloudBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Main app elements
        this.tablesContainer = document.getElementById('tablesContainer');
        this.emptyState = document.getElementById('emptyState');
        this.addTableBtn = document.getElementById('addTableBtn');
        this.initialAddTableBtn = document.getElementById('initialAddTable');
        this.importBtn = document.getElementById('importBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.statisticsBtn = document.getElementById('statisticsBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.clearDataBtn = document.getElementById('clearDataBtn');
        
        // File input
        this.fileInput = document.getElementById('fileInput');
        
        // Status indicators
        this.saveStatus = document.getElementById('saveStatus');
        this.lastSaved = document.getElementById('lastSaved');
        this.firebaseStatus = document.getElementById('firebaseStatus');
        this.cloudStatusText = document.getElementById('cloudStatusText');
        
        // Modals
        this.statisticsModal = document.getElementById('statisticsModal');
        this.terminalReportModal = document.getElementById('terminalReportModal');
        this.helpModal = document.getElementById('helpModal');
        this.confirmModal = document.getElementById('confirmModal');
        
        // Modal containers
        this.statisticsContainer = document.getElementById('statisticsContainer');
        this.terminalReportContainer = document.getElementById('terminalReportContainer');
        this.helpContainer = document.getElementById('helpContainer');
        
        // Confirmation modal elements
        this.confirmTitle = document.getElementById('confirmTitle');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmOk = document.getElementById('confirmOk');
        this.confirmCancel = document.getElementById('confirmCancel');
        
        // Notification toast
        this.notificationToast = document.getElementById('notificationToast');
        this.toastMessage = document.getElementById('toastMessage');
        this.toastClose = document.querySelector('.toast-close');
    }
    
    setupEventListeners() {
        // Login events
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupBtn.addEventListener('click', () => this.showModal(this.signupModal));
        this.guestBtn.addEventListener('click', () => this.loginAsGuest());
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        this.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal(this.resetPasswordModal);
        });
        
        // Signup events
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        this.cancelSignup.addEventListener('click', () => this.closeModal(this.signupModal));
        
        // Reset password events
        this.resetPasswordForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        this.cancelReset.addEventListener('click', () => this.closeModal(this.resetPasswordModal));
        
        // Password validation
        this.signupForm.addEventListener('input', (e) => this.validateSignupForm(e));
        
        // Cloud events
        this.cloudSyncBtn.addEventListener('click', () => this.saveToFirebase());
        this.loadFromCloudBtn.addEventListener('click', () => this.loadFromFirebase());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Main app events
        this.addTableBtn.addEventListener('click', () => this.addNewTable());
        this.initialAddTableBtn.addEventListener('click', () => this.addNewTable());
        this.importBtn.addEventListener('click', () => this.fileInput.click());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.statisticsBtn.addEventListener('click', () => this.showStatistics());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.clearDataBtn.addEventListener('click', () => this.confirmClearAllData());
        
        // File import
        this.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        
        // Modal close events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal-overlay')));
        });
        
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target);
            }
        });
        
        // Confirmation modal events
        this.confirmOk.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
            this.closeModal(this.confirmModal);
        });
        
        this.confirmCancel.addEventListener('click', () => {
            this.confirmCallback = null;
            this.closeModal(this.confirmModal);
        });
        
        // Notification toast
        this.toastClose.addEventListener('click', () => this.hideToast());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
            this.showToast('Back online', 'success');
            
            // Auto-sync when coming back online
            if (!this.isGuest && this.tables.length > 0) {
                setTimeout(() => this.saveToFirebase(), 3000);
            }
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
            this.showToast('You are offline', 'warning');
        });
        
        this.updateConnectionStatus();
    }
    
    setupFirebaseAuth() {
        // Check for remembered login
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail && this.emailInput) {
            this.emailInput.value = rememberedEmail;
            if (this.rememberMeCheckbox) {
                this.rememberMeCheckbox.checked = true;
            }
        }
        
        // Set up auth state listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                this.currentUser = user;
                this.isGuest = false;
                this.handleUserLogin(user);
            } else {
                // User is signed out
                this.currentUser = null;
                this.isGuest = true;
                
                // Show login screen if not already in guest mode
                if (!this.mainApp.style.display || this.mainApp.style.display === 'none') {
                    this.showLoginScreen();
                }
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            this.showToast('Authentication error', 'error');
        });
    }
    
    // ===== Authentication Methods =====
    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const rememberMe = this.rememberMeCheckbox.checked;
        
        // Validate inputs
        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            this.setLoadingState(this.loginBtn, true);
            
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Remember email if checkbox is checked
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            this.showToast('Login successful', 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            let message = 'Login failed';
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    message = 'Invalid email or password';
                    break;
                case 'auth/user-disabled':
                    message = 'Account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Try again later';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Check your connection';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                default:
                    message = 'Login failed. Please try again';
            }
            
            this.showToast(message, 'error');
        } finally {
            this.setLoadingState(this.loginBtn, false);
        }
    }
    
    async handleSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAgreed = document.getElementById('termsAgreement').checked;
        
        // Validate inputs
        if (!email || !password || !confirmPassword) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (!termsAgreed) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }
        
        try {
            this.setLoadingState(this.createAccountBtn, true);
            
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Create initial user document in Firestore
            await db.collection(FIREBASE_COLLECTION).doc(userCredential.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                version: VERSION,
                tableCount: 0
            });
            
            this.showToast('Account created successfully', 'success');
            this.closeModal(this.signupModal);
            
        } catch (error) {
            console.error('Signup error:', error);
            let message = 'Signup failed';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email already in use';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Check your connection';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Email/password accounts are not enabled';
                    break;
                default:
                    message = 'Signup failed. Please try again';
            }
            
            this.showToast(message, 'error');
        } finally {
            this.setLoadingState(this.createAccountBtn, false);
        }
    }
    
    async handleResetPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email) {
            this.showToast('Please enter your email', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            this.setLoadingState(this.sendResetBtn, true);
            
            await auth.sendPasswordResetEmail(email);
            
            this.showToast('Password reset email sent. Check your inbox.', 'success');
            this.closeModal(this.resetPasswordModal);
            
        } catch (error) {
            console.error('Reset password error:', error);
            let message = 'Failed to send reset email';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Check your connection';
                    break;
                default:
                    message = 'Failed to send reset email. Please try again';
            }
            
            this.showToast(message, 'error');
        } finally {
            this.setLoadingState(this.sendResetBtn, false);
        }
    }
    
    loginAsGuest() {
        this.currentUser = { 
            uid: GUEST_USER_ID, 
            email: 'guest@example.com',
            isAnonymous: true 
        };
        this.isGuest = true;
        this.handleUserLogin(this.currentUser);
        this.showToast('Continuing as guest. Data will be stored locally only.', 'info');
    }
    
    async handleLogout() {
        try {
            if (!this.isGuest) {
                await auth.signOut();
            }
            
            // Clear local data if guest
            if (this.isGuest) {
                this.tables = [];
                this.tableCounter = 1;
                localStorage.removeItem(STORAGE_KEY);
            }
            
            // Reset UI
            this.showLoginScreen();
            this.showToast('Logged out successfully', 'success');
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Logout failed', 'error');
        }
    }
    
    handleUserLogin(user) {
        // Update UI with user info
        this.userEmail.textContent = user.email || 'Guest User';
        this.userType.textContent = this.isGuest ? 'Guest Mode' : 'Authenticated';
        this.userType.className = this.isGuest ? 'guest' : 'authenticated';
        
        // Update avatar
        if (user.photoURL) {
            this.userAvatar.innerHTML = `<img src="${user.photoURL}" alt="Profile">`;
        } else {
            const initials = user.email ? user.email.charAt(0).toUpperCase() : 'G';
            this.userAvatar.innerHTML = `<span>${initials}</span>`;
        }
        
        // Show main app
        this.showMainApp();
        
        // Load data
        this.loadUserData();
    }
    
    // ===== Data Loading Strategy =====
    async loadUserData() {
        this.showToast('Loading your data...', 'info');
        
        try {
            let dataLoaded = false;
            let dataSource = '';
            
            // Try to load from Firebase first (if authenticated and online)
            if (!this.isGuest && this.isOnline) {
                try {
                    dataLoaded = await this.loadFromFirebase();
                    if (dataLoaded) {
                        dataSource = 'Cloud Storage';
                        this.storageLocation.textContent = dataSource;
                        this.showToast('Data loaded from cloud', 'success');
                    }
                } catch (firebaseError) {
                    console.warn('Failed to load from Firebase:', firebaseError);
                    dataSource = 'Local Storage (Cloud failed)';
                }
            }
            
            // If Firebase failed or user is guest, try localStorage
            if (!dataLoaded) {
                const localDataLoaded = this.loadFromLocalStorage();
                if (localDataLoaded) {
                    dataLoaded = true;
                    dataSource = this.isGuest ? 'Local Storage (Guest)' : 'Local Storage';
                    this.storageLocation.textContent = dataSource;
                    
                    if (!this.isGuest && this.isOnline) {
                        // Try to sync existing data to Firebase
                        setTimeout(() => {
                            if (this.tables.length > 0) {
                                this.saveToFirebase();
                            }
                        }, 2000);
                    }
                }
            }
            
            // If still no data, start fresh
            if (!dataLoaded) {
                this.tables = [];
                this.tableCounter = 1;
                dataSource = 'Fresh Start';
                this.storageLocation.textContent = dataSource;
                this.showToast('Starting fresh with empty tables', 'info');
            }
            
            // Update UI
            this.updateUI();
            
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showToast('Failed to load data. Starting fresh.', 'warning');
            
            // Start with empty state
            this.tables = [];
            this.tableCounter = 1;
            this.updateUI();
        }
    }
    
    // ===== Firebase Integration =====
    async saveToFirebase() {
        if (this.isGuest) {
            this.showToast('Please sign in to save to cloud', 'warning');
            return false;
        }
        
        if (!this.isOnline) {
            this.showToast('Cannot sync while offline', 'warning');
            return false;
        }
        
        // Prevent too frequent syncs (minimum 2 seconds between syncs)
        const now = Date.now();
        if (now - this.lastFirebaseSync < 2000) {
            this.showToast('Syncing too frequently. Please wait.', 'warning');
            return false;
        }
        
        try {
            this.setLoadingState(this.cloudSyncBtn, true);
            this.updateSyncStatus('syncing');
            
            const dataToSave = {
                version: VERSION,
                tables: this.tables,
                tableCounter: this.tableCounter,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: new Date().toISOString(),
                tableCount: this.tables.length,
                totalStudents: this.tables.reduce((total, table) => total + table.students.length, 0)
            };
            
            // Save to Firebase
            await db.collection(FIREBASE_COLLECTION)
                .doc(this.currentUser.uid)
                .set(dataToSave, { merge: true });
            
            // Update local storage as backup
            this.saveToLocalStorage();
            
            this.lastFirebaseSync = now;
            this.showToast('Data saved to cloud successfully', 'success');
            this.updateSyncStatus('synced');
            
            return true;
            
        } catch (error) {
            console.error('Firebase save error:', error);
            
            let message = 'Failed to save to cloud';
            if (error.code === 'permission-denied') {
                message = 'Permission denied. Please refresh and try again.';
            } else if (error.code === 'unavailable') {
                message = 'Cloud service unavailable. Saved locally instead.';
                this.saveToLocalStorage();
            } else if (error.code === 'failed-precondition') {
                message = 'Please close other tabs and try again.';
            }
            
            this.showToast(message, 'error');
            this.updateSyncStatus('error');
            
            return false;
        } finally {
            this.setLoadingState(this.cloudSyncBtn, false);
            
            // Reset sync status after 3 seconds
            setTimeout(() => {
                if (this.syncStatus.classList.contains('syncing')) {
                    this.updateSyncStatus('idle');
                }
            }, 3000);
        }
    }
    
    async loadFromFirebase() {
        if (this.isGuest) {
            throw new Error('Guest cannot load from Firebase');
        }
        
        if (!this.isOnline) {
            throw new Error('Cannot load from cloud while offline');
        }
        
        try {
            this.setLoadingState(this.loadFromCloudBtn, true);
            this.updateSyncStatus('syncing');
            
            const docRef = db.collection(FIREBASE_COLLECTION).doc(this.currentUser.uid);
            const doc = await docRef.get();
            
            if (doc.exists) {
                const data = doc.data();
                
                // Check if data is from same version
                if (data.version !== VERSION) {
                    console.warn(`Data version mismatch: ${data.version} vs ${VERSION}`);
                    this.showToast('Data format has changed. Some features may not work correctly.', 'warning');
                }
                
                // Validate data structure
                if (data.tables && Array.isArray(data.tables)) {
                    this.tables = data.tables;
                    this.tableCounter = data.tableCounter || 1;
                    
                    // Ensure data integrity
                    this.tables.forEach(table => this.validateTableData(table));
                    
                    // Save to local storage as backup
                    this.saveToLocalStorage();
                    
                    return true;
                } else {
                    throw new Error('Invalid data structure in Firebase');
                }
            } else {
                // No data in Firebase yet
                return false;
            }
            
        } catch (error) {
            console.error('Firebase load error:', error);
            throw error;
            
        } finally {
            this.setLoadingState(this.loadFromCloudBtn, false);
            this.updateSyncStatus('idle');
        }
    }
    
    setupFirebaseListener() {
        if (this.firebaseListener) {
            this.firebaseListener(); // Remove existing listener
        }
        
        if (!this.isGuest && this.isOnline) {
            this.firebaseListener = db.collection(FIREBASE_COLLECTION)
                .doc(this.currentUser.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        const remoteTimestamp = data.lastUpdated?.toMillis() || 0;
                        const localTimestamp = this.getLocalLastSavedTimestamp();
                        
                        // Only update if remote is newer (with 5-second buffer to avoid loops)
                        if (remoteTimestamp > localTimestamp + 5000) {
                            this.showToast('Data updated from cloud', 'info');
                            this.tables = data.tables || [];
                            this.tableCounter = data.tableCounter || 1;
                            this.updateUI();
                            this.saveToLocalStorage();
                        }
                    }
                }, (error) => {
                    console.warn('Firebase listener error:', error);
                    if (error.code === 'permission-denied') {
                        console.warn('Firebase listener permission denied');
                    }
                });
        }
    }
    
    // ===== Local Storage Methods =====
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Check if data belongs to current user (or guest)
                const savedUserId = parsedData.userId;
                const currentUserId = this.isGuest ? GUEST_USER_ID : (this.currentUser?.uid || '');
                
                if (savedUserId && currentUserId && savedUserId !== currentUserId) {
                    console.warn('Data belongs to different user. Starting fresh.');
                    this.showToast('Previous data belongs to different user. Starting fresh.', 'warning');
                    return false;
                }
                
                // Check version compatibility
                if (parsedData.version !== VERSION) {
                    console.warn('Data version mismatch, attempting migration...');
                    this.migrateData(parsedData);
                } else {
                    this.tables = parsedData.tables || [];
                    this.tableCounter = parsedData.tableCounter || 1;
                    
                    // Update last saved time display
                    if (parsedData.lastSaved) {
                        const lastSavedDate = new Date(parsedData.lastSaved);
                        this.lastSaved.textContent = `Last saved: ${lastSavedDate.toLocaleString()}`;
                    }
                }
                
                // Ensure data integrity
                this.tables.forEach(table => this.validateTableData(table));
                console.log('Data loaded from localStorage');
                
                return true;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        
        return false;
    }
    
    saveToLocalStorage() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveStatus.textContent = 'Saving...';
        this.saveStatus.className = '';
        
        this.saveTimeout = setTimeout(() => {
            try {
                const dataToSave = {
                    version: VERSION,
                    tables: this.tables,
                    tableCounter: this.tableCounter,
                    lastSaved: new Date().toISOString(),
                    userId: this.currentUser?.uid || GUEST_USER_ID,
                    email: this.currentUser?.email || 'guest'
                };
                
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
                
                this.saveStatus.textContent = 'All changes saved';
                this.saveStatus.className = 'saved-indicator';
                
                const lastSavedDate = new Date();
                this.lastSaved.textContent = `Last saved: ${lastSavedDate.toLocaleString()}`;
                
                console.log('Data saved to localStorage');
                
                // Auto-sync to Firebase if authenticated and online (debounced)
                if (!this.isGuest && this.isOnline && this.tables.length > 0) {
                    if (this.firebaseSaveTimeout) {
                        clearTimeout(this.firebaseSaveTimeout);
                    }
                    this.firebaseSaveTimeout = setTimeout(() => {
                        this.saveToFirebase();
                    }, 2000);
                }
                
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                this.saveStatus.textContent = 'Error saving data';
                this.saveStatus.className = '';
                
                // Check if storage is full
                if (error.name === 'QuotaExceededError') {
                    this.showToast('Storage is full. Please export and clear some data.', 'error');
                }
            }
        }, 500);
    }
    
    getLocalLastSavedTimestamp() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return new Date(parsedData.lastSaved || 0).getTime();
            }
        } catch (error) {
            console.error('Error getting local timestamp:', error);
        }
        return 0;
    }
    
    migrateData(oldData) {
        // Simple migration: preserve tables and students
        this.tables = oldData.tables || [];
        this.tableCounter = oldData.tableCounter || 1;
        
        // Ensure all tables have proper structure
        this.tables.forEach(table => {
            if (!table.catColumns) {
                table.catColumns = JSON.parse(JSON.stringify(DEFAULT_CAT_COLUMNS));
            }
            if (!table.students) {
                table.students = [];
            }
            table.students.forEach(student => {
                if (!student.catMarks) {
                    student.catMarks = {};
                    table.catColumns.forEach(cat => {
                        student.catMarks[cat.id] = student[cat.id] || 0;
                    });
                }
                this.recalculateStudentTotals(table, student);
            });
            this.updateTablePositions(table.id);
        });
        
        this.showToast('Data migrated to new version', 'info');
    }
    
    // ===== UI State Management =====
    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.mainApp.style.display = 'none';
        this.clearFormInputs();
    }
    
    showMainApp() {
        this.loginScreen.classList.add('hidden');
        this.mainApp.style.display = 'block';
        this.updateCloudStatus();
        this.setupFirebaseListener();
    }
    
    updateConnectionStatus() {
        if (this.isOnline) {
            this.connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
            this.connectionStatus.className = 'online';
            this.cloudSyncBtn.disabled = false;
            this.loadFromCloudBtn.disabled = this.isGuest;
        } else {
            this.connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
            this.connectionStatus.className = 'offline';
            this.cloudSyncBtn.disabled = true;
            this.loadFromCloudBtn.disabled = true;
        }
        this.updateCloudStatus();
    }
    
    updateCloudStatus() {
        if (this.isGuest) {
            this.cloudStatusText.textContent = 'Guest Mode';
            this.firebaseStatus.className = 'offline';
        } else if (this.isOnline) {
            this.cloudStatusText.textContent = 'Connected';
            this.firebaseStatus.className = 'online';
        } else {
            this.cloudStatusText.textContent = 'Offline';
            this.firebaseStatus.className = 'offline';
        }
    }
    
    updateSyncStatus(status) {
        const statusText = {
            'syncing': 'Syncing...',
            'synced': 'Synced',
            'error': 'Sync Error',
            'idle': 'Idle'
        }[status] || status;
        
        this.syncStatus.innerHTML = `<i class="fas fa-circle"></i> ${statusText}`;
        this.syncStatus.className = `sync-status ${status}`;
    }
    
    setLoadingState(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
            element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${element.textContent}`;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            // Restore original icon based on button type
            if (element.id === 'loginBtn') {
                element.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            } else if (element.id === 'createAccountBtn') {
                element.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            } else if (element.id === 'sendResetBtn') {
                element.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
            } else if (element.id === 'cloudSyncBtn') {
                element.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sync to Cloud';
            } else if (element.id === 'loadFromCloudBtn') {
                element.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Load from Cloud';
            }
        }
    }
    
    showToast(message, type = 'info') {
        this.toastMessage.textContent = message;
        this.notificationToast.className = `notification-toast show ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideToast(), 5000);
    }
    
    hideToast() {
        this.notificationToast.classList.remove('show');
    }
    
    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        this.togglePasswordBtn.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye"></i>' : 
            '<i class="fas fa-eye-slash"></i>';
    }
    
    validateSignupForm(e) {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthValue = document.getElementById('strengthValue');
        const passwordMatch = document.getElementById('passwordMatch');
        
        // Password strength
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++; // Extra point for longer password
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Cap at 6 for the bar width calculation
        const strengthLevel = Math.min(strength, 6);
        strengthBar.style.width = `${(strengthLevel / 6) * 100}%`;
        
        const strengthColors = ['#dc3545', '#ffc107', '#ffc107', '#28a745', '#20c997', '#198754'];
        const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        
        strengthBar.style.backgroundColor = strengthColors[strengthLevel] || '#dc3545';
        strengthValue.textContent = strengthTexts[strengthLevel] || 'Very Weak';
        strengthValue.style.color = strengthColors[strengthLevel] || '#dc3545';
        
        // Password match
        if (confirmPassword) {
            if (password === confirmPassword) {
                passwordMatch.textContent = 'Passwords match';
                passwordMatch.className = 'validation-message success';
            } else {
                passwordMatch.textContent = 'Passwords do not match';
                passwordMatch.className = 'validation-message error';
            }
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    clearFormInputs() {
        if (this.loginForm) this.loginForm.reset();
        if (this.signupForm) this.signupForm.reset();
        if (this.resetPasswordForm) this.resetPasswordForm.reset();
        
        // Restore remembered email if any
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail && this.emailInput) {
            this.emailInput.value = rememberedEmail;
            if (this.rememberMeCheckbox) {
                this.rememberMeCheckbox.checked = true;
            }
        }
    }
    
    // ===== Modal Management =====
    showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    showConfirmation(title, message, callback) {
        this.confirmTitle.textContent = title;
        this.confirmMessage.textContent = message;
        this.confirmCallback = callback;
        this.showModal(this.confirmModal);
    }
    
    // ===== Core Data Methods =====
    saveData() {
        this.saveToLocalStorage();
    }
    
    validateTableData(table) {
        // Ensure table has required properties
        if (!table.catColumns) {
            table.catColumns = JSON.parse(JSON.stringify(DEFAULT_CAT_COLUMNS));
        }
        
        if (!table.students) {
            table.students = [];
        }
        
        // Ensure each student has required properties
        table.students.forEach(student => {
            if (!student.catMarks) {
                student.catMarks = {};
                table.catColumns.forEach(cat => {
                    student.catMarks[cat.id] = 0;
                });
            }
            
            // Ensure numeric values
            student.exam = Number(student.exam) || 0;
            student.catTotal = Number(student.catTotal) || 0;
            student.total = Number(student.total) || 0;
            student.position = Number(student.position) || 0;
            
            // Recalculate totals
            this.recalculateStudentTotals(table, student);
        });
        
        // Update positions
        this.updateTablePositions(table.id);
    }
    
    // ===== Table Management =====
    addNewTable() {
        const tableId = `table-${this.tableCounter++}`;
        
        const students = INITIAL_STUDENTS.map(name => {
            const student = {
                name,
                exam: 0,
                catTotal: 0,
                total: 0,
                position: 0,
                catMarks: {}
            };
            
            DEFAULT_CAT_COLUMNS.forEach(cat => {
                student.catMarks[cat.id] = 0;
            });
            
            return student;
        });
        
        const tableData = {
            id: tableId,
            name: `Class ${this.tableCounter - 1}`,
            catColumns: JSON.parse(JSON.stringify(DEFAULT_CAT_COLUMNS)),
            students: students
        };
        
        this.tables.push(tableData);
        this.updateUI();
        this.saveData();
    }
    
    createTableFromNames(sourceTableId) {
        const sourceTable = this.tables.find(t => t.id === sourceTableId);
        if (!sourceTable) return;
        
        const tableId = `table-${this.tableCounter++}`;
        
        const students = sourceTable.students.map(student => {
            const newStudent = {
                name: student.name,
                exam: 0,
                catTotal: 0,
                total: 0,
                position: 0,
                catMarks: {}
            };
            
            sourceTable.catColumns.forEach(cat => {
                newStudent.catMarks[cat.id] = 0;
            });
            
            return newStudent;
        });
        
        const tableData = {
            id: tableId,
            name: `${sourceTable.name} (Copy)`,
            catColumns: JSON.parse(JSON.stringify(sourceTable.catColumns)),
            students: students
        };
        
        this.tables.push(tableData);
        this.updateUI();
        this.saveData();
    }
    
    deleteTable(tableId) {
        this.showConfirmation(
            'Delete Table',
            'Are you sure you want to delete this table? This action cannot be undone.',
            () => {
                this.tables = this.tables.filter(t => t.id !== tableId);
                this.updateUI();
                this.saveData();
            }
        );
    }
    
    updateTableName(tableId, newName) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            table.name = newName || `Class ${this.tableCounter}`;
            this.saveData();
        }
    }
    
    // ===== Student Management =====
    addStudent(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            const newStudent = {
                name: 'New Student',
                exam: 0,
                catTotal: 0,
                total: 0,
                position: 0,
                catMarks: {}
            };
            
            table.catColumns.forEach(cat => {
                newStudent.catMarks[cat.id] = 0;
            });
            
            table.students.push(newStudent);
            this.updateTablePositions(tableId);
            this.updateUI();
            this.saveData();
        }
    }
    
    deleteStudent(tableId, studentIndex) {
        this.showConfirmation(
            'Delete Student',
            'Are you sure you want to delete this student?',
            () => {
                const table = this.tables.find(t => t.id === tableId);
                if (table && table.students[studentIndex]) {
                    table.students.splice(studentIndex, 1);
                    this.updateTablePositions(tableId);
                    this.updateUI();
                    this.saveData();
                }
            }
        );
    }
    
    updateStudentName(tableId, studentIndex, newName) {
        const table = this.tables.find(t => t.id === tableId);
        if (table && table.students[studentIndex]) {
            table.students[studentIndex].name = newName || 'Unnamed Student';
            this.updateUI();
            this.saveData();
        }
    }
    
    updateStudentMark(tableId, studentIndex, markType, value) {
        const table = this.tables.find(t => t.id === tableId);
        if (table && table.students[studentIndex]) {
            table.students[studentIndex][markType] = value;
            this.recalculateStudentTotals(table, table.students[studentIndex]);
            this.updateTablePositions(tableId);
            this.updateUI();
            this.saveData();
        }
    }
    
    updateStudentCatMark(tableId, studentIndex, catId, value) {
        const table = this.tables.find(t => t.id === tableId);
        if (table && table.students[studentIndex]) {
            table.students[studentIndex].catMarks[catId] = value;
            this.recalculateStudentTotals(table, table.students[studentIndex]);
            this.updateTablePositions(tableId);
            this.updateUI();
            this.saveData();
        }
    }
    
    recalculateStudentTotals(table, student) {
        // Calculate CAT total (sum of all CAT marks, capped at 50)
        const catTotal = table.catColumns.reduce((sum, cat) => {
            return sum + (student.catMarks[cat.id] || 0);
        }, 0);
        
        student.catTotal = Math.min(catTotal, 50);
        student.total = student.catTotal + student.exam;
    }
    
    updateTablePositions(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            // Sort students by total marks in descending order
            const sortedStudents = [...table.students].sort((a, b) => b.total - a.total);
            
            // Assign positions
            let currentPosition = 1;
            let previousTotal = null;
            
            sortedStudents.forEach((student, index) => {
                if (previousTotal !== null && student.total === previousTotal) {
                    student.position = currentPosition;
                } else {
                    currentPosition = index + 1;
                    student.position = currentPosition;
                }
                previousTotal = student.total;
            });
        }
    }
    
    // ===== CAT Column Management =====
    addCatColumn(tableId, name, maxScore) {
        if (!name || !maxScore || maxScore <= 0) {
            alert('Please enter a valid name and maximum score (greater than 0)');
            return;
        }
        
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;
        
        // Check for duplicate names
        if (table.catColumns.some(cat => cat.name === name)) {
            alert('A CAT column with this name already exists');
            return;
        }
        
        // Generate unique ID
        const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add new CAT column
        table.catColumns.push({ id, name, maxScore });
        
        // Add column to all students
        table.students.forEach(student => {
            student.catMarks[id] = 0;
        });
        
        // Recalculate and update
        table.students.forEach(student => {
            this.recalculateStudentTotals(table, student);
        });
        
        this.updateTablePositions(tableId);
        this.updateUI();
        this.saveData();
    }
    
    editCatColumn(tableId, catIndex) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table || !table.catColumns[catIndex]) return;
        
        const catColumn = table.catColumns[catIndex];
        
        const newName = prompt('Enter new name for CAT column:', catColumn.name);
        if (newName === null) return;
        
        const newMaxScore = parseInt(prompt('Enter new maximum score:', catColumn.maxScore));
        if (isNaN(newMaxScore) || newMaxScore <= 0) {
            alert('Please enter a valid maximum score (greater than 0)');
            return;
        }
        
        // Update CAT column
        const oldMaxScore = catColumn.maxScore;
        catColumn.name = newName;
        catColumn.maxScore = newMaxScore;
        
        // Recalculate marks if max score changed
        if (newMaxScore !== oldMaxScore) {
            table.students.forEach(student => {
                const currentMark = student.catMarks[catColumn.id];
                if (currentMark > newMaxScore) {
                    student.catMarks[catColumn.id] = newMaxScore;
                }
            });
        }
        
        // Recalculate and update
        table.students.forEach(student => {
            this.recalculateStudentTotals(table, student);
        });
        
        this.updateTablePositions(tableId);
        this.updateUI();
        this.saveData();
    }
    
    deleteCatColumn(tableId, catIndex) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table || !table.catColumns[catIndex]) return;
        
        const catColumn = table.catColumns[catIndex];
        
        this.showConfirmation(
            'Delete CAT Column',
            `Are you sure you want to delete the "${catColumn.name}" CAT column? This action cannot be undone.`,
            () => {
                // Remove the CAT column
                table.catColumns.splice(catIndex, 1);
                
                // Remove from all students
                table.students.forEach(student => {
                    delete student.catMarks[catColumn.id];
                });
                
                // Recalculate and update
                table.students.forEach(student => {
                    this.recalculateStudentTotals(table, student);
                });
                
                this.updateTablePositions(tableId);
                this.updateUI();
                this.saveData();
            }
        );
    }
    
    // ===== Mark Parsing =====
    parseMarkInput(input, maxMark) {
        if (input === '' || input === null || input === undefined) {
            return 0;
        }
        
        const strInput = String(input).trim();
        
        // Handle fraction format (e.g., "45/50")
        if (strInput.includes('/')) {
            const parts = strInput.split('/');
            if (parts.length === 2) {
                const numerator = parseFloat(parts[0]);
                const denominator = parseFloat(parts[1]);
                
                if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                    const percentage = numerator / denominator;
                    const convertedMark = percentage * maxMark;
                    return Math.min(Math.max(Math.round(convertedMark), 0), maxMark);
                }
            }
        }
        
        // Handle percentage format (e.g., "90%")
        if (strInput.includes('%')) {
            const percentage = parseFloat(strInput);
            if (!isNaN(percentage)) {
                const convertedMark = (percentage / 100) * maxMark;
                return Math.min(Math.max(Math.round(convertedMark), 0), maxMark);
            }
        }
        
        // Handle decimal numbers
        const numValue = parseFloat(strInput);
        if (!isNaN(numValue)) {
            if (numValue > maxMark) {
                return maxMark;
            }
            return Math.min(Math.max(Math.round(numValue), 0), maxMark);
        }
        
        return 0;
    }
    
    // ===== UI Rendering =====
    updateUI() {
        if (this.tables.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            this.renderTables();
        }
    }
    
    renderTables() {
        this.tablesContainer.innerHTML = '';
        
        this.tables.forEach(tableData => {
            const tableElement = this.createTableElement(tableData);
            this.tablesContainer.appendChild(tableElement);
        });
    }
    
    createTableElement(tableData) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.id = tableData.id;
        
        // Table Header
        tableContainer.appendChild(this.createTableHeader(tableData));
        
        // CAT Configuration Section
        tableContainer.appendChild(this.createCatConfigSection(tableData));
        
        // Table Wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-wrapper';
        
        // Create Table
        const table = document.createElement('table');
        table.appendChild(this.createTableHeaderRow(tableData));
        table.appendChild(this.createTableBody(tableData));
        tableWrapper.appendChild(table);
        tableContainer.appendChild(tableWrapper);
        
        // Add Student Button
        tableContainer.appendChild(this.createAddStudentSection(tableData.id));
        
        return tableContainer;
    }
    
    createTableHeader(tableData) {
        const header = document.createElement('div');
        header.className = 'table-header';
        
        const title = document.createElement('div');
        title.className = 'table-title';
        title.contentEditable = true;
        title.textContent = tableData.name;
        
        title.addEventListener('blur', (e) => {
            this.updateTableName(tableData.id, e.target.textContent);
        });
        
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                title.blur();
            }
        });
        
        const actions = document.createElement('div');
        actions.className = 'table-actions';
        
        // Print Button
        const printBtn = this.createButton('btn-info', 'Print', '🖨️', () => this.printTable(tableData.id));
        
        // Clone Button
        const cloneBtn = this.createButton('btn-secondary', 'Clone Names', '📝', () => this.createTableFromNames(tableData.id));
        
        // Edit Name Button
        const renameBtn = this.createButton('btn-success', 'Edit Name', '✏️', () => {
            title.focus();
            const range = document.createRange();
            range.selectNodeContents(title);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });
        
        // Delete Button
        const deleteBtn = this.createButton('btn-danger', 'Delete', '🗑️', () => this.deleteTable(tableData.id));
        
        actions.append(printBtn, cloneBtn, renameBtn, deleteBtn);
        header.append(title, actions);
        
        return header;
    }
    
    createCatConfigSection(tableData) {
        const section = document.createElement('div');
        section.className = 'cat-config';
        
        const header = document.createElement('div');
        header.className = 'cat-config-header';
        
        const title = document.createElement('div');
        title.className = 'cat-config-title';
        title.textContent = 'CAT Columns Configuration';
        header.appendChild(title);
        
        const addBtn = this.createButton('btn-primary', 'Add CAT Column', '➕', () => {
            this.showAddCatForm(tableData.id);
        });
        header.appendChild(addBtn);
        section.appendChild(header);
        
        // CAT Columns List
        const columnsList = document.createElement('div');
        columnsList.className = 'cat-columns-list';
        
        tableData.catColumns.forEach((catColumn, index) => {
            const columnItem = document.createElement('div');
            columnItem.className = 'cat-column-item';
            
            const columnName = document.createElement('span');
            columnName.className = 'cat-column-name';
            columnName.textContent = catColumn.name;
            
            const columnMax = document.createElement('span');
            columnMax.className = 'cat-column-max';
            columnMax.textContent = `Max: ${catColumn.maxScore}`;
            
            const actions = document.createElement('div');
            actions.className = 'cat-column-actions';
            
            const editBtn = this.createButton('btn-secondary', 'Edit', '✏️', () => this.editCatColumn(tableData.id, index));
            const deleteBtn = this.createButton('btn-danger', 'Delete', '🗑️', () => this.deleteCatColumn(tableData.id, index));
            
            actions.append(editBtn, deleteBtn);
            columnItem.append(columnName, columnMax, actions);
            columnsList.appendChild(columnItem);
        });
        
        section.appendChild(columnsList);
        
        // Add CAT Form (initially hidden)
        section.appendChild(this.createAddCatForm(tableData.id));
        
        return section;
    }
    
    createAddCatForm(tableId) {
        const form = document.createElement('div');
        form.className = 'add-cat-form';
        form.id = `add-cat-form-${tableId}`;
        form.style.display = 'none';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'cat-name-input';
        nameInput.placeholder = 'CAT Name';
        
        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.className = 'cat-max-input';
        maxInput.placeholder = 'Max Score';
        maxInput.min = '1';
        maxInput.value = '10';
        
        const saveBtn = this.createButton('btn-success', 'Save', '💾', () => {
            this.addCatColumn(tableId, nameInput.value, parseInt(maxInput.value));
            this.hideAddCatForm(tableId);
        });
        
        const cancelBtn = this.createButton('btn-secondary', 'Cancel', '❌', () => this.hideAddCatForm(tableId));
        
        form.append(nameInput, maxInput, saveBtn, cancelBtn);
        return form;
    }
    
    createTableHeaderRow(tableData) {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Name header
        headerRow.appendChild(this.createTableHeaderCell('NAMES'));
        
        // CAT column headers
        tableData.catColumns.forEach(catColumn => {
            const header = document.createElement('th');
            header.textContent = `${catColumn.name} Marks ${catColumn.maxScore}`;
            headerRow.appendChild(header);
        });
        
        // Other headers
        ['CAT Totals 50', 'EXAM Marks 50', 'TOTAL CAT+ EXAM Marks 100', 'POSITION S', 'ACTIONS'].forEach(text => {
            headerRow.appendChild(this.createTableHeaderCell(text));
        });
        
        thead.appendChild(headerRow);
        return thead;
    }
    
    createTableBody(tableData) {
        const tbody = document.createElement('tbody');
        
        tableData.students.forEach((student, index) => {
            const row = document.createElement('tr');
            
            // Name cell
            row.appendChild(this.createEditableCell(student.name, (value) => {
                this.updateStudentName(tableData.id, index, value);
            }));
            
            // CAT column cells
            tableData.catColumns.forEach(catColumn => {
                const cell = document.createElement('td');
                const input = document.createElement('span');
                input.className = 'editable';
                input.textContent = student.catMarks[catColumn.id] || 0;
                input.contentEditable = true;
                
                input.addEventListener('blur', (e) => {
                    const convertedMark = this.parseMarkInput(e.target.textContent, catColumn.maxScore);
                    this.updateStudentCatMark(tableData.id, index, catColumn.id, convertedMark);
                });
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        input.blur();
                    }
                });
                
                cell.appendChild(input);
                row.appendChild(cell);
            });
            
            // CAT Total cell
            row.appendChild(this.createStaticCell(student.catTotal));
            
            // EXAM cell
            row.appendChild(this.createEditableCell(student.exam, (value) => {
                const convertedMark = this.parseMarkInput(value, 50);
                this.updateStudentMark(tableData.id, index, 'exam', convertedMark);
            }));
            
            // TOTAL cell
            row.appendChild(this.createStaticCell(student.total));
            
            // POSITION cell
            const positionCell = document.createElement('td');
            positionCell.className = 'position-cell';
            positionCell.textContent = student.position;
            row.appendChild(positionCell);
            
            // Actions cell
            const actionsCell = document.createElement('td');
            const deleteBtn = this.createButton('btn-danger', 'Delete Student', '🗑️', () => this.deleteStudent(tableData.id, index));
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        return tbody;
    }
    
    createAddStudentSection(tableId) {
        const section = document.createElement('div');
        section.style.padding = '15px 20px';
        section.style.borderTop = '1px solid var(--border)';
        section.style.textAlign = 'center';
        
        const addBtn = this.createButton('btn-primary', 'Add Student', '➕', () => this.addStudent(tableId));
        section.appendChild(addBtn);
        
        return section;
    }
    
    createButton(className, title, icon, onClick) {
        const button = document.createElement('button');
        button.className = `btn ${className}`;
        button.innerHTML = `${icon} ${title}`;
        button.addEventListener('click', onClick);
        return button;
    }
    
    createTableHeaderCell(text) {
        const th = document.createElement('th');
        th.textContent = text;
        return th;
    }
    
    createEditableCell(value, onBlur) {
        const cell = document.createElement('td');
        const input = document.createElement('span');
        input.className = 'editable';
        input.textContent = value;
        input.contentEditable = true;
        
        input.addEventListener('blur', (e) => {
            onBlur(e.target.textContent);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
        
        cell.appendChild(input);
        return cell;
    }
    
    createStaticCell(value) {
        const cell = document.createElement('td');
        cell.textContent = value;
        return cell;
    }
    
    showAddCatForm(tableId) {
        const form = document.getElementById(`add-cat-form-${tableId}`);
        if (form) {
            form.style.display = 'flex';
            const nameInput = form.querySelector('.cat-name-input');
            if (nameInput) {
                nameInput.focus();
                nameInput.value = `CAT${this.tables.find(t => t.id === tableId)?.catColumns.length + 1 || 1}`;
            }
        }
    }
    
    hideAddCatForm(tableId) {
        const form = document.getElementById(`add-cat-form-${tableId}`);
        if (form) {
            form.style.display = 'none';
            const nameInput = form.querySelector('.cat-name-input');
            const maxInput = form.querySelector('.cat-max-input');
            if (nameInput) nameInput.value = '';
            if (maxInput) maxInput.value = '10';
        }
    }
    
    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }
    }
    
    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }
    
    // ===== Statistics =====
    showStatistics() {
        if (this.tables.length === 0) {
            this.showToast('No tables available. Please create tables first.', 'warning');
            return;
        }
        
        this.renderStatisticsTable();
        this.showModal(this.statisticsModal);
    }
    
    renderStatisticsTable() {
        // Get all unique student names
        const allStudentNames = [...new Set(
            this.tables.flatMap(table => table.students.map(student => student.name))
        )].sort();
        
        // Create statistics data
        const statisticsData = allStudentNames.map(name => {
            const studentData = { name, totals: [] };
            
            this.tables.forEach(table => {
                const student = table.students.find(s => s.name === name);
                studentData.totals.push(student ? student.total : 0);
            });
            
            studentData.overallTotal = studentData.totals.reduce((sum, total) => sum + total, 0);
            return studentData;
        });
        
        // Sort by overall total
        statisticsData.sort((a, b) => b.overallTotal - a.overallTotal);
        
        // Assign positions
        let currentPosition = 1;
        let previousTotal = null;
        
        statisticsData.forEach((student, index) => {
            if (previousTotal !== null && student.overallTotal === previousTotal) {
                student.position = currentPosition;
            } else {
                currentPosition = index + 1;
                student.position = currentPosition;
            }
            previousTotal = student.overallTotal;
        });
        
        // Create table
        this.statisticsContainer.innerHTML = '';
        
        if (allStudentNames.length === 0) {
            this.statisticsContainer.innerHTML = '<p class="text-center">No student data available.</p>';
            return;
        }
        
        const statsTable = document.createElement('table');
        statsTable.style.width = '100%';
        
        // Header row
        const headerRow = document.createElement('tr');
        headerRow.appendChild(this.createTableHeaderCell('NAMES'));
        
        this.tables.forEach(table => {
            headerRow.appendChild(this.createTableHeaderCell(table.name));
        });
        
        headerRow.appendChild(this.createTableHeaderCell('TOTALS'));
        headerRow.appendChild(this.createTableHeaderCell('POSITION'));
        
        statsTable.appendChild(headerRow);
        
        // Data rows
        statisticsData.forEach(student => {
            const row = document.createElement('tr');
            
            // Name cell (clickable)
            const nameCell = document.createElement('td');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = student.name;
            nameSpan.className = 'clickable-name';
            nameSpan.addEventListener('click', () => this.showTerminalReport(student.name));
            nameCell.appendChild(nameSpan);
            row.appendChild(nameCell);
            
            // Table score cells
            student.totals.forEach(total => {
                row.appendChild(this.createStaticCell(total));
            });
            
            // Overall total cell
            row.appendChild(this.createStaticCell(student.overallTotal));
            
            // Position cell
            row.appendChild(this.createStaticCell(student.position));
            
            statsTable.appendChild(row);
        });
        
        this.statisticsContainer.appendChild(statsTable);
    }
    
    // ===== Terminal Reports =====
    showTerminalReport(studentName) {
        this.closeModal(this.statisticsModal);
        this.renderTerminalReport(studentName);
        this.showModal(this.terminalReportModal);
    }
    
    renderTerminalReport(studentName) {
        this.terminalReportContainer.innerHTML = '';
        
        const reportDiv = document.createElement('div');
        reportDiv.className = 'terminal-report';
        
        // Header
        const headerDiv = document.createElement('div');
        headerDiv.style.textAlign = 'center';
        headerDiv.style.marginBottom = '20px';
        headerDiv.style.paddingBottom = '15px';
        headerDiv.style.borderBottom = '2px solid var(--primary)';
        
        const studentNameHeading = document.createElement('h2');
        studentNameHeading.textContent = `Terminal Report: ${studentName}`;
        studentNameHeading.style.color = 'var(--primary)';
        headerDiv.appendChild(studentNameHeading);
        
        const reportDate = document.createElement('p');
        reportDate.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
        reportDate.style.color = 'var(--gray)';
        headerDiv.appendChild(reportDate);
        
        reportDiv.appendChild(headerDiv);
        
        // Results Table
        const resultsTable = document.createElement('table');
        resultsTable.appendChild(this.createTerminalReportHeader());
        resultsTable.appendChild(this.createTerminalReportBody(studentName));
        reportDiv.appendChild(resultsTable);
        
        // Comments Section
        reportDiv.appendChild(this.createCommentsSection());
        
        // Actions
        reportDiv.appendChild(this.createTerminalReportActions(studentName));
        
        this.terminalReportContainer.appendChild(reportDiv);
    }
    
    createTerminalReportHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['SUBJECT', 'CAT TOTAL', 'EXAM', 'SUBJECT TOTAL', 'REMARKS'].forEach(text => {
            headerRow.appendChild(this.createTableHeaderCell(text));
        });
        
        thead.appendChild(headerRow);
        return thead;
    }
    
    createTerminalReportBody(studentName) {
        const tbody = document.createElement('tbody');
        let grandTotal = 0;
        let totalPossible = 0;
        
        this.tables.forEach(table => {
            const student = table.students.find(s => s.name === studentName);
            if (student) {
                const row = document.createElement('tr');
                
                // Subject name
                row.appendChild(this.createStaticCell(table.name));
                
                // CAT Total
                row.appendChild(this.createStaticCell(student.catTotal));
                
                // Exam
                row.appendChild(this.createStaticCell(student.exam));
                
                // Subject Total
                row.appendChild(this.createStaticCell(student.total));
                
                // Remarks
                const remarksCell = document.createElement('td');
                const remarks = this.getRemarks(student.total, 100);
                remarksCell.textContent = remarks.text;
                remarksCell.className = `remarks-cell ${remarks.class}`;
                row.appendChild(remarksCell);
                
                tbody.appendChild(row);
                
                grandTotal += student.total;
                totalPossible += 100;
            }
        });
        
        // Grand Total Row
        const grandTotalRow = document.createElement('tr');
        grandTotalRow.style.fontWeight = 'bold';
        grandTotalRow.style.backgroundColor = '#f1f5fd';
        
        const grandTotalLabelCell = document.createElement('td');
        grandTotalLabelCell.textContent = 'GRAND TOTAL';
        grandTotalLabelCell.colSpan = 3;
        grandTotalRow.appendChild(grandTotalLabelCell);
        
        grandTotalRow.appendChild(this.createStaticCell(grandTotal));
        
        const overallRemarksCell = document.createElement('td');
        const overallPercentage = totalPossible > 0 ? (grandTotal / totalPossible) * 100 : 0;
        const overallRemarks = this.getRemarks(overallPercentage, 100);
        overallRemarksCell.textContent = overallRemarks.text;
        overallRemarksCell.className = `remarks-cell ${overallRemarks.class}`;
        grandTotalRow.appendChild(overallRemarksCell);
        
        tbody.appendChild(grandTotalRow);
        
        return tbody;
    }
    
    createCommentsSection() {
        const section = document.createElement('div');
        section.className = 'comments-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Teacher Comments:';
        heading.style.textAlign = 'center';
        section.appendChild(heading);
        
        const textarea = document.createElement('textarea');
        textarea.className = 'comments-textarea';
        textarea.placeholder = 'Enter teacher comments here...';
        section.appendChild(textarea);
        
        return section;
    }
    
    createTerminalReportActions(studentName) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'terminal-report-actions';
        
        const printBtn = this.createButton('btn-info', 'Print Report', '🖨️', () => {
            const comments = this.terminalReportContainer.querySelector('.comments-textarea')?.value || '';
            this.printTerminalReport(studentName, comments);
        });
        
        const closeBtn = this.createButton('btn-secondary', 'Close', '❌', () => {
            this.closeModal(this.terminalReportModal);
        });
        
        actionsDiv.append(printBtn, closeBtn);
        return actionsDiv;
    }
    
    getRemarks(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        
        for (const remark of REMARKS_CONFIG) {
            if (percentage >= remark.min) {
                return remark;
            }
        }
        
        return REMARKS_CONFIG[REMARKS_CONFIG.length - 1];
    }
    
    printTerminalReport(studentName, comments) {
        const printWindow = window.open('', '_blank');
        
        let grandTotal = 0;
        let totalPossible = 0;
        let subjectRows = '';
        
        this.tables.forEach(table => {
            const student = table.students.find(s => s.name === studentName);
            if (student) {
                const remarks = this.getRemarks(student.total, 100);
                subjectRows += `
                    <tr>
                        <td>${table.name}</td>
                        <td>${student.catTotal}</td>
                        <td>${student.exam}</td>
                        <td>${student.total}</td>
                        <td class="remarks-cell ${remarks.class}">${remarks.text}</td>
                    </tr>
                `;
                
                grandTotal += student.total;
                totalPossible += 100;
            }
        });
        
        const overallPercentage = totalPossible > 0 ? (grandTotal / totalPossible) * 100 : 0;
        const overallRemarks = this.getRemarks(overallPercentage, 100);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Terminal Report - ${studentName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    .print-table .remarks-cell { font-weight: bold; }
                    .remarks-excellent { color: #28a745; }
                    .remarks-very-good { color: #20c997; }
                    .remarks-good { color: #17a2b8; }
                    .remarks-pass { color: #ffc107; }
                    .remarks-fail { color: #dc3545; }
                    .comments-section { margin-top: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Terminal Report</h1>
                    <h2>${studentName}</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>SUBJECT</th><th>CAT TOTAL</th><th>EXAM</th><th>SUBJECT TOTAL</th><th>REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectRows}
                        <tr style="font-weight: bold; background-color: #f1f5fd;">
                            <td colspan="3">GRAND TOTAL</td>
                            <td>${grandTotal}</td>
                            <td class="remarks-cell ${overallRemarks.class}">${overallRemarks.text}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="comments-section">
                    <h3>Teacher Comments:</h3>
                    <p>${comments || 'No comments provided.'}</p>
                </div>
                <div style="margin-top: 20px; font-size: 12px; text-align: center;">
                    School Stamp & Signature: _________________________
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.print();
        };
    }
    
    // ===== Printing =====
    printTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;
        
        const printWindow = window.open('', '_blank');
        
        let catHeaders = '';
        table.catColumns.forEach(catColumn => {
            catHeaders += `<th>${catColumn.name} Marks ${catColumn.maxScore}</th>`;
        });
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${table.name} - Student Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    .print-table .position-cell { font-weight: bold; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>${table.name}</h1>
                    <p>Student Results Summary</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>NAMES</th>
                            ${catHeaders}
                            <th>CAT Totals 50</th>
                            <th>EXAM Marks 50</th>
                            <th>TOTAL CAT+ EXAM Marks 100</th>
                            <th>POSITION S</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${table.students.map(student => {
                            let catMarks = '';
                            table.catColumns.forEach(catColumn => {
                                catMarks += `<td>${student.catMarks[catColumn.id] || 0}</td>`;
                            });
                            
                            return `
                            <tr>
                                <td>${student.name}</td>
                                ${catMarks}
                                <td>${student.catTotal}</td>
                                <td>${student.exam}</td>
                                <td>${student.total}</td>
                                <td class="position-cell">${student.position}</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 20px; font-size: 12px; text-align: center;">
                    Generated on ${new Date().toLocaleDateString()}
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.print();
        };
    }
    
    // ===== Import/Export =====
    exportData() {
        if (this.tables.length === 0) {
            this.showToast('No data to export. Please add tables first.', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify({
            version: VERSION,
            tables: this.tables,
            tableCounter: this.tableCounter,
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentUser?.email || 'guest'
        }, null, 2);
        
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `student-results-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }
    
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('File too large. Maximum size is 5MB.', 'error');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data structure
                if (!Array.isArray(importedData.tables)) {
                    throw new Error('Invalid data format: missing tables array');
                }
                
                const importSummary = this.mergeImportedData(importedData);
                this.updateUI();
                this.saveData();
                
                this.showImportSummary(importSummary);
            } catch (error) {
                console.error('Import error:', error);
                let message = 'Error importing data';
                if (error.message.includes('JSON')) {
                    message = 'Invalid JSON file format';
                } else if (error.message.includes('tables')) {
                    message = 'Invalid data structure in file';
                }
                this.showToast(message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showToast('Error reading file', 'error');
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }
    
    mergeImportedData(importedData) {
        const summary = {
            tablesAdded: 0,
            tablesUpdated: 0,
            studentsAdded: 0,
            studentsUpdated: 0
        };
        
        // Update table counter to avoid ID conflicts
        const maxExistingId = this.tables.reduce((max, table) => {
            const idNum = parseInt(table.id.replace('table-', '')) || 0;
            return idNum > max ? idNum : max;
        }, 0);
        
        this.tableCounter = Math.max(this.tableCounter, maxExistingId + 1);
        
        // Process each imported table
        importedData.tables.forEach(importedTable => {
            // Check if table with same name exists
            const existingTable = this.tables.find(t => t.name === importedTable.name);
            
            if (existingTable) {
                // Merge students into existing table
                summary.tablesUpdated++;
                
                importedTable.students.forEach(importedStudent => {
                    const existingStudent = existingTable.students.find(s => s.name === importedStudent.name);
                    
                    if (existingStudent) {
                        // Update existing student
                        Object.assign(existingStudent, importedStudent);
                        summary.studentsUpdated++;
                    } else {
                        // Add new student
                        existingTable.students.push(importedStudent);
                        summary.studentsAdded++;
                    }
                });
                
                // Update positions for the merged table
                this.updateTablePositions(existingTable.id);
            } else {
                // Add new table
                const newTableId = `table-${this.tableCounter++}`;
                importedTable.id = newTableId;
                this.tables.push(importedTable);
                summary.tablesAdded++;
                summary.studentsAdded += importedTable.students.length;
            }
        });
        
        return summary;
    }
    
    showImportSummary(summary) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'import-summary';
        
        summaryDiv.innerHTML = `
            <h4><i class="fas fa-check-circle"></i> Data Import Successful</h4>
            <ul>
                <li><strong>Tables added:</strong> ${summary.tablesAdded}</li>
                <li><strong>Tables updated:</strong> ${summary.tablesUpdated}</li>
                <li><strong>Students added:</strong> ${summary.studentsAdded}</li>
                <li><strong>Students updated:</strong> ${summary.studentsUpdated}</li>
            </ul>
            <p>Your data has been merged successfully. All changes have been saved automatically.</p>
        `;
        
        if (this.tablesContainer.firstChild) {
            this.tablesContainer.insertBefore(summaryDiv, this.tablesContainer.firstChild);
        } else {
            this.tablesContainer.appendChild(summaryDiv);
        }
        
        setTimeout(() => {
            if (summaryDiv.parentNode) {
                summaryDiv.parentNode.removeChild(summaryDiv);
            }
        }, 5000);
    }
    
    confirmClearAllData() {
        this.showConfirmation(
            'Clear All Data',
            'Are you sure you want to clear ALL data? This action cannot be undone and will delete all tables.',
            () => {
                this.tables = [];
                this.tableCounter = 1;
                localStorage.removeItem(STORAGE_KEY);
                this.updateUI();
                this.saveStatus.textContent = 'All data cleared';
                this.saveStatus.className = '';
                this.showToast('All data cleared', 'success');
            }
        );
    }
    
    // ===== Help System =====
    showHelp() {
        this.renderHelpContent();
        this.showModal(this.helpModal);
    }
    
    renderHelpContent() {
        this.helpContainer.innerHTML = `
            <div class="help-section">
                <h3><i class="fas fa-rocket"></i> Getting Started</h3>
                <p>Welcome to the Student Results Manager! This application helps teachers and school administrators manage student grades efficiently.</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4><i class="fas fa-plus"></i> Add New Table</h4>
                        <p>Create a new class or subject table with default student names.</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-copy"></i> Clone Names</h4>
                        <p>Create a new table with student names from an existing table (marks reset to 0).</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-edit"></i> Edit Content</h4>
                        <p>Click on any cell to edit student names or marks. Changes save automatically.</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-user-plus"></i> Add Student</h4>
                        <p>Add new students to any table using the button at the bottom of each table.</p>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-cloud"></i> Cloud Features</h3>
                <ul>
                    <li><strong>Authentication:</strong> Sign up or login to save your data in the cloud</li>
                    <li><strong>Cloud Sync:</strong> Click "Sync to Cloud" to save your data to Firebase</li>
                    <li><strong>Load from Cloud:</strong> Click "Load from Cloud" to fetch your latest data</li>
                    <li><strong>Guest Mode:</strong> Use without account (data stored locally only)</li>
                    <li><strong>Auto-sync:</strong> Changes automatically sync when online (authenticated users)</li>
                    <li><strong>Offline Support:</strong> Works without internet connection</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-calculator"></i> Flexible Mark Input</h3>
                <p>You can enter marks in several formats and they will be automatically converted:</p>
                <ul>
                    <li><strong>Fractions:</strong> e.g., "45/50" will be converted to the equivalent mark out of the category maximum</li>
                    <li><strong>Percentages:</strong> e.g., "90%" will be converted to 90% of the category maximum</li>
                    <li><strong>Direct numbers:</strong> e.g., "14" will be used directly (if within the allowed maximum)</li>
                </ul>
                <p><strong>Examples:</strong></p>
                <ul>
                    <li>For CAT1 (max 15): "12/15" → 12, "80%" → 12, "14" → 14</li>
                    <li>For EXAM (max 50): "45/50" → 45, "90%" → 45, "48" → 48</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-sliders-h"></i> Dynamic CAT Columns</h3>
                <p>You can now customize the CAT columns for each table:</p>
                <ul>
                    <li><strong>Add CAT Columns:</strong> Use the "Add CAT Column" button to create new assessment columns</li>
                    <li><strong>Set Maximum Scores:</strong> Define the maximum score for each CAT column</li>
                    <li><strong>Edit CAT Columns:</strong> Click the edit button to change a CAT column's name or maximum score</li>
                    <li><strong>Delete CAT Columns:</strong> Remove CAT columns you no longer need</li>
                </ul>
                <p><strong>Note:</strong> When you delete a CAT column, all marks for that column will be permanently removed.</p>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-database"></i> Data Management</h3>
                <ul>
                    <li><strong>Automatic Saving:</strong> All changes are automatically saved to your browser's storage.</li>
                    <li><strong>Export Data:</strong> Download all your data as a JSON file for backup or transfer.</li>
                    <li><strong>Import Data:</strong> Merge data from JSON files with your existing data:
                        <ul>
                            <li>Tables with the same name will be merged (students updated/added)</li>
                            <li>New tables will be added to your existing data</li>
                            <li>Student records with the same name will be updated</li>
                        </ul>
                    </li>
                    <li><strong>Clear Data:</strong> Remove all tables and start fresh (use with caution!).</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-chart-line"></i> Statistics & Reports</h3>
                <ul>
                    <li><strong>Statistics View:</strong> See an overview of all students across all tables with their total scores and positions.</li>
                    <li><strong>Terminal Reports:</strong> Click on any student name in the statistics view to generate a detailed report card.</li>
                    <li><strong>Print Reports:</strong> Generate professional A4-sized reports for parent meetings or student records.</li>
                    <li><strong>Automatic Calculations:</strong> CAT totals, overall scores, and positions are calculated automatically.</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-print"></i> Printing</h3>
                <ul>
                    <li><strong>Table Printing:</strong> Print individual class tables using the print button on each table.</li>
                    <li><strong>Report Printing:</strong> Generate and print professional terminal reports for students.</li>
                    <li><strong>A4 Optimization:</strong> All print outputs are optimized for standard A4 paper size.</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-graduation-cap"></i> Grading System</h3>
                <ul>
                    <li><strong>CAT Marks:</strong> Each CAT column has its own maximum score that you define</li>
                    <li><strong>Exam Marks:</strong> Maximum of 50 marks per subject</li>
                    <li><strong>Total Calculation:</strong> CAT Total + Exam = Subject Total (out of 100)</li>
                    <li><strong>Automatic Remarks:</strong>
                        <ul>
                            <li>Distinction: 90% and above</li>
                            <li>Excellent: 80% - 89%</li>
                            <li>Very Good: 70% - 79%</li>
                            <li>Good: 60% - 69%</li>
                            <li>Pass: 50% - 59%</li>
                            <li>Fail: Below 50%</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-lightbulb"></i> Tips & Best Practices</h3>
                <ul>
                    <li>Use descriptive table names (e.g., "Mathematics Grade 7" instead of "Class 1")</li>
                    <li>Regularly export your data as backup</li>
                    <li>Use the statistics view to identify students who need extra help</li>
                    <li>Add personalized comments in terminal reports for better parent communication</li>
                    <li>Use the clone feature to create similar classes with the same student roster</li>
                    <li>Take advantage of flexible mark input to enter marks in your preferred format</li>
                    <li>Customize CAT columns to match your school's assessment structure</li>
                    <li>Sign in to save your data in the cloud and access it from anywhere</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-cogs"></i> Technical Information</h3>
                <ul>
                    <li>This app works entirely in your browser - no server required</li>
                    <li>Data is stored locally in your browser's storage</li>
                    <li>Cloud data is stored securely in Firebase</li>
                    <li>Works offline once loaded</li>
                    <li>Compatible with modern browsers (Chrome, Firefox, Safari, Edge)</li>
                    <li>Responsive design works on desktop, tablet, and mobile devices</li>
                    <li>Version: ${VERSION}</li>
                </ul>
            </div>
        `;
    }
    
    // ===== Utility Methods =====
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts when user is editing content
        if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + N: Add new table
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.addNewTable();
        }
        
        // Ctrl/Cmd + S: Save data
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveData();
            this.showToast('Data saved', 'success');
        }
        
        // Ctrl/Cmd + E: Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            this.exportData();
        }
        
        // Ctrl/Cmd + I: Import data
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            this.fileInput.click();
        }
        
        // Ctrl/Cmd + L: Load from cloud
        if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !this.isGuest) {
            e.preventDefault();
            this.loadFromFirebase();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                this.closeModal(activeModal);
            }
        }
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the application
    window.app = new StudentResultsManager();
    
    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // Don't show alert for all errors, just log them
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});