// Authentication Manager
const AuthManager = {
    auth: null,
    db: null,
    fieldValue: null,

    init(firebaseServices) {
        if (!firebaseServices) return;
        this.auth = firebaseServices.auth;
        this.db = firebaseServices.db;
        this.fieldValue = FirebaseConfig.getFirestoreFieldValue();
        this.setupEventListeners();
        this.setupAuthStateListener();
    },

    setupEventListeners() {
        // Toggle between login and register views
        document.getElementById('showRegister').addEventListener('click', () => {
            this.showView('register');
        });
        
        document.getElementById('showLogin').addEventListener('click', () => {
            this.showView('login');
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    },

    showView(view) {
        const loginView = document.getElementById('loginView');
        const registerView = document.getElementById('registerView');
        
        if (view === 'register') {
            loginView.style.display = 'none';
            registerView.style.display = 'block';
            this.clearAuthErrors();
        } else {
            registerView.style.display = 'none';
            loginView.style.display = 'block';
            this.clearAuthErrors();
        }
    },

    clearAuthErrors() {
        const authError = document.getElementById('authError');
        const registerError = document.getElementById('registerError');
        
        authError.textContent = '';
        authError.classList.remove('show');
        registerError.textContent = '';
        registerError.classList.remove('show');
    },

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorElement = document.getElementById('authError');

        if (!Utils.validateEmail(email)) {
            this.showAuthError('Please enter a valid email address', errorElement);
            return;
        }

        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            this.clearAuthErrors();
        } catch (error) {
            this.handleAuthError(error, errorElement);
        }
    },

    async handleRegister() {
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const errorElement = document.getElementById('registerError');

        // Validation
        if (!Utils.validateEmail(email)) {
            this.showAuthError('Please enter a valid email address', errorElement);
            return;
        }

        if (password !== confirmPassword) {
            this.showAuthError('Passwords do not match', errorElement);
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters', errorElement);
            return;
        }

        try {
            await this.auth.createUserWithEmailAndPassword(email, password);
            this.clearAuthErrors();
            UIManager.showNotification('Account created successfully!', 'success');
        } catch (error) {
            this.handleAuthError(error, errorElement);
        }
    },

    async handleLogout() {
        try {
            await this.auth.signOut();
            UIManager.showNotification('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            UIManager.showNotification('Error logging out', 'error');
        }
    },

    showAuthError(message, errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    },

    handleAuthError(error, errorElement) {
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'This email is already in use',
            'auth/weak-password': 'Password is too weak',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/too-many-requests': 'Too many requests. Please try again later',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled'
        };

        const message = errorMessages[error.code] || 'An error occurred. Please try again.';
        this.showAuthError(message, errorElement);
    },

    setupAuthStateListener() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.handleUserSignedIn(user);
            } else {
                this.handleUserSignedOut();
            }
        });
    },

    handleUserSignedIn(user) {
        UIManager.updateUserEmail(user.email);
        UIManager.showApp();
        
        // Initialize todos for the user
        TodoManager.init(this.db, user.uid);
        
        UIManager.showNotification(`Welcome back, ${user.email.split('@')[0]}!`, 'success');
    },

    handleUserSignedOut() {
        // Clean up todos listener
        TodoManager.cleanup();
        
        // Reset UI
        UIManager.hideApp();
        UIManager.resetForms();
        
        // Clear auth errors
        this.clearAuthErrors();
        
        // Show login view
        this.showView('login');
    }
};