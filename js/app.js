// SilvestreStock - Core Logic

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initMockData();
    setupEventListeners();
});

// Mock Data for Species
const speciesData = [
    { id: 1, name: 'Ararajuba', scientific: 'Guaruba guarouba', status: 'Vulnerável', quantity: 12, health: 'Excelente', lastCheck: '2026-03-15' },
    { id: 2, name: 'Onça-Pintada', scientific: 'Panthera onca', status: 'Quase Ameaçada', quantity: 4, health: 'Bom', lastCheck: '2026-03-14' },
    { id: 3, name: 'Mico-Leão-Dourado', scientific: 'Leontopithecus rosalia', status: 'Em Perigo', quantity: 28, health: 'Monitorado', lastCheck: '2026-03-16' },
    { id: 4, name: 'Lobo-Guará', scientific: 'Chrysocyon brachyurus', status: 'Vulnerável', quantity: 8, health: 'Excelente', lastCheck: '2026-03-12' }
];

function initDashboard() {
    renderActivityFeed();
    console.log('SilvestreStock Dashboard Initialized');
}

function initMockData() {
    // Dynamically insert species into a list (if we had a list component)
    console.log('Species data loaded:', speciesData.length);
}

function renderActivityFeed() {
    const feed = document.querySelector('.activity-feed');
    if (!feed) return;

    const activities = [
        { type: 'add', text: 'Novo Registro: Mico-Leão-Dourado (Juvenil)', time: 'Há 5 minutos', icon: 'bi-plus-circle' },
        { type: 'health', text: 'Checkup Sanitário: Recinto 04 concluído', time: 'Há 2 horas', icon: 'bi-heart-pulse' },
        { type: 'alert', text: 'Baixo Estoque: Ração Amazônica (Lote B-2)', time: 'Há 4 horas', icon: 'bi-exclamation-triangle' }
    ];

    feed.innerHTML = activities.map(act => `
        <div class="d-flex align-items-start gap-3 animate-fade" style="animation-delay: 0.1s">
            <div class="icon-circle bg-dark-subtle p-2 rounded-circle">
                <i class="bi ${act.icon} ${act.type === 'alert' ? 'text-accent' : 'text-emerald'}"></i>
            </div>
            <div>
                <p class="m-0 small fw-bold text-light">${act.text}</p>
                <span class="text-muted smaller">${act.time}</span>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Interactive effects for cards
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Subtle glow effect handled by CSS, but could add sound or JS logic here
        });
    });

    // Navigation logic (simple tab switching simulation)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Simulating page change
            const pageName = link.innerText.trim();
            document.querySelector('h1').innerText = `Painel: ${pageName}`;
        });
    });
}

// Simple Chart Simulation using Canvas
function drawMiniChart() {
    const ctx = document.getElementById('populationChart');
    if (!ctx) return;
    // In a real scenario, we'd use Chart.js, but since this is high-complexity custom, 
    // we can simulate better with specialized components.
}
