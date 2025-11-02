// Gestion avancée des tâches
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentView = 'list';
        this.filters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            search: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    setupEventListeners() {
        // Formulaire
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filtres
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderTasks();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.renderTasks();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.renderTasks();
        });

        document.getElementById('taskSearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.renderTasks();
        });
    }

    addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;

        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            category,
            status: 'pending',
            createdAt: new Date().toISOString(),
            completed: false,
            subtasks: [],
            tags: []
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.clearForm();
        
        app.showNotification('Tâche ajoutée avec succès !');
    }

    deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            app.showNotification('Tâche supprimée');
        }
    }

    toggleTaskStatus(taskId) {
        this.tasks = this.tasks.map(task => {
            if (task.id === taskId) {
                return { 
                    ...task, 
                    completed: !task.completed,
                    status: !task.completed ? 'completed' : 'pending'
                };
            }
            return task;
        });
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    updateTaskPriority(taskId, newPriority) {
        this.tasks = this.tasks.map(task => 
            task.id === taskId ? { ...task, priority: newPriority } : task
        );
        this.saveTasks();
        this.renderTasks();
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            // Filtre statut
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'pending' && task.completed) return false;
                if (this.filters.status === 'completed' && !task.completed) return false;
            }

            // Filtre priorité
            if (this.filters.priority !== 'all' && task.priority !== this.filters.priority) {
                return false;
            }

            // Filtre catégorie
            if (this.filters.category !== 'all' && task.category !== this.filters.category) {
                return false;
            }

            // Filtre recherche
            if (this.filters.search && !task.title.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            return true;
        });
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (this.currentView === 'list') {
            this.renderListView(filteredTasks);
        } else {
            this.renderKanbanView(filteredTasks);
        }
    }

    renderListView(tasks) {
        const container = document.getElementById('tasksList');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Aucune tâche trouvée</h3>
                    <p>Ajoute ta première tâche pour commencer !</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''} priority-${task.priority}">
                <div class="task-header">
                    <div class="task-checkbox" onclick="taskManager.toggleTaskStatus(${task.id})">
                        <i class="fas fa-${task.completed ? 'check-circle' : 'circle'}"></i>
                    </div>
                    <div class="task-title">${task.title}</div>
                    <div class="task-actions">
                        <button class="btn-icon" onclick="taskManager.editTask(${task.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="taskManager.deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${task.description ? `
                    <div class="task-description">${task.description}</div>
                ` : ''}
                
                <div class="task-meta">
                    <span class="task-category ${task.category}">
                        <i class="fas ${this.getCategoryIcon(task.category)}"></i>
                        ${this.getCategoryLabel(task.category)}
                    </span>
                    
                    <span class="task-priority ${task.priority}">
                        <i class="fas ${this.getPriorityIcon(task.priority)}"></i>
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                    
                    ${task.dueDate ? `
                        <span class="task-due-date ${this.isOverdue(task.dueDate) ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(task.dueDate)}
                            ${this.isOverdue(task.dueDate) ? ' - En retard!' : ''}
                        </span>
                    ` : ''}
                </div>
                
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.completed ? '100' : '0'}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderKanbanView(tasks) {
        const todoColumn = document.getElementById('todoColumn');
        const inProgressColumn = document.getElementById('inProgressColumn');
        const doneColumn = document.getElementById('doneColumn');

        const todoTasks = tasks.filter(task => !task.completed && task.status === 'pending');
        const inProgressTasks = tasks.filter(task => !task.completed && task.status === 'inProgress');
        const doneTasks = tasks.filter(task => task.completed);

        todoColumn.innerHTML = todoTasks.map(task => this.renderKanbanTask(task)).join('');
        inProgressColumn.innerHTML = inProgressTasks.map(task => this.renderKanbanTask(task)).join('');
        doneColumn.innerHTML = doneTasks.map(task => this.renderKanbanTask(task)).join('');
    }

    renderKanbanTask(task) {
        return `
            <div class="kanban-task ${task.priority}" draggable="true" data-task-id="${task.id}">
                <div class="kanban-task-header">
                    <span class="task-priority-badge ${task.priority}"></span>
                    <div class="task-actions">
                        <button onclick="taskManager.toggleTaskStatus(${task.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
                <div class="kanban-task-title">${task.title}</div>
                ${task.dueDate ? `
                    <div class="kanban-task-due">${this.formatDate(task.dueDate)}</div>
                ` : ''}
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(task => 
            !task.completed && task.dueDate && this.isOverdue(task.dueDate)
        ).length;

        document.getElementById('totalTasksCount').textContent = total;
        document.getElementById('pendingTasksCount').textContent = pending;
        document.getElementById('completedTasksCount').textContent = completed;
        document.getElementById('overdueTasksCount').textContent = overdue;
    }

    // Utilitaires
    getCategoryIcon(category) {
        const icons = {
            work: 'fa-briefcase',
            study: 'fa-graduation-cap',
            personal: 'fa-user',
            health: 'fa-heartbeat',
            shopping: 'fa-shopping-cart',
            other: 'fa-circle'
        };
        return icons[category] || 'fa-circle';
    }

    getCategoryLabel(category) {
        const labels = {
            work: 'Travail',
            study: 'Études',
            personal: 'Personnel',
            health: 'Santé',
            shopping: 'Courses',
            other: 'Autre'
        };
        return labels[category] || 'Autre';
    }

    getPriorityIcon(priority) {
        const icons = {
            low: 'fa-arrow-down',
            medium: 'fa-minus',
            high: 'fa-arrow-up',
            urgent: 'fa-bolt'
        };
        return icons[priority] || 'fa-circle';
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Basse',
            medium: 'Moyenne',
            high: 'Haute',
            urgent: 'Urgente'
        };
        return labels[priority] || 'Moyenne';
    }

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date() && !this.tasks.find(t => t.dueDate === dueDate)?.completed;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    clearForm() {
        document.getElementById('taskForm').reset();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Méthodes supplémentaires
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            // Remplir le formulaire avec les données de la tâche
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskCategory').value = task.category;
            
            // Supprimer l'ancienne tâche
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            
            app.showNotification('Modifie la tâche et clique sur "Ajouter"');
        }
    }

    exportTasks() {
        const data = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mes-taches.json';
        a.click();
        URL.revokeObjectURL(url);
        
        app.showNotification('Tâches exportées avec succès !');
    }

    clearCompletedTasks() {
        if (confirm('Supprimer toutes les tâches terminées ?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            app.showNotification('Tâches terminées supprimées');
        }
    }
}

// Fonctions globales
function switchView(view) {
    taskManager.currentView = view;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Afficher/masquer les vues
    if (view === 'list') {
        document.getElementById('tasksList').style.display = 'block';
        document.getElementById('kanbanView').style.display = 'none';
    } else {
        document.getElementById('tasksList').style.display = 'none';
        document.getElementById('kanbanView').style.display = 'grid';
    }
    
    taskManager.renderTasks();
}

function clearForm() {
    document.getElementById('taskForm').reset();
}

function exportTasks() {
    taskManager.exportTasks();
}

function clearCompletedTasks() {
    taskManager.clearCompletedTasks();
}

// Initialisation
const taskManager = new TaskManager();
