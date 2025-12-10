// Import/Export Manager
const ImportExportManager = {
    currentMode: 'export', // 'export' or 'import'
    currentFormat: 'json',
    selectedFile: null,
    importData: null,
    isInitialized: false,

    // Initialize import/export functionality
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.isInitialized = true;
        
        console.log('Import/Export Manager initialized');
    },

    // Setup event listeners with event delegation
    setupEventListeners() {
        // Use event delegation for dynamically added buttons
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // Export button click
            if (target.id === 'exportBtn' || target.closest('#exportBtn')) {
                event.preventDefault();
                event.stopPropagation();
                this.openModal('export');
            }
            
            // Import button click
            if (target.id === 'importBtn' || target.closest('#importBtn')) {
                event.preventDefault();
                event.stopPropagation();
                this.openModal('import');
            }
            
            // Modal close button
            if (target.id === 'modalClose' || target.closest('#modalClose')) {
                event.preventDefault();
                this.closeModal();
            }
            
            // Modal cancel button
            if (target.id === 'modalCancel' || target.closest('#modalCancel')) {
                event.preventDefault();
                this.closeModal();
            }
            
            // Modal action button (Export/Import)
            if (target.id === 'modalAction' || target.closest('#modalAction')) {
                event.preventDefault();
                if (this.currentMode === 'export') {
                    this.handleExport();
                } else {
                    this.handleImport();
                }
            }
            
            // Modal clear button
            if (target.id === 'modalClear' || target.closest('#modalClear')) {
                event.preventDefault();
                this.clearJsonEditor();
            }
            
            // Format selector buttons
            if (target.classList.contains('format-btn') || target.closest('.format-btn')) {
                event.preventDefault();
                const btn = target.classList.contains('format-btn') ? target : target.closest('.format-btn');
                if (btn && btn.dataset.format) {
                    this.setFormat(btn.dataset.format);
                }
            }
        });

        // File input change event
        document.getElementById('importFile').addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Handle Enter key in modal
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('importExportModal');
            if (!modal.classList.contains('active')) return;
            
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                if (this.currentMode === 'export') {
                    this.handleExport();
                } else {
                    this.handleImport();
                }
            }
            
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    // Setup drag and drop for file upload
    setupDragAndDrop() {
        const dropArea = document.getElementById('fileUploadArea');
        if (!dropArea) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, this.highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, this.unhighlight, false);
        });

        // Handle dropped files
        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        }, false);

        // Click to open file dialog
        dropArea.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
    },

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    },

    highlight() {
        const dropArea = document.getElementById('fileUploadArea');
        if (dropArea) {
            dropArea.style.backgroundColor = '#e8f4fd';
            dropArea.style.borderColor = '#1a68e8';
        }
    },

    unhighlight() {
        const dropArea = document.getElementById('fileUploadArea');
        if (dropArea) {
            dropArea.style.backgroundColor = '';
            dropArea.style.borderColor = '#2575fc';
        }
    },

    // Open modal in export or import mode
    openModal(mode) {
        console.log('Opening modal in mode:', mode);
        
        this.currentMode = mode;
        const modal = document.getElementById('importExportModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalAction = document.getElementById('modalAction');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const jsonEditor = document.getElementById('jsonEditor');
        const importStats = document.getElementById('importStats');
        const modalClear = document.getElementById('modalClear');
        const importFile = document.getElementById('importFile');

        if (!modal || !modalTitle || !modalAction) {
            console.error('Modal elements not found');
            return;
        }

        // Reset UI
        this.hideProgress();
        this.hideError();
        
        // Reset file input
        if (importFile) {
            importFile.value = '';
        }

        if (mode === 'export') {
            modalTitle.textContent = 'Export Todos';
            modalAction.textContent = 'Export';
            modalAction.className = 'modal-btn primary';
            
            if (fileUploadArea) fileUploadArea.style.display = 'none';
            if (jsonEditor) {
                jsonEditor.style.display = 'block';
                // Generate JSON for export
                const exportData = this.generateExportData();
                jsonEditor.value = JSON.stringify(exportData, null, 2);
            }
            if (importStats) importStats.style.display = 'none';
            if (modalClear) modalClear.style.display = 'none';
            
        } else {
            modalTitle.textContent = 'Import Todos';
            modalAction.textContent = 'Import';
            modalAction.className = 'modal-btn primary';
            
            if (fileUploadArea) fileUploadArea.style.display = 'block';
            if (jsonEditor) {
                jsonEditor.style.display = 'none';
                jsonEditor.value = '';
            }
            if (importStats) importStats.style.display = 'none';
            if (modalClear) modalClear.style.display = 'block';
            
            // Clear previous data
            this.selectedFile = null;
            this.importData = null;
        }

        modal.classList.add('active');
        
        // Focus on the modal
        setTimeout(() => {
            if (mode === 'export' && jsonEditor) {
                jsonEditor.focus();
            }
        }, 100);
    },

    // ... [Rest of the methods remain the same, but ensure they all have proper null checks]
    
    // Handle export
    handleExport() {
        const jsonEditor = document.getElementById('jsonEditor');
        if (!jsonEditor) {
            this.showError('Export editor not found');
            return;
        }
        
        try {
            let content, filename, mimeType;
            
            if (this.currentFormat === 'json') {
                // Export as JSON
                const exportData = JSON.parse(jsonEditor.value);
                content = JSON.stringify(exportData, null, 2);
                filename = `todos-export-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                
            } else if (this.currentFormat === 'csv') {
                // Export as CSV
                content = this.generateCSVExport();
                filename = `todos-export-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                
            } else if (this.currentFormat === 'txt') {
                // Export as text
                content = this.generateTextExport();
                filename = `todos-export-${new Date().toISOString().split('T')[0]}.txt`;
                mimeType = 'text/plain';
            }
            
            // Create download link
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show notification using UIManager
            if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                UIManager.showNotification(`Todos exported successfully as ${this.currentFormat.toUpperCase()}`, 'success');
            } else {
                alert(`Todos exported successfully as ${this.currentFormat.toUpperCase()}`);
            }
            
            this.closeModal();
            
        } catch (error) {
            this.showError('Invalid data format: ' + error.message);
        }
    },
    
    // Handle import
    async handleImport() {
        if (!this.importData || !this.importData.todos) {
            this.showError('No valid data to import');
            return;
        }
        
        const todos = this.importData.todos;
        const total = todos.length;
        
        if (total === 0) {
            this.showError('No todos found in the import data');
            return;
        }
        
        let imported = 0;
        let errors = 0;
        let duplicates = 0;
        
        this.showProgress('Starting import...', 0);
        this.hideError();
        
        try {
            // Get existing todos for duplicate check
            const existingTodos = TodoManager.todos.map(t => t.text.toLowerCase());
            
            for (let i = 0; i < todos.length; i++) {
                const todo = todos[i];
                const progress = Math.round((i / total) * 90); // Leave 10% for completion
                this.showProgress(`Importing ${i + 1} of ${total}...`, progress);
                
                try {
                    // Check if todo already exists (case-insensitive)
                    const isDuplicate = existingTodos.includes(todo.text.toLowerCase());
                    
                    if (!isDuplicate) {
                        // Add todo to Firestore
                        await TodoManager.addTodo(todo.text, todo.completed);
                        imported++;
                    } else {
                        duplicates++;
                    }
                    
                    // Small delay to prevent overwhelming Firebase
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (error) {
                    console.error('Error importing todo:', error);
                    errors++;
                }
            }
            
            this.showProgress('Import complete!', 100);
            
            // Show summary
            setTimeout(() => {
                let message = `Successfully imported ${imported} new todos`;
                if (duplicates > 0) message += ` (skipped ${duplicates} duplicates)`;
                if (errors > 0) message += `, ${errors} errors occurred`;
                
                if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                    UIManager.showNotification(message, imported > 0 ? 'success' : 'info');
                } else {
                    alert(message);
                }
                
                this.closeModal();
                
                // Refresh the todo list
                if (TodoManager.todosRef && typeof TodoManager.setupTodosListener === 'function') {
                    // The listener will automatically update the UI
                }
                
            }, 1000);
            
        } catch (error) {
            this.showError('Import failed: ' + error.message);
            this.hideProgress();
        }
    },
    
    // Initialize on app load and reinitialize when user logs in
    reinitialize() {
        this.isInitialized = false;
        this.init();
    }
};

// Make sure TodoManager.addTodo accepts completed parameter
// This should already be in your todos.js