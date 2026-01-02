// Firebase references
let auth, db;
let firebaseModules;

// Current state
let currentUser = null;
let schedules = { female: [], male: [] };
let displaySettings = {
    female: { showNames: true, showCongregation: true, showNumber: true },
    male: { showNames: true, showCongregation: true, showNumber: true }
};

// DOM Elements
let loginContainer, adminContainer;
let currentEditingEntry = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Get Firebase references from window
    auth = window.firebaseAuth;
    db = window.firebaseDb;
    firebaseModules = window.firebaseModules;
    
    // Get DOM elements
    loginContainer = document.getElementById('login-container');
    adminContainer = document.getElementById('admin-container');
    
    // Check authentication state
    firebaseModules.onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showAdminPanel();
            initAdminApp();
        } else {
            showLogin();
        }
    });
    
    // Initialize login form
    initLoginForm();
    
    // Initialize admin app components
    initTabs();
    initModals();
    initButtons();
    
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
});

// Login functions
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await firebaseModules.signInWithEmailAndPassword(auth, email, password);
            showToast('Login successful!');
        } catch (error) {
            errorElement.textContent = getFirebaseErrorMessage(error);
            errorElement.style.display = 'block';
            console.error('Login error:', error);
        }
    });
}

function showLogin() {
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
}

function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
}

// Admin app initialization
async function initAdminApp() {
    await loadDisplaySettings();
    await loadSchedules();
    setupRealTimeListeners();
}

async function loadDisplaySettings() {
    try {
        const settingsRef = firebaseModules.collection(db, 'displaySettings');
        const snapshot = await firebaseModules.getDocs(settingsRef);
        
        if (!snapshot.empty) {
            const settingsDoc = snapshot.docs[0];
            const data = settingsDoc.data();
            displaySettings = data;
        }
        
        // Update checkboxes
        updateDisplayCheckboxes();
    } catch (error) {
        console.error('Error loading display settings:', error);
        showToast('Error loading display settings', 'error');
    }
}

function updateDisplayCheckboxes() {
    document.getElementById('show-female-names').checked = displaySettings.female.showNames;
    document.getElementById('show-female-congregation').checked = displaySettings.female.showCongregation;
    document.getElementById('show-female-number').checked = displaySettings.female.showNumber;
    
    document.getElementById('show-male-names').checked = displaySettings.male.showNames;
    document.getElementById('show-male-congregation').checked = displaySettings.male.showCongregation;
    document.getElementById('show-male-number').checked = displaySettings.male.showNumber;
}

async function loadSchedules() {
    try {
        const schedulesRef = firebaseModules.collection(db, 'schedules');
        const q = firebaseModules.query(schedulesRef, firebaseModules.orderBy('timeSlot'));
        const snapshot = await firebaseModules.getDocs(q);
        
        schedules = { female: [], male: [] };
        
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            schedules[data.gender].push(data);
        });
        
        renderSchedules();
    } catch (error) {
        console.error('Error loading schedules:', error);
        showToast('Error loading schedules', 'error');
    }
}

function setupRealTimeListeners() {
    // Listen for schedule changes
    const schedulesRef = firebaseModules.collection(db, 'schedules');
    const q = firebaseModules.query(schedulesRef, firebaseModules.orderBy('timeSlot'));
    
    firebaseModules.onSnapshot(q, (snapshot) => {
        schedules = { female: [], male: [] };
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            schedules[data.gender].push(data);
        });
        renderSchedules();
    });
    
    // Listen for display settings changes
    const settingsRef = firebaseModules.collection(db, 'displaySettings');
    firebaseModules.onSnapshot(settingsRef, (snapshot) => {
        if (!snapshot.empty) {
            const settingsDoc = snapshot.docs[0];
            displaySettings = settingsDoc.data();
            updateDisplayCheckboxes();
        }
    });
}

// Rendering functions
function renderSchedules() {
    renderGenderSchedule('female');
    renderGenderSchedule('male');
}

function renderGenderSchedule(gender) {
    const tableBody = document.getElementById(`${gender}-schedule-body`);
    const genderData = schedules[gender];
    
    tableBody.innerHTML = '';
    
    if (genderData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--secondary-color)">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No schedule entries yet. Click "Add Entry" to create one.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    genderData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.timeSlot}</td>
            <td>${entry.name1 || ''}</td>
            <td>${entry.congregation1 || ''}</td>
            <td>${entry.number1 || ''}</td>
            <td>${entry.name2 || ''}</td>
            <td>${entry.congregation2 || ''}</td>
            <td>${entry.number2 || ''}</td>
            <td class="actions">
                <button class="action-btn edit" onclick="editEntry('${gender}', '${entry.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete" onclick="deleteEntry('${gender}', '${entry.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Tab management
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                    
                    // Special handling for import/export tab
                    if (tabId === 'import-export') {
                        updateExportPreview();
                    }
                }
            });
        });
    });
}

// Modal management
function initModals() {
    // Entry modal
    const entryModal = document.getElementById('entry-modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    const entryForm = document.getElementById('entry-form');
    
    // Open modal for adding female entry
    document.getElementById('add-female-entry').addEventListener('click', () => {
        openEntryModal('female');
    });
    
    // Open modal for adding male entry
    document.getElementById('add-male-entry').addEventListener('click', () => {
        openEntryModal('male');
    });
    
    // Close modal
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            entryModal.classList.remove('active');
            document.getElementById('password-modal').classList.remove('active');
            currentEditingEntry = null;
            entryForm.reset();
        });
    });
    
    // Submit entry form
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEntry();
    });
    
    // Save display settings
    document.getElementById('save-display-settings').addEventListener('click', saveDisplaySettings);
    
    // Import/Export
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', handleFileSelect);
    document.getElementById('import-data').addEventListener('click', importData);
    
    // Password change
    document.getElementById('change-password-btn').addEventListener('click', () => {
        document.getElementById('password-modal').classList.add('active');
    });
    
    document.getElementById('password-form').addEventListener('submit', changePassword);
    document.getElementById('logout-btn').addEventListener('click', logout);
}

function openEntryModal(gender, entryId = null) {
    const modal = document.getElementById('entry-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('entry-form');
    
    currentEditingEntry = entryId;
    document.getElementById('entry-gender').value = gender;
    
    if (entryId) {
        title.textContent = 'Edit Schedule Entry';
        const entry = schedules[gender].find(e => e.id === entryId);
        if (entry) {
            document.getElementById('entry-id').value = entryId;
            document.getElementById('time-slot').value = entry.timeSlot || '';
            document.getElementById('name1').value = entry.name1 || '';
            document.getElementById('congregation1').value = entry.congregation1 || '';
            document.getElementById('number1').value = entry.number1 || '';
            document.getElementById('name2').value = entry.name2 || '';
            document.getElementById('congregation2').value = entry.congregation2 || '';
            document.getElementById('number2').value = entry.number2 || '';
        }
    } else {
        title.textContent = `Add ${gender === 'female' ? 'Female' : 'Male'} Schedule Entry`;
        form.reset();
        document.getElementById('entry-id').value = '';
    }
    
    modal.classList.add('active');
}

async function saveEntry() {
    try {
        const gender = document.getElementById('entry-gender').value;
        const entryId = document.getElementById('entry-id').value;
        
        const entryData = {
            gender,
            timeSlot: document.getElementById('time-slot').value,
            name1: document.getElementById('name1').value,
            congregation1: document.getElementById('congregation1').value,
            number1: document.getElementById('number1').value,
            name2: document.getElementById('name2').value || '',
            congregation2: document.getElementById('congregation2').value || '',
            number2: document.getElementById('number2').value || '',
            updatedAt: new Date().toISOString()
        };
        
        // Validate time slot format
        if (!validateTimeSlot(entryData.timeSlot)) {
            showToast('Please enter time slot in format: "9:30 – 10:00"', 'error');
            return;
        }
        
        if (entryId) {
            // Update existing entry
            const entryRef = firebaseModules.doc(db, 'schedules', entryId);
            await firebaseModules.updateDoc(entryRef, entryData);
            showToast('Entry updated successfully!');
        } else {
            // Create new entry
            await firebaseModules.addDoc(firebaseModules.collection(db, 'schedules'), entryData);
            showToast('Entry added successfully!');
        }
        
        document.getElementById('entry-modal').classList.remove('active');
        document.getElementById('entry-form').reset();
        currentEditingEntry = null;
    } catch (error) {
        console.error('Error saving entry:', error);
        showToast('Error saving entry', 'error');
    }
}

function validateTimeSlot(timeSlot) {
    // Validate format like "9:30 – 10:00"
    const timeSlotRegex = /^\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}$/;
    return timeSlotRegex.test(timeSlot);
}

function editEntry(gender, entryId) {
    openEntryModal(gender, entryId);
}

async function deleteEntry(gender, entryId) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
        const entryRef = firebaseModules.doc(db, 'schedules', entryId);
        await firebaseModules.deleteDoc(entryRef);
        showToast('Entry deleted successfully!');
    } catch (error) {
        console.error('Error deleting entry:', error);
        showToast('Error deleting entry', 'error');
    }
}

// Display settings
async function saveDisplaySettings() {
    try {
        const newSettings = {
            female: {
                showNames: document.getElementById('show-female-names').checked,
                showCongregation: document.getElementById('show-female-congregation').checked,
                showNumber: document.getElementById('show-female-number').checked
            },
            male: {
                showNames: document.getElementById('show-male-names').checked,
                showCongregation: document.getElementById('show-male-congregation').checked,
                showNumber: document.getElementById('show-male-number').checked
            }
        };
        
        const settingsRef = firebaseModules.collection(db, 'displaySettings');
        const snapshot = await firebaseModules.getDocs(settingsRef);
        
        if (snapshot.empty) {
            await firebaseModules.addDoc(settingsRef, newSettings);
        } else {
            const settingsDoc = snapshot.docs[0];
            await firebaseModules.updateDoc(firebaseModules.doc(db, 'displaySettings', settingsDoc.id), newSettings);
        }
        
        displaySettings = newSettings;
        showToast('Display settings saved!');
    } catch (error) {
        console.error('Error saving display settings:', error);
        showToast('Error saving display settings', 'error');
    }
}

// Import/Export functions
function updateExportPreview() {
    const preview = document.getElementById('export-preview');
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        schedules: schedules,
        displaySettings: displaySettings
    };
    preview.textContent = JSON.stringify(exportData, null, 2);
}

async function exportData() {
    try {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            schedules: schedules,
            displaySettings: displaySettings
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedule-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Error exporting data', 'error');
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileName = document.getElementById('file-name');
    const importButton = document.getElementById('import-data');
    
    if (file) {
        fileName.textContent = file.name;
        importButton.disabled = false;
    } else {
        fileName.textContent = 'No file chosen';
        importButton.disabled = true;
    }
}

async function importData() {
    const fileInput = document.getElementById('import-file');
    const importButton = document.getElementById('import-data');
    
    if (!fileInput.files.length) {
        showToast('Please select a file first', 'error');
        return;
    }
    
    if (!confirm('This will overwrite all existing schedule data. Are you sure?')) {
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            importButton.disabled = true;
            importButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
            
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.schedules || !data.displaySettings) {
                throw new Error('Invalid file format');
            }
            
            // Import schedules
            const batch = firebaseModules.writeBatch(db);
            const schedulesRef = firebaseModules.collection(db, 'schedules');
            
            // Delete existing schedules
            const existingSchedules = await firebaseModules.getDocs(schedulesRef);
            existingSchedules.forEach(doc => {
                batch.delete(firebaseModules.doc(db, 'schedules', doc.id));
            });
            
            // Add new schedules
            Object.entries(data.schedules).forEach(([gender, entries]) => {
                entries.forEach(entry => {
                    const { id, ...entryData } = entry;
                    const docRef = firebaseModules.doc(schedulesRef);
                    batch.set(docRef, entryData);
                });
            });
            
            // Update display settings
            const settingsRef = firebaseModules.collection(db, 'displaySettings');
            const settingsSnapshot = await firebaseModules.getDocs(settingsRef);
            
            if (settingsSnapshot.empty) {
                batch.set(firebaseModules.doc(settingsRef), data.displaySettings);
            } else {
                const settingsDoc = settingsSnapshot.docs[0];
                batch.update(firebaseModules.doc(db, 'displaySettings', settingsDoc.id), data.displaySettings);
            }
            
            await batch.commit();
            
            // Reset form
            fileInput.value = '';
            document.getElementById('file-name').textContent = 'No file chosen';
            
            showToast('Data imported successfully!');
            updateExportPreview();
        } catch (error) {
            console.error('Error importing data:', error);
            showToast('Error importing data: ' + error.message, 'error');
        } finally {
            importButton.disabled = false;
            importButton.innerHTML = '<i class="fas fa-upload"></i> Import Data';
        }
    };
    
    reader.onerror = () => {
        showToast('Error reading file', 'error');
        importButton.disabled = false;
        importButton.innerHTML = '<i class="fas fa-upload"></i> Import Data';
    };
    
    reader.readAsText(file);
}

// Password functions
async function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('password-error');
    
    errorElement.style.display = 'none';
    
    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'New passwords do not match';
        errorElement.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        errorElement.style.display = 'block';
        return;
    }
    
    try {
        // Re-authenticate user
        const credential = firebaseModules.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        await firebaseModules.reauthenticateWithCredential(currentUser, credential);
        await firebaseModules.updatePassword(currentUser, newPassword);
        
        showToast('Password changed successfully!');
        document.getElementById('password-modal').classList.remove('active');
        document.getElementById('password-form').reset();
    } catch (error) {
        errorElement.textContent = getFirebaseErrorMessage(error);
        errorElement.style.display = 'block';
        console.error('Error changing password:', error);
    }
}

async function logout() {
    try {
        await firebaseModules.signOut(auth);
        showToast('Logged out successfully');
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Utility functions
function updateCurrentTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('current-time').textContent = now.toLocaleDateString('en-US', options);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-disabled':
            return 'Account has been disabled';
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/requires-recent-login':
            return 'Please log in again to change your password';
        default:
            return error.message || 'An error occurred';
    }
}

// Make functions available globally for onclick handlers
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;