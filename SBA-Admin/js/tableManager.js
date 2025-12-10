// Table management and rendering
const TableManager = {
    // Create a new table
    createNewTable: function(dataset) {
        const tableId = `table-${dataset.tableCounter++}`;
        
        const students = DataManager.initialStudents.map(name => {
            return CatManager.createStudentWithCats(name, DataManager.defaultCatColumns);
        });
        
        const tableData = {
            id: tableId,
            name: `Class ${dataset.tableCounter - 1}`,
            catColumns: JSON.parse(JSON.stringify(DataManager.defaultCatColumns)),
            students: students
        };
        
        dataset.tables.push(tableData);
        CatManager.updatePositions(tableData);
        return tableData;
    },

    // Create table from existing names
    createTableFromNames: function(dataset, sourceTableId) {
        const sourceTable = dataset.tables.find(t => t.id === sourceTableId);
        if (!sourceTable) return null;
        
        const tableId = `table-${dataset.tableCounter++}`;
        
        const students = sourceTable.students.map(student => {
            return CatManager.createStudentWithCats(student.name, sourceTable.catColumns);
        });
        
        const tableData = {
            id: tableId,
            name: `${sourceTable.name} (Copy)`,
            catColumns: JSON.parse(JSON.stringify(sourceTable.catColumns)),
            students: students
        };
        
        dataset.tables.push(tableData);
        CatManager.updatePositions(tableData);
        return tableData;
    },

    // Add student to table
    addStudentToTable: function(table) {
        const newStudent = CatManager.createStudentWithCats('New Student', table.catColumns);
        table.students.push(newStudent);
        CatManager.updatePositions(table);
        return newStudent;
    },

    // Delete student from table
    deleteStudentFromTable: function(table, studentIndex) {
        if (table.students[studentIndex]) {
            table.students.splice(studentIndex, 1);
            CatManager.updatePositions(table);
            return true;
        }
        return false;
    },

    // Update student marks
    updateStudentMark: function(table, studentIndex, markType, value) {
        const student = table.students[studentIndex];
        if (!student) return false;
        
        if (markType === 'exam') {
            student.exam = Math.min(Math.max(value, 0), 50);
        }
        
        CatManager.recalculateStudentTotals(table, student);
        CatManager.updatePositions(table);
        return true;
    },

    // Update CAT mark
    updateStudentCatMark: function(table, studentIndex, catId, value) {
        const student = table.students[studentIndex];
        if (!student) return false;
        
        const catColumn = table.catColumns.find(cat => cat.id === catId);
        if (!catColumn) return false;
        
        student.catMarks[catId] = Math.min(Math.max(value, 0), catColumn.maxScore);
        CatManager.recalculateStudentTotals(table, student);
        CatManager.updatePositions(table);
        return true;
    },

    // Find table by ID
    findTableById: function(dataset, tableId) {
        return dataset.tables.find(t => t.id === tableId);
    },

    // Find table index by ID
    findTableIndexById: function(dataset, tableId) {
        return dataset.tables.findIndex(t => t.id === tableId);
    },

    // Delete table
    deleteTable: function(dataset, tableId) {
        const index = this.findTableIndexById(dataset, tableId);
        if (index !== -1) {
            dataset.tables.splice(index, 1);
            return true;
        }
        return false;
    }
};