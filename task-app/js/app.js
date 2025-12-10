// Main Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const firebaseServices = FirebaseConfig.initialize();
    
    if (!firebaseServices) {
        console.error('Failed to initialize Firebase');
        UIManager.showNotification('Failed to initialize app. Please refresh.', 'error');
        return;
    }

    // Initialize utilities
    Utils.cacheElements();
    
    // Initialize UI Manager
    UIManager.init();
    
    // Initialize Auth Manager
    AuthManager.init(firebaseServices);
    
    // Check if user is already logged in
    if (firebaseServices.auth.currentUser) {
        // Focus on todo input if user is logged in
        Utils.elements.todoInput.focus();
    } else {
        // Focus on login email field
        document.getElementById('loginEmail').focus();
    }

    // Export/Import functionality (optional enhancement)
    this.setupExportImport();
});

// Optional: Export/Import functionality
function setupExportImport() {
    // You can add export/import buttons to the UI and implement these functions
    /*
    document.getElementById('exportBtn').addEventListener('click', () => {
        const data = TodoManager.exportTodos();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const text = await file.text();
            const success = await TodoManager.importTodos(text);
            if (success) {
                UIManager.showNotification('Todos imported successfully', 'success');
            } else {
                UIManager.showNotification('Failed to import todos', 'error');
            }
        };
        input.click();
    });
    */
}

// Service worker registration (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
            registration => {
                console.log('ServiceWorker registration successful');
            },
            err => {
                console.log('ServiceWorker registration failed: ', err);
            }
        );
    });
}