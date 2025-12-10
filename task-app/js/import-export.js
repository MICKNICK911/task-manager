// Import/Export Manager
const ImportExportManager = {
    currentMode: 'export',
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

    // Setup event listeners
    setupEventListeners() {
        // Export button click
        document.addEventListener('click', (event) => {
            if (event.target.id === 'exportBtn' || event.target.closest('#exportBtn')) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Export button clicked');
                this.openModal('export');
            }
            
            // Import button click
            if (event.target.id === 'importBtn' || event.target.closest('#importBtn')) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Import button clicked');
                this.openModal('import');
            }
            
            // Modal close button
            if (event.target.id === 'modalClose' || event.target.closest('#modalClose')) {
                event.preventDefault();
                this.closeModal();
            }
            
            // Modal cancel button
            if (event.target.id === 'modalCancel' || event.target.closest('#modalCancel')) {
                event.preventDefault();
                this.closeModal();
            }
            
            // Modal action button
            if (event.target.id === 'modalAction' || event.target.closest('#modalAction')) {
                event.preventDefault();
                console.log('Modal action clicked, mode:', this.currentMode);
                if (this.currentMode === 'export') {
                    this.handleExport();
                } else {
                    this.handleImport();
                }
            }
            
            // Modal clear button
            if (event.target.id === 'modalClear' || event.target.closest('#modalClear')) {
                event.preventDefault();
                this.clearJsonEditor();
            }
            
            // Format selector buttons
            if (event.target.classList.contains('format-btn') || event.target.closest('.format-btn')) {
                event.preventDefault();
                const btn = event.target.classList.contains('format-btn') ? event.target : event.target.closest('.format-btn');
                if (btn && btn.dataset.format) {
                    this.setFormat(btn.dataset.format);
                }
            }
        });

        // File input change
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('importExportModal');
            if (!modal || !modal.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                this.closeModal();
            }
            
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                if (this.currentMode === 'export') {
                    this.handleExport();
                } else {
                    this.handleImport();
                }
            }
        });
    },

    // Setup drag and drop
    setupDragAndDrop() {
        const dropArea = document.getElementById('fileUploadArea');
        if (!dropArea) return;
        
        // Helper functions
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const highlight = () => {
            dropArea.style.backgroundColor = '#e8f4fd';
            dropArea.style.borderColor = '#1a68e8';
        };

        const unhighlight = () => {
            dropArea.style.backgroundColor = '';
            dropArea.style.borderColor = '#2575fc';
        };

        // Add event listeners
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle drop
        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        }, false);

        // Click to open file dialog
        dropArea.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
    },

    // Open modal
    openModal(mode) {
        console.log('Opening modal:', mode);
        this.currentMode = mode;
        
        const modal = document.getElementById('importExportModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalAction = document.getElementById('modalAction');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const jsonEditor = document.getElementById('jsonEditor');
        const importStats = document.getElementById('importStats');
        const modalClear = document.getElementById('modalClear');
        
        if (!modal || !modalTitle || !modalAction) {
            console.error('Modal elements not found');
            return;
        }

        // Reset UI
        this.hideProgress();
        this.hideError();

        if (mode === 'export') {
            modalTitle.textContent = 'Export Todos';
            modalAction.textContent = 'Export';
            modalAction.className = 'modal-btn primary';
            
            if (fileUploadArea) fileUploadArea.style.display = 'none';
            if (jsonEditor) {
                jsonEditor.style.display = 'block';
                jsonEditor.value = JSON.stringify(this.generateExportData(), null, 2);
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
            
            this.selectedFile = null;
            this.importData = null;
        }

        modal.classList.add('active');
        
        // Focus
        setTimeout(() => {
            if (mode === 'export' && jsonEditor) {
                jsonEditor.focus();
                jsonEditor.select();
            }
        }, 100);
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('importExportModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.hideProgress();
        this.hideError();
    },

    // Set format
    setFormat(format) {
        this.currentFormat = format;
        
        // Update UI
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
        
        // Update editor content for export mode
        if (this.currentMode === 'export') {
            const jsonEditor = document.getElementById('jsonEditor');
            if (jsonEditor) {
                if (format === 'json') {
                    jsonEditor.value = JSON.stringify(this.generateExportData(), null, 2);
                } else if (format === 'csv') {
                    jsonEditor.value = this.generateCSVExport();
                } else if (format === 'txt') {
                    jsonEditor.value = this.generateTextExport();
                }
            }
        }
    },

    // Generate export data (JSON)
    generateExportData() {
        const todos = TodoManager.todos || [];
        return {
            version: '1.0',
            app: 'Secure Todo List',
            exportedAt: new Date().toISOString(),
            user: auth.currentUser ? auth.currentUser.email : 'anonymous',
            stats: {
                total: todos.length,
                active: todos.filter(t => !t.completed).length,
                completed: todos.filter(t => t.completed).length
            },
            todos: todos.map(todo => ({
                text: todo.text,
                completed: todo.completed,
                createdAt: todo.createdAt ? todo.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: todo.updatedAt ? todo.updatedAt.toDate().toISOString() : new Date().toISOString()
            }))
        };
    },

    // Generate CSV export
    generateCSVExport() {
        const todos = TodoManager.todos || [];
        const headers = ['Text', 'Status', 'Created At', 'Updated At'];
        const rows = todos.map(todo => {
            const status = todo.completed ? 'Completed' : 'Active';
            const createdAt = todo.createdAt ? todo.createdAt.toDate().toLocaleString() : '';
            const updatedAt = todo.updatedAt ? todo.updatedAt.toDate().toLocaleString() : '';
            return `"${todo.text.replace(/"/g, '""')}",${status},"${createdAt}","${updatedAt}"`;
        });
        return [headers.join(','), ...rows].join('\n');
    },

    // Generate text export
    generateTextExport() {
        const todos = TodoManager.todos || [];
        let output = 'MY TODO LIST\n';
        output += '='.repeat(50) + '\n\n';
        
        todos.forEach((todo, index) => {
            const checkbox = todo.completed ? '[✓]' : '[ ]';
            output += `${index + 1}. ${checkbox} ${todo.text}\n`;
        });
        
        return output;
    },

    // Handle file selection
    async handleFileSelect(file) {
        if (!file) return;
        
        this.selectedFile = file;
        this.showProgress('Reading file...', 10);
        
        try {
            const text = await this.readFile(file);
            this.showProgress('Parsing data...', 30);
            
            // Try to parse as JSON
            try {
                this.importData = JSON.parse(text);
                this.validateImportData();
                this.showImportStats();
                this.showProgress('Data ready for import', 100);
            } catch (jsonError) {
                // Try to parse as text
                this.importData = this.parseTextData(text);
                this.validateImportData();
                this.showImportStats();
                this.showProgress('Data ready for import', 100);
            }
        } catch (error) {
            this.showError('Error reading file: ' + error.message);
            this.hideProgress();
        }
    },

    // Read file
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsText(file);
        });
    },

    // Parse text data
    parseTextData(text) {
        const lines = text.split('\n').filter(line => line.trim());
        
        // Check if it's CSV
        if (lines[0].includes(',')) {
            return this.parseCSVData(lines);
        } else {
            return this.parsePlainTextData(lines);
        }
    },

    // Parse CSV data
    parseCSVData(lines) {
        const todos = [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Simple CSV parsing
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const todo = {
                text: values[0] || '',
                completed: (values[1] || '').toLowerCase().includes('complete') || (values[1] || '').includes('✓'),
                createdAt: values[2] || new Date().toISOString(),
                updatedAt: values[3] || new Date().toISOString()
            };
            
            if (todo.text) {
                todos.push(todo);
            }
        }
        
        return {
            version: '1.0',
            importedAt: new Date().toISOString(),
            format: 'csv',
            todos: todos
        };
    },

    // Parse plain text
    parsePlainTextData(lines) {
        const todos = [];
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Match patterns like: "1. [✓] Task" or "- [ ] Task"
            const match = line.match(/(?:\d+\.\s*|\-\s*)?\[([ x✓]?)\]\s*(.+)/i);
            if (match) {
                const completed = match[1].trim() === '✓' || match[1].trim() === 'x';
                const text = match[2].trim();
                todos.push({
                    text: text,
                    completed: completed,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Just text
                todos.push({
                    text: line,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        });
        
        return {
            version: '1.0',
            importedAt: new Date().toISOString(),
            format: 'plaintext',
            todos: todos
        };
    },

    // Validate import data
    validateImportData() {
        if (!this.importData) {
            throw new Error('No import data');
        }
        
        // If data is directly an array, wrap it
        if (Array.isArray(this.importData)) {
            this.importData = {
                version: '1.0',
                importedAt: new Date().toISOString(),
                todos: this.importData
            };
        }
        
        // Ensure todos array exists
        if (!this.importData.todos || !Array.isArray(this.importData.todos)) {
            throw new Error('Invalid format: missing todos array');
        }
        
        // Validate each todo
        this.importData.todos = this.importData.todos.map(todo => ({
            text: String(todo.text || '').trim(),
            completed: Boolean(todo.completed),
            createdAt: todo.createdAt || new Date().toISOString(),
            updatedAt: todo.updatedAt || new Date().toISOString()
        })).filter(todo => todo.text.length > 0);
    },

    // Show import stats
    showImportStats() {
        if (!this.importData || !this.importData.todos) return;
        
        const todos = this.importData.todos;
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const active = total - completed;
        
        // Check duplicates
        const existingTodos = (TodoManager.todos || []).map(t => t.text.toLowerCase());
        const duplicates = todos.filter(t => 
            existingTodos.includes(t.text.toLowerCase())
        ).length;
        
        const stats = document.getElementById('importStats');
        if (stats) {
            document.getElementById('statTotal').textContent = total;
            document.getElementById('statActive').textContent = active;
            document.getElementById('statCompleted').textContent = completed;
            document.getElementById('statDuplicates').textContent = duplicates;
            stats.style.display = 'block';
        }
    },

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
                content = jsonEditor.value;
                filename = `todos-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else if (this.currentFormat === 'csv') {
                content = jsonEditor.value;
                filename = `todos-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
            } else if (this.currentFormat === 'txt') {
                content = jsonEditor.value;
                filename = `todos-${new Date().toISOString().split('T')[0]}.txt`;
                mimeType = 'text/plain';
            }
            
            // Download file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show notification
            if (UIManager && UIManager.showNotification) {
                UIManager.showNotification(`Exported ${TodoManager.todos?.length || 0} todos`, 'success');
            }
            
            this.closeModal();
            
        } catch (error) {
            this.showError('Export failed: ' + error.message);
        }
    },

    // Handle import
    async handleImport() {
        if (!this.importData || !this.importData.todos) {
            this.showError('No data to import');
            return;
        }
        
        const todos = this.importData.todos;
        if (todos.length === 0) {
            this.showError('No valid todos found');
            return;
        }
        
        this.showProgress('Starting import...', 0);
        
        try {
            let imported = 0;
            let duplicates = 0;
            const existingTodos = (TodoManager.todos || []).map(t => t.text.toLowerCase());
            
            for (let i = 0; i < todos.length; i++) {
                const todo = todos[i];
                const progress = Math.floor((i / todos.length) * 100);
                this.showProgress(`Importing ${i + 1} of ${todos.length}...`, progress);
                
                // Check for duplicates
                if (existingTodos.includes(todo.text.toLowerCase())) {
                    duplicates++;
                    continue;
                }
                
                // Add todo
                try {
                    if (TodoManager.addTodo) {
                        const success = await TodoManager.addTodo(todo.text, todo.completed);
                        if (success) imported++;
                    }
                } catch (error) {
                    console.error('Error adding todo:', error);
                }
                
                // Small delay
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            this.showProgress('Import complete!', 100);
            
            // Show summary
            setTimeout(() => {
                let message = `Imported ${imported} new todos`;
                if (duplicates > 0) message += ` (skipped ${duplicates} duplicates)`;
                
                if (UIManager && UIManager.showNotification) {
                    UIManager.showNotification(message, 'success');
                }
                
                this.closeModal();
            }, 1000);
            
        } catch (error) {
            this.showError('Import failed: ' + error.message);
            this.hideProgress();
        }
    },

    // Clear JSON editor
    clearJsonEditor() {
        const editor = document.getElementById('jsonEditor');
        if (editor) editor.value = '';
    },

    // Show progress
    showProgress(text, percentage) {
        const progressText = document.getElementById('progressText');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        
        if (progressText) {
            progressText.textContent = text;
            progressText.style.display = 'block';
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    },

    // Hide progress
    hideProgress() {
        const progressText = document.getElementById('progressText');
        const progressContainer = document.getElementById('progressContainer');
        
        if (progressText) progressText.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'none';
    },

    // Show error
    showError(message) {
        const errorElement = document.getElementById('importError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    // Hide error
    hideError() {
        const errorElement = document.getElementById('importError');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    },

    // Reinitialize
    reinitialize() {
        this.isInitialized = false;
        this.init();
    }
};