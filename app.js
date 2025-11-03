// Assistant IA TRÈS SIMPLE
function sendMessage() {
    console.log("Fonction sendMessage appelée !"); // Pour debugger
    
    const input = document.getElementById('aiInput');
    const messages = document.getElementById('aiMessages');
    
    if (!input || !messages) {
        console.log("Éléments non trouvés !");
        return;
    }
    
    const message = input.value;
    console.log("Message :", message);
    
    if (message.trim() === "") return;
    
    // Ajouter message utilisateur
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.textContent = message;
    messages.appendChild(userMsg);
    
    input.value = '';
    
    // Réponse IA
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message assistant-message';
        aiMsg.textContent = "Bonjour ! Je suis ton assistant IA 🤖";
        messages.appendChild(aiMsg);
        
        // Scroll vers le bas
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

// Raccourci Entrée
document.getElementById('aiInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
