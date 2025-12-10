// Todo Manager
const TodoManager = {
    todosRef: null,
    unsubscribe: null,
    todos: [],
    currentFilter: 'all',

    init(db, userId) {
        this.todosRef = db.collection('users').doc(userId).collection('todos');
        this.setupTodosListener();
    },

    setupTodosListener() {
        // Unsubscribe from previous listener if exists
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Set up real-time listener
        this.unsubscribe = this.todosRef
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                (snapshot) => this.handleSnapshotUpdate(snapshot),
                (error) => this.handleSnapshotError(error)
            );
    },

    handleSnapshotUpdate(snapshot) {
        this.todos = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            this.todos.push({
                id: doc.id,
                text: data.text,
                completed: data.completed || false,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            });
        });
        
        UIManager.renderTodos(this.todos, this.currentFilter);
    },

    handleSnapshotError(error) {
        console.error("Error listening to todos:", error);
        
        if (error.code === 'permission-denied') {
            UIManager.showNotification('You do not have permission to access these todos', 'error');
        } else {
            UIManager.showNotification('Error loading todos', 'error');
        }
    },

    async addTodo(text) {
        if (!text.trim() || !this.todosRef) return;

        try {
            await this.todosRef.add({
                text: Utils.escapeHtml(text.trim()),
                completed: false,
                createdAt: FirebaseConfig.getFirestoreFieldValue().serverTimestamp(),
                updatedAt: FirebaseConfig.getFirestoreFieldValue().serverTimestamp()
            });
            UIManager.showNotification('Task added successfully', 'success');
            return true;
        } catch (error) {
            console.error("Error adding todo:", error);
            UIManager.showNotification('Error adding task', 'error');
            return false;
        }
    },

    async updateTodo(id, newText) {
        if (!this.todosRef) return;

        try {
            await this.todosRef.doc(id).update({
                text: Utils.escapeHtml(newText.trim()),
                updatedAt: FirebaseConfig.getFirestoreFieldValue().serverTimestamp()
            });
            UIManager.showNotification('Task updated successfully', 'success');
            return true;
        } catch (error) {
            console.error("Error updating todo:", error);
            UIManager.showNotification('Error updating task', 'error');
            return false;
        }
    },

    async toggleTodoCompletion(id, completed) {
        if (!this.todosRef) return;

        try {
            await this.todosRef.doc(id).update({
                completed: !completed,
                updatedAt: FirebaseConfig.getFirestoreFieldValue().serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error toggling todo completion:", error);
            UIManager.showNotification('Error updating task status', 'error');
            return false;
        }
    },

    async deleteTodo(id) {
        if (!this.todosRef) return;

        try {
            await this.todosRef.doc(id).delete();
            UIManager.showNotification('Task deleted successfully', 'success');
            return true;
        } catch (error) {
            console.error("Error deleting todo:", error);
            UIManager.showNotification('Error deleting task', 'error');
            return false;
        }
    },

    getFilteredTodos(filter) {
        this.currentFilter = filter;
        
        switch (filter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    },

    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        
        return { total, active, completed };
    },

    exportTodos() {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            count: this.todos.length,
            todos: this.todos.map(todo => ({
                text: todo.text,
                completed: todo.completed,
                createdAt: todo.createdAt?.toDate().toISOString() || new Date().toISOString(),
                updatedAt: todo.updatedAt?.toDate().toISOString() || new Date().toISOString()
            }))
        };
        
        return JSON.stringify(exportData, null, 2);
    },

    async importTodos(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.todos || !Array.isArray(data.todos)) {
                throw new Error('Invalid data format');
            }
            
            const importPromises = data.todos.map(todo => 
                this.addTodo(todo.text).then(() => {
                    if (todo.completed) {
                        // We would need to update to mark as completed
                        // This is simplified - in production you'd need to get the ID
                    }
                })
            );
            
            await Promise.all(importPromises);
            return true;
        } catch (error) {
            console.error('Error importing todos:', error);
            return false;
        }
    },

    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.todosRef = null;
        this.todos = [];
    },

    // Search functionality (optional enhancement)
    searchTodos(searchTerm) {
        return this.todos.filter(todo =>
            todo.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    },

    // Batch operations (optional enhancement)
    async completeAll() {
        if (!this.todosRef) return;
        
        const batch = this.db.batch();
        const incompleteTodos = this.todos.filter(todo => !todo.completed);
        
        incompleteTodos.forEach(todo => {
            const todoRef = this.todosRef.doc(todo.id);
            batch.update(todoRef, {
                completed: true,
                updatedAt: FirebaseConfig.getFirestoreFieldValue().serverTimestamp()
            });
        });
        
        try {
            await batch.commit();
            UIManager.showNotification('All tasks marked as complete', 'success');
        } catch (error) {
            console.error('Error completing all todos:', error);
            UIManager.showNotification('Error updating tasks', 'error');
        }
    }
};