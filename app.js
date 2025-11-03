// === SYSTÈME DE GESTION DES UTILISATEURS ===

let currentUser = null;

// Créer ou charger un profil utilisateur
function createUserProfile(username) {
    const profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    if (!profiles[username]) {
        profiles[username] = {
            tasks: [],
            events: [],
            notes: [],
            goals: [],
            created: new Date().toISOString()
        };
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }
    return profiles[username];
}

// Charger les données d'un utilisateur
function loadUserData(username) {
    const profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    return profiles[username] || { 
        tasks: [], 
        events: [], 
        notes: [], 
        goals: [] 
    };
}

// Sauvegarder les données utilisateur
function saveUserData(username, userData) {
    const profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    profiles[username] = userData;
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
}

// Connexion utilisateur
function login(username) {
    currentUser = username;
    createUserProfile(username);
    localStorage.setItem('currentUser', username);
    
    // Recharger toutes les données
    loadAllUserData();
    showMainInterface();
}

// Déconnexion
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginInterface();
}

// Charger toutes les données de l'utilisateur actuel
function loadAllUserData() {
    if (!currentUser) return;
    
    const userData = loadUserData(currentUser);
    
    // Mettre à jour tous les modules
    if (window.loadTasks) loadTasks(userData.tasks);
    if (window.loadEvents) loadEvents(userData.events);
    if (window.loadNotes) loadNotes(userData.notes);
    if (window.loadGoals) loadGoals(userData.goals);
}

// Vérifier si un utilisateur est déjà connecté au chargement
function initUserSystem() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        login(savedUser);
    } else {
        showLoginInterface();
    }
}
