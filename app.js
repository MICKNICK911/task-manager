// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');

// Reference to the tasks collection in Firestore
const tasksCollection = db.collection('tasks');

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Add new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        try {
            // Add task to Firestore
            await tasksCollection.add({
                text: taskText,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                completed: false
            });
            
            // Clear input
            taskInput.value = '';
            
            // Reload tasks
            loadTasks();
            
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        }
    }
});

// Load tasks from Firestore
async function loadTasks() {
    try {
        tasksContainer.innerHTML = '<div class="loading">Loading tasks...</div>';
        
        // Get tasks ordered by creation date
        const snapshot = await tasksCollection
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    📝 No tasks yet! Add your first task above.
                </div>
            `;
            return;
        }
        
        // Clear container
        tasksContainer.innerHTML = '';
        
        // Add each task to the DOM
        snapshot.forEach(doc => {
            const task = doc.data();
            const taskId = doc.id;
            
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <span class="task-text">${task.text}</span>
                <button class="delete-btn" onclick="deleteTask('${taskId}')">
                    Delete
                </button>
            `;
            
            tasksContainer.appendChild(taskElement);
        });
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksContainer.innerHTML = '<div class="loading">Error loading tasks. Please refresh.</div>';
    }
}

// Delete task
async function deleteTask(taskId) {
    try {
        if (confirm('Are you sure you want to delete this task?')) {
            await tasksCollection.doc(taskId).delete();
            loadTasks(); // Reload the tasks
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
    }
}

// Make deleteTask function available globally
window.deleteTask = deleteTask;