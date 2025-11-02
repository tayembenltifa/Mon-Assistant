// Application principale avec Assistant IA
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
        this.setupAIAssistant();
    }

    setupEventListeners() {
        // Thème
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Assistant IA
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage();
                }
            });
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Assistant IA
    setupAIAssistant() {
        this.aiMessages = JSON.parse(localStorage.getItem('aiMessages')) || [];
        this.renderAIMessages();
    }

    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Ajouter le message de l'utilisateur
        this.addAIMessage('user', message);
        input.value = '';

        // Simuler une réponse de l'IA
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addAIMessage('assistant', response);
        }, 1000 + Math.random() * 1000); // Délai aléatoire pour plus de réalisme
    }

    addAIMessage(sender, content) {
        const message = {
            id: Date.now(),
            sender: sender,
            content: content,
            timestamp: new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        this.aiMessages.push(message);
        
        // Garder seulement les 50 derniers messages
        if (this.aiMessages.length > 50) {
            this.aiMessages = this.aiMessages.slice(-50);
        }

        this.saveAIMessages();
        this.renderAIMessages();
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Réponses contextuelles basées sur le contenu du message
        if (message.includes('bonjour') || message.includes('salut') || message.includes('coucou')) {
            return "Bonjour ! Comment puis-je vous aider aujourd'hui ? 😊";
        }

        if (message.includes('merci')) {
            return "De rien ! N'hésitez pas si vous avez d'autres questions. 👍";
        }

        if (message.includes('tâche') || message.includes('todo') || message.includes('à faire')) {
            const pendingTasks = this.tasks.filter(task => !task.completed).length;
            if (pendingTasks === 0) {
                return "Super ! Vous n'avez aucune tâche en attente. 🎉";
            } else {
                return `Vous avez ${pendingTasks} tâche${pendingTasks > 1 ? 's' : ''} en attente. N'oubliez pas de les prioriser !`;
            }
        }

        if (message.includes('note') || message.includes('memo')) {
            const totalNotes = this.notes.length;
            if (totalNotes === 0) {
                return "Vous n'avez pas encore de notes. Voulez-vous que je vous aide à en créer une ?";
            } else {
                return `Vous avez ${totalNotes} note${totalNotes > 1 ? 's' : ''} sauvegardée${totalNotes > 1 ? 's' : ''}.`;
            }
        }

        if (message.includes('objectif') || message.includes('but')) {
            const activeGoals = this.goals.filter(goal => !goal.completed).length;
            const completedGoals = this.goals.filter(goal => goal.completed).length;
            
            if (activeGoals === 0 && completedGoals === 0) {
                return "Vous n'avez pas encore défini d'objectifs. Voulez-vous commencer ?";
            } else {
                return `Vous avez ${activeGoals} objectif${activeGoals > 1 ? 's' : ''} en cours et ${completedGoals} atteint${completedGoals > 1 ? 's' : ''}. Continuez comme ça ! 💪`;
            }
        }

        if (message.includes('aide') || message.includes('help')) {
            return `Je peux vous aider avec :
• La gestion de vos tâches
• La prise de notes
• Le suivi de vos objectifs
• L'organisation de votre temps
• Des conseils de productivité

Que souhaitez-vous faire ?`;
        }

        if (message.includes('heure')) {
            return `Il est ${new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}.`;
        }

        if (message.includes('date')) {
            return `Nous sommes le ${new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}.`;
        }

        if (message.includes('blague') || message.includes('rigole')) {
            const jokes = [
                "Pourquoi les plongeurs plongent-ils toujours en arrière et pas en avant ? Parce que sinon ils tombent dans le bateau !",
                "Qu'est-ce qu'un canard en pleine forme ? Un canard en forme de bouée !",
                "Pourquoi les programmeurs préfèrent-ils le mode sombre ? Parce que la lumière attire les bugs !",
                "Quel est le comble pour un électricien ? De ne pas être au courant !"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }

        if (message.includes('motivation') || message.includes('encourage')) {
            const motivations = [
                "Vous faites du super travail ! Continuez comme ça ! 🚀",
                "Chaque petite étape vous rapproche de votre objectif. 💫",
                "La persévérance est la clé du succès. Vous y êtes presque ! 🌟",
                "N'oubliez pas de célébrer vos petites victoires ! 🎉",
                "Vous êtes capable de grandes choses ! Croyez en vous. 💪"
            ];
            return motivations[Math.floor(Math.random() * motivations.length)];
        }

        // Réponses par défaut
        const defaultResponses = [
            "Je comprends. Pouvez-vous me donner plus de détails ?",
            "Intéressant ! Comment puis-je vous aider avec cela ?",
            "Je vois. Avez-vous besoin d'aide pour organiser cela ?",
            "C'est une bonne question. Laissez-moi réfléchir à la meilleure façon de vous aider.",
            "Je peux vous aider à planifier cela. Par où souhaitez-vous commencer ?",
            "D'accord. Voulez-vous que nous créions une tâche ou une note à ce sujet ?",
            "Je suis là pour vous aider à rester organisé. Que souhaitez-vous accomplir ?"
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    renderAIMessages() {
        const container = document.getElementById('aiMessages');
        if (!container) return;

        container.innerHTML = this.aiMessages.map(message => `
            <div class="message ${message.sender}-message">
                <div class="message-content">
                    <div class="message-text">${message.content}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            </div>
        `).join('');

        // Scroll vers le bas
        container.scrollTop = container.scrollHeight;
    }

    saveAIMessages() {
        localStorage.setItem('aiMessages', JSON.stringify(this.aiMessages));
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
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Mise à jour du dashboard
    updateDashboard() {
        this.updateStats();
        this.updateRecentTasks();
        this.updateRecentNotes();
        this.updateTodayEvents();
    }

    updateStats() {
        this.updateElement('totalTasks', this.tasks.length);
        this.updateElement('completedTasks', this.tasks.filter(task => task.completed).length);
        this.updateElement('totalNotes', this.notes.length);
        this.updateElement('activeGoals', this.goals.filter(goal => !goal.completed).length);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateRecentTasks() {
        const container = document.getElementById('recentTasks');
        if (!container) return;

        const recentTasks = this.tasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        container.innerHTML = recentTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                </div>
            </div>
        `).join('');
    }

    updateRecentNotes() {
        const container = document.getElementById('recentNotes');
        if (!container) return;

        const recentNotes = this.notes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        container.innerHTML = recentNotes.map(note => `
            <div class="note-item">
                <div class="note-title">${note.title}</div>
                <div class="note-preview">${note.content.substring(0, 50)}...</div>
            </div>
        `).join('');
    }

    updateTodayEvents() {
        const container = document.getElementById('todayEvents');
        if (!container) return;

        const today = new Date().toDateString();
        const todayEvents = this.events.filter(event => 
            new Date(event.startDate).toDateString() === today
        );

        document.getElementById('todayDate').textContent = this.formatDate(new Date());

        if (todayEvents.length === 0) {
            container.innerHTML = '<p class="no-events">Aucun événement aujourd\'hui</p>';
        } else {
            container.innerHTML = todayEvents.map(event => `
                <div class="event-item">
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                </div>
            `).join('');
        }
    }

    // Utilitaires
    formatDate(date) {
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    updateTimeGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Bonne journée';
        
        if (hour < 12) greeting = 'Bonjour';
        else if (hour < 18) greeting = 'Bon après-midi';
        else greeting = 'Bonsoir';
        
        const greetingElement = document.getElementById('timeGreeting');
        if (greetingElement) {
            greetingElement.textContent = greeting;
        }
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

    // Notifications
    showNotification(message, type = 'success') {
        // Créer une notification simple
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Tu peux ajouter un système de notifications visuelles ici plus tard
        alert(message); // Solution temporaire
    }
}

// Initialisation de l'application
const app = new PersonalAssistant();

// Fonctions globales pour l'HTML
function sendMessage() {
    app.sendAIMessage();
}

function toggleTheme() {
    app.toggleTheme();
}

function addTask() {
    const input = document.getElementById('newTask');
    const text = input.value.trim();
    
    if (text) {
        const task = {
            id: Date.now(),
            title: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        app.tasks.push(task);
        app.saveTasks();
        app.updateDashboard();
        input.value = '';
        app.showNotification('Tâche ajoutée !');
    }
}

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
            createdAt: new Date().toISOString()
        };
        
        app.notes.push(note);
        app.saveNotes();
        app.updateDashboard();
        titleInput.value = '';
        contentInput.value = '';
        app.showNotification('Note sauvegardée !');
    }
}

// Méthodes de sauvegarde
PersonalAssistant.prototype.saveTasks = function() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
};

PersonalAssistant.prototype.saveNotes = function() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
};

PersonalAssistant.prototype.saveGoals = function() {
    localStorage.setItem('goals', JSON.stringify(this.goals));
};

PersonalAssistant.prototype.saveEvents = function() {
    localStorage.setItem('events', JSON.stringify(this.events));
};
