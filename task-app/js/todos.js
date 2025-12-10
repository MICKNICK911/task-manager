// Todo Manager
const TodoManager = {
    todosRef: null,
    unsubscribe: null,
    todos: [],
    currentFilter: 'all',

    // Get user's todos collection reference
    getUserTodosRef(uid) {
        return db.collection('users').doc(uid).collection('todos');
    },

    // Initialize todos for a user
    init(uid) {
        this.todosRef = this.getUserTodosRef(uid);
        this.setupTodosListener();
    },

    // Setup real-time listener for todos
    setupTodosListener() {
        // Unsubscribe from previous listener if exists
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Set up real-time listener
        this.unsubscribe = this.todosRef.orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                this.todos = [];
                
                snapshot.forEach((doc) => {
                    this.todos.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                UIManager.renderTodos(this.todos, this.currentFilter);
            }, (error) => {
                console.error("Error listening to todos:", error);
                
                if (error.code === 'permission-denied') {
                    UIManager.showNotification('You do not have permission to access these todos', 'error');
                } else {
                    UIManager.showNotification('Error loading todos', 'error');
                }
            });
    },

    // Add a new todo
    addTodo(text, completed = false) {
        if (!this.todosRef) {
            console.error('Todos reference not initialized');
            return Promise.reject('Todos reference not initialized');
        }
        
        return this.todosRef.add({
            text: text,
            completed: completed,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }).then(() => {
            // Show notification
            if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                UIManager.showNotification('Task added successfully', 'success');
            }
            return true;
        }).catch((error) => {
            console.error("Error adding todo: ", error);
            if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                UIManager.showNotification('Error adding task', 'error');
            }
            return false;
        });
    },

    // Update todo text
    updateTodo(id, newText) {
        if (!this.todosRef) return;
        
        this.todosRef.doc(id).update({
            text: newText,
            updatedAt: FieldValue.serverTimestamp()
        }).then(() => {
            UIManager.showNotification('Task updated successfully', 'success');
        }).catch((error) => {
            console.error("Error updating todo: ", error);
            UIManager.showNotification('Error updating task', 'error');
        });
    },

    // Toggle todo completion
    toggleTodoCompletion(id, completed) {
        if (!this.todosRef) return;
        
        this.todosRef.doc(id).update({
            completed: !completed,
            updatedAt: FieldValue.serverTimestamp()
        }).catch((error) => {
            console.error("Error toggling todo completion: ", error);
            UIManager.showNotification('Error updating task status', 'error');
        });
    },

    // Delete a todo
    deleteTodo(id) {
        if (!this.todosRef) return;
        
        this.todosRef.doc(id).delete().then(() => {
            UIManager.showNotification('Task deleted successfully', 'success');
        }).catch((error) => {
            console.error("Error deleting todo: ", error);
            UIManager.showNotification('Error deleting task', 'error');
        });
    },

    // Get stats
    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        return { total, active, completed };
    },

    // Cleanup
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.todosRef = null;
        this.todos = [];
    }
};