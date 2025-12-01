// auth.js
// Firebase Authentication functions for user management

// Toggle between login and register forms
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearAuthErrors();
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearAuthErrors();
}

// Clear error messages
function clearAuthErrors() {
    document.getElementById('auth-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}

// Register new user with email and password
async function registerUser() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Validation
    if (password !== confirmPassword) {
        document.getElementById('register-error').textContent = 'Passwords do not match!';
        return;
    }
    
    if (password.length < 6) {
        document.getElementById('register-error').textContent = 'Password must be at least 6 characters!';
        return;
    }
    
    try {
        // Firebase createUserWithEmailAndPassword method [citation:2]
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('User registered:', user.uid);
        
        // Create user data structure in Realtime Database
        await database.ref('users/' + user.uid).set({
            email: email,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            notesCount: 0
        });
        
        // Redirect to main app
        window.location.href = 'index.html';
        
    } catch (error) {
        // Handle Firebase authentication errors
        let errorMessage = 'Registration failed! ';
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'Email already exists.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage += 'Email/password accounts are not enabled.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Password is too weak.';
                break;
            default:
                errorMessage += error.message;
        }
        document.getElementById('register-error').textContent = errorMessage;
    }
}

// Login existing user
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // Firebase signInWithEmailAndPassword method [citation:2]
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('User logged in:', user.uid);
        
        // Redirect to main app
        window.location.href = 'index.html';
        
    } catch (error) {
        let errorMessage = 'Login failed! ';
        switch(error.code) {
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage += 'Account has been disabled.';
                break;
            case 'auth/user-not-found':
                errorMessage += 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Incorrect password.';
                break;
            default:
                errorMessage += error.message;
        }
        document.getElementById('auth-error').textContent = errorMessage;
    }
}

// Logout function (used in main app)
function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Check authentication state on page load [citation:2]
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is authenticated:', user.uid);
        
        // If on login page, redirect to main app
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // User is signed out
        console.log('User is not authenticated');
        
        // If on main app page, redirect to login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});