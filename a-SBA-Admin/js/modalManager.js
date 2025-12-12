// Modal management
const ModalManager = {
    modals: {
        statistics: document.getElementById('statisticsModal'),
        terminalReport: document.getElementById('terminalReportModal'),
        help: document.getElementById('helpModal'),
        bulkList: document.getElementById('bulkListModal')
    },

    init: function() {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) this.hide(modal);
            });
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hide(e.target);
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Object.values(this.modals).forEach(modal => {
                    if (modal.style.display === 'flex') {
                        this.hide(modal);
                    }
                });
            }
        });
    },

    show: function(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    hide: function(modal) {
        if (typeof modal === 'string') {
            modal = this.modals[modal];
        }
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Render statistics
    renderStatistics: function() {
        const container = document.getElementById('statisticsContainer');
        const dataset = DataManager.getCurrentDataset();
        
        if (!dataset || dataset.tables.length === 0) {
            container.innerHTML = '<p style="text-align: center;">No data available.</p>';
            return;
        }

        const allStudentNames = [...new Set(
            dataset.tables.flatMap(table => table.students.map(student => student.name))
        )].sort();

        const statisticsData = allStudentNames.map(name => {
            const totals = dataset.tables.map(table => {
                const student = table.students.find(s => s.name === name);
                return student ? student.total : 0;
            });
            
            const overallTotal = totals.reduce((sum, total) => sum + total, 0);
            return { name, totals, overallTotal };
        });

        // Sort by overall total
        statisticsData.sort((a, b) => b.overallTotal - a.overallTotal);

        // Assign positions
        let currentPosition = 1;
        let previousTotal = null;
        let skipPosition = 0;

        statisticsData.forEach((student, index) => {
            if (previousTotal !== null && student.overallTotal === previousTotal) {
                student.position = currentPosition;
                skipPosition++;
            } else {
                currentPosition = index + 1 - skipPosition;
                student.position = currentPosition;
            }
            previousTotal = student.overallTotal;
        });

        // Create table
        let html = `<table style="width: 100%;">
            <thead>
                <tr>
                    <th>NAMES</th>`;
        
        dataset.tables.forEach(table => {
            html += `<th>${table.name}</th>`;
        });
        
        html += `<th>TOTALS</th><th>POSITION</th></tr></thead><tbody>`;
        
        statisticsData.forEach(student => {
            html += `<tr>
                <td><span class="clickable-name" data-name="${student.name}">${student.name}</span></td>`;
            
            student.totals.forEach(total => {
                html += `<td>${total}</td>`;
            });
            
            html += `<td>${student.overallTotal}</td>
                <td>${student.position}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;

        // Add click handlers for student names
        container.querySelectorAll('.clickable-name').forEach(span => {
            span.addEventListener('click', (e) => {
                const studentName = e.target.dataset.name;
                this.renderTerminalReport(studentName);
                this.hide('statistics');
                this.show('terminalReport');
            });
        });
    },

    // Render terminal report
    renderTerminalReport: function(studentName) {
        const container = document.getElementById('terminalReportContainer');
        const dataset = DataManager.getCurrentDataset();
        
        if (!dataset) {
            container.innerHTML = '<p style="text-align: center;">No data available.</p>';
            return;
        }

        let html = `<div class="terminal-report">
            <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid var(--primary);">
                <h2 style="color: var(--primary);">Terminal Report: ${studentName}</h2>
                <p style="color: var(--gray);">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>SUBJECT</th>
                        <th>CAT TOTAL</th>
                        <th>EXAM</th>
                        <th>SUBJECT TOTAL</th>
                        <th>REMARKS</th>
                    </tr>
                </thead>
                <tbody>`;
        
        let grandTotal = 0;
        let totalPossible = 0;
        
        dataset.tables.forEach(table => {
            const student = table.students.find(s => s.name === studentName);
            if (student) {
                const subjectRemarks = Utils.getRemarks(student.total, 100);
                html += `<tr>
                    <td>${table.name}</td>
                    <td>${student.catTotal}</td>
                    <td>${student.exam}</td>
                    <td>${student.total}</td>
                    <td class="remarks-cell ${subjectRemarks.class}">${subjectRemarks.text}</td>
                </tr>`;
                
                grandTotal += student.total;
                totalPossible += 100;
            }
        });
        
        const overallPercentage = totalPossible > 0 ? (grandTotal / totalPossible) * 100 : 0;
        const overallRemarks = Utils.getRemarks(overallPercentage, 100);
        
        html += `<tr style="font-weight: bold; background-color: #f1f5fd;">
            <td colspan="3">GRAND TOTAL</td>
            <td>${grandTotal}</td>
            <td class="remarks-cell ${overallRemarks.class}">${overallRemarks.text}</td>
        </tr>`;
        
        html += `</tbody></table>
            <div class="comments-section">
                <h3 style="text-align: center;">Teacher Comments:</h3>
                <textarea id="reportComments" class="comments-textarea" placeholder="Enter teacher comments here..."></textarea>
            </div>
            <div class="terminal-report-actions">
                <button id="printReportBtn" class="btn-info">🖨️ Print Report</button>
                <button id="closeReportBtn" class="btn-secondary">❌ Close</button>
            </div>
        </div>`;
        
        container.innerHTML = html;
        
        // Add event listeners
        document.getElementById('printReportBtn').addEventListener('click', () => {
            ExportManager.printTerminalReport(studentName, document.getElementById('reportComments').value);
        });
        
        document.getElementById('closeReportBtn').addEventListener('click', () => {
            this.hide('terminalReport');
        });
    },

    // Render help content
    renderHelp: function() {
        const container = document.getElementById('helpContainer');
        container.innerHTML = `
            <div class="help-section">
                <h3>📋 Getting Started</h3>
                <p>Welcome to the Student Results Manager! This application helps teachers and school administrators manage student grades efficiently.</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>➕ Add New Table</h4>
                        <p>Create a new class or subject table with default student names.</p>
                    </div>
                    <div class="feature-card">
                        <h4>📝 Clone Names</h4>
                        <p>Create a new table with student names from an existing table (marks reset to 0).</p>
                    </div>
                    <div class="feature-card">
                        <h4>✏️ Edit Content</h4>
                        <p>Click on any cell to edit student names or marks. Changes save automatically.</p>
                    </div>
                    <div class="feature-card">
                        <h4>➕ Add Student</h4>
                        <p>Add new students to any table using the button at the bottom of each table.</p>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3>📚 Multiple Datasets</h3>
                <p>You can now work with multiple result datasets:</p>
                <ul>
                    <li><strong>Bulk Import:</strong> Import multiple datasets from JSON files</li>
                    <li><strong>Bulk Export:</strong> Export all your datasets as a single JSON file</li>
                    <li><strong>Bulk List:</strong> View and switch between all your datasets</li>
                    <li><strong>Dataset Management:</strong> Create new datasets or delete existing ones</li>
                </ul>
                <p>Each dataset acts as a separate workspace with its own tables and students.</p>
            </div>

            <div class="help-section">
                <h3>🔢 Flexible Mark Input</h3>
                <p>You can enter marks in several formats and they will be automatically converted:</p>
                <ul>
                    <li><strong>Fractions:</strong> e.g., "45/50" will be converted to the equivalent mark out of the category maximum</li>
                    <li><strong>Percentages:</strong> e.g., "90%" will be converted to 90% of the category maximum</li>
                    <li><strong>Direct numbers:</strong> e.g., "14" will be used directly (if within the allowed maximum)</li>
                </ul>
            </div>

            <div class="help-section">
                <h3>⚙️ Dynamic CAT Columns</h3>
                <p>You can now customize the CAT columns for each table:</p>
                <ul>
                    <li><strong>Add CAT Columns:</strong> Use the "Add CAT Column" button to create new assessment columns</li>
                    <li><strong>Set Maximum Scores:</strong> Define the maximum score for each CAT column</li>
                    <li><strong>Edit CAT Columns:</strong> Click the edit button to change a CAT column's name or maximum score</li>
                    <li><strong>Delete CAT Columns:</strong> Remove CAT columns you no longer need</li>
                </ul>
            </div>

            <div class="help-section">
                <h3>📊 Statistics & Reports</h3>
                <ul>
                    <li><strong>Statistics View:</strong> See an overview of all students across all tables</li>
                    <li><strong>Terminal Reports:</strong> Click on any student name to generate a detailed report card</li>
                    <li><strong>Print Reports:</strong> Generate professional A4-sized reports</li>
                </ul>
            </div>

            <div class="help-section" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid var(--primary);">
                <h3>🚀 Quick Start</h3>
                <p>Need a starting point? Download our template to see how the data should be structured.</p>
                <button id="exportTemplateBtn" class="btn-primary" style="margin-top: 15px;">
                    📥 Download Template
                </button>
            </div>

            <div class="help-section" style="text-align: center; margin-top: 20px;">
                <h3>🔍 Data Health Check</h3>
                <p>Run a comprehensive check to identify any data integrity issues in your datasets.</p>
                <button id="dataIntegrityBtn" class="btn-warning" style="margin-top: 15px;">
                    🔍 Run Data Integrity Check
                </button>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('exportTemplateBtn').addEventListener('click', ExportManager.exportDatasetTemplate);
        document.getElementById('dataIntegrityBtn').addEventListener('click', this.showDataIntegrityReport);
    },

    // Render bulk list
    renderBulkList: function() {
        const container = document.getElementById('bulkListContainer');
        
        if (DataManager.resultDatasets.length === 0) {
            container.innerHTML = '<p style="text-align: center;">No datasets available.</p>';
            return;
        }
        
        let html = '';
        DataManager.resultDatasets.forEach(dataset => {
            const studentCount = dataset.tables.reduce((total, table) => total + table.students.length, 0);
            const isActive = dataset.id === DataManager.currentDatasetId;
            
            html += `<div class="bulk-list-item ${isActive ? 'active' : ''}">
                <div class="bulk-list-item-info">
                    <div class="bulk-list-item-name">${dataset.name}</div>
                    <div class="bulk-list-item-details">${dataset.tables.length} table(s), ${studentCount} student(s)</div>
                </div>
                <div class="bulk-list-item-actions">
                    <button class="btn-primary switch-dataset" data-id="${dataset.id}">📋 Switch</button>
                    <button class="btn-danger delete-dataset" data-id="${dataset.id}">🗑️ Delete</button>
                </div>
            </div>`;
        });
        
        container.innerHTML = html;
        
        // Add event listeners
        container.querySelectorAll('.switch-dataset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const datasetId = e.target.dataset.id;
                DataManager.switchDataset(datasetId);
                this.hide('bulkList');
                App.refreshUI();
            });
        });
        
        container.querySelectorAll('.delete-dataset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const datasetId = e.target.dataset.id;
                if (DataManager.resultDatasets.length <= 1) {
                    alert('You cannot delete the last dataset. At least one dataset is required.');
                    return;
                }
                
                if (confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
                    DataManager.deleteDataset(datasetId);
                    this.renderBulkList();
                    App.refreshUI();
                }
            });
        });
    },

    // Show data integrity report
    showDataIntegrityReport: function() {
        const issues = DataIntegrityChecker.performDataIntegrityCheck();
        
        if (issues.length === 0) {
            alert('✅ No data integrity issues found! Your data is in good shape.');
            return;
        }
        
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Data Integrity Report</title>
                <style>
                    body { font-family: Arial; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #333; }
                    .issue { background: #f8f9fa; padding: 10px 15px; margin-bottom: 10px; border-left: 4px solid #dc3545; border-radius: 4px; }
                    .summary { background: #e8f5e8; padding: 15px; margin-top: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Data Integrity Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <h2>Issues Found (${issues.length})</h2>
                ${issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
                <div class="summary">
                    <h3>Recommendations</h3>
                    <ul>
                        <li>Review and fix the issues listed above</li>
                        <li>Export your data regularly as backup</li>
                        <li>Use the template for creating new datasets</li>
                    </ul>
                </div>
            </body>
            </html>
        `);
        reportWindow.document.close();
    }
};