// Export and import management
const ExportManager = {
    // Export single dataset
    exportDataset: function() {
        const dataset = DataManager.getCurrentDataset();
        if (!dataset || dataset.tables.length === 0) {
            alert('No data to export. Please add tables first.');
            return;
        }
        
        const exportData = {
            ...dataset,
            exportedAt: new Date().toISOString()
        };
        
        Utils.downloadFile(
            `student-results-${dataset.name.replace(/\s+/g, '-').toLowerCase()}.json`,
            JSON.stringify(exportData, null, 2)
        );
    },

    // Export all datasets (bulk)
    exportAllDatasets: function() {
        if (DataManager.resultDatasets.length === 0) {
            alert('No datasets to export. Please create datasets first.');
            return;
        }
        
        const exportData = {
            resultDatasets: DataManager.resultDatasets,
            currentDatasetId: DataManager.currentDatasetId,
            exportedAt: new Date().toISOString()
        };
        
        Utils.downloadFile(
            'student-results-bulk-data.json',
            JSON.stringify(exportData, null, 2)
        );
    },

    // Import single dataset
    importDataset: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    const currentDataset = DataManager.getCurrentDataset();
                    
                    if (!currentDataset) {
                        reject('No current dataset found');
                        return;
                    }
                    
                    if (!Array.isArray(importedData.tables)) {
                        reject('Invalid data format: tables array not found');
                        return;
                    }
                    
                    const summary = ExportManager.mergeImportedData(importedData);
                    resolve(summary);
                } catch (error) {
                    reject(`Error parsing JSON: ${error.message}`);
                }
            };
            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
        });
    },

    // Import multiple datasets (bulk)
    importBulkDatasets: function(files) {
        return new Promise((resolve, reject) => {
            const promises = Array.from(files).map(file => {
                return new Promise((resolveFile, rejectFile) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const importedData = JSON.parse(e.target.result);
                            
                            if (Array.isArray(importedData)) {
                                // List of datasets
                                importedData.forEach(data => {
                                    if (Utils.isValidDataset(data)) {
                                        ExportManager.importSingleDataset(data);
                                    }
                                });
                            } else if (Utils.isValidDataset(importedData)) {
                                // Single dataset
                                ExportManager.importSingleDataset(importedData);
                            } else if (importedData.resultDatasets) {
                                // Bulk export file
                                importedData.resultDatasets.forEach(dataset => {
                                    if (Utils.isValidDataset(dataset)) {
                                        ExportManager.importSingleDataset(dataset);
                                    }
                                });
                            }
                            resolveFile();
                        } catch (error) {
                            rejectFile(`Error processing ${file.name}: ${error.message}`);
                        }
                    };
                    reader.onerror = () => rejectFile(`Error reading ${file.name}`);
                    reader.readAsText(file);
                });
            });
            
            Promise.all(promises).then(() => {
                DataManager.saveToLocalStorage();
                resolve();
            }).catch(reject);
        });
    },

    // Import single dataset into collection
    importSingleDataset: function(importedDataset) {
        // Check if dataset with same ID already exists
        const existingIndex = DataManager.resultDatasets.findIndex(d => d.id === importedDataset.id);
        
        if (existingIndex !== -1) {
            // Update existing dataset
            DataManager.resultDatasets[existingIndex] = importedDataset;
        } else {
            // Add new dataset
            DataManager.resultDatasets.push(importedDataset);
        }
    },

    // Merge imported data with existing data
    mergeImportedData: function(importedData) {
        const currentDataset = DataManager.getCurrentDataset();
        if (!currentDataset) return { tablesAdded: 0, tablesUpdated: 0, studentsAdded: 0, studentsUpdated: 0 };
        
        const summary = { tablesAdded: 0, tablesUpdated: 0, studentsAdded: 0, studentsUpdated: 0 };
        
        // Update table counter
        const maxExistingId = currentDataset.tables.reduce((max, table) => {
            const idNum = parseInt(table.id.replace('table-', '')) || 0;
            return idNum > max ? idNum : max;
        }, 0);
        
        currentDataset.tableCounter = Math.max(currentDataset.tableCounter, maxExistingId + 1);
        
        // Process each imported table
        importedData.tables.forEach(importedTable => {
            const existingTable = currentDataset.tables.find(t => t.name === importedTable.name);
            
            if (existingTable) {
                summary.tablesUpdated++;
                
                importedTable.students.forEach(importedStudent => {
                    const existingStudent = existingTable.students.find(s => s.name === importedStudent.name);
                    
                    if (existingStudent) {
                        Object.assign(existingStudent, importedStudent);
                        summary.studentsUpdated++;
                    } else {
                        existingTable.students.push(importedStudent);
                        summary.studentsAdded++;
                    }
                });
                
                CatManager.updatePositions(existingTable);
            } else {
                const newTableId = `table-${currentDataset.tableCounter++}`;
                importedTable.id = newTableId;
                currentDataset.tables.push(importedTable);
                summary.tablesAdded++;
                summary.studentsAdded += importedTable.students.length;
            }
        });
        
        return summary;
    },

    // Print table
    printTable: function(tableId) {
        const dataset = DataManager.getCurrentDataset();
        const table = dataset.tables.find(t => t.id === tableId);
        if (!table) return;
        
        let catHeaders = '';
        table.catColumns.forEach(catColumn => {
            catHeaders += `<th>${catColumn.name} Marks ${catColumn.maxScore}</th>`;
        });
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${table.name} - Student Results</title>
                <style>
                    body { font-family: Arial; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    .position-cell { font-weight: bold; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>${table.name}</h1>
                    <p>Student Results Summary</p>
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
        printWindow.onload = function() { printWindow.print(); };
    },

    // Print terminal report
    printTerminalReport: function(studentName, comments) {
        const dataset = DataManager.getCurrentDataset();
        
        let grandTotal = 0;
        let totalPossible = 0;
        let subjectRows = '';
        
        dataset.tables.forEach(table => {
            const student = table.students.find(s => s.name === studentName);
            if (student) {
                const subjectRemarks = Utils.getRemarks(student.total, 100);
                subjectRows += `
                    <tr>
                        <td>${table.name}</td>
                        <td>${student.catTotal}</td>
                        <td>${student.exam}</td>
                        <td>${student.total}</td>
                        <td class="remarks-cell ${subjectRemarks.class}">${subjectRemarks.text}</td>
                    </tr>
                `;
                
                grandTotal += student.total;
                totalPossible += 100;
            }
        });
        
        const overallPercentage = totalPossible > 0 ? (grandTotal / totalPossible) * 100 : 0;
        const overallRemarks = Utils.getRemarks(overallPercentage, 100);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Terminal Report - ${studentName}</title>
                <style>
                    body { font-family: Arial; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    .remarks-cell { font-weight: bold; }
                    .remarks-excellent { color: #28a745; }
                    .remarks-very-good { color: #20c997; }
                    .remarks-good { color: #17a2b8; }
                    .remarks-pass { color: #ffc107; }
                    .remarks-fail { color: #dc3545; }
                    .comments-section { margin-top: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Terminal Report</h1>
                    <h2>${studentName}</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>SUBJECT</th>
                            <th>CAT TOTAL</th>
                            <th>EXAM</th>
                            <th>SUBJECT TOTAL</th>
                            <th>REMARKS</th>
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
        printWindow.onload = function() { printWindow.print(); };
    },

    // Export template
    exportDatasetTemplate: function() {
        const template = {
            id: Utils.generateId(),
            name: 'Template Dataset',
            tables: [
                {
                    id: 'table-1',
                    name: 'Mathematics',
                    catColumns: [...DataManager.defaultCatColumns],
                    students: DataManager.initialStudents.map(name => ({
                        name,
                        exam: 0,
                        catTotal: 0,
                        total: 0,
                        position: 0,
                        catMarks: DataManager.defaultCatColumns.reduce((acc, cat) => {
                            acc[cat.id] = 0;
                            return acc;
                        }, {})
                    }))
                }
            ],
            tableCounter: 2
        };
        
        Utils.downloadFile(
            'student-results-template.json',
            JSON.stringify(template, null, 2)
        );
    }
};