// Gestion des graphiques pour le dashboard
class ChartsManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.setupDashboardCharts();
    }

    setupDashboardCharts() {
        this.renderProgressChart();
        this.renderProductivityChart();
    }

    renderProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const total = goals.length;
        const completed = goals.filter(g => g.completed).length;
        const inProgress = total - completed;

        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Terminés', 'En cours'],
                datasets: [{
                    data: [completed, inProgress],
                    backgroundColor: ['#43e97b', '#667eea'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderProductivityChart() {
        const ctx = document.getElementById('productivityChart');
        if (!ctx) return;

        // Données simulées pour la productivité hebdomadaire
        const weeklyData = {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
                label: 'Tâches complétées',
                data: [5, 8, 6, 10, 7, 3, 2],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };

        this.charts.productivity = new Chart(ctx, {
            type: 'line',
            data: weeklyData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateProgressChart(progress) {
        // Mettre à jour le graphique de progression si nécessaire
    }

    // Méthode pour mettre à jour tous les graphiques
    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });
        this.setupDashboardCharts();
    }
}

// Fonction globale pour mettre à jour le graphique de progression
function updateProgressChart(progress) {
    if (window.chartsManager) {
        window.chartsManager.updateProgressChart(progress);
    }
}

// Initialisation des graphiques
document.addEventListener('DOMContentLoaded', function() {
    window.chartsManager = new ChartsManager();
});
