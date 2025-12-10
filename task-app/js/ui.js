// UI Manager
const UIManager = {
    editingTodoId: null,

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    },

    // Render todos
    renderTodos(todos, filter = 'all') {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos(todos, filter);
        
        this.updateStats(todos);
        
        if (filteredTodos.length === 0) {
            this.showEmptyState(todos.length, filter);
            return;
        }
        
        // Sort by creation date (newest first)
        filteredTodos.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.toDate() - a.createdAt.toDate();
        });
        
        // Render each todo
        todoList.innerHTML = '';
        filteredTodos.forEach(todo => {
            todoList.appendChild(this.createTodoElement(todo));
        });
    },

    // Get filtered todos
    getFilteredTodos(todos, filter) {
        if (filter === 'active') {
            return todos.filter(todo => !todo.completed);
        } else if (filter === 'completed') {
            return todos.filter(todo => todo.completed);
        } else {
            return todos;
        }
    },

    // Show empty state
    showEmptyState(totalTodos, filter) {
        const todoList = document.getElementById('todoList');
        let message = '';
        
        if (totalTodos === 0) {
            message = 'No tasks yet. Add your first task above!';
        } else if (filter === 'active') {
            message = 'No active tasks. Great job!';
        } else if (filter === 'completed') {
            message = 'No completed tasks yet. Keep going!';
        }
        
        todoList.innerHTML = `
            <div class="empty-state">
                <h3>${message}</h3>
            </div>
        `;
    },

    // Update stats
    updateStats(todos) {
        const stats = this.calculateStats(todos);
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('activeTasks').textContent = stats.active;
        document.getElementById('completedTasks').textContent = stats.completed;
    },

    // Calculate stats
    calculateStats(todos) {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        return { total, active, completed };
    },

    // Create todo element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        // Format timestamp
        let timeText = '';
        if (todo.createdAt) {
            const date = todo.createdAt.toDate();
            timeText = date.toLocaleDateString();
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            TodoManager.toggleTodoCompletion(todo.id, todo.completed);
        });
        
        const textSpan = document.createElement('span');
        textSpan.className = `todo-text ${todo.completed ? 'completed' : ''}`;
        textSpan.textContent = todo.text;
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = timeText;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', () => {
            this.startEditingTodo(todo.id, todo.text);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                TodoManager.deleteTodo(todo.id);
            }
        });
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(timestampSpan);
        li.appendChild(actionsDiv);
        
        return li;
    },

    // Start editing a todo
    startEditingTodo(id, currentText) {
        this.editingTodoId = id;
        const todoElement = document.querySelector(`.todo-item[data-id="${id}"]`);
        const textSpan = todoElement.querySelector('.todo-text');
        
        const editForm = document.createElement('form');
        editForm.className = 'edit-form';
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = currentText;
        editInput.required = true;
        
        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Save';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newText = editInput.value.trim();
            if (newText && newText !== currentText) {
                TodoManager.updateTodo(id, newText);
            } else {
                this.renderTodos(TodoManager.todos, TodoManager.currentFilter);
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.renderTodos(TodoManager.todos, TodoManager.currentFilter);
        });
        
        editForm.appendChild(editInput);
        editForm.appendChild(saveBtn);
        editForm.appendChild(cancelBtn);
        
        textSpan.replaceWith(editForm);
        editInput.focus();
    },

    // Setup todo form
    setupTodoForm() {
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('todoInput').value.trim();
            
            if (text) {
                if (this.editingTodoId) {
                    TodoManager.updateTodo(this.editingTodoId, text);
                    this.editingTodoId = null;
                } else {
                    TodoManager.addTodo(text);
                }
                document.getElementById('todoInput').value = '';
            }
        });
    },

    // Setup filters
    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                TodoManager.currentFilter = btn.dataset.filter;
                this.renderTodos(TodoManager.todos, TodoManager.currentFilter);
            });
        });
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && 
                document.activeElement === document.getElementById('todoInput')) {
                document.getElementById('todoForm').dispatchEvent(new Event('submit'));
            }
            
            // Escape to cancel editing
            if (e.key === 'Escape' && this.editingTodoId) {
                this.renderTodos(TodoManager.todos, TodoManager.currentFilter);
                this.editingTodoId = null;
            }
        });
    },

    // Initialize UI manager
    init() {
        this.setupTodoForm();
        this.setupFilters();
        this.setupKeyboardShortcuts();
    }
};