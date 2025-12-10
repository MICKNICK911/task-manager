// UI Manager
const UIManager = {
    editingTodoId: null,

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    },

    cacheElements() {
        Utils.elements = {
            authContainer: document.getElementById('authContainer'),
            appContainer: document.getElementById('appContainer'),
            userEmail: document.getElementById('userEmail'),
            todoForm: document.getElementById('todoForm'),
            todoInput: document.getElementById('todoInput'),
            todoList: document.getElementById('todoList'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            notification: document.getElementById('notification'),
            totalTasks: document.getElementById('totalTasks'),
            activeTasks: document.getElementById('activeTasks'),
            completedTasks: document.getElementById('completedTasks')
        };
    },

    setupEventListeners() {
        // Todo form submission
        Utils.elements.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTodoSubmit();
        });

        // Filter buttons
        Utils.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleFilterChange(btn);
            });
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && 
                document.activeElement === Utils.elements.todoInput) {
                Utils.elements.todoForm.dispatchEvent(new Event('submit'));
            }

            // Escape to cancel editing
            if (e.key === 'Escape' && this.editingTodoId) {
                this.cancelEditing();
            }
        });
    },

    async handleTodoSubmit() {
        const text = Utils.elements.todoInput.value.trim();
        
        if (text) {
            let success;
            
            if (this.editingTodoId) {
                success = await TodoManager.updateTodo(this.editingTodoId, text);
                if (success) this.editingTodoId = null;
            } else {
                success = await TodoManager.addTodo(text);
            }
            
            if (success) {
                Utils.elements.todoInput.value = '';
                Utils.elements.todoInput.focus();
            }
        }
    },

    handleFilterChange(btn) {
        Utils.elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        TodoManager.currentFilter = filter;
        this.renderTodos(TodoManager.todos, filter);
    },

    updateUserEmail(email) {
        Utils.elements.userEmail.textContent = email;
    },

    showApp() {
        Utils.elements.authContainer.style.display = 'none';
        Utils.elements.appContainer.classList.add('active');
        Utils.elements.todoInput.focus();
    },

    hideApp() {
        Utils.elements.authContainer.style.display = 'flex';
        Utils.elements.appContainer.classList.remove('active');
    },

    resetForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        Utils.elements.todoInput.value = '';
    },

    showNotification(message, type = 'info') {
        const notification = Utils.elements.notification;
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    },

    renderTodos(todos, filter = 'all') {
        const todoList = Utils.elements.todoList;
        const filteredTodos = filter === 'all' ? todos : 
            filter === 'active' ? todos.filter(todo => !todo.completed) :
            todos.filter(todo => todo.completed);

        this.updateStats();

        if (filteredTodos.length === 0) {
            this.showEmptyState(todos.length, filter);
            return;
        }

        // Sort by creation date (newest first)
        const sortedTodos = [...filteredTodos].sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateB - dateA;
        });

        // Clear and render
        todoList.innerHTML = '';
        sortedTodos.forEach(todo => {
            todoList.appendChild(this.createTodoElement(todo));
        });
    },

    showEmptyState(totalTodos, filter) {
        const todoList = Utils.elements.todoList;
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

    createTodoElement(todo) {
        const li = Utils.createElement('li', {
            'class': `todo-item ${todo.completed ? 'completed' : ''}`,
            'data-id': todo.id
        });

        const checkbox = Utils.createElement('input', {
            'type': 'checkbox',
            'class': 'todo-checkbox',
            'checked': todo.completed
        });
        checkbox.addEventListener('change', () => {
            TodoManager.toggleTodoCompletion(todo.id, todo.completed);
        });

        const textSpan = Utils.createElement('span', {
            'class': `todo-text ${todo.completed ? 'completed' : ''}`
        }, todo.text);

        const timeText = todo.createdAt ? Utils.formatDate(todo.createdAt) : '';
        const timestampSpan = Utils.createElement('span', {
            'class': 'timestamp'
        }, timeText);

        const actionsDiv = Utils.createElement('div', { 'class': 'todo-actions' });

        const editBtn = Utils.createElement('button', {
            'class': 'edit-btn',
            'title': 'Edit task'
        });
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', () => {
            this.startEditingTodo(todo.id, todo.text);
        });

        const deleteBtn = Utils.createElement('button', {
            'class': 'delete-btn',
            'title': 'Delete task'
        });
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

    startEditingTodo(id, currentText) {
        this.editingTodoId = id;
        const todoElement = document.querySelector(`.todo-item[data-id="${id}"]`);
        const textSpan = todoElement.querySelector('.todo-text');
        
        const editForm = Utils.createElement('form', { 'class': 'edit-form' });
        
        const editInput = Utils.createElement('input', {
            'type': 'text',
            'class': 'edit-input',
            'value': currentText,
            'required': true
        });
        
        const saveBtn = Utils.createElement('button', {
            'type': 'submit',
            'class': 'save-btn'
        });
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Save';
        
        const cancelBtn = Utils.createElement('button', {
            'type': 'button',
            'class': 'cancel-btn'
        });
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newText = editInput.value.trim();
            if (newText && newText !== currentText) {
                const success = await TodoManager.updateTodo(id, newText);
                if (success) {
                    this.editingTodoId = null;
                    // Re-render will happen via Firestore listener
                }
            } else {
                this.cancelEditing();
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.cancelEditing();
        });
        
        editForm.appendChild(editInput);
        editForm.appendChild(saveBtn);
        editForm.appendChild(cancelBtn);
        
        textSpan.replaceWith(editForm);
        editInput.focus();
        editInput.select();
    },

    cancelEditing() {
        this.editingTodoId = null;
        this.renderTodos(TodoManager.todos, TodoManager.currentFilter);
    },

    updateStats() {
        const stats = TodoManager.getStats();
        Utils.elements.totalTasks.textContent = stats.total;
        Utils.elements.activeTasks.textContent = stats.active;
        Utils.elements.completedTasks.textContent = stats.completed;
    }
};