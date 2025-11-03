// Assistant IA simple
function sendMessage() {
    const input = document.getElementById('aiInput');
    const messagesContainer = document.getElementById('aiMessages');
    const message = input.value.trim();
    
    if (message) {
        // Ajouter le message de l'utilisateur
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
        `;
        messagesContainer.appendChild(userMessage);
        
        input.value = '';
        
        // Réponse automatique de l'IA
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message assistant-message';
            
            let response = "Je suis ton assistant ! Comment puis-je t'aider ?";
            
            if (message.toLowerCase().includes('bonjour') || message.toLowerCase().includes('salut')) {
                response = "Bonjour ! 😊 Comment ça va aujourd'hui ?";
            } else if (message.toLowerCase().includes('tâche') || message.toLowerCase().includes('todo')) {
                response = "Je peux t'aider à gérer tes tâches. Va dans l'onglet 'Tâches' pour les voir !";
            } else if (message.toLowerCase().includes('note')) {
                response = "Tes notes personnelles sont dans l'onglet 'Notes' 📝";
            }
            
            aiMessage.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${response}</div>
                    <div class="message-time">${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                </div>
            `;
            messagesContainer.appendChild(aiMessage);
            
            // Scroll vers le bas
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
}

// Raccourci Entrée
document.addEventListener('DOMContentLoaded', function() {
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
