class GoalsManager {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.currentGoal = null;
        this.filters = {
            status: 'all',
            category: 'all',
            type: 'all',
            search: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderGoals();
        this.updateStats();
        this.initCharts();
    }

    setupEventListeners() {
        // Formulaire
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });

        // Filtres
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderGoals();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.renderGoals();
        });

        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.renderGoals();
        });

        document.getElementById('goalsSearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.renderGoals();
        });
    }

    addGoal() {
        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const category = document.getElementById('goalCategory').value;
        const priority = document.getElementById('goalPriority').value;
        const startDate = document.getElementById('goalStartDate').value;
        const targetDate = document.getElementById('goalTargetDate').value;
        const type = document.getElementById('goalType').value;

        if (!title) {
            app.showNotification('Le titre est requis', 'error');
            return;
        }

        const goalData = {
            title,
            description,
            category,
            priority,
            startDate,
            targetDate,
            type,
            createdAt: new Date().toISOString(),
            completed: false
        };

        // Données spécifiques au type
        if (type === 'numeric') {
            goalData.targetValue = parseInt(document.getElementById('goalTargetValue').value) || 0;
            goalData.currentValue = parseInt(document.getElementById('goalCurrentValue').value) || 0;
            goalData.unit = document.getElementById('goalUnit').value || '';
        } else if (type === 'habit') {
            goalData.frequency = document.querySelector('input[name="frequency"]:checked').value;
            goalData.streak = 0;
            goalData.lastCompleted = null;
        }

        if (this.currentGoal) {
            // Mettre à jour l'objectif existant
            Object.assign(this.currentGoal, goalData);
            app.showNotification('Objectif mis à jour !');
        } else {
            // Créer un nouvel objectif
            const newGoal = {
                id: Date.now(),
                ...goalData
            };
            this.goals.push(newGoal);
            app.showNotification('Objectif créé !');
        }

        this.saveGoals();
        this.clearForm();
        this.renderGoals();
        this.updateStats();
        this.updateCharts();
    }

    toggleGoalType() {
        const type = document.getElementById('goalType').value;
        
        document.getElementById('numericFields').style.display = 
            type === 'numeric' ? 'block' : 'none';
        document.getElementById('habitFields').style.display = 
            type === 'habit' ? 'block' : 'none';
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            this.currentGoal = goal;
            
            // Remplir le formulaire
            document.getElementById('goalTitle').value = goal.title;
            document.getElementById('goalDescription').value = goal.description || '';
            document.getElementById('goalCategory').value = goal.category;
            document.getElementById('goalPriority').value = goal.priority;
            document.getElementById('goalStartDate').value = goal.startDate || '';
            document.getElementById('goalTargetDate').value = goal.targetDate || '';
            document.getElementById('goalType').value = goal.type;
            
            // Remplir les champs spécifiques au type
            if (goal.type === 'numeric') {
                document.getElementById('goalTargetValue').value = goal.targetValue || '';
                document.getElementById('goalCurrentValue').value = goal.currentValue || '';
                document.getElementById('goalUnit').value = goal.unit || '';
            } else if (goal.type === 'habit') {
                document.querySelector(`input[name="frequency"][value="${goal.frequency}"]`).checked = true;
            }
            
            this.toggleGoalType();
            document.getElementById('goalForm').scrollIntoView();
        }
    }

    deleteGoal(goalId) {
        if (confirm('Supprimer cet objectif ?')) {
            this.goals = this.goals.filter(goal => goal.id !== goalId);
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            this.updateCharts();
            app.showNotification('Objectif supprimé');
        }
    }

    toggleGoalCompletion(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            
            if (goal.completed) {
                goal.completedAt = new Date().toISOString();
                
                // Pour les habitudes, mettre à jour la série
                if (goal.type === 'habit') {
                    this.updateHabitStreak(goal);
                }
            }
            
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            this.updateCharts();
            
            app.showNotification(goal.completed ? 'Objectif atteint ! 🎉' : 'Objectif réactivé');
        }
    }

    updateHabitStreak(goal) {
        const today = new Date().toDateString();
        const lastCompleted = goal.lastCompleted ? new Date(goal.lastCompleted).toDateString() : null;
        
        if (lastCompleted === today) {
            return; // Déjà complété aujourd'hui
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastCompleted === yesterday.toDateString()) {
            goal.streak++;
        } else {
            goal.streak = 1;
        }
        
        goal.lastCompleted = new Date().toISOString();
    }

    updateGoalProgress(goalId, newValue) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal && goal.type === 'numeric') {
            goal.currentValue = Math.min(newValue, goal.targetValue);
            
            // Vérifier si l'objectif est atteint
            if (goal.currentValue >= goal.targetValue && !goal.completed) {
                goal.completed = true;
                goal.completedAt = new Date().toISOString();
                app.showNotification('Objectif atteint ! 🎉');
            }
            
            this.saveGoals();
            this.renderGoals();
            this.updateStats();
            this.updateCharts();
        }
    }

    getFilteredGoals() {
        return this.goals.filter(goal => {
            // Filtre statut
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'active' && goal.completed) return false;
                if (this.filters.status === 'completed' && !goal.completed) return false;
                if (this.filters.status === 'overdue' && !this.isOverdue(goal)) return false;
            }

            // Filtre catégorie
            if (this.filters.category !== 'all' && goal.category !== this.filters.category) {
                return false;
            }

            // Filtre type
            if (this.filters.type !== 'all' && goal.type !== this.filters.type) {
                return false;
            }

            // Filtre recherche
            if (this.filters.search && !goal.title.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            return true;
        });
    }

    renderGoals() {
        const goals = this.getFilteredGoals();
        const container = document.getElementById('goalsList');
        
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>Aucun objectif trouvé</h3>
                    <p>Crée ton premier objectif pour commencer !</p>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => this.renderGoalCard(goal)).join('');
    }

    renderGoalCard(goal) {
        const progress = this.calculateProgress(goal);
        const isOverdue = this.isOverdue(goal);
        
        return `
            <div class="goal-card ${goal.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                <div class="goal-header">
                    <div class="goal-checkbox" onclick="goalsManager.toggleGoalCompletion(${goal.id})">
                        <i class="fas fa-${goal.completed ? 'check-circle' : 'circle'}"></i>
                    </div>
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-actions">
                        <button class="btn-icon" onclick="goalsManager.editGoal(${goal.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="goalsManager.deleteGoal(${goal.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${goal.description ? `
                    <div class="goal-description">${goal.description}</div>
                ` : ''}
                
                <div class="goal-meta">
                    <span class="goal-category ${goal.category}">
                        <i class="fas ${this.getCategoryIcon(goal.category)}"></i>
                        ${this.getCategoryLabel(goal.category)}
                    </span>
                    
                    <span class="goal-priority ${goal.priority}">
                        <i class="fas ${this.getPriorityIcon(goal.priority)}"></i>
                        ${this.getPriorityLabel(goal.priority)}
                    </span>
                    
                    ${goal.targetDate ? `
                        <span class="goal-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(goal.targetDate)}
                        </span>
                    ` : ''}
                </div>
                
                ${goal.type === 'numeric' ? this.renderNumericProgress(goal, progress) : ''}
                ${goal.type === 'habit' ? this.renderHabitProgress(goal) : ''}
                
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>
            </div>
        `;
    }

    renderNumericProgress(goal, progress) {
        return `
            <div class="numeric-progress">
                <div class="progress-values">
                    <span>${goal.currentValue} ${goal.unit}</span>
                    <span>sur ${goal.targetValue} ${goal.unit}</span>
                </div>
                <div class="progress-controls">
                    <button class="btn-small" onclick="goalsManager.updateGoalProgress(${goal.id}, ${goal.currentValue - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn-small" onclick="goalsManager.updateGoalProgress(${goal.id}, ${goal.currentValue + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderHabitProgress(goal) {
        return `
            <div class="habit-progress">
                <div class="streak-counter">
                    <i class="fas fa-fire"></i>
                    Série actuelle : ${goal.streak} jours
                </div>
                <div class="frequency">
                    Fréquence : ${this.getFrequencyLabel(goal.frequency)}
                </div>
            </div>
        `;
    }

    calculateProgress(goal) {
        if (goal.completed) return 100;
        
        switch (goal.type) {
            case 'numeric':
                if (goal.targetValue > 0) {
                    return (goal.currentValue / goal.targetValue) * 100;
                }
                return 0;
                
            case 'habit':
                // Calcul basé sur la série et la fréquence
                return Math.min((goal.streak / 30) * 100, 100); // 30 jours max
                
            case 'binary':
            default:
                return goal.completed ? 100 : 0;
        }
    }

    isOverdue(goal) {
        if (goal.completed || !goal.targetDate) return false;
        return new Date(goal.targetDate) < new Date();
    }

    // Statistiques
    updateStats() {
        const total = this.goals.length;
        const completed = this.goals.filter(g => g.completed).length;
        const active = total - completed;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('totalGoals').textContent = total;
        document.getElementById('completedGoals').textContent = completed;
        document.getElementById('activeGoals').textContent = active;
        document.getElementById('successRate').textContent = successRate + '%';
    }

    // Graphiques
    initCharts() {
        this.updateCharts();
    }

    updateCharts() {
        this.renderGoalsByCategoryChart();
        this.renderMonthlyProgressChart();
    }

    renderGoalsByCategoryChart() {
        const ctx = document.getElementById('goalsByCategoryChart').getContext('2d');
        const categories = this.getGoalsByCategory();
        
        if (window.goalsByCategoryChart) {
            window.goalsByCategoryChart.destroy();
        }

        window.goalsByCategoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(c => c.category),
                datasets: [{
                    data: categories.map(c => c.count),
                    backgroundColor: [
                        '#667eea', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#ffd400'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderMonthlyProgressChart() {
        const ctx = document.getElementById('monthlyProgressChart').getContext('2d');
        const monthlyData = this.getMonthlyProgress();
        
        if (window.monthlyProgressChart) {
            window.monthlyProgressChart.destroy();
        }

        window.monthlyProgressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(m => m.month),
                datasets: [{
                    label: 'Objectifs complétés',
                    data: monthlyData.map(m => m.completed),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    getGoalsByCategory() {
        const categories = {};
        this.goals.forEach(goal => {
            categories[goal.category] = (categories[goal.category] || 0) + 1;
        });
        
        return Object.entries(categories).map(([category, count]) => ({
            category: this.getCategoryLabel(category),
            count
        }));
    }

    getMonthlyProgress() {
        const months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleDateString('fr-FR', { month: 'short' });
            
            const completed = this.goals.filter(goal => {
                if (!goal.completedAt) return false;
                const completedDate = new Date(goal.completedAt);
                return completedDate.getMonth() === date.getMonth() && 
                       completedDate.getFullYear() === date.getFullYear();
            }).length;
            
            months.push({ month: monthKey, completed });
        }
        
        return months;
    }

    // Utilitaires
    getCategoryIcon(category) {
        const icons = {
            personal: 'fa-user',
            career: 'fa-briefcase',
            education: 'fa-graduation-cap',
            health: 'fa-heartbeat',
            financial: 'fa-money-bill-wave',
            relationships: 'fa-users',
            hobbies: 'fa-palette'
        };
        return icons[category] || 'fa-bullseye';
    }

    getCategoryLabel(category) {
        const labels = {
            personal: 'Personnel',
            career: 'Carrière',
            education: 'Éducation',
            health: 'Santé',
            financial: 'Finances',
            relationships: 'Relations',
            hobbies: 'Loisirs'
        };
        return labels[category] || 'Autre';
    }

    getPriorityIcon(priority) {
        const icons = {
            low: 'fa-arrow-down',
            medium: 'fa-minus',
            high: 'fa-arrow-up'
        };
        return icons[priority] || 'fa-circle';
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Basse',
            medium: 'Moyenne',
            high: 'Haute'
        };
        return labels[priority] || 'Moyenne';
    }

    getFrequencyLabel(frequency) {
        const labels = {
            daily: 'Quotidien',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel'
        };
        return labels[frequency] || 'Quotidien';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    clearForm() {
        document.getElementById('goalForm').reset();
        this.currentGoal = null;
        this.toggleGoalType();
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    // Export/Import
    exportGoals() {
        const data = JSON.stringify(this.goals, null, 2);
        this.downloadFile(data, 'mes-objectifs.json', 'application/json');
    }

    downloadFile(content, fileName, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialisation
const goalsManager = new GoalsManager();
