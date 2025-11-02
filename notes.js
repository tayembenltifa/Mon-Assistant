class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentNote = null;
        this.isEditing = false;
        this.currentView = 'grid';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderNotes();
        this.updateStats();
    }

    setupEventListeners() {
        // Recherche
        document.getElementById('notesSearch').addEventListener('input', (e) => {
            this.renderNotes();
        });

        // Filtres
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.renderNotes();
        });

        document.getElementById('sortFilter').addEventListener('change', () => {
            this.renderNotes();
        });

        // Sauvegarde automatique
        document.getElementById('noteContent').addEventListener('input', () => {
            if (this.isEditing) {
                this.autoSave();
            }
        });
    }

    createNewNote() {
        this.isEditing = true;
        this.currentNote = null;
        
        document.getElementById('noteEditor').style.display = 'block';
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        document.getElementById('tagsContainer').innerHTML = '';
        document.getElementById('editorCategory').value = 'personal';
        
        document.getElementById('noteTitle').focus();
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.isEditing = true;
            this.currentNote = note;
            
            document.getElementById('noteEditor').style.display = 'block';
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
            document.getElementById('editorCategory').value = note.category;
            
            // Afficher les tags
            this.renderTags(note.tags);
            
            document.getElementById('noteTitle').focus();
        }
    }

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const category = document.getElementById('editorCategory').value;
        const tags = Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent);

        if (!title) {
            app.showNotification('Le titre est requis', 'error');
            return;
        }

        const noteData = {
            title,
            content,
            category,
            tags,
            updatedAt: new Date().toISOString()
        };

        if (this.currentNote) {
            // Mettre à jour la note existante
            Object.assign(this.currentNote, noteData);
            app.showNotification('Note mise à jour !');
        } else {
            // Créer une nouvelle note
            const newNote = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                ...noteData
            };
            this.notes.push(newNote);
            app.showNotification('Note créée !');
        }

        this.saveNotes();
        this.cancelEdit();
        this.renderNotes();
        this.updateStats();
    }

    autoSave() {
        // Sauvegarde automatique après 2 secondes d'inactivité
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            if (this.currentNote) {
                this.saveNote();
            }
        }, 2000);
    }

    cancelEdit() {
        this.isEditing = false;
        this.currentNote = null;
        document.getElementById('noteEditor').style.display = 'none';
    }

    deleteNote(noteId) {
        if (confirm('Supprimer cette note ?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            this.renderNotes();
            this.updateStats();
            app.showNotification('Note supprimée');
        }
    }

    getFilteredNotes() {
        const searchTerm = document.getElementById('notesSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const sortBy = document.getElementById('sortFilter').value;

        let filtered = this.notes.filter(note => {
            // Filtre recherche
            if (searchTerm && !note.title.toLowerCase().includes(searchTerm) && 
                !note.content.toLowerCase().includes(searchTerm)) {
                return false;
            }

            // Filtre catégorie
            if (categoryFilter !== 'all' && note.category !== categoryFilter) {
                return false;
            }

            return true;
        });

        // Tri
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                case 'oldest':
                    return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    renderNotes() {
        const notes = this.getFilteredNotes();
        const container = this.currentView === 'grid' ? 
            document.getElementById('notesGrid') : 
            document.getElementById('notesListView');

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note"></i>
                    <h3>Aucune note trouvée</h3>
                    <p>Crée ta première note pour commencer !</p>
                </div>
            `;
            return;
        }

        if (this.currentView === 'grid') {
            container.innerHTML = notes.map(note => this.renderNoteCard(note)).join('');
        } else {
            container.innerHTML = notes.map(note => this.renderNoteListItem(note)).join('');
        }
    }

    renderNoteCard(note) {
        const preview = note.content.length > 150 ? 
            note.content.substring(0, 150) + '...' : note.content;
        
        const tagsHtml = note.tags && note.tags.length > 0 ? 
            note.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

        return `
            <div class="note-card" onclick="notesManager.editNote(${note.id})">
                <div class="note-card-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); notesManager.editNote(${note.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="event.stopPropagation(); notesManager.deleteNote(${note.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="note-preview">${preview}</div>
                
                ${tagsHtml ? `
                    <div class="note-tags">${tagsHtml}</div>
                ` : ''}
                
                <div class="note-meta">
                    <span class="note-category ${note.category}">
                        <i class="fas ${this.getCategoryIcon(note.category)}"></i>
                        ${this.getCategoryLabel(note.category)}
                    </span>
                    <span class="note-date">
                        ${this.formatDate(note.updatedAt || note.createdAt)}
                    </span>
                </div>
            </div>
        `;
    }

    renderNoteListItem(note) {
        const preview = note.content.length > 100 ? 
            note.content.substring(0, 100) + '...' : note.content;

        return `
            <div class="note-list-item" onclick="notesManager.editNote(${note.id})">
                <div class="note-list-content">
                    <h4 class="note-title">${note.title}</h4>
                    <p class="note-preview">${preview}</p>
                    <div class="note-meta">
                        <span class="note-category ${note.category}">
                            ${this.getCategoryLabel(note.category)}
                        </span>
                        <span class="note-date">
                            ${this.formatDate(note.updatedAt || note.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="note-list-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); notesManager.editNote(${note.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="event.stopPropagation(); notesManager.deleteNote(${note.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Gestion des tags
    addTag() {
        const tagInput = document.getElementById('tagInput');
        const tag = tagInput.value.trim();
        
        if (tag) {
            const tagsContainer = document.getElementById('tagsContainer');
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <button onclick="this.parentElement.remove()">×</button>
            `;
            tagsContainer.appendChild(tagElement);
            tagInput.value = '';
        }
    }

    renderTags(tags) {
        const container = document.getElementById('tagsContainer');
        container.innerHTML = tags ? tags.map(tag => `
            <span class="tag">
                ${tag}
                <button onclick="this.parentElement.remove()">×</button>
            </span>
        `).join('') : '';
    }

    // Outils de formatage
    formatText(format) {
        const textarea = document.getElementById('noteContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let formattedText = '';
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `_${selectedText}_`;
                break;
            case 'underline':
                formattedText = `<u>${selectedText}</u>`;
                break;
        }
        
        textarea.setRangeText(formattedText, start, end, 'select');
        textarea.focus();
    }

    insertList(type) {
        const textarea = document.getElementById('noteContent');
        const start = textarea.selectionStart;
        const listItem = type === 'ul' ? '- ' : '1. ';
        
        textarea.setRangeText(listItem, start, start, 'end');
        textarea.focus();
    }

    insertLink() {
        const url = prompt('Entrez l URL:');
        if (url) {
            const textarea = document.getElementById('noteContent');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value.substring(start, end) || 'lien';
            
            textarea.setRangeText(`[${text}](${url})`, start, end, 'select');
            textarea.focus();
        }
    }

    insertImage() {
        const url = prompt('Entrez l URL de l image:');
        if (url) {
            const textarea = document.getElementById('noteContent');
            const start = textarea.selectionStart;
            const alt = prompt('Texte alternatif:') || 'Image';
            
            textarea.setRangeText(`![${alt}](${url})`, start, start, 'end');
            textarea.focus();
        }
    }

    changeCategory(category) {
        // Catégorie déjà gérée par le select
    }

    // Statistiques
    updateStats() {
        const total = this.notes.length;
        const categories = new Set(this.notes.map(note => note.category)).size;
        const tags = new Set(this.notes.flatMap(note => note.tags || [])).size;
        
        const thisMonth = new Date().getMonth();
        const recent = this.notes.filter(note => {
            const noteDate = new Date(note.createdAt);
            return noteDate.getMonth() === thisMonth;
        }).length;

        document.getElementById('totalNotesCount').textContent = total;
        document.getElementById('categoriesCount').textContent = categories;
        document.getElementById('tagsCount').textContent = tags;
        document.getElementById('recentNotesCount').textContent = recent;
    }

    // Utilitaires
    getCategoryIcon(category) {
        const icons = {
            personal: 'fa-user',
            work: 'fa-briefcase',
            study: 'fa-graduation-cap',
            ideas: 'fa-lightbulb',
            projects: 'fa-project-diagram'
        };
        return icons[category] || 'fa-file';
    }

    getCategoryLabel(category) {
        const labels = {
            personal: 'Personnel',
            work: 'Travail',
            study: 'Études',
            ideas: 'Idées',
            projects: 'Projets'
        };
        return labels[category] || 'Autre';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    // Export/Import
    exportNotes() {
        const data = JSON.stringify(this.notes, null, 2);
        this.downloadFile(data, 'mes-notes.json', 'application/json');
    }

    importNotes(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedNotes = JSON.parse(e.target.result);
                    this.notes = [...this.notes, ...importedNotes];
                    this.saveNotes();
                    this.renderNotes();
                    this.updateStats();
                    app.showNotification('Notes importées avec succès !');
                } catch (error) {
                    app.showNotification('Erreur lors de l importation', 'error');
                }
            };
            reader.readAsText(file);
        }
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
const notesManager = new NotesManager();
