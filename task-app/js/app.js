// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app...');
    
    // Initialize managers in correct order
    AuthManager.init();
    UIManager.init();
    
    // Initialize ImportExportManager after a short delay to ensure DOM is ready
    setTimeout(() => {
        ImportExportManager.init();
        console.log('Import/Export Manager initialized');
    }, 500);
    
    // Check if user is already logged in
    const user = auth.currentUser;
    
    // Focus on the first input field
    if (!user) {
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.focus();
    } else {
        const todoInput = document.getElementById('todoInput');
        if (todoInput) todoInput.focus();
    }
    
    console.log('Todo App with Import/Export Initialized Successfully');
});

// Reinitialize import/export when user logs in
if (typeof AuthManager !== 'undefined') {
    // Store original handleUserSignedIn if it exists
    const originalHandleUserSignedIn = AuthManager.handleUserSignedIn;
    
    AuthManager.handleUserSignedIn = function(user) {
        // Call original function
        if (originalHandleUserSignedIn) {
            originalHandleUserSignedIn.call(this, user);
        }
        
        // Reinitialize import/export buttons
        setTimeout(() => {
            if (typeof ImportExportManager !== 'undefined' && ImportExportManager.reinitialize) {
                ImportExportManager.reinitialize();
                console.log('Reinitialized Import/Export for logged in user');
            }
        }, 1000);
    };
}