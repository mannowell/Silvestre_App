/* ================================================
   SilvestreStock — Core Application Logic v2.0
   Gestão Avançada de Fauna Silvestre
   ================================================ */

'use strict';

// ============================================================
// DATA STORE (localStorage persistence)
// ============================================================

const DB_KEY_SPECIES  = 'ss_species';
const DB_KEY_SUPPLIES = 'ss_supplies';
const DB_KEY_ACTIVITY = 'ss_activity';

function loadData(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ---- Default species data ----
const DEFAULT_SPECIES = [
    { id: 1, name: 'Ararajuba',          scientific: 'Guaruba guarouba',             status: 'Vulnerável',         quantity: 12, health: 'Excelente',  lastCheck: '2026-03-15', location: 'Amazônia (AM)',  classe: 'Ave'     },
    { id: 2, name: 'Onça-Pintada',       scientific: 'Panthera onca',                status: 'Quase Ameaçada',     quantity: 4,  health: 'Bom',         lastCheck: '2026-03-14', location: 'Pantanal (MT)',  classe: 'Mamífero'},
    { id: 3, name: 'Mico-Leão-Dourado',  scientific: 'Leontopithecus rosalia',       status: 'Em Perigo',          quantity: 28, health: 'Monitorado',  lastCheck: '2026-03-16', location: 'Mata Atlântica (RJ)', classe: 'Mamífero'},
    { id: 4, name: 'Lobo-Guará',         scientific: 'Chrysocyon brachyurus',        status: 'Vulnerável',         quantity: 8,  health: 'Excelente',   lastCheck: '2026-03-12', location: 'Cerrado (GO)',   classe: 'Mamífero'},
    { id: 5, name: 'Peixe-Boi-Marinho',  scientific: 'Trichechus manatus',           status: 'Vulnerável',         quantity: 6,  health: 'Monitorado',  lastCheck: '2026-03-10', location: 'Nordeste (CE)',  classe: 'Mamífero'},
    { id: 6, name: 'Jaguatirica',        scientific: 'Leopardus pardalis',           status: 'Quase Ameaçada',     quantity: 5,  health: 'Bom',         lastCheck: '2026-03-08', location: 'Pantanal (MT)',  classe: 'Mamífero'},
    { id: 7, name: 'Mutum-do-Nordeste',  scientific: 'Pauxi mitu',                  status: 'Em Perigo',          quantity: 3,  health: 'Crítico',     lastCheck: '2026-03-17', location: 'Nordeste (PE)',  classe: 'Ave'     },
    { id: 8, name: 'Tartaruga-Cabeçuda', scientific: 'Caretta caretta',             status: 'Vulnerável',         quantity: 9,  health: 'Bom',         lastCheck: '2026-03-11', location: 'Litoral (BA)',   classe: 'Réptil'  },
];

const DEFAULT_SUPPLIES = [
    { id: 1, name: 'Ração Amazônica Lote B-2', category: 'Alimentação', stock: 8,  minStock: 20, expiry: '2026-06-30', unit: 'kg' },
    { id: 2, name: 'Vitamina C Injetável',      category: 'Medicamento', stock: 3,  minStock: 10, expiry: '2026-04-15', unit: 'amp' },
    { id: 3, name: 'Paracetamol Veterinário',   category: 'Medicamento', stock: 45, minStock: 20, expiry: '2026-09-01', unit: 'comp' },
    { id: 4, name: 'Desinfetante Biológico',    category: 'Higiene',     stock: 12, minStock: 8,  expiry: '2026-12-10', unit: 'L' },
    { id: 5, name: 'Ração Carnívoros Premium',  category: 'Alimentação', stock: 2,  minStock: 15, expiry: '2026-05-20', unit: 'kg' },
    { id: 6, name: 'Seringas Descartáveis 5ml', category: 'Equipamento', stock: 200,minStock: 50, expiry: '2028-01-01', unit: 'un' },
];

const DEFAULT_ACTIVITY = [
    { type: 'add',    text: 'Novo Registo: Mico-Leão-Dourado (Juvenil)',   time: 'Há 5 minutos',  icon: 'bi-plus-circle' },
    { type: 'health', text: 'Checkup Sanitário: Recinto 04 concluído',     time: 'Há 2 horas',    icon: 'bi-heart-pulse' },
    { type: 'alert',  text: 'Stock Crítico: Ração Amazônica Lote B-2',     time: 'Há 4 horas',    icon: 'bi-exclamation-triangle' },
    { type: 'add',    text: 'Novo Registo: Tartaruga-Cabeçuda (Fêmea)',    time: 'Há 6 horas',    icon: 'bi-plus-circle' },
    { type: 'health', text: 'Alerta: Mutum-do-Nordeste em estado crítico', time: 'Ontem 09:42',   icon: 'bi-heart-pulse' },
];

const IBAMA_ALERTS = [
    {
        id: 1, level: 'urgente',
        title: 'Atualização de CITES Pendente',
        description: 'Documentação CITES para Mico-Leão-Dourado (Leontopithecus rosalia) vence em 5 dias. Renovação obrigatória para manutenção do espécime em cativeiro.',
        prazo: '27/03/2026',
        resolved: false
    },
    {
        id: 2, level: 'urgente',
        title: 'Relatório Trimestral — Atraso',
        description: 'Relatório de monitoramento Q1/2026 não submetido. IBAMA aguarda envio da documentação completa incluindo logs de saúde e fluxo populacional.',
        prazo: '25/03/2026',
        resolved: false
    },
    {
        id: 3, level: 'atencao',
        title: 'Revisão de Licença de Manejo',
        description: 'Licença de manejo da Ararajuba (Guaruba guarouba) entra em período de revisão. Documentação para auditoria deve ser preparada com antecedência.',
        prazo: '15/04/2026',
        resolved: false
    },
];

// ============================================================
// STATE
// ============================================================
let speciesData = loadData(DB_KEY_SPECIES, DEFAULT_SPECIES);
let suppliesData = loadData(DB_KEY_SUPPLIES, DEFAULT_SUPPLIES);
let activityData = loadData(DB_KEY_ACTIVITY, DEFAULT_ACTIVITY);
let ibamaAlerts  = IBAMA_ALERTS; // kept in memory

let currentPage        = 'dashboard';
let populationChart    = null;
let selectedSpeciesId  = null;
let inventorySearchTerm = '';
let inventoryStatusFilter = '';
let inventoryPage = 1;
const INVENTORY_PER_PAGE = 6;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initInventory();
    initSupplies();
    initGeo();
    initAlerts();
    initModals();
    initSidebar();
    updateHeaderBadges();
});

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
            // Close sidebar on mobile
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('open');
        });
    });

    // Sidebar search filter
    document.getElementById('sidebar-search').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#nav-menu .nav-item').forEach(item => {
            const label = item.dataset.label.toLowerCase();
            item.style.display = label.includes(q) ? '' : 'none';
        });
    });
}

function navigateTo(page) {
    if (currentPage === page) return;
    currentPage = page;

    // Update nav active state
    document.querySelectorAll('.nav-link[data-page]').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Show/hide sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`page-${page}`);
    if (section) section.classList.add('active');

    // Update header
    const titles = {
        dashboard: ['Painel Bio-Analítico', 'Monitoramento de fauna em tempo real'],
        inventory:  ['Inventário de Espécimes', 'Catálogo completo de fauna sob custódia'],
        geo:        ['Geomonitoramento', 'Distribuição geográfica e habitat das espécies'],
        supplies:   ['Gestão de Suprimentos', 'Controlo de stock, medicamentos e insumos'],
        alerts:     ['Alertas IBAMA', 'Pendências regulatórias e conformidade ambiental'],
    };
    const [title, sub] = titles[page] || ['SilvestreStock', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = sub;

    // Re-render page content on navigation
    if (page === 'dashboard') renderChart(document.getElementById('chart-period').value);
    if (page === 'alerts')    renderAlerts();
    if (page === 'inventory') renderInventoryTable();
    if (page === 'geo')       { renderGeoMap(); renderGeoSpeciesList(); }
    if (page === 'supplies')  renderSuppliesTable();
}

// ============================================================
// DASHBOARD
// ============================================================
function initDashboard() {
    renderActivityFeed();
    renderChart(30);

    document.getElementById('chart-period').addEventListener('change', e => {
        renderChart(parseInt(e.target.value));
    });

    document.getElementById('btn-clear-feed').addEventListener('click', () => {
        activityData = [];
        saveData(DB_KEY_ACTIVITY, activityData);
        renderActivityFeed();
    });

    // Stat card click → go to inventory
    document.getElementById('stat-especimes').addEventListener('click', () => navigateTo('inventory'));
    document.getElementById('stat-alerts').addEventListener('click', () => navigateTo('alerts'));
}

function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    if (activityData.length === 0) {
        feed.innerHTML = `<p class="text-muted text-center small mt-3">Nenhuma atividade recente.</p>`;
        return;
    }

    feed.innerHTML = activityData.slice(0, 8).map((act, i) => `
        <div class="d-flex align-items-start gap-3 animate-fade" style="animation-delay: ${i * 0.06}s">
            <div class="icon-circle">
                <i class="bi ${act.icon} ${act.type === 'alert' ? 'text-accent' : 'text-emerald'}"></i>
            </div>
            <div>
                <p class="m-0 small fw-bold text-light">${act.text}</p>
                <span class="text-muted smaller">${act.time}</span>
            </div>
        </div>
    `).join('');
}

function addActivity(type, text, icon) {
    activityData.unshift({ type, text, icon, time: 'Agora mesmo' });
    if (activityData.length > 20) activityData.pop();
    saveData(DB_KEY_ACTIVITY, activityData);
    if (currentPage === 'dashboard') renderActivityFeed();
}

// ============================================================
// CHART — Fluxo Populacional
// ============================================================
function renderChart(days) {
    const ctx = document.getElementById('populationChart');
    if (!ctx) return;

    const labels = generateDateLabels(parseInt(days));
    const dataSpecimes = generatePopulationData(parseInt(days), 1180, 1250);
    const dataAlertas  = generateAlertData(parseInt(days));

    if (populationChart) {
        populationChart.destroy();
        populationChart = null;
    }

    populationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Total de Espécimes',
                    data: dataSpecimes,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    borderWidth: 2.5,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981',
                    tension: 0.45,
                    fill: true,
                    yAxisID: 'y',
                },
                {
                    label: 'Alertas IBAMA',
                    data: dataAlertas,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245,158,11,0.05)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b',
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true }
                },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.92)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    padding: 12,
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#64748b', font: { size: 11 }, maxTicksLimit: 8 }
                },
                y: {
                    position: 'left',
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#64748b', font: { size: 11 } }
                },
                y1: {
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#64748b', font: { size: 11 } }
                }
            }
        }
    });
}

function generateDateLabels(days) {
    const labels = [];
    const step = Math.ceil(days / 10);
    for (let i = days; i >= 0; i -= step) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    return labels;
}

function generatePopulationData(days, min, max) {
    const count = Math.ceil(days / Math.ceil(days / 10)) + 1;
    const data = [];
    let v = min + Math.random() * (max - min) * 0.5;
    for (let i = 0; i < count; i++) {
        v += (Math.random() - 0.38) * 18;
        v = Math.max(min, Math.min(max, v));
        data.push(Math.round(v));
    }
    return data;
}

function generateAlertData(days) {
    const count = Math.ceil(days / Math.ceil(days / 10)) + 1;
    return Array.from({ length: count }, () => Math.floor(Math.random() * 5) + 1);
}

// ============================================================
// INVENTORY
// ============================================================
function initInventory() {
    renderInventoryTable();

    document.getElementById('inventory-search').addEventListener('input', e => {
        inventorySearchTerm = e.target.value.toLowerCase();
        inventoryPage = 1;
        renderInventoryTable();
    });

    document.getElementById('inventory-filter-status').addEventListener('change', e => {
        inventoryStatusFilter = e.target.value;
        inventoryPage = 1;
        renderInventoryTable();
    });

    document.getElementById('btn-export-inventory').addEventListener('click', exportInventoryCSV);
    document.getElementById('btn-add-species').addEventListener('click', () => openNovoRegistroModal());
}

function getFilteredSpecies() {
    return speciesData.filter(s => {
        const matchSearch = !inventorySearchTerm ||
            s.name.toLowerCase().includes(inventorySearchTerm) ||
            s.scientific.toLowerCase().includes(inventorySearchTerm);
        const matchStatus = !inventoryStatusFilter || s.status === inventoryStatusFilter;
        return matchSearch && matchStatus;
    });
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventory-tbody');
    const countEl = document.getElementById('inventory-count');
    const pagEl = document.getElementById('inventory-pagination');

    const filtered = getFilteredSpecies();
    const totalPages = Math.max(1, Math.ceil(filtered.length / INVENTORY_PER_PAGE));
    inventoryPage = Math.min(inventoryPage, totalPages);
    const start = (inventoryPage - 1) * INVENTORY_PER_PAGE;
    const paginated = filtered.slice(start, start + INVENTORY_PER_PAGE);

    countEl.textContent = `${filtered.length} registo${filtered.length !== 1 ? 's' : ''}`;

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">Nenhuma espécie encontrada.</td></tr>`;
        pagEl.innerHTML = '';
        return;
    }

    tbody.innerHTML = paginated.map(s => `
        <tr style="cursor:pointer" onclick="openSpeciesDetail(${s.id})">
            <td class="ps-4 fw-semibold">${s.name}</td>
            <td class="fst-italic text-muted small">${s.scientific}</td>
            <td><span class="fw-bold">${s.quantity}</span></td>
            <td><span class="status-badge ${statusClass(s.status)}">${s.status}</span></td>
            <td><span class="health-badge ${healthClass(s.health)}">${s.health}</span></td>
            <td class="text-muted small">${formatDate(s.lastCheck)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-icon text-emerald" onclick="event.stopPropagation(); openSpeciesDetail(${s.id})" title="Ver detalhes">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-icon text-danger-c" onclick="event.stopPropagation(); deleteSpecies(${s.id})" title="Remover">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Pagination
    if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
    let pagHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        pagHTML += `<button class="btn btn-sm glass-card border-0 ${i === inventoryPage ? 'btn-emerald' : ''}"
            onclick="inventoryPage=${i}; renderInventoryTable()">${i}</button>`;
    }
    pagEl.innerHTML = pagHTML;
}

function statusClass(s) {
    const map = {
        'Vulnerável': 'status-vulneravel',
        'Em Perigo':  'status-perigo',
        'Criticamente em Perigo': 'status-perigo',
        'Quase Ameaçada': 'status-quase-ameacada',
        'Pouco Preocupante': 'status-pouco-preocupante',
    };
    return map[s] || 'status-vulneravel';
}

function healthClass(h) {
    const map = {
        'Excelente': 'health-excelente',
        'Bom':       'health-bom',
        'Monitorado':'health-monitorado',
        'Crítico':   'health-critico',
    };
    return map[h] || 'health-monitorado';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
}

function openSpeciesDetail(id) {
    selectedSpeciesId = id;
    const s = speciesData.find(x => x.id === id);
    if (!s) return;

    document.getElementById('detail-nome').textContent = s.name;
    document.getElementById('detail-body').innerHTML = `
        <div class="row g-3">
            <div class="col-6">
                <span class="text-muted small d-block">Nome Científico</span>
                <span class="fw-semibold fst-italic">${s.scientific}</span>
            </div>
            <div class="col-6">
                <span class="text-muted small d-block">Classe</span>
                <span class="fw-semibold">${s.classe || '—'}</span>
            </div>
            <div class="col-4">
                <span class="text-muted small d-block">Quantidade</span>
                <span class="fw-bold text-emerald fs-4">${s.quantity}</span>
            </div>
            <div class="col-4">
                <span class="text-muted small d-block">Status IUCN</span>
                <span class="status-badge ${statusClass(s.status)}">${s.status}</span>
            </div>
            <div class="col-4">
                <span class="text-muted small d-block">Saúde</span>
                <span class="health-badge ${healthClass(s.health)}">${s.health}</span>
            </div>
            <div class="col-6">
                <span class="text-muted small d-block">Localização</span>
                <span><i class="bi bi-geo-alt-fill text-emerald me-1"></i>${s.location || '—'}</span>
            </div>
            <div class="col-6">
                <span class="text-muted small d-block">Último Checkup</span>
                <span>${formatDate(s.lastCheck)}</span>
            </div>
            ${s.obs ? `<div class="col-12"><span class="text-muted small d-block">Observações</span><span>${s.obs}</span></div>` : ''}
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modal-detalhe-especie'));
    modal.show();
}

function deleteSpecies(id) {
    if (!confirm('Tem a certeza que deseja remover este registo?')) return;
    const s = speciesData.find(x => x.id === id);
    speciesData = speciesData.filter(x => x.id !== id);
    saveData(DB_KEY_SPECIES, speciesData);
    renderInventoryTable();
    updateDashboardStats();
    if (s) addActivity('alert', `Registo removido: ${s.name}`, 'bi-trash');
    showToast('Registo removido com sucesso.', 'warning');
    // Close detail modal if open
    const m = bootstrap.Modal.getInstance(document.getElementById('modal-detalhe-especie'));
    if (m) m.hide();
}

function exportInventoryCSV() {
    const headers = ['ID', 'Nome', 'Nome Científico', 'Quantidade', 'Status', 'Saúde', 'Localização', 'Último Checkup'];
    const rows = speciesData.map(s => [s.id, s.name, s.scientific, s.quantity, s.status, s.health, s.location || '', s.lastCheck || '']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'silvestre_inventario.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventário exportado com sucesso!');
}

// ============================================================
// SUPPLIES
// ============================================================
function initSupplies() {
    renderSuppliesTable();
    document.getElementById('btn-add-supply').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('modal-supply'));
        modal.show();
    });
}

function renderSuppliesTable() {
    const tbody = document.getElementById('supplies-tbody');
    const critical = suppliesData.filter(s => s.stock <= s.minStock).length;

    document.getElementById('supply-total').textContent = suppliesData.length;
    document.getElementById('supply-critical').textContent = critical;
    document.getElementById('supplies-badge').textContent = critical > 0 ? '!' : '';
    document.getElementById('supplies-badge').style.display = critical > 0 ? '' : 'none';

    tbody.innerHTML = suppliesData.map(s => {
        const pct = Math.min(100, Math.round((s.stock / (s.minStock * 3)) * 100));
        const barClass = s.stock <= s.minStock ? 'stock-crit' : (s.stock <= s.minStock * 1.5 ? 'stock-low' : 'stock-ok');
        const statusLabel = s.stock <= s.minStock ? 'Crítico' : (s.stock <= s.minStock * 1.5 ? 'Baixo' : 'Normal');
        const statusBadge = s.stock <= s.minStock ? 'status-perigo' : (s.stock <= s.minStock * 1.5 ? 'status-quase-ameacada' : 'status-pouco-preocupante');
        return `
        <tr>
            <td class="ps-4 fw-semibold">${s.name}</td>
            <td class="text-muted small">${s.category}</td>
            <td>
                <div class="stock-bar-wrap">
                    <span class="fw-bold" style="min-width:30px">${s.stock}</span>
                    <div class="stock-bar-bg">
                        <div class="stock-bar-fill ${barClass}" style="width:${pct}%"></div>
                    </div>
                    <span class="text-muted smaller">${s.unit}</span>
                </div>
            </td>
            <td class="text-muted">${s.minStock} ${s.unit}</td>
            <td><span class="status-badge ${statusBadge}">${statusLabel}</span></td>
            <td class="text-muted small">${formatDate(s.expiry)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-icon text-emerald" onclick="orderSupply(${s.id})" title="Encomendar">
                    <i class="bi bi-truck"></i>
                </button>
                <button class="btn btn-sm btn-icon text-danger-c" onclick="deleteSupply(${s.id})" title="Remover">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

function orderSupply(id) {
    const s = suppliesData.find(x => x.id === id);
    if (!s) return;
    s.stock += s.minStock * 2;
    saveData(DB_KEY_SUPPLIES, suppliesData);
    renderSuppliesTable();
    addActivity('add', `Encomenda realizada: ${s.name} (+${s.minStock * 2} ${s.unit})`, 'bi-truck');
    document.getElementById('supply-pending').textContent = parseInt(document.getElementById('supply-pending').textContent) + 1;
    showToast(`Encomenda de "${s.name}" registada.`);
}

function deleteSupply(id) {
    if (!confirm('Remover este suprimento?')) return;
    suppliesData = suppliesData.filter(x => x.id !== id);
    saveData(DB_KEY_SUPPLIES, suppliesData);
    renderSuppliesTable();
    showToast('Suprimento removido.', 'warning');
}

// ============================================================
// GEO
// ============================================================
const GEO_LOCATIONS = {
    'Amazônia (AM)':      { x: 105, y: 110 },
    'Pantanal (MT)':      { x: 185, y: 230 },
    'Mata Atlântica (RJ)':{ x: 280, y: 260 },
    'Cerrado (GO)':       { x: 215, y: 195 },
    'Nordeste (CE)':      { x: 305, y: 120 },
    'Nordeste (PE)':      { x: 315, y: 145 },
    'Litoral (BA)':       { x: 285, y: 195 },
};

const STATUS_COLORS = {
    'Vulnerável':         '#f59e0b',
    'Em Perigo':          '#ef4444',
    'Criticamente em Perigo': '#dc2626',
    'Quase Ameaçada':     '#fbbf24',
    'Pouco Preocupante':  '#10b981',
};

function initGeo() {
    renderGeoMap();
    renderGeoSpeciesList();

    document.getElementById('btn-map-all').addEventListener('click', () => {
        document.querySelectorAll('.btn-filter-map').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-map-all').classList.add('active');
        renderGeoMap();
    });

    document.querySelectorAll('.btn-filter-map').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('btn-map-all').classList.remove('active');
            document.querySelectorAll('.btn-filter-map').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGeoMap(btn.dataset.filter);
        });
    });
}

function renderGeoMap(filterStatus = null) {
    const container = document.getElementById('geo-map');
    const filtered = filterStatus ? speciesData.filter(s => s.status === filterStatus) : speciesData;

    // Brazil outline SVG (simplified paths)
    const svgContent = `
    <svg viewBox="0 0 420 380" class="geo-map-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Stylized Brazil outline -->
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(16,185,129,0.04)"/>
                <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
            </radialGradient>
        </defs>
        <rect width="420" height="380" fill="url(#bg-grad)"/>
        <!-- Grid lines -->
        <line x1="0" y1="95"  x2="420" y2="95"  stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <line x1="0" y1="190" x2="420" y2="190" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <line x1="0" y1="285" x2="420" y2="285" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <line x1="105" y1="0" x2="105" y2="380" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <line x1="210" y1="0" x2="210" y2="380" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <line x1="315" y1="0" x2="315" y2="380" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <!-- Simplified Brazil landmass -->
        <path d="M 80,50 L 180,30 L 280,45 L 340,80 L 365,130 L 355,175 L 330,210 L 310,250 L 295,295 L 270,340 L 240,360 L 200,355 L 165,330 L 140,300 L 120,270 L 95,240 L 75,200 L 60,165 L 62,120 L 80,50 Z"
              fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.2)" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Region labels -->
        <text x="90"  y="100" class="geo-label" font-size="8" fill="rgba(255,255,255,0.2)">Norte</text>
        <text x="220" y="175" class="geo-label" font-size="8" fill="rgba(255,255,255,0.2)">Centro</text>
        <text x="285" y="115" class="geo-label" font-size="8" fill="rgba(255,255,255,0.2)">Nordeste</text>
        <text x="250" y="270" class="geo-label" font-size="8" fill="rgba(255,255,255,0.2)">Sudeste</text>
        ${filtered.map((s, i) => {
            const loc = GEO_LOCATIONS[s.location] || { x: 180 + i * 15, y: 180 };
            const color = STATUS_COLORS[s.status] || '#10b981';
            return `
            <g class="geo-dot" onclick="highlightSpecies(${s.id})">
                <circle cx="${loc.x}" cy="${loc.y}" r="14" fill="${color}22" class="pulse-ring"/>
                <circle cx="${loc.x}" cy="${loc.y}" r="7"  fill="${color}" opacity="0.9" filter="url(#glow)"/>
                <circle cx="${loc.x}" cy="${loc.y}" r="3"  fill="white" opacity="0.8"/>
                <text x="${loc.x}" y="${loc.y + 22}" text-anchor="middle" class="geo-label" font-size="9" fill="${color}">${s.name}</text>
            </g>`;
        }).join('')}
    </svg>`;
    container.innerHTML = svgContent;
}

function renderGeoSpeciesList(filterStatus = null) {
    const list = document.getElementById('geo-species-list');
    const data = filterStatus ? speciesData.filter(s => s.status === filterStatus) : speciesData;

    list.innerHTML = data.map(s => {
        const color = STATUS_COLORS[s.status] || '#10b981';
        return `
        <div class="geo-species-item" onclick="highlightSpecies(${s.id})">
            <div class="geo-species-dot" style="background:${color}"></div>
            <div class="flex-grow-1">
                <p class="m-0 small fw-semibold">${s.name}</p>
                <span class="text-muted smaller">${s.location || 'Localização N/D'}</span>
            </div>
            <span class="status-badge ${statusClass(s.status)}" style="font-size:0.65rem">${s.status}</span>
        </div>`;
    }).join('');
}

function highlightSpecies(id) {
    const s = speciesData.find(x => x.id === id);
    if (!s) return;
    openSpeciesDetail(id);
}

// ============================================================
// ALERTS
// ============================================================
function initAlerts() {
    renderAlerts();
}

function renderAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;
    const active = ibamaAlerts.filter(a => !a.resolved);

    // Update the stat counter in the dashboard card
    const statH2 = document.querySelector('#stat-alerts h2');
    if (statH2) statH2.textContent = String(active.length).padStart(2, '0');

    // Update the sidebar badge
    const badge = document.getElementById('alerts-badge');
    if (badge) {
        badge.textContent = active.length;
        badge.style.display = active.length > 0 ? '' : 'none';
    }

    if (active.length === 0) {
        list.innerHTML = `<div class="text-center py-5 text-emerald">
            <i class="bi bi-check-circle-fill fs-1 mb-3 d-block"></i>
            <p class="fw-bold">Sem pendências! Tudo em conformidade.</p></div>`;
        return;
    }

    list.innerHTML = active.map(alert => `
        <div class="alert-card ${alert.level}" id="alert-card-${alert.id}">
            <div class="alert-icon">
                <i class="bi ${alert.level === 'urgente' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'}"></i>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <span class="fw-bold small">${alert.title}</span>
                    <span class="badge ${alert.level === 'urgente' ? 'bg-danger' : 'bg-warning'} ms-2" style="font-size:0.65rem">
                        ${alert.level === 'urgente' ? 'URGENTE' : 'ATENÇÃO'}
                    </span>
                </div>
                <p class="text-muted small m-0 mb-2">${alert.description}</p>
                <span class="smaller text-muted"><i class="bi bi-calendar me-1"></i>Prazo: ${alert.prazo}</span>
            </div>
            <button class="btn-resolve" onclick="resolveAlert(${alert.id})">
                <i class="bi bi-check me-1"></i>Resolver
            </button>
        </div>
    `).join('');
}

function resolveAlert(id) {
    const a = ibamaAlerts.find(x => x.id === id);
    if (!a) return;
    a.resolved = true;
    addActivity('add', `Alerta IBAMA resolvido: ${a.title}`, 'bi-check-circle');
    renderAlerts();
    updateHeaderBadges();
    showToast(`Pendência "${a.title}" marcada como resolvida.`);
}

// ============================================================
// MODALS
// ============================================================
function initModals() {
    // --- Novo Registro ---
    document.getElementById('btn-novo-registro').addEventListener('click', openNovoRegistroModal);
    document.getElementById('btn-save-registro').addEventListener('click', saveNovoRegistro);

    // --- Delete from detail modal ---
    document.getElementById('btn-delete-especie').addEventListener('click', () => {
        if (selectedSpeciesId) deleteSpecies(selectedSpeciesId);
    });

    // --- Save supply ---
    document.getElementById('btn-save-supply').addEventListener('click', saveSupply);

    // --- Notifications ---
    document.getElementById('btn-notifications').addEventListener('click', () => navigateTo('alerts'));
}

function openNovoRegistroModal() {
    document.getElementById('form-novo-registro').reset();
    const modal = new bootstrap.Modal(document.getElementById('modal-novo-registro'));
    modal.show();
}

function saveNovoRegistro() {
    const form = document.getElementById('form-novo-registro');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const newSpecies = {
        id:        speciesData.length > 0 ? Math.max(...speciesData.map(s => s.id)) + 1 : 1,
        name:      document.getElementById('field-nome').value.trim(),
        scientific:document.getElementById('field-cientifico').value.trim(),
        quantity:  parseInt(document.getElementById('field-quantidade').value),
        status:    document.getElementById('field-status').value,
        health:    document.getElementById('field-saude').value,
        location:  document.getElementById('field-localizacao').value.trim(),
        classe:    document.getElementById('field-classe').value,
        obs:       document.getElementById('field-obs').value.trim(),
        lastCheck: new Date().toISOString().slice(0, 10),
    };

    speciesData.push(newSpecies);
    saveData(DB_KEY_SPECIES, speciesData);

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('modal-novo-registro')).hide();

    // Update UI
    renderInventoryTable();
    updateDashboardStats();
    addActivity('add', `Novo Registo: ${newSpecies.name} (${newSpecies.quantity} espécime${newSpecies.quantity !== 1 ? 's' : ''})`, 'bi-plus-circle');
    updateHeaderBadges();
    showToast(`"${newSpecies.name}" adicionado ao inventário!`);
}

function saveSupply() {
    const name = document.getElementById('supply-name').value.trim();
    if (!name) return;

    const newSupply = {
        id:       suppliesData.length > 0 ? Math.max(...suppliesData.map(s => s.id)) + 1 : 1,
        name,
        category: document.getElementById('supply-category').value,
        stock:    parseInt(document.getElementById('supply-stock').value) || 0,
        minStock: parseInt(document.getElementById('supply-min').value) || 5,
        expiry:   document.getElementById('supply-expiry').value,
        unit:     'un',
    };

    suppliesData.push(newSupply);
    saveData(DB_KEY_SUPPLIES, suppliesData);
    bootstrap.Modal.getInstance(document.getElementById('modal-supply')).hide();
    renderSuppliesTable();
    addActivity('add', `Novo suprimento cadastrado: ${newSupply.name}`, 'bi-box-seam');
    showToast(`Suprimento "${newSupply.name}" adicionado!`);
}

// ============================================================
// SIDEBAR (mobile)
// ============================================================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const btnOpen  = document.getElementById('btn-hamburger');
    const btnClose = document.getElementById('btn-close-sidebar');

    btnOpen.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    });
    btnClose.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    });

    // User profile — show info toast
    document.getElementById('user-profile-btn').addEventListener('click', () => {
        showToast('Sessão ativa como Dr. Silvestre — Administrador');
    });
}

// ============================================================
// HELPERS
// ============================================================
function updateDashboardStats() {
    const total = speciesData.reduce((sum, s) => sum + s.quantity, 0);
    document.getElementById('stat-total').textContent = total.toLocaleString('pt-BR');
    document.getElementById('stat-species').textContent = speciesData.length;
}

function updateHeaderBadges() {
    const activeAlerts = ibamaAlerts.filter(a => !a.resolved).length;
    document.getElementById('alerts-badge').textContent = activeAlerts;
    document.getElementById('alerts-badge').style.display = activeAlerts > 0 ? '' : 'none';
    updateDashboardStats();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.className = `toast align-items-center border-0 glass-panel text-${type === 'success' ? 'emerald' : type === 'warning' ? 'accent' : 'danger-c'}`;
    const bsToast = new bootstrap.Toast(toast, { delay: 3500 });
    bsToast.show();
}

// Initialize chart on load (dashboard is active by default)
window.addEventListener('load', () => {
    renderChart(30);
    updateHeaderBadges();
    renderGeoSpeciesList();
});
