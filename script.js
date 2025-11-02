// Génération des particules
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Gestion des tâches
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function addTask() {
    const taskInput = document.getElementById('newTask');
    const text = taskInput.value.trim();
    
    if (text) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleDateString('fr-FR')
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        updateStats();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? {...task, completed: !task.completed} : task
    );
    saveTasks();
    renderTasks();
    updateStats();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <div class="task-text">${task.text}</div>
            <div class="task-actions">
                <button class="btn-complete" onclick="toggleTask(${task.id})">
                    ${task.completed ? '↶' : '✓'}
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">✕</button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

// Gestion des notes
function addNote() {
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (title && content) {
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            createdAt: new Date().toLocaleString('fr-FR')
        };
        
        notes.push(note);
        saveNotes();
        renderNotes();
        titleInput.value = '';
        contentInput.value = '';
        updateStats();
    }
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
    updateStats();
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.content}</div>
            <div class="note-actions">
                <button class="btn-delete" onclick="deleteNote(${note.id})">Supprimer</button>
            </div>
            <div class="note-date">${note.createdAt}</div>
        `;
        notesList.appendChild(noteElement);
    });
}

// Sauvegarde
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Statistiques
function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('totalNotes').textContent = notes.length;
}

// Raccourci clavier
document.getElementById('newTask').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    renderTasks();
    renderNotes();
    updateStats();
});
