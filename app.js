// Application principale
class PersonalAssistant {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.setupTheme();
        this.updateTimeGreeting();
    }

    setupEventListeners() {
        // Thème
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Assistant IA
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });
    }

    // Assistant IA
    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Message utilisateur
        this.addAIMessage('user', message);
        input.value = '';

        // Réponse IA
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addAIMessage('assistant', response);
        }, 1000);
    }

    addAIMessage(sender, content) {
        const messagesContainer = document.getElementById('aiMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = content;
        messagesContainer.appendChild(messageElement);

        // Scroll vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateAIResponse(message) {
        const text = message.toLowerCase();

        if (text.includes('bonjour') || text.includes('salut')) {
            return "Bonjour ! Comment puis-je t'aider aujourd'hui ? 😊";
        }

        if (text.includes('tâche') || text.includes('todo')) {
            const pending = this.tasks.filter(t => !t.completed).length;
            return `Tu as ${pending} tâche${pending > 1 ? 's' : ''} en attente. Tu peux les gérer dans l'onglet "Tâches" !`;
        }

        if (text.includes('note')) {
            return "Tes notes sont dans l'onglet 'Notes'. Je peux t'aider à organiser tes idées ! 📝";
        }

        if (text.includes('blague')) {
            const blagues = [
                "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tombent dans le bateau !",
                "Que dit un oignon quand il se cogne ? Aïe !",
                "Pourquoi les poissons sont-ils si intelligents ? Parce qu'ils vivent dans des bancs !"
            ];
            return blagues[Math.floor(Math.random() * blagues.length)];
        }

        if (text.includes('heure')) {
            return `Il est ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`;
        }

        return "Je suis là pour t'aider à organiser ton travail ! Tu peux me demander de l'aide pour tes tâches, notes ou objectifs. 😊";
    }

    // Thème
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Dashboard
    updateDashboard() {
        this.updateStats();
        this.updateRecentTasks();
        this.updateRecentNotes();
        this.updateTodayDate();
    }

    updateStats() {
        document.getElementById('totalTasks').textContent = this.tasks.length;
        document.getElementById('completedTasks').textContent = this.tasks.filter(t => t.completed).length;
        document.getElementById('totalNotes').textContent = this.notes.length;
        document.getElementById('activeGoals').textContent = this.goals.filter(g => !g.completed).length;
    }

    updateRecentTasks() {
        const container = document.getElementById('recentTasks');
        const recent = this.tasks.slice(-3).reverse();
        
        container.innerHTML = recent.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">${this.formatDate(task.createdAt)}</div>
                </div>
            </div>
        `).join('') || '<div class="task-item">Aucune tâche récente</div>';
    }

    updateRecentNotes() {
        const container = document.getElementById('recentNotes');
        const recent = this.notes.slice(-3).reverse();
        
        container.innerHTML = recent.map(note => `
            <div class="note-item">
                <div class="note-title">${note.title}</div>
                <div class="note-preview">${note.content.substring(0, 50)}...</div>
            </div>
        `).join('') || '<div class="note-item">Aucune note récente</div>';
    }

    updateTodayDate() {
        document.getElementById('todayDate').textContent = 
            new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    updateTimeGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Bonne journée';
        if (hour < 12) greeting = 'Bonjour';
        else if (hour < 18) greeting = 'Bon après-midi';
        else greeting = 'Bonsoir';
        
        document.getElementById('timeGreeting').textContent = greeting;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR');
    }
}

// Initialisation
const app = new PersonalAssistant();

// Fonction globale pour l'HTML
function sendMessage() {
    app.sendAIMessage();
}
