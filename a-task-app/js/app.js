// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    AuthManager.init();
    UIManager.init();
    
    // Check if user is already logged in
    const user = auth.currentUser;
    
    // Focus on the first input field
    if (!user) {
        document.getElementById('loginEmail').focus();
    } else {
        document.getElementById('todoInput').focus();
    }
    
    // Log initialization
    console.log('Todo App Initialized Successfully');
});