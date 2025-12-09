// ===== Firebase Configuration =====
// Use the SAME configuration as your main app
const firebaseConfig = {
            apiKey: "AIzaSyBIuRj51fQUCNREMT3JEZAyWjl7TsBU_08",
            authDomain: "my-task-manager-c8e32.firebaseapp.com",
            projectId: "my-task-manager-c8e32",
            storageBucket: "my-task-manager-c8e32.firebasestorage.app",
            messagingSenderId: "182865686068",
            appId: "1:182865686068:web:ef8716eb8edcc7749c6461"
        };

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch((err) => {
    console.warn('Firebase persistence failed:', err.code);
});

// ===== Constants and Configuration =====
const STORAGE_KEY_PREFIX = 'admin_results_';
const FIREBASE_COLLECTION = 'student_results';
const ADMIN_COLLECTION = 'admins';
const ACTIVITY_LOG_COLLECTION = 'admin_logs';
const VERSION = '3.0';

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

// ===== Core Admin Application Class =====
class AdminResultsManager {
    constructor() {
        this.tables = [];
        this.tableCounter = 1;
        this.saveTimeout = null;
        this.confirmCallback = null;
        this.adminConfirmCallback = null;
        this.currentUser = null;
        this.currentManagedUserId = null;
        this.currentManagedUserEmail = null;
        this.isAdmin = false;
        this.isOnline = navigator.onLine;
        this.adminSessionId = this.generateSessionId();
        this.allUsers = [];
        this.activityLog = [];
        this.lastSyncTime = null;
        
        this.initializeApp();
    }
    
    generateSessionId() {
        return 'admin-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    initializeApp() {
        this.setupDOMReferences();
        this.setupEventListeners();
        this.setupNetworkListener();
        this.setCurrentYear();
        this.setupFirebaseAuth();
        this.updateAdminSessionDisplay();
    }
    
    setupDOMReferences() {
        // Login screen
        this.loginScreen = document.getElementById('loginScreen');
        this.mainApp = document.getElementById('mainApp');
        
        // Login form elements
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.loginBtn = document.getElementById('loginBtn');
        
        // User info elements
        this.userAvatar = document.getElementById('userAvatar');
        this.userEmail = document.getElementById('userEmail');
        this.syncStatus = document.getElementById('syncStatus');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.userType = document.getElementById('userType');
        this.adminSessionIdElement = document.getElementById('adminSessionId');
        
        // Admin controls
        this.userSelect = document.getElementById('userSelect');
        this.currentManagedUser = document.getElementById('currentManagedUser');
        
        // Admin stats
        this.totalUsers = document.getElementById('totalUsers');
        this.totalTables = document.getElementById('totalTables');
        this.totalStudents = document.getElementById('totalStudents');
        this.lastUpdated = document.getElementById('lastUpdated');
        
        // Activity log
        this.activityLogElement = document.getElementById('activityLog');
        
        // Main app elements
        this.tablesContainer = document.getElementById('tablesContainer');
        this.emptyState = document.getElementById('emptyState');
        this.addTableBtn = document.getElementById('addTableBtn');
        this.importBtn = document.getElementById('importBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.statisticsBtn = document.getElementById('statisticsBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // File input
        this.fileInput = document.getElementById('fileInput');
        
        // Status indicators
        this.saveStatus = document.getElementById('saveStatus');
        this.lastSaved = document.getElementById('lastSaved');
        
        // Modals
        this.statisticsModal = document.getElementById('statisticsModal');
        this.terminalReportModal = document.getElementById('terminalReportModal');
        this.helpModal = document.getElementById('helpModal');
        this.adminConfirmModal = document.getElementById('adminConfirmModal');
        this.userDetailsModal = document.getElementById('userDetailsModal');
        
        // Modal containers
        this.statisticsContainer = document.getElementById('statisticsContainer');
        this.terminalReportContainer = document.getElementById('terminalReportContainer');
        this.helpContainer = document.getElementById('helpContainer');
        this.userDetailsContainer = document.getElementById('userDetailsContainer');
        
        // Confirmation modal elements
        this.adminConfirmTitle = document.getElementById('adminConfirmTitle');
        this.adminConfirmMessage = document.getElementById('adminConfirmMessage');
        this.adminConfirmOk = document.getElementById('adminConfirmOk');
        this.adminConfirmCancel = document.getElementById('adminConfirmCancel');
        
        // Notification toast
        this.notificationToast = document.getElementById('notificationToast');
        this.toastMessage = document.getElementById('toastMessage');
        this.toastClose = document.querySelector('.toast-close');
    }
    
    setupEventListeners() {
        // Login events
        this.loginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // User selection
        this.userSelect.addEventListener('change', (e) => this.handleUserSelection(e));
        
        // Main app events
        this.addTableBtn.addEventListener('click', () => this.addNewTable());
        this.importBtn.addEventListener('click', () => this.fileInput.click());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.statisticsBtn.addEventListener('click', () => this.showStatistics());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
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
        
        // Admin confirmation modal
        this.adminConfirmOk.addEventListener('click', () => {
            if (this.adminConfirmCallback) {
                this.adminConfirmCallback();
                this.adminConfirmCallback = null;
            }
            this.closeModal(this.adminConfirmModal);
        });
        
        this.adminConfirmCancel.addEventListener('click', () => {
            this.adminConfirmCallback = null;
            this.closeModal(this.adminConfirmModal);
        });
        
        // Notification toast
        this.toastClose.addEventListener('click', () => this.hideToast());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-save on user change warning
        window.addEventListener('beforeunload', (e) => {
            if (this.tables.length > 0 && this.currentManagedUserId) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }
    
    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
            this.showToast('Back online', 'success');
            this.loadAllUsers();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
            this.showToast('You are offline', 'warning');
        });
        
        this.updateConnectionStatus();
    }
    
    setupFirebaseAuth() {
        // Check for remembered admin login
        const rememberedAdmin = localStorage.getItem('adminRememberedEmail');
        if (rememberedAdmin && this.emailInput) {
            this.emailInput.value = rememberedAdmin;
        }
        
        // Set up auth state listener
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in - check if admin
                this.currentUser = user;
                const isAdmin = await this.checkAdminStatus(user.uid);
                
                if (isAdmin) {
                    this.isAdmin = true;
                    this.handleAdminLoginSuccess(user);
                } else {
                    // Not an admin - log them out
                    this.showToast('Access denied: Administrator privileges required', 'error');
                    await auth.signOut();
                    this.showLoginScreen();
                }
            } else {
                // User is signed out
                this.showLoginScreen();
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            this.showToast('Authentication error', 'error');
        });
    }
    
    async checkAdminStatus(userId) {
        try {
            const adminDoc = await db.collection(ADMIN_COLLECTION).doc(userId).get();
            return adminDoc.exists;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
    
    // ===== Authentication Methods =====
    async handleAdminLogin(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
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
            
            // Check if this user is an admin
            const isAdmin = await this.checkAdminStatus(userCredential.user.uid);
            
            if (!isAdmin) {
                await auth.signOut();
                throw new Error('Not an administrator');
            }
            
            // Remember admin email
            localStorage.setItem('adminRememberedEmail', email);
            
            this.showToast('Admin login successful', 'success');
            
        } catch (error) {
            console.error('Admin login error:', error);
            let message = 'Login failed';
            
            switch (error.code || error.message) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    message = 'Invalid credentials';
                    break;
                case 'auth/user-disabled':
                    message = 'Account disabled';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Try again later';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error';
                    break;
                case 'Not an administrator':
                    message = 'Administrator privileges required';
                    break;
                default:
                    message = 'Login failed';
            }
            
            this.showToast(message, 'error');
        } finally {
            this.setLoadingState(this.loginBtn, false);
        }
    }
    
    handleAdminLoginSuccess(user) {
        // Update UI
        this.userEmail.textContent = user.email;
        this.userType.textContent = 'Administrator';
        this.userType.className = 'authenticated';
        
        // Update avatar with admin badge
        const initials = user.email ? user.email.charAt(0).toUpperCase() : 'A';
        this.userAvatar.innerHTML = `<span>${initials}</span><i class="fas fa-shield-alt" style="position: absolute; bottom: -5px; right: -5px; font-size: 12px; background: white; border-radius: 50%; padding: 2px;"></i>`;
        
        // Show main app
        this.showMainApp();
        
        // Load all users and initialize
        this.initializeAdminDashboard();
    }
    
    async initializeAdminDashboard() {
        // Load all users
        await this.loadAllUsers();
        
        // Load admin activity log
        await this.loadActivityLog();
        
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Setup auto-refresh every 30 seconds
        setInterval(() => {
            if (this.isOnline) {
                this.loadAllUsers();
            }
        }, 30000);
    }
    
    async loadAllUsers() {
        try {
            const snapshot = await db.collection(FIREBASE_COLLECTION).get();
            this.allUsers = [];
            
            snapshot.forEach(doc => {
                const userData = doc.data();
                this.allUsers.push({
                    id: doc.id,
                    email: userData.email || 'Unknown User',
                    tableCount: userData.tables ? userData.tables.length : 0,
                    studentCount: this.calculateTotalStudents(userData.tables),
                    lastUpdated: userData.lastUpdated || userData.updatedAt || 'Never',
                    data: userData
                });
            });
            
            // Sort by email
            this.allUsers.sort((a, b) => a.email.localeCompare(b.email));
            
            this.populateUserDropdown();
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Failed to load users', 'error');
        }
    }
    
    calculateTotalStudents(tables) {
        if (!tables) return 0;
        return tables.reduce((total, table) => total + (table.students ? table.students.length : 0), 0);
    }
    
    populateUserDropdown() {
        this.userSelect.innerHTML = '<option value="">-- Select a user to manage --</option>';
        
        this.allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.email} (${user.tableCount} tables, ${user.studentCount} students)`;
            this.userSelect.appendChild(option);
        });
        
        // If we have a previously selected user, try to restore it
        const lastSelected = localStorage.getItem('lastSelectedUser');
        if (lastSelected && this.allUsers.some(u => u.id === lastSelected)) {
            this.userSelect.value = lastSelected;
            this.handleUserSelection({ target: this.userSelect });
        }
    }
    
    async handleUserSelection(e) {
        const userId = e.target.value;
        
        if (!userId) {
            this.currentManagedUserId = null;
            this.currentManagedUserEmail = null;
            this.currentManagedUser.textContent = 'No user selected';
            this.tables = [];
            this.tableCounter = 1;
            this.updateUI();
            return;
        }
        
        try {
            // Show loading
            this.showToast(`Loading user data...`, 'info');
            
            // Find user in our cached list
            const user = this.allUsers.find(u => u.id === userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            this.currentManagedUserId = userId;
            this.currentManagedUserEmail = user.email;
            this.currentManagedUser.textContent = user.email;
            
            // Store last selection
            localStorage.setItem('lastSelectedUser', userId);
            
            // Load user's data
            await this.loadUserData(userId);
            
            // Log the admin action
            await this.logAdminAction('view_user', userId, { email: user.email });
            
            this.showToast(`Now managing: ${user.email}`, 'success');
            
        } catch (error) {
            console.error('Error selecting user:', error);
            this.showToast('Failed to load user data', 'error');
            this.userSelect.value = '';
            this.currentManagedUserId = null;
        }
    }
    
    async loadUserData(userId) {
        try {
            const doc = await db.collection(FIREBASE_COLLECTION).doc(userId).get();
            
            if (doc.exists) {
                const userData = doc.data();
                this.tables = userData.tables || [];
                this.tableCounter = userData.tableCounter || 1;
                
                // Validate and fix data structure
                this.tables.forEach(table => this.validateTableData(table));
                
                // Update UI
                this.updateUI();
                
                // Save to local storage as cache
                this.saveToLocalStorage(userId);
                
                return true;
            } else {
                this.showToast('User has no data yet', 'info');
                this.tables = [];
                this.tableCounter = 1;
                this.updateUI();
                return false;
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
            throw error;
        }
    }
    
    async logAdminAction(action, targetUserId, details = {}) {
        if (!this.currentUser || !this.isAdmin) return;
        
        try {
            const logEntry = {
                adminId: this.currentUser.uid,
                adminEmail: this.currentUser.email,
                action: action,
                targetUserId: targetUserId,
                targetUserEmail: this.allUsers.find(u => u.id === targetUserId)?.email || 'Unknown',
                details: details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sessionId: this.adminSessionId,
                ipAddress: await this.getClientIP()
            };
            
            // Add to local activity log
            this.activityLog.unshift({
                ...logEntry,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 50 entries locally
            if (this.activityLog.length > 50) {
                this.activityLog = this.activityLog.slice(0, 50);
            }
            
            // Update UI
            this.updateActivityLog();
            
            // Save to Firestore if online
            if (this.isOnline) {
                await db.collection(ACTIVITY_LOG_COLLECTION).add(logEntry);
            }
            
        } catch (error) {
            console.error('Error logging admin action:', error);
            // Don't show error to user for logging failures
        }
    }
    
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
    
    updateActivityLog() {
        this.activityLogElement.innerHTML = '';
        
        if (this.activityLog.length === 0) {
            this.activityLogElement.innerHTML = '<div class="log-entry">No activity yet</div>';
            return;
        }
        
        this.activityLog.slice(0, 10).forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            
            const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const actionMap = {
                'view_user': 'Viewed user',
                'save_data': 'Saved data',
                'add_table': 'Added table',
                'delete_table': 'Deleted table',
                'add_student': 'Added student',
                'delete_student': 'Deleted student',
                'export_data': 'Exported data',
                'import_data': 'Imported data'
            };
            
            entry.innerHTML = `
                <span class="log-time">${time}</span>
                <span class="log-action">${actionMap[log.action] || log.action}</span>
                <span class="log-user">for ${log.targetUserEmail}</span>
            `;
            
            this.activityLogElement.appendChild(entry);
        });
    }
    
    updateDashboardStats() {
        this.totalUsers.textContent = this.allUsers.length;
        
        const totalTables = this.allUsers.reduce((sum, user) => sum + user.tableCount, 0);
        this.totalTables.textContent = totalTables;
        
        const totalStudents = this.allUsers.reduce((sum, user) => sum + user.studentCount, 0);
        this.totalStudents.textContent = totalStudents;
        
        if (this.allUsers.length > 0) {
            const latestUpdate = this.allUsers.reduce((latest, user) => {
                const userTime = new Date(user.lastUpdated).getTime();
                return userTime > latest ? userTime : latest;
            }, 0);
            
            if (latestUpdate > 0) {
                const date = new Date(latestUpdate);
                this.lastUpdated.textContent = date.toLocaleDateString();
            } else {
                this.lastUpdated.textContent = '-';
            }
        } else {
            this.lastUpdated.textContent = '-';
        }
    }
    
    updateAdminSessionDisplay() {
        if (this.adminSessionIdElement) {
            this.adminSessionIdElement.textContent = this.adminSessionId;
        }
    }
    
    // ===== Data Management Methods =====
    async saveUserData() {
        if (!this.currentManagedUserId) {
            this.showToast('No user selected', 'warning');
            return false;
        }
        
        try {
            this.setLoadingState(this.saveStatus, true, 'Saving...');
            
            const dataToSave = {
                version: VERSION,
                tables: this.tables,
                tableCounter: this.tableCounter,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: new Date().toISOString(),
                updatedByAdmin: true,
                adminId: this.currentUser.uid,
                adminEmail: this.currentUser.email,
                email: this.currentManagedUserEmail
            };
            
            // Save to Firestore
            await db.collection(FIREBASE_COLLECTION)
                .doc(this.currentManagedUserId)
                .set(dataToSave, { merge: true });
            
            // Update local storage
            this.saveToLocalStorage(this.currentManagedUserId);
            
            // Log the action
            await this.logAdminAction('save_data', this.currentManagedUserId, {
                tableCount: this.tables.length,
                studentCount: this.calculateTotalStudents(this.tables)
            });
            
            this.showToast('User data saved successfully', 'success');
            this.lastSyncTime = Date.now();
            
            return true;
            
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showToast('Failed to save user data', 'error');
            return false;
        } finally {
            this.setLoadingState(this.saveStatus, false, 'All changes saved');
        }
    }
    
    saveToLocalStorage(userId) {
        if (!userId) return;
        
        try {
            const storageKey = STORAGE_KEY_PREFIX + userId;
            const dataToSave = {
                version: VERSION,
                tables: this.tables,
                tableCounter: this.tableCounter,
                lastSaved: new Date().toISOString(),
                userId: userId,
                email: this.currentManagedUserEmail
            };
            
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
            
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    loadFromLocalStorage(userId) {
        if (!userId) return false;
        
        try {
            const storageKey = STORAGE_KEY_PREFIX + userId;
            const savedData = localStorage.getItem(storageKey);
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.tables = parsedData.tables || [];
                this.tableCounter = parsedData.tableCounter || 1;
                
                // Update last saved time display
                if (parsedData.lastSaved) {
                    const lastSavedDate = new Date(parsedData.lastSaved);
                    this.lastSaved.textContent = `Cached: ${lastSavedDate.toLocaleString()}`;
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        
        return false;
    }
    
    // ===== Core Application Methods (Same as original) =====
    addNewTable() {
        if (!this.currentManagedUserId) {
            this.showAdminConfirmation(
                'Create New Table',
                'No user selected. Create a new table for the currently selected user?',
                () => {
                    if (!this.currentManagedUserId) {
                        this.showToast('Please select a user first', 'warning');
                        return;
                    }
                    this.performAddTable();
                }
            );
            return;
        }
        
        this.performAddTable();
    }
    
    performAddTable() {
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
        
        // Log action
        this.logAdminAction('add_table', this.currentManagedUserId, {
            tableName: tableData.name,
            studentCount: students.length
        });
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
        this.showAdminConfirmation(
            'Delete Table',
            'Are you sure you want to delete this table? This action cannot be undone.',
            () => {
                const table = this.tables.find(t => t.id === tableId);
                if (table) {
                    this.tables = this.tables.filter(t => t.id !== tableId);
                    this.updateUI();
                    this.saveData();
                    
                    // Log action
                    this.logAdminAction('delete_table', this.currentManagedUserId, {
                        tableName: table.name,
                        tableId: tableId
                    });
                }
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
            
            // Log action
            this.logAdminAction('add_student', this.currentManagedUserId, {
                tableName: table.name,
                studentName: newStudent.name
            });
        }
    }
    
    deleteStudent(tableId, studentIndex) {
        this.showAdminConfirmation(
            'Delete Student',
            'Are you sure you want to delete this student?',
            () => {
                const table = this.tables.find(t => t.id === tableId);
                if (table && table.students[studentIndex]) {
                    const studentName = table.students[studentIndex].name;
                    table.students.splice(studentIndex, 1);
                    this.updateTablePositions(tableId);
                    this.updateUI();
                    this.saveData();
                    
                    // Log action
                    this.logAdminAction('delete_student', this.currentManagedUserId, {
                        tableName: table.name,
                        studentName: studentName
                    });
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
        
        this.showAdminConfirmation(
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
        if (!this.currentManagedUserId || this.tables.length === 0) {
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
    
    // ===== Data Management =====
    saveData() {
        if (this.currentManagedUserId) {
            this.saveUserData();
        } else {
            this.showToast('No user selected', 'warning');
        }
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
    
    // ===== Statistics =====
    showStatistics() {
        if (!this.currentManagedUserId || this.tables.length === 0) {
            this.showToast('Please select a user with data first', 'warning');
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
        
        const adminNote = document.createElement('p');
        adminNote.textContent = `Managed by: ${this.currentUser.email} (Admin)`;
        adminNote.style.color = '#8B0000';
        adminNote.style.fontSize = '14px';
        headerDiv.appendChild(adminNote);
        
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
    
    getRemarks(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        
        for (const remark of REMARKS_CONFIG) {
            if (percentage >= remark.min) {
                return remark;
            }
        }
        
        return REMARKS_CONFIG[REMARKS_CONFIG.length - 1];
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
                    .admin-note { font-size: 12px; color: #8B0000; margin-top: 5px; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Terminal Report</h1>
                    <h2>${studentName}</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    <p class="admin-note">Report generated by administrator</p>
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
                    .admin-note { font-size: 12px; color: #8B0000; margin-top: 5px; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>${table.name}</h1>
                    <p>Student Results Summary</p>
                    <p class="admin-note">Generated by administrator</p>
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
        if (!this.currentManagedUserId) {
            this.showToast('Please select a user first', 'warning');
            return;
        }
        
        if (this.tables.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }
        
        const userEmail = this.currentManagedUserEmail || 'unknown';
        const dateStr = new Date().toISOString().split('T')[0];
        
        const dataStr = JSON.stringify({
            version: VERSION,
            tables: this.tables,
            tableCounter: this.tableCounter,
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentUser.email,
            exportedFor: userEmail,
            exportedForId: this.currentManagedUserId
        }, null, 2);
        
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-results-${userEmail}-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Log action
        this.logAdminAction('export_data', this.currentManagedUserId, {
            tableCount: this.tables.length,
            fileName: link.download
        });
        
        this.showToast('Data exported successfully', 'success');
    }
    
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.currentManagedUserId) {
            this.showToast('Please select a user first', 'warning');
            event.target.value = '';
            return;
        }
        
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
                
                this.showAdminConfirmation(
                    'Import Data',
                    `Import data for ${this.currentManagedUserEmail}? This will merge with existing data.`,
                    () => {
                        const importSummary = this.mergeImportedData(importedData);
                        this.updateUI();
                        this.saveData();
                        
                        // Log action
                        this.logAdminAction('import_data', this.currentManagedUserId, {
                            fileSize: file.size,
                            tableCount: importedData.tables.length
                        });
                        
                        this.showImportSummary(importSummary);
                    }
                );
                
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
            <p>Data has been merged successfully for ${this.currentManagedUserEmail}.</p>
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
    
    // ===== Help System =====
    showHelp() {
        this.renderHelpContent();
        this.showModal(this.helpModal);
    }
    
    renderHelpContent() {
        this.helpContainer.innerHTML = `
            <div class="help-section">
                <h3><i class="fas fa-shield-alt"></i> Admin Portal Guide</h3>
                <p>Welcome to the Student Results Admin Portal. This interface allows administrators to manage all user data in the system.</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4><i class="fas fa-users"></i> User Management</h4>
                        <p>Select any user from the dropdown to view and manage their data</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-edit"></i> Full Edit Access</h4>
                        <p>Modify tables, students, and marks for any user</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-history"></i> Audit Logging</h4>
                        <p>All administrative actions are logged for accountability</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-chart-bar"></i> System Statistics</h4>
                        <p>View system-wide statistics and user analytics</p>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-user-shield"></i> Admin Workflow</h3>
                <ol>
                    <li><strong>Select User:</strong> Choose a user from the dropdown menu at the top</li>
                    <li><strong>View Data:</strong> The user's tables and student data will load automatically</li>
                    <li><strong>Edit Data:</strong> Click on any cell to edit student names or marks</li>
                    <li><strong>Save Changes:</strong> Changes are auto-saved or use manual save for critical updates</li>
                    <li><strong>Export/Import:</strong> Export user data or import new data as needed</li>
                    <li><strong>Generate Reports:</strong> Create terminal reports for individual students</li>
                </ol>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-exclamation-triangle"></i> Important Notes</h3>
                <ul>
                    <li>All actions are logged with your admin credentials</li>
                    <li>You are responsible for all changes made through this portal</li>
                    <li>Always verify user identity before making changes</li>
                    <li>Export backups before making significant modifications</li>
                    <li>Changes are saved to the user's original data in the database</li>
                    <li>Users will see admin-made changes when they next sync their data</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-cogs"></i> Technical Information</h3>
                <ul>
                    <li>Admin Session ID: ${this.adminSessionId}</li>
                    <li>Database Collection: ${FIREBASE_COLLECTION}</li>
                    <li>Total Users in System: ${this.allUsers.length}</li>
                    <li>Currently Managing: ${this.currentManagedUserEmail || 'None'}</li>
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
    
    updateConnectionStatus() {
        if (this.isOnline) {
            this.connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
            this.connectionStatus.className = 'online';
        } else {
            this.connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
            this.connectionStatus.className = 'offline';
        }
    }
    
    setLoadingState(element, isLoading, text = null) {
        if (isLoading) {
            element.classList.add('loading');
            if (text) element.textContent = text;
        } else {
            element.classList.remove('loading');
            if (text) element.textContent = text;
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
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.mainApp.style.display = 'none';
        this.clearFormInputs();
    }
    
    showMainApp() {
        this.loginScreen.classList.add('hidden');
        this.mainApp.style.display = 'block';
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
    
    clearFormInputs() {
        if (this.loginForm) this.loginForm.reset();
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
    
    showAdminConfirmation(title, message, callback) {
        this.adminConfirmTitle.textContent = title;
        this.adminConfirmMessage.textContent = message;
        this.adminConfirmCallback = callback;
        this.showModal(this.adminConfirmModal);
    }
    
    // ===== Event Handlers =====
    async handleLogout() {
        try {
            // Log logout action
            await this.logAdminAction('logout', 'system', { sessionId: this.adminSessionId });
            
            await auth.signOut();
            
            // Clear local storage
            localStorage.removeItem('adminRememberedEmail');
            localStorage.removeItem('lastSelectedUser');
            
            // Reset state
            this.tables = [];
            this.tableCounter = 1;
            this.currentManagedUserId = null;
            this.allUsers = [];
            
            this.showToast('Admin logged out', 'success');
            this.showLoginScreen();
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Logout failed', 'error');
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts when user is editing content
        if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
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
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                this.closeModal(activeModal);
            }
        }
        
        // Alt + U: Refresh user list
        if (e.altKey && e.key === 'u') {
            e.preventDefault();
            this.loadAllUsers();
            this.showToast('User list refreshed', 'info');
        }
    }
    
    async loadActivityLog() {
        try {
            const snapshot = await db.collection(ACTIVITY_LOG_COLLECTION)
                .where('adminId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            snapshot.forEach(doc => {
                const log = doc.data();
                this.activityLog.push({
                    ...log,
                    timestamp: log.timestamp?.toDate().toISOString() || new Date().toISOString()
                });
            });
            
            this.updateActivityLog();
            
        } catch (error) {
            console.error('Error loading activity log:', error);
        }
    }
}

// ===== Initialize Admin Application =====
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the admin app
    window.adminApp = new AdminResultsManager();
    
    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Admin app error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});