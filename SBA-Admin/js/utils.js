// Utility functions
const Utils = {
    // Generate unique ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // Parse mark input and convert to appropriate scale
    parseMarkInput: function(input, maxMark) {
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
    },

    // Get remarks based on score
    getRemarks: function(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        
        if (percentage >= 90) {
            return { text: 'Distinction', class: 'remarks-excellent' };
        } else if (percentage >= 80) {
            return { text: 'Excellent', class: 'remarks-excellent' };
        } else if (percentage >= 70) {
            return { text: 'Very Good', class: 'remarks-very-good' };
        } else if (percentage >= 60) {
            return { text: 'Good', class: 'remarks-good' };
        } else if (percentage >= 50) {
            return { text: 'Pass', class: 'remarks-pass' };
        } else {
            return { text: 'Fail', class: 'remarks-fail' };
        }
    },

    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format date
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Download file
    downloadFile: function(filename, content, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Validate dataset structure
    isValidDataset: function(data) {
        return data && 
               typeof data === 'object' && 
               data.id && 
               data.name && 
               Array.isArray(data.tables) &&
               typeof data.tableCounter === 'number';
    },

    // Calculate average
    calculateAverage: function(numbers) {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((a, b) => a + b, 0);
        return sum / numbers.length;
    },

    // Calculate median
    calculateMedian: function(numbers) {
        if (numbers.length === 0) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    },

    // Calculate standard deviation
    calculateStandardDeviation: function(numbers) {
        if (numbers.length === 0) return 0;
        const avg = this.calculateAverage(numbers);
        const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.calculateAverage(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }
};