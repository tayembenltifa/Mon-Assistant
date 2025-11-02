class ProfileManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || this.getDefaultUser();
        this.preferences = JSON.parse(localStorage.getItem('preferences')) || this.getDefaultPreferences();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.loadPreferences();
        this.updateStats();
        this.initCharts();
    }

    setupEventListeners() {
        // Navigation du profil
        document.querySelectorAll('.profile-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Formulaire informations personnelles
        document.getElementById('personalInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePersonalInfo();
        });

        // Thème
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.saveThemePreference(e.target.value);
            });
        });

        // Intérêts
        document.getElementById('interestInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addInterest();
            }
        });
    }

    switchSection(section) {
        // Mettre à jour la navigation
        document.querySelectorAll('.profile-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Afficher la section
        document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}Section`).classList.add('active');
    }

    loadUserData() {
        document.getElementById('userName').value = this.user.name || '';
        document.getElementById('userEmail').value = this.user.email || '';
        document.getElementById('userAge').value = this.user.age || '';
        document.getElementById('userLocation').value = this.user.location || '';
        document.getElementById('userBio').value = this.user.bio || '';
        
        this.renderInterests();
        this.updateAvatar();
    }

    loadPreferences() {
        // Thème
        const theme = this.preferences.theme || 'light';
        document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;

        // Notifications
        document.getElementById('notifyTasks').checked = this.preferences.notifications?.tasks ?? true;
        document.getElementById('notifyEvents').checked = this.preferences.notifications?.events ?? true;
        document.getElementById('notifyGoals').checked = this.preferences.notifications?.goals ?? false;

        // Affichage
        document.getElementById('defaultView').value = this.preferences.display?.defaultView || 'overview';
        document.getElementById('displayDensity').value = this.preferences.display?.density || 'comfortable';

        // Organisation
        document.getElementById('tasksSort').value = this.preferences.organization?.tasksSort || 'dueDate';
        document.getElementById('notesGrouping').value = this.preferences.organization?.notesGrouping || 'category';
    }

    savePersonalInfo() {
        this.user = {
            ...this.user,
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            age: document.getElementById('userAge').value,
            location: document.getElementById('userLocation').value,
            bio: document.getElementById('userBio').value,
            interests: this.user.interests || [],
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('user', JSON.stringify(this.user));
        app.showNotification('Informations sauvegardées !');
        
        // Mettre à jour le nom dans l'application
        if (window.app && this.user.name) {
            document.getElementById('userName').textContent = this.user.name;
        }
    }

    savePreferences() {
        this.preferences = {
            theme: document.querySelector('input[name="theme"]:checked').value,
            notifications: {
                tasks: document.getElementById('notifyTasks').checked,
                events: document.getElementById('notifyEvents').checked,
                goals: document.getElementById('notifyGoals').checked
            },
            display: {
                defaultView: document.getElementById('defaultView').value,
                density: document.getElementById('displayDensity').value
            },
            organization: {
                tasksSort: document.getElementById('tasksSort').value,
                notesGrouping: document.getElementById('notesGrouping').value
            }
        };

        localStorage.setItem('preferences', JSON.stringify(this.preferences));
        
        // Appliquer les préférences
        this.applyTheme();
        app.showNotification('Préférences sauvegardées !');
    }

    saveThemePreference(theme) {
        this.preferences.theme = theme;
        localStorage.setItem('preferences', JSON.stringify(this.preferences));
        this.applyTheme();
    }

    applyTheme() {
        const theme = this.preferences.theme;
        
        if (theme === 'auto') {
            // Détection automatique du thème du système
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    resetPreferences() {
        if (confirm('Réinitialiser toutes les préférences ?')) {
            this.preferences = this.getDefaultPreferences();
            localStorage.setItem('preferences', JSON.stringify(this.preferences));
            this.loadPreferences();
            this.applyTheme();
            app.showNotification('Préférences réinitialisées');
        }
    }

    // Gestion des intérêts
    addInterest() {
        const input = document.getElementById('interestInput');
        const interest = input.value.trim();
        
        if (interest && !this.user.interests.includes(interest)) {
            this.user.interests.push(interest);
            this.saveUserData();
            this.renderInterests();
            input.value = '';
        }
    }

    removeInterest(interest) {
        this.user.interests = this.user.interests.filter(i => i !== interest);
        this.saveUserData();
        this.renderInterests();
    }

    renderInterests() {
        const container = document.getElementById('interestsContainer');
        container.innerHTML = this.user.interests.map(interest => `
            <span class="interest-tag">
                ${interest}
                <button onclick="profileManager.removeInterest('${interest}')">×</button>
            </span>
        `).join('');
    }

    // Avatar
    changeAvatar() {
        // Simuler un changement d'avatar (dans une vraie app, on permettrait l'upload)
        const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧'];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        
        this.user.avatar = randomAvatar;
        this.saveUserData();
        this.updateAvatar();
        
        app.showNotification('Avatar mis à jour !');
    }

    updateAvatar() {
        const avatarElement = document.getElementById('userAvatar');
        if (this.user.avatar) {
            avatarElement.innerHTML = this.user.avatar;
        } else {
            avatarElement.innerHTML = '<i class="fas fa-user"></i>';
        }
    }

    // Statistiques
    updateStats() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const events = JSON.parse(localStorage.getItem('events')) || [];

        document.getElementById('profileTasksCount').textContent = tasks.length;
        document.getElementById('profileNotesCount').textContent = notes.length;
        document.getElementById('profileGoalsCount').textContent = goals.filter(g => !g.completed).length;
        document.getElementById('profileEventsCount').textContent = this.getUpcomingEventsCount(events);

        // Statistiques détaillées
        document.getElementById('totalTasksCreated').textContent = tasks.length;
        document.getElementById('tasksCompletionRate').textContent = this.calculateCompletionRate(tasks) + '%';
        document.getElementById('goalsAchieved').textContent = goals.filter(g => g.completed).length;
    }

    calculateCompletionRate(tasks) {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    }

    getUpcomingEventsCount(events) {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= nextWeek;
        }).length;
    }

    // Graphiques
    initCharts() {
        this.updateCharts();
    }

    updateCharts() {
        this.renderWeeklyProductivityChart();
        this.renderTasksDistributionChart();
        this.renderGoalsProgressChart();
        this.renderHourlyActivityChart();
        this.renderAchievements();
    }

    renderWeeklyProductivityChart() {
        const ctx = document.getElementById('weeklyProductivityChart').getContext('2d');
        const weeklyData = this.getWeeklyProductivityData();
        
        if (window.weeklyProductivityChart) {
            window.weeklyProductivityChart.destroy();
        }

        window.weeklyProductivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Tâches complétées',
                    data: weeklyData,
                    backgroundColor: '#667eea'
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

    renderTasksDistributionChart() {
        const ctx = document.getElementById('tasksDistributionChart').getContext('2d');
        const distributionData = this.getTasksDistributionData();
        
        if (window.tasksDistributionChart) {
            window.tasksDistributionChart.destroy();
        }

        window.tasksDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: distributionData.map(d => d.category),
                datasets: [{
                    data: distributionData.map(d => d.count),
                    backgroundColor: ['#667eea', '#f093fb', '#f5576c', '#4facfe', '#43e97b']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    renderGoalsProgressChart() {
        const ctx = document.getElementById('goalsProgressChart').getContext('2d');
        const progressData = this.getGoalsProgressData();
        
        if (window.goalsProgressChart) {
            window.goalsProgressChart.destroy();
        }

        window.goalsProgressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progressData.map(d => d.month),
                datasets: [{
                    label: 'Objectifs atteints',
                    data: progressData.map(d => d.completed),
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67, 233, 123, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    renderHourlyActivityChart() {
        const ctx = document.getElementById('hourlyActivityChart').getContext('2d');
        const activityData = this.getHourlyActivityData();
        
        if (window.hourlyActivityChart) {
            window.hourlyActivityChart.destroy();
        }

        window.hourlyActivityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => i + 'h'),
                datasets: [{
                    label: 'Activité',
                    data: activityData,
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Méthodes utilitaires pour les données des graphiques
    getWeeklyProductivityData() {
        // Données simulées pour la démo
        return Array.from({length: 7}, () => Math.floor(Math.random() * 10) + 1);
    }

    getTasksDistributionData() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const categories = {};
        
        tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });
        
        return Object.entries(categories).map(([category, count]) => ({
            category: this.getTaskCategoryLabel(category),
            count
        }));
    }

    getGoalsProgressData() {
        // Données simulées pour la démo
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        return months.map(month => ({
            month,
            completed: Math.floor(Math.random() * 5) + 1
        }));
    }

    getHourlyActivityData() {
        // Données simulées pour la démo
        return Array.from({length: 24}, (_, i) => {
            // Pic d'activité entre 9h et 18h
            const base = i >= 9 && i <= 18 ? 5 : 1;
            return base + Math.random() * 3;
        });
    }

    getTaskCategoryLabel(category) {
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

    // Réussites et badges
    renderAchievements() {
        const container = document.getElementById('achievementsContainer');
        const achievements = this.getUserAchievements();
        
        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    ${achievement.progress !== undefined ? `
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                            </div>
                            <span>${achievement.progress}%</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getUserAchievements() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        
        return [
            {
                icon: 'fa-tasks',
                title: 'Productif',
                description: 'Compléter 10 tâches',
                unlocked: tasks.filter(t => t.completed).length >= 10,
                progress: Math.min((tasks.filter(t => t.completed).length / 10) * 100, 100)
            },
            {
                icon: 'fa-bullseye',
                title: 'Objectif atteint',
                description: 'Atteindre 5 objectifs',
                unlocked: goals.filter(g => g.completed).length >= 5,
                progress: Math.min((goals.filter(g => g.completed).length / 5) * 100, 100)
            },
            {
                icon: 'fa-sticky-note',
                title: 'Écrivain',
                description: 'Créer 20 notes',
                unlocked: notes.length >= 20,
                progress: Math.min((notes.length / 20) * 100, 100)
            },
            {
                icon: 'fa-calendar',
                title: 'Organisé',
                description: 'Planifier 15 événements',
                unlocked: false,
                progress: 0
            },
            {
                icon: 'fa-fire',
                title: 'Sérieux',
                description: 'Maintenir une habitude pendant 30 jours',
                unlocked: false,
                progress: 0
            },
            {
                icon: 'fa-trophy',
                title: 'Maître de la productivité',
                description: 'Débloquer tous les autres badges',
                unlocked: false,
                progress: 0
            }
        ];
    }

    // Données par défaut
    getDefaultUser() {
        return {
            name: 'Étudiant',
            interests: [],
            createdAt: new Date().toISOString()
        };
    }

    getDefaultPreferences() {
        return {
            theme: 'light',
            notifications: {
                tasks: true,
                events: true,
                goals: false
            },
            display: {
                defaultView: 'overview',
                density: 'comfortable'
            },
            organization: {
                tasksSort: 'dueDate',
                notesGrouping: 'category'
            }
        };
    }

    saveUserData() {
        localStorage.setItem('user', JSON.stringify(this.user));
    }

    // Export des données
    exportData() {
        const data = {
            user: this.user,
            tasks: JSON.parse(localStorage.getItem('tasks')) || [],
            notes: JSON.parse(localStorage.getItem('notes')) || [],
            goals: JSON.parse(localStorage.getItem('goals')) || [],
            events: JSON.parse(localStorage.getItem('events')) || [],
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sauvegarde-assistant-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        app.showNotification('Données exportées avec succès !');
    }

    importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
                    if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
                    if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
                    if (data.events) localStorage.setItem('events', JSON.stringify(data.events));
                    
                    this.init(); // Recharger les données
                    app.showNotification('Données importées avec succès !');
                } catch (error) {
                    app.showNotification('Erreur lors de l\'importation', 'error');
                }
            };
            reader.readAsText(file);
        }
    }
}

// Initialisation
const profileManager = new ProfileManager();
