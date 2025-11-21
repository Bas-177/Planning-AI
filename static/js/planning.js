// JavaScript voor Planning pagina

const API_BASE = '/api';

let currentView = 'kanban';

// Laad planning bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadPlanning();
});

// Laad planning data
async function loadPlanning() {
    try {
        const response = await fetch(`${API_BASE}/planning`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Planning API error:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }
        const planning = await response.json();
        
        if (currentView === 'kanban') {
            displayKanbanView(planning);
        } else {
            displayTableView(planning);
        }
    } catch (error) {
        console.error('Fout bij laden planning:', error);
        alert('Fout bij laden planning: ' + error.message);
    }
}

// Toon Kanban view
function showKanbanView() {
    currentView = 'kanban';
    document.getElementById('kanbanView').style.display = 'flex';
    document.getElementById('tableView').style.display = 'none';
    loadPlanning();
}

// Toon Table view
function showTableView() {
    currentView = 'table';
    document.getElementById('kanbanView').style.display = 'none';
    document.getElementById('tableView').style.display = 'block';
    loadPlanning();
}

// Display Kanban view
function displayKanbanView(planning) {
    const columns = {
        'werkvoorbereiding': document.getElementById('col-werkvoorbereiding'),
        'materiaal_besteld': document.getElementById('col-materiaal_besteld'),
        'materiaal_binnen': document.getElementById('col-materiaal_binnen'),
        'in_productie': document.getElementById('col-in_productie'),
        'productie_gereed': document.getElementById('col-productie_gereed'),
        'project_gereed': document.getElementById('col-project_gereed')
    };
    
    // Leeg alle kolommen
    Object.values(columns).forEach(col => {
        if (col) col.innerHTML = '';
    });
    
    // Vul kolommen
    if (planning.werkvoorbereiding) {
        planning.werkvoorbereiding.forEach(order => {
            columns.werkvoorbereiding.innerHTML += createKanbanCard(order);
        });
    }
    
    if (planning.materiaal_besteld) {
        planning.materiaal_besteld.forEach(order => {
            columns.materiaal_besteld.innerHTML += createKanbanCard(order);
        });
    }
    
    if (planning.materiaal_binnen) {
        planning.materiaal_binnen.forEach(order => {
            columns.materiaal_binnen.innerHTML += createKanbanCard(order);
        });
    }
    
    if (planning.in_productie) {
        planning.in_productie.forEach(order => {
            columns.in_productie.innerHTML += createKanbanCard(order);
        });
    }
    
    if (planning.productie_gereed) {
        planning.productie_gereed.forEach(order => {
            columns.productie_gereed.innerHTML += createKanbanCard(order);
        });
    }
    
    if (planning.project_gereed) {
        planning.project_gereed.forEach(order => {
            columns.project_gereed.innerHTML += createKanbanCard(order);
        });
    }
}

// Maak Kanban card
function createKanbanCard(order) {
    const leverdatum = formatDate(order.leverdatum);
    const totaalUren = (order.uren_voorbereiding || 0) + (order.uren_samenstellen || 0) + (order.uren_aflassen || 0);
    const dagenTotDeadline = getDagenTotDeadline(order.leverdatum);
    const deadlineClass = dagenTotDeadline <= 3 ? 'deadline warning' : dagenTotDeadline <= 0 ? 'deadline' : '';
    const currentStatus = getOrderStatus(order);
    
    return `
        <div class="kanban-item" data-order="${order.ordernummer}">
            <div class="kanban-item-header">${order.ordernummer}</div>
            <div class="kanban-item-body">
                <strong>${order.klant || '-'}</strong><br>
                ${order.omschrijving || '-'}
            </div>
            <div class="kanban-item-footer">
                <span class="${deadlineClass}">${leverdatum}</span>
                <span class="uren">${totaalUren.toFixed(1)}u</span>
            </div>
            <div class="kanban-item-status">
                <select class="status-select" onchange="updateOrderStatusFromPlanning('${order.ordernummer}', this.value)" onclick="event.stopPropagation()">
                    <option value="werkvoorbereiding" ${currentStatus === 'werkvoorbereiding' ? 'selected' : ''}>Werkvoorbereiding</option>
                    <option value="materiaal_besteld" ${currentStatus === 'materiaal_besteld' ? 'selected' : ''}>Materiaal Besteld</option>
                    <option value="materiaal_binnen" ${currentStatus === 'materiaal_binnen' ? 'selected' : ''}>Materiaal Binnen</option>
                    <option value="in_productie" ${currentStatus === 'in_productie' ? 'selected' : ''}>In Productie</option>
                    <option value="productie_gereed" ${currentStatus === 'productie_gereed' ? 'selected' : ''}>Productie Gereed</option>
                    <option value="project_gereed" ${currentStatus === 'project_gereed' ? 'selected' : ''}>Project Gereed</option>
                </select>
            </div>
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

// Parse boolean
function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() in ['true', '1', 'yes'];
    return false;
}

// Update order status vanuit planning
async function updateOrderStatusFromPlanning(ordernummer, newStatus) {
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
        
        if (response.ok) {
            loadPlanning(); // Herlaad planning
        } else {
            const errorData = await response.json().catch(() => ({ detail: 'Onbekende fout' }));
            alert('Fout bij updaten status: ' + (errorData.detail || `HTTP ${response.status}`));
        }
    } catch (error) {
        console.error('Fout bij updaten status:', error);
        alert('Fout bij updaten status: ' + error.message);
    }
}

// Display Table view
function displayTableView(planning) {
    const tbody = document.getElementById('planningTableBody');
    if (!tbody) return;
    
    // Combineer alle orders
    const allOrders = [
        ...(planning.werkvoorbereiding || []),
        ...(planning.materiaal_besteld || []),
        ...(planning.materiaal_binnen || []),
        ...(planning.in_productie || []),
        ...(planning.productie_gereed || []),
        ...(planning.project_gereed || [])
    ];
    
    if (allOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Geen orders gevonden</td></tr>';
        return;
    }
    
    tbody.innerHTML = allOrders.map(order => {
        const leverdatum = formatDate(order.leverdatum);
        const totaalUren = (order.uren_voorbereiding || 0) + (order.uren_samenstellen || 0) + (order.uren_aflassen || 0);
        
        return `
            <tr>
                <td><strong>${order.ordernummer}</strong></td>
                <td>${order.klant || '-'}</td>
                <td>${order.omschrijving || '-'}</td>
                <td>${leverdatum}</td>
                <td>${totaalUren.toFixed(1)} u</td>
                <td>${getOrderStatusText(order)}</td>
                <td><input type="checkbox" ${order.materiaal_besteld ? 'checked' : ''} onchange="updateStatus('${order.ordernummer}', 'materiaal_besteld', this.checked)"></td>
                <td><input type="checkbox" ${order.materiaal_binnen ? 'checked' : ''} onchange="updateStatus('${order.ordernummer}', 'materiaal_binnen', this.checked)"></td>
                <td><input type="checkbox" ${order.productie_gereed ? 'checked' : ''} onchange="updateStatus('${order.ordernummer}', 'productie_gereed', this.checked)"></td>
                <td><input type="checkbox" ${order.project_gereed ? 'checked' : ''} onchange="updateStatus('${order.ordernummer}', 'project_gereed', this.checked)"></td>
            </tr>
        `;
    }).join('');
}

// Update status checkbox
async function updateStatus(ordernummer, statusField, value) {
    try {
        const updateData = { [statusField]: value };
        
        const response = await fetch(`${API_BASE}/orders/${ordernummer}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            // Herlaad planning
            loadPlanning();
        } else {
            alert('Fout bij updaten status');
        }
    } catch (error) {
        console.error('Fout bij updaten status:', error);
        alert('Fout bij updaten status');
    }
}

// Helper functies
function formatDate(dateValue) {
    if (!dateValue) return '-';
    
    let date;
    if (typeof dateValue === 'string') {
        date = new Date(dateValue);
    } else {
        date = dateValue;
    }
    
    return date.toLocaleDateString('nl-NL');
}

function getDagenTotDeadline(leverdatum) {
    if (!leverdatum) return 999;
    
    let date;
    if (typeof leverdatum === 'string') {
        date = new Date(leverdatum);
    } else {
        date = leverdatum;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function getOrderStatusText(order) {
    if (order.project_gereed) return 'Project Gereed';
    if (order.productie_gereed) return 'Productie Gereed';
    if (order.materiaal_binnen) return 'In Productie';
    if (order.materiaal_besteld) return 'Materiaal Besteld';
    return 'Werkvoorbereiding';
}

