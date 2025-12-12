/**
 * TODO APP - FRONTEND JAVASCRIPT
 * This file handles all user interactions and communicates with our API
 * Perfect for beginners to understand how frontend-backend communication works
 */

class TodoApp {
    constructor() {
        // API Base URL - Netlify will host our functions at /.netlify/functions/
        this.API_BASE_URL = '/.netlify/functions/todos';
        
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.clearAllBtn = document.getElementById('clearAll');
        this.statsElements = {
            total: document.getElementById('totalCount'),
            active: document.getElementById('activeCount'),
            completed: document.getElementById('completedCount')
        };
        
        // App State
        this.currentFilter = 'all';
        this.todos = [];
        this.isLoading = true;
        
        // Initialize the app
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Todo App...');
        
        // Load todos from database
        await this.loadTodos();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateUI();
        
        console.log('App initialized successfully!');
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Add todo button click
        this.addBtn.addEventListener('click', () => this.addTodo());
        
        // Add todo on Enter key
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter || e.target.closest('.filter-btn').dataset.filter);
            });
        });
        
        // Clear all completed
        this.clearAllBtn.addEventListener('click', () => this.clearCompleted());
    }
    
    /**
     * Load todos from the database
     */
    async loadTodos() {
        console.log('Loading todos from database...');
        this.showLoading(true);
        
        try {
            // Fetch todos from our Netlify function
            const response = await fetch(this.API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.todos = data;
            console.log(`Loaded ${this.todos.length} todos`);
            
        } catch (error) {
            console.error('Error loading todos:', error);
            alert('Failed to load todos. Please refresh the page.');
        } finally {
            this.showLoading(false);
            this.updateUI();
        }
    }
    
    /**
     * Add a new todo
     */
    async addTodo() {
        const text = this.todoInput.value.trim();
        
        // Validate input
        if (!text) {
            alert('Please enter a todo!');
            this.todoInput.focus();
            return;
        }
        
        if (text.length > 100) {
            alert('Todo must be less than 100 characters!');
            return;
        }
        
        console.log('Adding new todo:', text);
        
        try {
            // Send POST request to create new todo
            const response = await fetch(this.API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const newTodo = await response.json();
            
            // Add to local array
            this.todos.push(newTodo);
            
            // Clear input
            this.todoInput.value = '';
            
            // Update UI
            this.updateUI();
            
            console.log('Todo added successfully:', newTodo);
            
        } catch (error) {
            console.error('Error adding todo:', error);
            alert('Failed to add todo. Please try again.');
        }
    }
    
    /**
     * Toggle todo completion status
     */
    async toggleTodo(id) {
        console.log('Toggling todo:', id);
        
        const todoIndex = this.todos.findIndex(todo => todo.id === id);
        if (todoIndex === -1) return;
        
        const newCompleted = !this.todos[todoIndex].completed;
        
        try {
            // Send PATCH request to update todo
            const response = await fetch(`${this.API_BASE_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: newCompleted })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const updatedTodo = await response.json();
            
            // Update local array
            this.todos[todoIndex] = updatedTodo;
            
            // Update UI
            this.updateUI();
            
            console.log('Todo updated:', updatedTodo);
            
        } catch (error) {
            console.error('Error updating todo:', error);
            alert('Failed to update todo. Please try again.');
        }
    }
    
    /**
     * Delete a todo
     */
    async deleteTodo(id, event) {
        // Prevent event bubbling (so we don't trigger toggle)
        if (event) event.stopPropagation();
        
        console.log('Deleting todo:', id);
        
        if (!confirm('Are you sure you want to delete this todo?')) {
            return;
        }
        
        try {
            // Send DELETE request
            const response = await fetch(`${this.API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Remove from local array
            this.todos = this.todos.filter(todo => todo.id !== id);
            
            // Update UI
            this.updateUI();
            
            console.log('Todo deleted successfully');
            
        } catch (error) {
            console.error('Error deleting todo:', error);
            alert('Failed to delete todo. Please try again.');
        }
    }
    
    /**
     * Clear all completed todos
     */
    async clearCompleted() {
        const completedTodos = this.todos.filter(todo => todo.completed);
        
        if (completedTodos.length === 0) {
            alert('No completed todos to clear!');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${completedTodos.length} completed todos?`)) {
            return;
        }
        
        console.log('Clearing completed todos...');
        
        try {
            // Send DELETE request to clear completed
            const response = await fetch(`${this.API_BASE_URL}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Remove completed todos from local array
            this.todos = this.todos.filter(todo => !todo.completed);
            
            // Update UI
            this.updateUI();
            
            console.log('Completed todos cleared successfully');
            
        } catch (error) {
            console.error('Error clearing completed todos:', error);
            alert('Failed to clear completed todos. Please try again.');
        }
    }
    
    /**
     * Set the current filter
     */
    setFilter(filter) {
        console.log('Setting filter to:', filter);
        
        // Update active filter button
        this.filterButtons.forEach(button => {
            if (button.dataset.filter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update current filter
        this.currentFilter = filter;
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Get filtered todos based on current filter
     */
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }
    
    /**
     * Update all UI elements
     */
    updateUI() {
        // Update todo list
        this.renderTodoList();
        
        // Update stats
        this.updateStats();
        
        // Show/hide empty state
        this.toggleEmptyState();
    }
    
    /**
     * Render the todo list
     */
    renderTodoList() {
        // Clear current list
        this.todoList.innerHTML = '';
        
        // Get filtered todos
        const filteredTodos = this.getFilteredTodos();
        
        // Create todo items
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" 
                     onclick="app.toggleTodo('${todo.id}')"></div>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">
                    ${this.escapeHtml(todo.text)}
                </span>
                <button class="delete-btn" onclick="app.deleteTodo('${todo.id}', event)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add click event for the entire todo text
            const todoText = li.querySelector('.todo-text');
            todoText.addEventListener('click', () => this.toggleTodo(todo.id));
            
            this.todoList.appendChild(li);
        });
    }
    
    /**
     * Update statistics
     */
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        this.statsElements.total.textContent = total;
        this.statsElements.active.textContent = active;
        this.statsElements.completed.textContent = completed;
    }
    
    /**
     * Show/hide empty state
     */
    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const hasTodos = this.todos.length > 0;
        const hasFilteredTodos = this.getFilteredTodos().length > 0;
        
        emptyState.style.display = hasTodos && !hasFilteredTodos ? 'block' : 'none';
    }
    
    /**
     * Show/hide loading state
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
        this.isLoading = show;
    }
    
    /**
     * Helper function to escape HTML (prevent XSS)
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance (so we can access it from inline onclick handlers)
    window.app = new TodoApp();
    
    // Focus the input field
    document.getElementById('todoInput').focus();
    
    console.log('DOM loaded, app ready!');
});