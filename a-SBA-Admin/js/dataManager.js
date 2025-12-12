// Data management and state
const DataManager = {
    resultDatasets: [],
    currentDatasetId: null,
    STORAGE_KEY: 'studentResultsDataV2',
    defaultCatColumns: [
        { id: 'cat1', name: 'CAT1', maxScore: 15 },
        { id: 'cat2', name: 'CAT2', maxScore: 20 },
        { id: 'cat3', name: 'CAT3', maxScore: 15 }
    ],
    initialStudents: [
        "Student 1", "Student 2", "Student 3", "Student 4", "Student 5", 
        "Student 6", "Student 7", "Student 8", "Student 9", "Student 10"
    ],

    // Initialize data
    init: function() {
        this.loadFromLocalStorage();
        if (this.resultDatasets.length === 0) {
            this.createDefaultDataset();
        }
        if (!this.currentDatasetId && this.resultDatasets.length > 0) {
            this.currentDatasetId = this.resultDatasets[0].id;
        }
    },

    // Get current dataset
    getCurrentDataset: function() {
        return this.resultDatasets.find(dataset => dataset.id === this.currentDatasetId);
    },

    // Get current tables
    getCurrentTables: function() {
        const dataset = this.getCurrentDataset();
        return dataset ? dataset.tables : [];
    },

    // Load from localStorage
    loadFromLocalStorage: function() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Handle migration from v1 to v2
                if (parsedData.tables !== undefined) {
                    const datasetId = Utils.generateId();
                    this.resultDatasets = [{
                        id: datasetId,
                        name: 'Migrated Dataset',
                        tables: parsedData.tables || [],
                        tableCounter: parsedData.tableCounter || 1
                    }];
                    this.currentDatasetId = datasetId;
                } else {
                    this.resultDatasets = parsedData.resultDatasets || [];
                    this.currentDatasetId = parsedData.currentDatasetId || null;
                }
                
                // Ensure all datasets have proper structure
                this.resultDatasets.forEach(dataset => {
                    this.validateAndRepairDataset(dataset);
                });
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            this.resultDatasets = [];
            this.currentDatasetId = null;
        }
    },

    // Save to localStorage
    saveToLocalStorage: function() {
        try {
            const dataToSave = {
                resultDatasets: this.resultDatasets,
                currentDatasetId: this.currentDatasetId,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    },

    // Create default dataset
    createDefaultDataset: function() {
        const datasetId = Utils.generateId();
        this.resultDatasets.push({
            id: datasetId,
            name: 'Default Dataset',
            tables: [],
            tableCounter: 1
        });
        this.currentDatasetId = datasetId;
        this.saveToLocalStorage();
    },

    // Create new dataset
    createNewDataset: function(name) {
        const datasetId = Utils.generateId();
        const newDataset = {
            id: datasetId,
            name: name || `Dataset ${this.resultDatasets.length + 1}`,
            tables: [],
            tableCounter: 1
        };
        
        this.resultDatasets.push(newDataset);
        this.currentDatasetId = datasetId;
        this.saveToLocalStorage();
        return newDataset;
    },

    // Switch dataset
    switchDataset: function(datasetId) {
        this.currentDatasetId = datasetId;
        this.saveToLocalStorage();
    },

    // Delete dataset
    deleteDataset: function(datasetId) {
        this.resultDatasets = this.resultDatasets.filter(d => d.id !== datasetId);
        if (this.currentDatasetId === datasetId) {
            this.currentDatasetId = this.resultDatasets.length > 0 ? this.resultDatasets[0].id : null;
        }
        this.saveToLocalStorage();
    },

    // Validate and repair dataset
    validateAndRepairDataset: function(dataset) {
        if (!dataset.tables) dataset.tables = [];
        if (!dataset.tableCounter) dataset.tableCounter = 1;
        
        dataset.tables.forEach(table => {
            if (!table.catColumns) {
                table.catColumns = [...this.defaultCatColumns];
            }
            table.students.forEach(student => {
                if (!student.catMarks) {
                    student.catMarks = {};
                    table.catColumns.forEach(cat => {
                        student.catMarks[cat.id] = student[cat.id] || 0;
                    });
                }
                // Ensure all required properties exist
                if (!student.name) student.name = 'Unnamed Student';
                if (typeof student.exam !== 'number') student.exam = 0;
                if (typeof student.catTotal !== 'number') student.catTotal = 0;
                if (typeof student.total !== 'number') student.total = 0;
                if (typeof student.position !== 'number') student.position = 0;
                
                // Ensure all CAT columns have marks
                table.catColumns.forEach(cat => {
                    if (typeof student.catMarks[cat.id] !== 'number') {
                        student.catMarks[cat.id] = 0;
                    }
                });
            });
        });
        
        return dataset;
    },

    // Clear all data
    clearAllData: function() {
        this.resultDatasets = [];
        this.currentDatasetId = null;
        localStorage.removeItem(this.STORAGE_KEY);
    }
};