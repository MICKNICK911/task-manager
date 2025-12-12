// CAT Column management
const CatManager = {
    // Add new CAT column to table
    addCatColumn: function(table, name, maxScore) {
        if (!name || !maxScore || maxScore <= 0) {
            throw new Error('Please enter a valid name and maximum score (greater than 0)');
        }
        
        if (table.catColumns.some(cat => cat.name === name)) {
            throw new Error('A CAT column with this name already exists');
        }
        
        const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        table.catColumns.push({
            id: id,
            name: name,
            maxScore: maxScore
        });
        
        // Add the new CAT column to all students
        table.students.forEach(student => {
            student.catMarks[id] = 0;
        });
        
        return table;
    },

    // Edit CAT column
    editCatColumn: function(table, catIndex, newName, newMaxScore) {
        if (!table.catColumns[catIndex]) {
            throw new Error('CAT column not found');
        }
        
        const catColumn = table.catColumns[catIndex];
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
        
        return table;
    },

    // Delete CAT column
    deleteCatColumn: function(table, catIndex) {
        if (!table.catColumns[catIndex]) {
            throw new Error('CAT column not found');
        }
        
        const catColumn = table.catColumns[catIndex];
        table.catColumns.splice(catIndex, 1);
        
        // Remove the CAT column from all students
        table.students.forEach(student => {
            delete student.catMarks[catColumn.id];
        });
        
        return table;
    },

    // Recalculate student totals
    recalculateStudentTotals: function(table, student) {
        // Calculate CAT total (sum of all CAT marks)
        student.catTotal = table.catColumns.reduce((sum, cat) => {
            return sum + (student.catMarks[cat.id] || 0);
        }, 0);
        
        // Ensure CAT total doesn't exceed 50
        student.catTotal = Math.min(student.catTotal, 50);
        
        // Calculate overall total
        student.total = student.catTotal + student.exam;
        
        return student;
    },

    // Update positions based on total marks
    updatePositions: function(table) {
        if (!table || !table.students || table.students.length === 0) {
            return table;
        }
        
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
        
        // Update the original array with sorted positions
        table.students.forEach(student => {
            const sortedStudent = sortedStudents.find(s => s.name === student.name);
            if (sortedStudent) {
                student.position = sortedStudent.position;
            }
        });
        
        return table;
    },

    // Create initial student with CAT columns
    createStudentWithCats: function(name, catColumns) {
        const student = {
            name: name,
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: {}
        };
        
        catColumns.forEach(cat => {
            student.catMarks[cat.id] = 0;
        });
        
        return student;
    }
};