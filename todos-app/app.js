// app.js
// Main application logic for Notes CRUD operations

// Global variables
let currentUser = null;
let currentNoteId = null; // For edit mode
let allNotes = []; // Store all notes for filtering

// DOM Elements
const notesContainer = document.getElementById('notes-container');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesCountElement = document.getElementById('notes-count');
const userEmailElement = document.getElementById('user-email');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up auth state observer [citation:2]
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            userEmailElement.textContent = user.email;
            loadNotes(); // Load user's notes
            setupRealtimeListener(); // Listen for real-time updates
        } else {
            // Redirect handled by auth.js
        }
    });
});

// Load notes from Firebase Realtime Database
function loadNotes() {
    if (!currentUser) return;
    
    // Get reference to user's notes in database
    const userNotesRef = database.ref('notes/' + currentUser.uid);
    
    // Fetch data once [citation:3]
    userNotesRef.get().then((snapshot) => {
        if (snapshot.exists()) {
            const notesData = snapshot.val();
            allNotes = [];
            
            // Convert object to array
            for (const noteId in notesData) {
                allNotes.push({
                    id: noteId,
                    ...notesData[noteId]
                });
            }
            
            // Apply sorting
            applySorting();
            displayNotes(allNotes);
            updateNotesCount();
        } else {
            // No notes found
            allNotes = [];
            displayNoNotes();
        }
    }).catch((error) => {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = '<div class="error">Error loading notes. Please refresh.</div>';
    });
}

// Set up real-time listener for note changes
function setupRealtimeListener() {
    if (!currentUser) return;
    
    const userNotesRef = database.ref('notes/' + currentUser.uid);
    
    // Listen for value changes [citation:3]
    userNotesRef.on('value', (snapshot) => {
        // This triggers whenever data changes
        if (snapshot.exists()) {
            const notesData = snapshot.val();
            allNotes = [];
            
            for (const noteId in notesData) {
                allNotes.push({
                    id: noteId,
                    ...notesData[noteId]
                });
            }
            
            applySorting();
            displayNotes(allNotes);
            updateNotesCount();
        } else {
            allNotes = [];
            displayNoNotes();
        }
    });
}

// Apply sorting based on selected option
function applySorting() {
    const sortBy = document.getElementById('sort-notes').value;
    
    switch(sortBy) {
        case 'newest':
            allNotes.sort((a, b) => b.createdAt - a.createdAt);
            break;
        case 'oldest':
            allNotes.sort((a, b) => a.createdAt - b.createdAt);
            break;
        case 'title':
            allNotes.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

// Display notes in the grid
function displayNotes(notes) {
    if (notes.length === 0) {
        displayNoNotes();
        return;
    }
    
    notesContainer.innerHTML = '';
    
    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        notesContainer.appendChild(noteElement);
    });
}

// Create HTML element for a single note
function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-card';
    noteDiv.dataset.id = note.id;
    
    // Format date
    const date = new Date(note.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    noteDiv.innerHTML = `
        <div class="note-title">${escapeHtml(note.title) || 'Untitled Note'}</div>
        <div class="note-content">${escapeHtml(note.content) || 'No content'}</div>
        <div class="note-meta">
            <span class="note-date">${formattedDate}</span>
            <div class="note-controls">
                <button onclick="editNote('${note.id}')" class="btn-control edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteNote('${note.id}')" class="btn-control delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return noteDiv;
}

// Display message when no notes exist
function displayNoNotes() {
    notesContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list fa-3x"></i>
            <h3>No Notes Yet</h3>
            <p>Create your first note using the form above!</p>
        </div>
    `;
    notesCountElement.textContent = '0 notes';
}

// Update notes count display
function updateNotesCount() {
    const count = allNotes.length;
    notesCountElement.textContent = `${count} note${count !== 1 ? 's' : ''}`;
}

// Create a new note
async function addNote() {
    if (!currentUser) {
        alert('Please login to create notes');
        return;
    }
    
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    // Validate input
    if (!title && !content) {
        document.getElementById('form-error').textContent = 'Note cannot be empty!';
        return;
    }
    
    // Clear any previous errors
    document.getElementById('form-error').textContent = '';
    
    const noteData = {
        title: title,
        content: content,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        userId: currentUser.uid
    };
    
    try {
        if (currentNoteId) {
            // Update existing note
            await updateNoteInDatabase(currentNoteId, noteData);
            currentNoteId = null;
        } else {
            // Create new note - push() generates unique ID [citation:3]
            await database.ref('notes/' + currentUser.uid).push(noteData);
        }
        
        // Clear form
        clearForm();
        
    } catch (error) {
        console.error('Error saving note:', error);
        document.getElementById('form-error').textContent = 'Failed to save note. Please try again.';
    }
}

// Update note in database
async function updateNoteInDatabase(noteId, noteData) {
    const noteRef = database.ref('notes/' + currentUser.uid + '/' + noteId);
    await noteRef.update({
        title: noteData.title,
        content: noteData.content,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
}

// Edit existing note
function editNote(noteId) {
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;
    
    // Populate form with note data
    noteTitleInput.value = note.title || '';
    noteContentInput.value = note.content || '';
    currentNoteId = noteId;
    
    // Change button text
    const addButton = document.querySelector('.btn-primary');
    addButton.innerHTML = '<i class="fas fa-save"></i> Update Note';
    
    // Scroll to form
    noteTitleInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete note with confirmation
async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const noteRef = database.ref('notes/' + currentUser.uid + '/' + noteId);
        await noteRef.remove(); // Remove from database [citation:3]
        
        // If deleting the note being edited, clear form
        if (currentNoteId === noteId) {
            clearForm();
        }
        
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
    }
}

// Filter notes based on search input
function filterNotes() {
    const searchTerm = document.getElementById('search-notes').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayNotes(allNotes);
        return;
    }
    
    const filteredNotes = allNotes.filter(note => {
        const title = note.title ? note.title.toLowerCase() : '';
        const content = note.content ? note.content.toLowerCase() : '';
        return title.includes(searchTerm) || content.includes(searchTerm);
    });
    
    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x"></i>
                <h3>No matching notes</h3>
                <p>Try a different search term.</p>
            </div>
        `;
    } else {
        displayNotes(filteredNotes);
    }
}

// Clear form and reset to create mode
function clearForm() {
    noteTitleInput.value = '';
    noteContentInput.value = '';
    currentNoteId = null;
    document.getElementById('form-error').textContent = '';
    
    // Reset button text
    const addButton = document.querySelector('.btn-primary');
    addButton.innerHTML = '<i class="fas fa-plus"></i> Add Note';
}

// Utility function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}