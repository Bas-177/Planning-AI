// JavaScript voor Home pagina

const API_BASE = '/api';

// Laad data bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadHomeData();
});

// Laad alle home data
async function loadHomeData() {
    try {
        const [ordersResponse, vrijeDagenResponse] = await Promise.all([
            fetch(`${API_BASE}/orders`),
            fetch(`${API_BASE}/vrije-dagen`)
        ]);
        
        const orders = await ordersResponse.json();
        const vrijeDagen = await vrijeDagenResponse.json();
        
        // Update stats
        updateStats(orders);
        
        // Laad agenda meldingen
        loadAgendaMeldingen(vrijeDagen);
        
        // Laad orders voor conservering
        loadConserveringOrders(orders);
        
        // Laad orders voor levering
        loadLeveringOrders(orders);
        
        // Laad alle orders
        loadAlleOrders(orders);
    } catch (error) {
        console.error('Fout bij laden home data:', error);
    }
}

// Update statistieken
function updateStats(orders) {
    const totaal = orders.length;
    const open = orders.filter(o => !parseBoolean(o.project_gereed)).length;
    const deadlineNadert = orders.filter(o => {
        if (!o.leverdatum) return false;
        const leverdatum = new Date(o.leverdatum);
        const nu = new Date();
        const dagen = Math.ceil((leverdatum - nu) / (1000 * 60 * 60 * 24));
        return dagen <= 3 && dagen >= 0 && !parseBoolean(o.project_gereed);
    }).length;
    
    document.getElementById('totaalOrders').textContent = totaal;
    document.getElementById('openOrders').textContent = open;
    document.getElementById('deadlineNadert').textContent = deadlineNadert;
}

// Parse boolean (kan string zijn uit Excel)
function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() in ['true', '1', 'yes'];
    return false;
}

// Laad agenda meldingen
function loadAgendaMeldingen(vrijeDagen) {
    const container = document.getElementById('agendaMeldingen');
    if (!container) return;
    
    // Filter vrije dagen voor deze en volgende week
    const nu = new Date();
    const volgendeWeek = new Date(nu);
    volgendeWeek.setDate(nu.getDate() + 7);
    
    const relevanteDagen = vrijeDagen.filter(vd => {
        if (!vd.datum) return false;
        const datum = new Date(vd.datum);
        return datum >= nu && datum <= volgendeWeek;
    });
    
    if (relevanteDagen.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">Geen vrije dagen deze week</p>';
        return;
    }
    
    container.innerHTML = relevanteDagen.map(vd => {
        const datum = new Date(vd.datum);
        return `
            <div class="agenda-melding vrije-dag">
                <div>
                    <strong>${vd.medewerker || 'Onbekend'}</strong> - ${datum.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    ${vd.omschrijving ? `<br><small>${vd.omschrijving}</small>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Laad orders voor conservering (deze week)
function loadConserveringOrders(orders) {
    const container = document.getElementById('conserveringOrders');
    if (!container) return;
    
    const nu = new Date();
    const eindeWeek = new Date(nu);
    eindeWeek.setDate(nu.getDate() + 7);
    
    const conserveringOrders = orders.filter(o => {
        if (!o.conserveringsdatum) return false;
        const datum = new Date(o.conserveringsdatum);
        return datum >= nu && datum <= eindeWeek;
    });
    
    if (conserveringOrders.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">Geen projecten naar conservering deze week</p>';
        return;
    }
    
    container.innerHTML = conserveringOrders.map(o => createOrderCard(o)).join('');
}

// Laad orders voor levering (deze/volgende week)
function loadLeveringOrders(orders) {
    const container = document.getElementById('leveringOrders');
    if (!container) return;
    
    const nu = new Date();
    const volgendeWeek = new Date(nu);
    volgendeWeek.setDate(nu.getDate() + 14);
    
    const leveringOrders = orders.filter(o => {
        if (!o.leverdatum) return false;
        const datum = new Date(o.leverdatum);
        return datum >= nu && datum <= volgendeWeek;
    });
    
    if (leveringOrders.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">Geen orders voor levering deze/volgende week</p>';
        return;
    }
    
    container.innerHTML = leveringOrders.map(o => createOrderCard(o)).join('');
}

// Laad alle orders
function loadAlleOrders(orders) {
    const container = document.getElementById('alleOrders');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">Geen orders</p>';
        return;
    }
    
    container.innerHTML = orders.map(o => createOrderCard(o)).join('');
}

// Maak order card
function createOrderCard(order) {
    // Valideer ordernummer
    if (!order || !order.ordernummer) {
        console.error('Order zonder ordernummer:', order);
        return '';
    }
    
    const ordernummer = String(order.ordernummer);
    const status = getOrderStatus(order);
    const statusLabel = getStatusLabel(status);
    const leverdatum = order.leverdatum ? new Date(order.leverdatum).toLocaleDateString('nl-NL') : '-';
    const conserveringsdatum = order.conserveringsdatum ? new Date(order.conserveringsdatum).toLocaleDateString('nl-NL') : '-';
    
    return `
        <div class="order-card" onclick="window.location.href='/orders'">
            <div class="order-card-header">
                <div class="order-card-title">${ordernummer}</div>
                <span class="order-status-badge ${status}">${statusLabel}</span>
            </div>
            <div class="order-card-info">
                <strong>Klant:</strong> ${order.klant || '-'}<br>
                <strong>Omschrijving:</strong> ${order.omschrijving || '-'}<br>
                <strong>Leverdatum:</strong> ${leverdatum}<br>
                ${conserveringsdatum !== '-' ? `<strong>Conservering:</strong> ${conserveringsdatum}<br>` : ''}
            </div>
            ${order.montage_opmerkingen ? `
                <div class="order-card-opmerkingen montage">
                    <strong>Montage:</strong> ${order.montage_opmerkingen}
                </div>
            ` : ''}
            ${order.uitlevering_opmerkingen ? `
                <div class="order-card-opmerkingen uitlevering">
                    <strong>Uitlevering:</strong> ${order.uitlevering_opmerkingen}
                </div>
            ` : ''}
            <select class="order-status-select" onchange="updateOrderStatus('${ordernummer}', this.value)" onclick="event.stopPropagation()">
                <option value="werkvoorbereiding" ${status === 'werkvoorbereiding' ? 'selected' : ''}>Werkvoorbereiding</option>
                <option value="materiaal_besteld" ${status === 'materiaal_besteld' ? 'selected' : ''}>Materiaal Besteld</option>
                <option value="materiaal_binnen" ${status === 'materiaal_binnen' ? 'selected' : ''}>Materiaal Binnen</option>
                <option value="in_productie" ${status === 'in_productie' ? 'selected' : ''}>In Productie</option>
                <option value="productie_gereed" ${status === 'productie_gereed' ? 'selected' : ''}>Productie Gereed</option>
                <option value="project_gereed" ${status === 'project_gereed' ? 'selected' : ''}>Project Gereed</option>
            </select>
        </div>
    `;
}

// Bepaal order status
function getOrderStatus(order) {
    if (parseBoolean(order.project_gereed)) return 'project_gereed';
    if (parseBoolean(order.productie_gereed)) return 'productie_gereed';
    if (parseBoolean(order.materiaal_binnen)) return 'in_productie';
    if (parseBoolean(order.materiaal_besteld)) return 'materiaal_besteld';
    return 'werkvoorbereiding';
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'werkvoorbereiding': 'Werkvoorbereiding',
        'materiaal_besteld': 'Materiaal Besteld',
        'materiaal_binnen': 'Materiaal Binnen',
        'in_productie': 'In Productie',
        'productie_gereed': 'Productie Gereed',
        'project_gereed': 'Project Gereed'
    };
    return labels[status] || status;
}

// Update order status
async function updateOrderStatus(ordernummer, newStatus) {
    // Valideer ordernummer
    if (!ordernummer || ordernummer === 'null' || ordernummer === 'undefined') {
        console.error('Ongeldig ordernummer:', ordernummer);
        alert('Fout: Ordernummer ontbreekt');
        return;
    }
    
    const statusMap = {
        'werkvoorbereiding': { materiaal_besteld: false, materiaal_binnen: false, productie_gereed: false, project_gereed: false },
        'materiaal_besteld': { materiaal_besteld: true, materiaal_binnen: false, productie_gereed: false, project_gereed: false },
        'materiaal_binnen': { materiaal_besteld: true, materiaal_binnen: true, productie_gereed: false, project_gereed: false },
        'in_productie': { materiaal_besteld: true, materiaal_binnen: true, productie_gereed: false, project_gereed: false },
        'productie_gereed': { materiaal_besteld: true, materiaal_binnen: true, productie_gereed: true, project_gereed: false },
        'project_gereed': { materiaal_besteld: true, materiaal_binnen: true, productie_gereed: true, project_gereed: true }
    };
    
    const updateData = statusMap[newStatus];
    if (!updateData) {
        console.error('Ongeldige status:', newStatus);
        alert('Ongeldige status geselecteerd');
        return;
    }
    
    try {
        const encodedOrdernummer = encodeURIComponent(String(ordernummer));
        const response = await fetch(`${API_BASE}/orders/${encodedOrdernummer}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Onbekende fout' }));
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
        
        // Herlaad data
        await loadHomeData();
    } catch (error) {
        console.error('Fout bij updaten status:', error);
        alert('Fout bij updaten status: ' + error.message);
    }
}

// Zoek orders
function searchOrders() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    // TODO: Implementeer zoek functionaliteit
    console.log('Zoeken naar:', query);
}

