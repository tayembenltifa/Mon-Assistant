// Application principale
class PersonalAssistant {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.events = JSON.parse(localStorage.getItem('events')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || { name: 'Étudiant' };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.setupTheme();
        this.updateTimeGreeting();
        this.loadWeather();
        this.setupServiceWorker();
    }

    setupEventListeners() {
        // Thème
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Gestion du thème
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Mise à jour du dashboard
    updateDashboard() {
        this.updateStats();
        this.updateRecentTasks();
        this.updateRecentNotes();
        this.updateTodayEvents();
        this.updateGoalsProgress();
    }

    updateStats() {
        document.getElementById('totalTasks').textContent = this.tasks.length;
        document.getElementById('completedTasks').textContent = 
            this.tasks.filter(task => task.completed).length;
        document.getElementById('totalNotes').textContent = this.notes.length;
        document.getElementById('activeGoals').textContent = 
            this.goals.filter(goal => !goal.completed).length;
    }

    updateRecentTasks() {
        const container = document.getElementById('recentTasks');
        const recentTasks = this.tasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        container.innerHTML = recentTasks.map(task => `
            <div class="task-item fade-in">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="app.toggleTask(${task.id})">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${this.formatDate(task.dueDate)} • ${task.priority}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateRecentNotes() {
        const container = document.getElementById('recentNotes');
        const recentNotes = this.notes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        container.innerHTML = recentNotes.map(note => `
            <div class="note-item fade-in">
                <div class="note-title">${note.title}</div>
                <div class="note-preview">${note.content.substring(0, 100)}...</div>
                <div class="note-meta">${this.formatDate(note.createdAt)}</div>
            </div>
        `).join('');
    }

    updateTodayEvents() {
        const container = document.getElementById('todayEvents');
        const today = new Date().toDateString();
        const todayEvents = this.events.filter(event => 
            new Date(event.date).toDateString() === today
        );

        document.getElementById('todayDate').textContent = this.formatDate(new Date());

        if (todayEvents.length === 0) {
            container.innerHTML = '<p class="no-events">Aucun événement aujourd\'hui</p>';
        } else {
            container.innerHTML = todayEvents.map(event => `
                <div class="event-item fade-in">
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                </div>
            `).join('');
        }
    }

    updateGoalsProgress() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(goal => goal.completed).length;
        const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        
        // Mettre à jour le graphique (sera implémenté dans charts.js)
        if (window.updateProgressChart) {
            window.updateProgressChart(progress);
        }
    }

    // Gestion des tâches
    toggleTask(taskId) {
        this.tasks = this.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.updateDashboard();
    }

    addTask(task) {
        const newTask = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            completed: false,
            ...task
        };
        this.tasks.push(newTask);
        this.saveTasks();
        this.updateDashboard();
        this.showNotification('Tâche ajoutée avec succès !');
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Utilitaires
    formatDate(dateString) {
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    updateTimeGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Bonne journée';
        
        if (hour < 12) greeting = 'Bonjour';
        else if (hour < 18) greeting = 'Bon après-midi';
        else greeting = 'Bonsoir';
        
        document.getElementById('timeGreeting').textContent = greeting;
    }

    async loadWeather() {
        try {
            // Utiliser une API météo gratuite
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true');
            const data = await response.json();
            
            const temp = Math.round(data.current_weather.temperature);
            const weatherCode = data.current_weather.weathercode;
            
            const weatherWidget = document.getElementById('weatherWidget');
            weatherWidget.innerHTML = `
                <i class="fas ${this.getWeatherIcon(weatherCode)}"></i>
                <span>${temp}°C</span>
            `;
        } catch (error) {
            console.log('Impossible de charger la météo');
        }
    }

    getWeatherIcon(weatherCode) {
        // Mapping simplifié des codes météo
        if (weatherCode <= 3) return 'fa-sun';
        if (weatherCode <= 48) return 'fa-cloud';
        if (weatherCode <= 67) return 'fa-cloud-rain';
        return 'fa-snowflake';
    }

    // Notifications
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            background: type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
            color: 'white',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease'
        });

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Raccourcis clavier
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    window.location.href = 'notes.html';
                    break;
                case 't':
                    e.preventDefault();
                    window.location.href = 'tasks.html';
                    break;
                case 'c':
                    e.preventDefault();
                    window.location.href = 'calendar.html';
                    break;
            }
        }
    }

    // Service Worker pour PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
    }
}

// Initialisation de l'application
const app = new PersonalAssistant();

// Fonction globale pour l'assistant IA
function sendMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (message) {
        const messagesContainer = document.getElementById('aiMessages');
        
        // Ajouter le message de l'utilisateur
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = message;
        messagesContainer.appendChild(userMessage);
        
        input.value = '';
        
        // Simuler une réponse de l'IA
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.textContent = getAIResponse(message);
            messagesContainer.appendChild(aiMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
}

function getAIResponse(message) {
    const responses = [
        "Je peux t'aider à organiser tes tâches et notes !",
        "N'oublie pas de prioriser tes tâches importantes.",
        "As-tu pensé à planifier ta semaine ?",
        "Je te recommande de diviser les grosses tâches en petites étapes.",
        "N'oublie pas de prendre des pauses régulières !"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}
