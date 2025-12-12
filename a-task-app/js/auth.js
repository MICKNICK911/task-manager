// Authentication Manager
const AuthManager = {
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    },

    // Clear auth errors
    clearAuthErrors() {
        document.getElementById('authError').textContent = '';
        document.getElementById('authError').classList.remove('show');
        document.getElementById('registerError').textContent = '';
        document.getElementById('registerError').classList.remove('show');
    },

    // Handle auth errors
    handleAuthError(error, errorElement) {
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already in use';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many requests. Please try again later';
                break;
        }
        
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    },

    // Toggle between login and register views
    setupViewToggle() {
        document.getElementById('showRegister').addEventListener('click', () => {
            document.getElementById('loginView').style.display = 'none';
            document.getElementById('registerView').style.display = 'block';
            this.clearAuthErrors();
        });
        
        document.getElementById('showLogin').addEventListener('click', () => {
            document.getElementById('registerView').style.display = 'none';
            document.getElementById('loginView').style.display = 'block';
            this.clearAuthErrors();
        });
    },

    // Handle login
    setupLogin() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorElement = document.getElementById('authError');
            
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    this.clearAuthErrors();
                })
                .catch((error) => {
                    this.handleAuthError(error, errorElement);
                });
        });
    },

    // Handle registration
    setupRegistration() {
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const errorElement = document.getElementById('registerError');
            
            // Validation
            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.classList.add('show');
                return;
            }
            
            if (password.length < 6) {
                errorElement.textContent = 'Password must be at least 6 characters';
                errorElement.classList.add('show');
                return;
            }
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    this.clearAuthErrors();
                    this.showNotification('Account created successfully!', 'success');
                })
                .catch((error) => {
                    this.handleAuthError(error, errorElement);
                });
        });
    },

    // Handle logout
    setupLogout() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    this.showNotification('Logged out successfully', 'info');
                })
                .catch((error) => {
                    console.error('Logout error:', error);
                    this.showNotification('Error logging out', 'error');
                });
        });
    },

    // Setup auth state listener
    setupAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                document.getElementById('userEmail').textContent = user.email;
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('appContainer').classList.add('active');
                
                // Initialize todos for this user
                TodoManager.init(user.uid);
                
                this.showNotification(`Welcome back, ${user.email.split('@')[0]}!`, 'success');
                
            } else {
                // User is signed out
                TodoManager.cleanup();
                
                document.getElementById('authContainer').style.display = 'flex';
                document.getElementById('appContainer').classList.remove('active');
                
                // Reset forms
                document.getElementById('loginForm').reset();
                document.getElementById('registerForm').reset();
                this.clearAuthErrors();
                
                // Show login view by default
                document.getElementById('loginView').style.display = 'block';
                document.getElementById('registerView').style.display = 'none';
            }
        });
    },

    // Initialize auth manager
    init() {
        this.setupViewToggle();
        this.setupLogin();
        this.setupRegistration();
        this.setupLogout();
        this.setupAuthStateListener();
    }
};