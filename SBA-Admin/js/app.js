// Main application controller
const App = {
    saveTimeout: null,
    saveStatus: document.getElementById('saveStatus'),
    
    init: function() {
        // Initialize managers
        DataManager.init();
        ModalManager.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial UI render
        this.refreshUI();
        
        // Set up auto-save
        this.setupAutoSave();
        
        console.log('Student Results Manager initialized');
    },
    
    setupEventListeners: function() {
        // Main controls
        document.getElementById('reloadBtn').addEventListener('click', () => {
            if (confirm('Reload the page? All unsaved changes will be lost.')) {
                location.reload();
            }
        });
        
        document.getElementById('addTableBtn').addEventListener('click', () => this.addNewTable());
        document.getElementById('initialAddTable').addEventListener('click', () => this.addNewTable());
        
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            ExportManager.exportDataset();
        });
        
        document.getElementById('statisticsBtn').addEventListener('click', () => {
            const dataset = DataManager.getCurrentDataset();
            if (!dataset || dataset.tables.length === 0) {
                alert('No tables available. Please create tables first.');
                return;
            }
            ModalManager.renderStatistics();
            ModalManager.show('statistics');
        });
        
        document.getElementById('helpBtn').addEventListener('click', () => {
            ModalManager.renderHelp();
            ModalManager.show('help');
        });
        
        document.getElementById('bulkImportBtn').addEventListener('click', () => {
            document.getElementById('bulkFileInput').click();
        });
        
        document.getElementById('bulkExportBtn').addEventListener('click', () => {
            ExportManager.exportAllDatasets();
        });
        
        document.getElementById('bulkListBtn').addEventListener('click', () => {
            ModalManager.renderBulkList();
            ModalManager.show('bulkList');
        });
        
        document.getElementById('createNewDatasetBtn').addEventListener('click', () => {
            const name = prompt('Enter a name for the new dataset:', `Dataset ${DataManager.resultDatasets.length + 1}`);
            if (name) {
                DataManager.createNewDataset(name);
                ModalManager.hide('bulkList');
                this.refreshUI();
            }
        });
        
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL data? This action cannot be undone.')) {
                DataManager.clearAllData();
                this.refreshUI();
                this.updateSaveStatus('All data cleared');
            }
        });
        
        document.getElementById('dataIntegrityBtn').addEventListener('click', () => {
            ModalManager.showDataIntegrityReport();
        });
        
        // File inputs
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileImport(e.target.files[0]);
        });
        
        document.getElementById('bulkFileInput').addEventListener('change', (e) => {
            this.handleBulkImport(e.target.files);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveData();
            }
        });
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    },
    
    setupAutoSave: function() {
        const saveDebounced = Utils.debounce(() => {
            this.saveData();
        }, 1000);
        
        // Listen to all input events in tables container
        document.getElementById('tablesContainer').addEventListener('input', saveDebounced);
        document.getElementById('tablesContainer').addEventListener('blur', saveDebounced, true);
    },
    
    addNewTable: function() {
        const dataset = DataManager.getCurrentDataset();
        if (!dataset) return;
        
        TableManager.createNewTable(dataset);
        DataManager.saveToLocalStorage();
        this.refreshUI();
        this.updateSaveStatus('Table added');
    },
    
    handleFileImport: function(file) {
        if (!file) return;
        
        ExportManager.importDataset(file).then(summary => {
            this.refreshUI();
            this.showImportSummary(summary);
            document.getElementById('fileInput').value = '';
        }).catch(error => {
            alert(`Error importing file: ${error}`);
            document.getElementById('fileInput').value = '';
        });
    },
    
    handleBulkImport: function(files) {
        if (!files || files.length === 0) return;
        
        ExportManager.importBulkDatasets(files).then(() => {
            this.refreshUI();
            this.showImportSummary({ bulk: true, fileCount: files.length });
            document.getElementById('bulkFileInput').value = '';
        }).catch(error => {
            alert(`Error importing files: ${error}`);
            document.getElementById('bulkFileInput').value = '';
        });
    },
    
    showImportSummary: function(summary) {
        const container = document.getElementById('tablesContainer');
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'import-summary';
        
        if (summary.bulk) {
            summaryDiv.innerHTML = `
                <h4>✅ Bulk Import Successful</h4>
                <p>${summary.fileCount} file(s) imported successfully.</p>
                <p>Your datasets have been imported. All changes have been saved automatically.</p>
            `;
        } else {
            summaryDiv.innerHTML = `
                <h4>✅ Data Import Successful</h4>
                <ul>
                    <li>Tables added: ${summary.tablesAdded}</li>
                    <li>Tables updated: ${summary.tablesUpdated}</li>
                    <li>Students added: ${summary.studentsAdded}</li>
                    <li>Students updated: ${summary.studentsUpdated}</li>
                </ul>
                <p>Your data has been merged successfully. All changes have been saved automatically.</p>
            `;
        }
        
        container.insertBefore(summaryDiv, container.firstChild);
        
        setTimeout(() => {
            if (summaryDiv.parentNode) {
                summaryDiv.parentNode.removeChild(summaryDiv);
            }
        }, 5000);
    },
    
    refreshUI: function() {
        this.renderTables();
        this.updateCurrentDatasetIndicator();
        this.updateEmptyState();
    },
    
    renderTables: function() {
        const container = document.getElementById('tablesContainer');
        const dataset = DataManager.getCurrentDataset();
        
        if (!dataset || dataset.tables.length === 0) {
            container.innerHTML = '<div class="empty-state" id="emptyState">' +
                '<p>No tables created yet. Click "Add New Table" to get started.</p>' +
                '<button id="initialAddTable" class="btn-primary">📋 Create First Table</button>' +
                '</div>';
            
            // Reattach event listener
            document.getElementById('initialAddTable').addEventListener('click', () => this.addNewTable());
            return;
        }
        
        let html = '';
        dataset.tables.forEach(table => {
            html += this.renderTable(table);
        });
        
        container.innerHTML = html;
        
        // Attach event listeners to all tables
        this.attachTableEventListeners();
    },
    
    renderTable: function(table) {
        let catHeaders = '';
        table.catColumns.forEach(catColumn => {
            catHeaders += `<th>${catColumn.name} Marks ${catColumn.maxScore}</th>`;
        });
        
        let catColumnsList = '';
        table.catColumns.forEach((catColumn, index) => {
            catColumnsList += `
                <div class="cat-column-item">
                    <span class="cat-column-name">${catColumn.name}</span>
                    <span class="cat-column-max">Max: ${catColumn.maxScore}</span>
                    <div class="cat-column-actions">
                        <button class="btn-secondary edit-cat" data-table="${table.id}" data-index="${index}">✏️</button>
                        <button class="btn-danger delete-cat" data-table="${table.id}" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        let studentRows = '';
        table.students.forEach((student, index) => {
            let catMarks = '';
            table.catColumns.forEach(catColumn => {
                catMarks += `<td><span class="editable" contenteditable="true" data-table="${table.id}" data-student="${index}" data-cat="${catColumn.id}">${student.catMarks[catColumn.id] || 0}</span></td>`;
            });
            
            studentRows += `
                <tr>
                    <td><span class="editable" contenteditable="true" data-table="${table.id}" data-student="${index}" data-field="name">${student.name}</span></td>
                    ${catMarks}
                    <td>${student.catTotal}</td>
                    <td><span class="editable" contenteditable="true" data-table="${table.id}" data-student="${index}" data-field="exam">${student.exam}</span></td>
                    <td>${student.total}</td>
                    <td class="position-cell">${student.position}</td>
                    <td><button class="btn-danger delete-student" data-table="${table.id}" data-index="${index}">🗑️</button></td>
                </tr>
            `;
        });
        
        return `
            <div class="table-container" id="${table.id}">
                <div class="table-header">
                    <div class="table-title" contenteditable="true" data-table="${table.id}">${table.name}</div>
                    <div class="table-actions">
                        <button class="btn-info print-table" data-table="${table.id}">🖨️ Print</button>
                        <button class="btn-secondary clone-table" data-table="${table.id}">📝 Clone Names</button>
                        <button class="btn-success edit-name" data-table="${table.id}">✏️ Edit Name</button>
                        <button class="btn-danger delete-table" data-table="${table.id}">🗑️ Delete</button>
                    </div>
                </div>
                <div class="cat-config">
                    <div class="cat-config-header">
                        <div class="cat-config-title">CAT Columns Configuration</div>
                        <button class="btn-primary add-cat-btn" data-table="${table.id}">➕ Add CAT Column</button>
                    </div>
                    <div class="cat-columns-list">
                        ${catColumnsList}
                    </div>
                    <div class="add-cat-form" id="add-cat-form-${table.id}">
                        <input type="text" class="cat-name-input" placeholder="CAT Name">
                        <input type="number" class="cat-max-input" placeholder="Max Score" min="1" value="10">
                        <button class="btn-success save-cat" data-table="${table.id}">💾 Save</button>
                        <button class="btn-secondary cancel-cat" data-table="${table.id}">❌ Cancel</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>NAMES</th>
                            ${catHeaders}
                            <th>CAT Totals 50</th>
                            <th>EXAM Marks 50</th>
                            <th>TOTAL CAT+ EXAM Marks 100</th>
                            <th>POSITION S</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentRows}
                    </tbody>
                </table>
                <div style="padding: 15px 20px; border-top: 1px solid var(--border); text-align: center;">
                    <button class="btn-primary add-student" data-table="${table.id}">➕ Add Student</button>
                </div>
            </div>
        `;
    },
    
    attachTableEventListeners: function() {
        const container = document.getElementById('tablesContainer');
        
        // Table actions
        container.addEventListener('click', (e) => {
            const target = e.target;
            const tableId = target.dataset.table;
            
            if (!tableId) return;
            
            const dataset = DataManager.getCurrentDataset();
            const table = TableManager.findTableById(dataset, tableId);
            if (!table) return;
            
            if (target.classList.contains('print-table')) {
                ExportManager.printTable(tableId);
            } else if (target.classList.contains('clone-table')) {
                TableManager.createTableFromNames(dataset, tableId);
                DataManager.saveToLocalStorage();
                this.refreshUI();
                this.updateSaveStatus('Table cloned');
            } else if (target.classList.contains('edit-name')) {
                const title = container.querySelector(`#${tableId} .table-title`);
                title.focus();
                const range = document.createRange();
                range.selectNodeContents(title);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } else if (target.classList.contains('delete-table')) {
                if (confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
                    TableManager.deleteTable(dataset, tableId);
                    DataManager.saveToLocalStorage();
                    this.refreshUI();
                    this.updateSaveStatus('Table deleted');
                }
            } else if (target.classList.contains('add-student')) {
                TableManager.addStudentToTable(table);
                DataManager.saveToLocalStorage();
                this.refreshUI();
                this.updateSaveStatus('Student added');
            } else if (target.classList.contains('delete-student')) {
                const studentIndex = parseInt(target.dataset.index);
                if (confirm('Are you sure you want to delete this student?')) {
                    TableManager.deleteStudentFromTable(table, studentIndex);
                    DataManager.saveToLocalStorage();
                    this.refreshUI();
                    this.updateSaveStatus('Student deleted');
                }
            } else if (target.classList.contains('add-cat-btn')) {
                const form = document.getElementById(`add-cat-form-${tableId}`);
                form.style.display = 'flex';
                form.querySelector('.cat-name-input').focus();
            } else if (target.classList.contains('save-cat')) {
                const form = document.getElementById(`add-cat-form-${tableId}`);
                const nameInput = form.querySelector('.cat-name-input');
                const maxInput = form.querySelector('.cat-max-input');
                
                try {
                    CatManager.addCatColumn(table, nameInput.value, parseInt(maxInput.value));
                    DataManager.saveToLocalStorage();
                    this.refreshUI();
                    this.updateSaveStatus('CAT column added');
                    form.style.display = 'none';
                    nameInput.value = '';
                    maxInput.value = '10';
                } catch (error) {
                    alert(error.message);
                }
            } else if (target.classList.contains('cancel-cat')) {
                const form = document.getElementById(`add-cat-form-${tableId}`);
                form.style.display = 'none';
                form.querySelector('.cat-name-input').value = '';
                form.querySelector('.cat-max-input').value = '10';
            } else if (target.classList.contains('edit-cat')) {
                const catIndex = parseInt(target.dataset.index);
                const catColumn = table.catColumns[catIndex];
                const newName = prompt('Enter new name for CAT column:', catColumn.name);
                if (newName === null) return;
                
                const newMaxScore = parseInt(prompt('Enter new maximum score:', catColumn.maxScore));
                if (isNaN(newMaxScore) || newMaxScore <= 0) {
                    alert('Please enter a valid maximum score (greater than 0)');
                    return;
                }
                
                try {
                    CatManager.editCatColumn(table, catIndex, newName, newMaxScore);
                    DataManager.saveToLocalStorage();
                    this.refreshUI();
                    this.updateSaveStatus('CAT column updated');
                } catch (error) {
                    alert(error.message);
                }
            } else if (target.classList.contains('delete-cat')) {
                const catIndex = parseInt(target.dataset.index);
                const catColumn = table.catColumns[catIndex];
                if (!confirm(`Are you sure you want to delete the "${catColumn.name}" CAT column?`)) {
                    return;
                }
                
                try {
                    CatManager.deleteCatColumn(table, catIndex);
                    DataManager.saveToLocalStorage();
                    this.refreshUI();
                    this.updateSaveStatus('CAT column deleted');
                } catch (error) {
                    alert(error.message);
                }
            }
        });
        
        // Editable content
        container.addEventListener('blur', (e) => {
            const target = e.target;
            if (!target.classList.contains('editable')) return;
            
            const tableId = target.dataset.table;
            const studentIndex = parseInt(target.dataset.student);
            const field = target.dataset.field;
            const catId = target.dataset.cat;
            
            const dataset = DataManager.getCurrentDataset();
            const table = TableManager.findTableById(dataset, tableId);
            if (!table || !table.students[studentIndex]) return;
            
            if (field === 'name') {
                table.students[studentIndex].name = target.textContent || 'Unnamed Student';
            } else if (field === 'exam') {
                const value = Utils.parseMarkInput(target.textContent, 50);
                TableManager.updateStudentMark(table, studentIndex, 'exam', value);
            } else if (catId) {
                const catColumn = table.catColumns.find(cat => cat.id === catId);
                if (catColumn) {
                    const value = Utils.parseMarkInput(target.textContent, catColumn.maxScore);
                    TableManager.updateStudentCatMark(table, studentIndex, catId, value);
                }
            }
            
            DataManager.saveToLocalStorage();
            this.refreshUI();
        }, true);
        
        // Table title editing
        container.addEventListener('blur', (e) => {
            const target = e.target;
            if (!target.classList.contains('table-title')) return;
            
            const tableId = target.dataset.table;
            const dataset = DataManager.getCurrentDataset();
            const table = TableManager.findTableById(dataset, tableId);
            if (table) {
                table.name = target.textContent || `Class ${dataset.tableCounter}`;
                DataManager.saveToLocalStorage();
                this.updateSaveStatus('Table name updated');
            }
        }, true);
        
        // Handle Enter key in editable fields
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('editable')) {
                e.preventDefault();
                e.target.blur();
            }
            if (e.key === 'Enter' && e.target.classList.contains('table-title')) {
                e.preventDefault();
                e.target.blur();
            }
        });
    },
    
    updateCurrentDatasetIndicator: function() {
        const dataset = DataManager.getCurrentDataset();
        const indicator = document.getElementById('currentDatasetIndicator');
        const nameSpan = document.getElementById('currentDatasetName');
        
        if (dataset) {
            nameSpan.textContent = dataset.name;
            indicator.style.display = 'inline-flex';
        } else {
            indicator.style.display = 'none';
        }
    },
    
    updateEmptyState: function() {
        const container = document.getElementById('tablesContainer');
        const dataset = DataManager.getCurrentDataset();
        const emptyState = container.querySelector('.empty-state');
        
        if (!dataset || dataset.tables.length === 0) {
            if (!emptyState) {
                container.innerHTML = '<div class="empty-state" id="emptyState">' +
                    '<p>No tables created yet. Click "Add New Table" to get started.</p>' +
                    '<button id="initialAddTable" class="btn-primary">📋 Create First Table</button>' +
                    '</div>';
                document.getElementById('initialAddTable').addEventListener('click', () => this.addNewTable());
            }
        } else if (emptyState) {
            emptyState.remove();
        }
    },
    
    saveData: function() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.updateSaveStatus('Saving...');
        
        this.saveTimeout = setTimeout(() => {
            const success = DataManager.saveToLocalStorage();
            if (success) {
                this.updateSaveStatus('All changes saved', true);
            } else {
                this.updateSaveStatus('Error saving data', false);
            }
        }, 500);
    },
    
    updateSaveStatus: function(message, isSuccess = false) {
        this.saveStatus.textContent = message;
        this.saveStatus.className = isSuccess ? 'saved-indicator' : '';
        
        if (isSuccess) {
            setTimeout(() => {
                if (this.saveStatus.textContent === message) {
                    this.saveStatus.textContent = 'All changes saved';
                    this.saveStatus.className = 'saved-indicator';
                }
            }, 2000);
        }
    }
};

// Data integrity checker
const DataIntegrityChecker = {
    performDataIntegrityCheck: function() {
        const issues = [];
        
        DataManager.resultDatasets.forEach((dataset, datasetIndex) => {
            if (!dataset.id || !dataset.name) {
                issues.push(`Dataset ${datasetIndex + 1} is missing ID or name`);
            }
            
            dataset.tables.forEach((table, tableIndex) => {
                if (!table.id || !table.name) {
                    issues.push(`Table ${tableIndex + 1} in dataset "${dataset.name}" is missing ID or name`);
                }
                
                // Check for duplicate student names
                const studentNames = table.students.map(s => s.name);
                const duplicateNames = studentNames.filter((name, index) => studentNames.indexOf(name) !== index);
                if (duplicateNames.length > 0) {
                    issues.push(`Table "${table.name}" has duplicate student names: ${duplicateNames.join(', ')}`);
                }
                
                // Check for invalid marks
                table.students.forEach(student => {
                    table.catColumns.forEach(cat => {
                        const mark = student.catMarks[cat.id];
                        if (mark < 0 || mark > cat.maxScore) {
                            issues.push(`Invalid mark ${mark} for ${student.name} in ${cat.name} (should be 0-${cat.maxScore})`);
                        }
                    });
                    
                    if (student.exam < 0 || student.exam > 50) {
                        issues.push(`Invalid exam mark ${student.exam} for ${student.name} (should be 0-50)`);
                    }
                });
            });
        });
        
        return issues;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for debugging
if (typeof window !== 'undefined') {
    window.debugApp = {
        DataManager,
        TableManager,
        CatManager,
        ExportManager,
        Utils,
        DataIntegrityChecker
    };
}