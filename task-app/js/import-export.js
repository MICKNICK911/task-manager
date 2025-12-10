// Import/Export Manager
const ImportExportManager = {
    currentMode: 'export', // 'export' or 'import'
    currentFormat: 'json',
    selectedFile: null,
    importData: null,

    // Initialize import/export functionality
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    },

    // Setup event listeners
    setupEventListeners() {
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.openModal('export');
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            this.openModal('import');
        });

        // File input
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Modal close button
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal cancel button
        document.getElementById('modalCancel').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal action button (Export/Import)
        document.getElementById('modalAction').addEventListener('click', () => {
            if (this.currentMode === 'export') {
                this.handleExport();
            } else {
                this.handleImport();
            }
        });

        // Modal clear button
        document.getElementById('modalClear').addEventListener('click', () => {
            this.clearJsonEditor();
        });

        // Format selector buttons
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFormat(btn.dataset.format);
            });
        });
    },

    // Setup drag and drop for file upload
    setupDragAndDrop() {
        const dropArea = document.getElementById('fileUploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropArea.style.backgroundColor = '#e8f4fd';
            dropArea.style.borderColor = '#1a68e8';
        }

        function unhighlight() {
            dropArea.style.backgroundColor = '';
            dropArea.style.borderColor = '#2575fc';
        }

        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            this.handleFileSelect(file);
        });

        dropArea.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
    },

    // Open modal in export or import mode
    openModal(mode) {
        this.currentMode = mode;
        const modal = document.getElementById('importExportModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalAction = document.getElementById('modalAction');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const jsonEditor = document.getElementById('jsonEditor');
        const importStats = document.getElementById('importStats');
        const modalClear = document.getElementById('modalClear');

        // Reset UI
        this.hideProgress();
        this.hideError();

        if (mode === 'export') {
            modalTitle.textContent = 'Export Todos';
            modalAction.textContent = 'Export';
            modalAction.className = 'modal-btn primary';
            fileUploadArea.style.display = 'none';
            jsonEditor.style.display = 'block';
            importStats.style.display = 'none';
            modalClear.style.display = 'none';
            
            // Generate JSON for export
            const exportData = this.generateExportData();
            jsonEditor.value = JSON.stringify(exportData, null, 2);
            
        } else {
            modalTitle.textContent = 'Import Todos';
            modalAction.textContent = 'Import';
            modalAction.className = 'modal-btn primary';
            fileUploadArea.style.display = 'block';
            jsonEditor.style.display = 'none';
            importStats.style.display = 'none';
            modalClear.style.display = 'block';
            
            // Clear previous data
            jsonEditor.value = '';
            this.selectedFile = null;
            this.importData = null;
        }

        modal.classList.add('active');
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('importExportModal');
        modal.classList.remove('active');
        this.hideProgress();
        this.hideError();
    },

    // Set export/import format
    setFormat(format) {
        this.currentFormat = format;
        
        // Update active format button
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.format === format) {
                btn.classList.add('active');
            }
        });

        // Update UI based on format
        const jsonEditor = document.getElementById('jsonEditor');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (this.currentMode === 'export') {
            if (format === 'json') {
                jsonEditor.style.display = 'block';
                const exportData = this.generateExportData();
                jsonEditor.value = JSON.stringify(exportData, null, 2);
            } else {
                jsonEditor.style.display = 'block';
                jsonEditor.value = this.generateTextExport();
            }
        }
    },

    // Generate export data in JSON format
    generateExportData() {
        const todos = TodoManager.todos;
        const exportData = {
            version: '2.0',
            app: 'Secure Todo List',
            exportedAt: new Date().toISOString(),
            user: auth.currentUser ? auth.currentUser.email : 'anonymous',
            stats: {
                total: todos.length,
                active: todos.filter(t => !t.completed).length,
                completed: todos.filter(t => t.completed).length
            },
            todos: todos.map(todo => ({
                id: todo.id,
                text: todo.text,
                completed: todo.completed,
                createdAt: todo.createdAt ? todo.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: todo.updatedAt ? todo.updatedAt.toDate().toISOString() : new Date().toISOString()
            }))
        };
        
        return exportData;
    },

    // Generate text export (CSV or plain text)
    generateTextExport() {
        const todos = TodoManager.todos;
        
        if (this.currentFormat === 'csv') {
            // Generate CSV
            const headers = ['Text', 'Status', 'Created At', 'Updated At'];
            const rows = todos.map(todo => {
                const status = todo.completed ? 'Completed' : 'Active';
                const createdAt = todo.createdAt ? todo.createdAt.toDate().toLocaleDateString() : '';
                const updatedAt = todo.updatedAt ? todo.updatedAt.toDate().toLocaleDateString() : '';
                return `"${todo.text}",${status},"${createdAt}","${updatedAt}"`;
            });
            
            return [headers.join(','), ...rows].join('\n');
            
        } else if (this.currentFormat === 'txt') {
            // Generate plain text
            let text = 'MY TODO LIST\n';
            text += '='.repeat(50) + '\n\n';
            
            todos.forEach((todo, index) => {
                const status = todo.completed ? '✓' : '○';
                text += `${index + 1}. [${status}] ${todo.text}\n`;
            });
            
            return text;
        }
        
        return '';
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
                // If not JSON, try to parse as text
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

    // Read file as text
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    // Parse text data (CSV or plain text)
    parseTextData(text) {
        const lines = text.trim().split('\n');
        
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
            if (lines[i].trim() === '') continue;
            
            const values = this.parseCSVLine(lines[i]);
            const todo = {
                text: values[0] || '',
                completed: (values[1] || '').toLowerCase().includes('complete'),
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

    // Parse CSV line (handles quoted values with commas)
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/"/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim().replace(/"/g, ''));
        return values;
    },

    // Parse plain text data
    parsePlainTextData(lines) {
        const todos = [];
        
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('//') || line.startsWith('#')) return;
            
            // Try to match patterns like: "1. [✓] Buy groceries" or "- [ ] Call mom"
            const match = line.match(/^(?:\d+\.\s*|\-\s*)?\[([○✓xX]?)\]\s*(.+)$/);
            if (match) {
                const status = match[1];
                const text = match[2];
                const completed = status === '✓' || status === 'x' || status === 'X';
                
                todos.push({
                    text: text,
                    completed: completed,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else if (line) {
                // If no pattern, treat as a todo item
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
            throw new Error('No data to import');
        }
        
        // Check if data has todos array
        if (!this.importData.todos || !Array.isArray(this.importData.todos)) {
            // If data is directly an array, wrap it
            if (Array.isArray(this.importData)) {
                this.importData = {
                    version: '1.0',
                    importedAt: new Date().toISOString(),
                    todos: this.importData
                };
            } else {
                throw new Error('Invalid data format. Expected array of todos or object with "todos" array');
            }
        }
        
        // Validate each todo
        this.importData.todos.forEach((todo, index) => {
            if (!todo.text || typeof todo.text !== 'string') {
                throw new Error(`Todo at index ${index} is missing text property`);
            }
            
            // Ensure required properties exist
            todo.text = todo.text.toString().trim();
            todo.completed = Boolean(todo.completed);
            
            if (!todo.createdAt) todo.createdAt = new Date().toISOString();
            if (!todo.updatedAt) todo.updatedAt = new Date().toISOString();
        });
    },

    // Show import statistics
    showImportStats() {
        if (!this.importData || !this.importData.todos) return;
        
        const todos = this.importData.todos;
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const active = total - completed;
        
        // Check for duplicates with existing todos
        const existingTodos = TodoManager.todos.map(t => t.text.toLowerCase());
        const duplicates = todos.filter(t => 
            existingTodos.includes(t.text.toLowerCase())
        ).length;
        
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statActive').textContent = active;
        document.getElementById('statCompleted').textContent = completed;
        document.getElementById('statDuplicates').textContent = duplicates;
        
        document.getElementById('importStats').style.display = 'block';
    },

    // Handle export
    handleExport() {
        const jsonEditor = document.getElementById('jsonEditor');
        
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
                content = jsonEditor.value;
                filename = `todos-export-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                
            } else if (this.currentFormat === 'txt') {
                // Export as text
                content = jsonEditor.value;
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
            
            UIManager.showNotification(`Todos exported successfully as ${this.currentFormat.toUpperCase()}`, 'success');
            this.closeModal();
            
        } catch (error) {
            this.showError('Invalid JSON format: ' + error.message);
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
        let imported = 0;
        let errors = 0;
        
        this.showProgress('Starting import...', 0);
        this.hideError();
        
        try {
            for (let i = 0; i < todos.length; i++) {
                const todo = todos[i];
                const progress = Math.round((i / total) * 100);
                this.showProgress(`Importing ${i + 1} of ${total}...`, progress);
                
                try {
                    // Check if todo already exists (case-insensitive)
                    const existingTodos = TodoManager.todos.map(t => t.text.toLowerCase());
                    const isDuplicate = existingTodos.includes(todo.text.toLowerCase());
                    
                    if (!isDuplicate) {
                        // Add todo to Firestore
                        await TodoManager.addTodo(todo.text, todo.completed);
                        imported++;
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
                const summary = `Imported ${imported} new todos`;
                const duplicateCount = total - imported - errors;
                const errorCount = errors;
                
                let message = summary;
                if (duplicateCount > 0) message += `, skipped ${duplicateCount} duplicates`;
                if (errorCount > 0) message += `, ${errorCount} errors`;
                
                UIManager.showNotification(message, imported > 0 ? 'success' : 'info');
                this.closeModal();
            }, 1000);
            
        } catch (error) {
            this.showError('Import failed: ' + error.message);
            this.hideProgress();
        }
    },

    // Clear JSON editor
    clearJsonEditor() {
        document.getElementById('jsonEditor').value = '';
    },

    // Show progress bar
    showProgress(text, percentage) {
        document.getElementById('progressText').textContent = text;
        document.getElementById('progressText').style.display = 'block';
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('progressBar').style.width = percentage + '%';
    },

    // Hide progress bar
    hideProgress() {
        document.getElementById('progressText').style.display = 'none';
        document.getElementById('progressContainer').style.display = 'none';
        document.getElementById('progressBar').style.width = '0%';
    },

    // Show error message
    showError(message) {
        const errorElement = document.getElementById('importError');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    },

    // Hide error message
    hideError() {
        const errorElement = document.getElementById('importError');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    // Add this method to TodoManager for adding todos with completion status
    // We'll update the TodoManager.addTodo method in todos.js
};

// Update TodoManager.addTodo to accept completion status parameter
// In js/todos.js, modify the addTodo method:
/*
addTodo(text, completed = false) {
    if (!this.todosRef) return;
    
    this.todosRef.add({
        text: text,
        completed: completed,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    }).then(() => {
        UIManager.showNotification('Task added successfully', 'success');
    }).catch((error) => {
        console.error("Error adding todo: ", error);
        UIManager.showNotification('Error adding task', 'error');
    });
}
*/