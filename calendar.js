class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.events = JSON.parse(localStorage.getItem('events')) || [];
        this.selectedEvent = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.renderUpcomingEvents();
    }

    setupEventListeners() {
        // Changement de vue
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Formulaire d'événement
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        // Événement toute la journée
        document.getElementById('eventAllDay').addEventListener('change', (e) => {
            this.toggleAllDay(e.target.checked);
        });

        // Sélection de couleur
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.getElementById('eventColor').value = e.target.dataset.color;
            });
        });

        // Filtres par catégorie
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Masquer toutes les vues
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.style.display = 'none';
        });
        
        // Afficher la vue active
        document.getElementById(`${view}View`).style.display = 'block';
        
        this.render();
    }

    render() {
        switch (this.currentView) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'day':
                this.renderDayView();
                break;
            case 'agenda':
                this.renderAgendaView();
                break;
        }
        
        this.updateCurrentPeriod();
    }

    renderMonthView() {
        const grid = document.getElementById('monthGrid');
        grid.innerHTML = '';
        
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // Jours du mois précédent
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = startDay; i > 0; i--) {
            const prevDate = new Date(firstDay);
            prevDate.setDate(prevDate.getDate() - i);
            grid.appendChild(this.createDayElement(prevDate, 'prev-month'));
        }
        
        // Jours du mois courant
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            grid.appendChild(this.createDayElement(date, 'current-month'));
        }
        
        // Jours du mois suivant
        const totalCells = 42; // 6 semaines
        const remainingCells = totalCells - (startDay + lastDay.getDate());
        for (let i = 1; i <= remainingCells; i++) {
            const nextDate = new Date(lastDay);
            nextDate.setDate(nextDate.getDate() + i);
            grid.appendChild(this.createDayElement(nextDate, 'next-month'));
        }
    }

    createDayElement(date, className) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        
        const isToday = this.isToday(date);
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${date.getDate()}</div>
            <div class="day-events">
                ${this.renderDayEvents(date)}
            </div>
        `;
        
        dayElement.addEventListener('click', () => {
            this.showEventFormForDate(date);
        });
        
        return dayElement;
    }

    renderDayEvents(date) {
        const dayEvents = this.getEventsForDate(date);
        return dayEvents.slice(0, 3).map(event => `
            <div class="event-indicator" style="background: ${event.color}" 
                 onclick="event.stopPropagation(); calendar.editEvent(${event.id})">
                ${event.title}
            </div>
        `).join('');
    }

    renderWeekView() {
        const header = document.getElementById('weekDaysHeader');
        const grid = document.getElementById('weekGrid');
        
        header.innerHTML = '';
        grid.innerHTML = '';
        
        const weekStart = this.getWeekStart(this.currentDate);
        
        // En-têtes des jours
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `
                <div class="day-name">${this.getDayName(day)}</div>
                <div class="day-date">${day.getDate()}</div>
            `;
            header.appendChild(dayHeader);
        }
        
        // Grille des heures
        for (let hour = 0; hour < 24; hour++) {
            const timeRow = document.createElement('div');
            timeRow.className = 'time-row';
            timeRow.innerHTML = `
                <div class="time-label">${hour.toString().padStart(2, '0')}:00</div>
                <div class="time-slots">
                    ${Array.from({length: 7}, (_, i) => {
                        const day = new Date(weekStart);
                        day.setDate(day.getDate() + i);
                        day.setHours(hour, 0, 0, 0);
                        return `<div class="time-slot" data-date="${day.toISOString()}"></div>`;
                    }).join('')}
                </div>
            `;
            grid.appendChild(timeRow);
        }
        
        this.renderWeekEvents();
    }

    renderWeekEvents() {
        const weekStart = this.getWeekStart(this.currentDate);
        const weekEvents = this.getEventsForWeek(weekStart);
        
        weekEvents.forEach(event => {
            this.renderWeekEvent(event);
        });
    }

    renderWeekEvent(event) {
        // Implémentation de l'affichage des événements dans la vue semaine
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        
        const dayOffset = start.getDay() === 0 ? 6 : start.getDay() - 1;
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = (end - start) / (1000 * 60); // durée en minutes
        
        const eventElement = document.createElement('div');
        eventElement.className = 'week-event';
        eventElement.style.cssText = `
            top: ${(startMinutes / 60) * 60}px;
            left: ${(dayOffset / 7) * 100}%;
            width: ${100 / 7}%;
            height: ${(duration / 60) * 60}px;
            background: ${event.color};
        `;
        eventElement.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">${this.formatTime(start)} - ${this.formatTime(end)}</div>
        `;
        
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editEvent(event.id);
        });
        
        document.getElementById('weekGrid').appendChild(eventElement);
    }

    renderDayView() {
        const timeline = document.getElementById('dayTimeline');
        timeline.innerHTML = '';
        
        document.getElementById('currentDay').textContent = 
            this.currentDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        
        // Créer les créneaux horaires
        for (let hour = 0; hour < 24; hour++) {
            const hourSlot = document.createElement('div');
            hourSlot.className = 'hour-slot';
            hourSlot.innerHTML = `
                <div class="hour-label">${hour.toString().padStart(2, '0')}:00</div>
                <div class="hour-content" data-hour="${hour}"></div>
            `;
            timeline.appendChild(hourSlot);
        }
        
        this.renderDayEventsView();
    }

    renderDayEventsView() {
        const dayEvents = this.getEventsForDate(this.currentDate);
        
        dayEvents.forEach(event => {
            this.renderDayEvent(event);
        });
    }

    renderDayEvent(event) {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = (end - start) / (1000 * 60);
        
        const eventElement = document.createElement('div');
        eventElement.className = 'day-event';
        eventElement.style.cssText = `
            top: ${startMinutes}px;
            height: ${duration}px;
            background: ${event.color};
        `;
        eventElement.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">${this.formatTime(start)} - ${this.formatTime(end)}</div>
            ${event.description ? `<div class="event-desc">${event.description}</div>` : ''}
        `;
        
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editEvent(event.id);
        });
        
        document.querySelector('.hour-content[data-hour="' + start.getHours() + '"]')
            .appendChild(eventElement);
    }

    renderAgendaView() {
        const agendaList = document.getElementById('agendaList');
        const upcomingEvents = this.getUpcomingEvents(30); // 30 jours
        
        if (upcomingEvents.length === 0) {
            agendaList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Aucun événement à venir</h3>
                    <p>Ajoute ton premier événement !</p>
                </div>
            `;
            return;
        }
        
        agendaList.innerHTML = upcomingEvents.map(event => this.renderAgendaItem(event)).join('');
    }

    renderAgendaItem(event) {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        
        return `
            <div class="agenda-item" onclick="calendar.editEvent(${event.id})">
                <div class="agenda-date">
                    <div class="agenda-day">${start.getDate()}</div>
                    <div class="agenda-month">${this.getMonthName(start)}</div>
                </div>
                <div class="agenda-content">
                    <h4 class="agenda-title">${event.title}</h4>
                    <div class="agenda-time">${this.formatTime(start)} - ${this.formatTime(end)}</div>
                    ${event.description ? `<p class="agenda-desc">${event.description}</p>` : ''}
                </div>
                <div class="agenda-category" style="background: ${event.color}"></div>
            </div>
        `;
    }

    // Gestion des événements
    showEventForm() {
        this.selectedEvent = null;
        document.getElementById('eventFormModal').style.display = 'block';
        document.getElementById('deleteEventBtn').style.display = 'none';
        document.getElementById('eventForm').reset();
        
        // Définir la date par défaut
        const now = new Date();
        const startDate = now.toISOString().slice(0, 16);
        const endDate = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
        
        document.getElementById('eventStartDate').value = startDate;
        document.getElementById('eventEndDate').value = endDate;
    }

    showEventFormForDate(date) {
        this.showEventForm();
        
        const startDate = new Date(date);
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(10, 0, 0, 0);
        
        document.getElementById('eventStartDate').value = startDate.toISOString().slice(0, 16);
        document.getElementById('eventEndDate').value = endDate.toISOString().slice(0, 16);
    }

    hideEventForm() {
        document.getElementById('eventFormModal').style.display = 'none';
    }

    saveEvent() {
        const formData = new FormData(document.getElementById('eventForm'));
        const eventData = {
            title: document.getElementById('eventTitle').value,
            startDate: document.getElementById('eventStartDate').value,
            endDate: document.getElementById('eventEndDate').value,
            description: document.getElementById('eventDescription').value,
            color: document.getElementById('eventColor').value,
            category: document.getElementById('eventCategory').value,
            allDay: document.getElementById('eventAllDay').checked
        };

        if (!eventData.title) {
            app.showNotification('Le titre est requis', 'error');
            return;
        }

        if (this.selectedEvent) {
            // Mettre à jour l'événement existant
            Object.assign(this.selectedEvent, eventData);
            app.showNotification('Événement mis à jour !');
        } else {
            // Créer un nouvel événement
            const newEvent = {
                id: Date.now(),
                ...eventData
            };
            this.events.push(newEvent);
            app.showNotification('Événement créé !');
        }

        this.saveEvents();
        this.hideEventForm();
        this.render();
        this.renderUpcomingEvents();
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.selectedEvent = event;
            
            document.getElementById('eventFormModal').style.display = 'block';
            document.getElementById('deleteEventBtn').style.display = 'block';
            
            // Remplir le formulaire
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventStartDate').value = event.startDate.slice(0, 16);
            document.getElementById('eventEndDate').value = event.endDate.slice(0, 16);
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventColor').value = event.color;
            document.getElementById('eventCategory').value = event.category;
            document.getElementById('eventAllDay').checked = event.allDay || false;
            
            // Configurer le bouton supprimer
            document.getElementById('deleteEventBtn').onclick = () => {
                this.deleteEvent(eventId);
            };
        }
    }

    deleteEvent(eventId) {
        if (confirm('Supprimer cet événement ?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.saveEvents();
            this.hideEventForm();
            this.render();
            this.renderUpcomingEvents();
            app.showNotification('Événement supprimé');
        }
    }

    // Navigation
    previous() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                break;
            case 'day':
                this.currentDate.setDate(this.currentDate.getDate() - 1);
                break;
        }
        this.render();
    }

    next() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                break;
            case 'day':
                this.currentDate.setDate(this.currentDate.getDate() + 1);
                break;
        }
        this.render();
    }

    today() {
        this.currentDate = new Date();
        this.render();
    }

    // Utilitaires
    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.startDate).toDateString();
            return eventDate === date.toDateString();
        });
    }

    getEventsForWeek(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        
        return this.events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= startDate && eventDate < endDate;
        });
    }

    getUpcomingEvents(days = 7) {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);
        
        return this.events
            .filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate >= start && eventDate <= end;
            })
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    renderUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        const upcoming = this.getUpcomingEvents(7).slice(0, 5);
        
        if (upcoming.length === 0) {
            container.innerHTML = '<p class="no-events">Aucun événement à venir</p>';
            return;
        }
        
        container.innerHTML = upcoming.map(event => `
            <div class="upcoming-event" onclick="calendar.editEvent(${event.id})">
                <div class="event-color" style="background: ${event.color}"></div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${this.formatEventDate(event.startDate)}</div>
                </div>
            </div>
        `).join('');
    }

    updateCurrentPeriod() {
        let periodText = '';
        
        switch (this.currentView) {
            case 'month':
                periodText = this.currentDate.toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                });
                break;
            case 'week':
                const weekStart = this.getWeekStart(this.currentDate);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                periodText = `${weekStart.getDate()} ${this.getMonthName(weekStart)} - ${weekEnd.getDate()} ${this.getMonthName(weekEnd)} ${weekEnd.getFullYear()}`;
                break;
            case 'day':
                periodText = this.currentDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                break;
        }
        
        document.getElementById('currentPeriod').textContent = periodText;
    }

    // Méthodes utilitaires
    getWeekStart(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getDayName(date) {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }

    getMonthName(date) {
        return date.toLocaleDateString('fr-FR', { month: 'short' });
    }

    formatTime(date) {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    toggleAllDay(isAllDay) {
        const startDate = document.getElementById('eventStartDate');
        const endDate = document.getElementById('eventEndDate');
        
        if (isAllDay) {
            startDate.type = 'date';
            endDate.type = 'date';
        } else {
            startDate.type = 'datetime-local';
            endDate.type = 'datetime-local';
        }
    }

    filterByCategory(category) {
        // Implémentation du filtrage par catégorie
        console.log('Filtrer par catégorie:', category);
    }

    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }
}

// Initialisation
const calendar = new Calendar();
