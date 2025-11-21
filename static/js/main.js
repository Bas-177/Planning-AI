// Main JavaScript voor Planning Industrie AI

// API base URL
const API_BASE = '/api';

// Laad notificaties bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
});

// Zoek functionaliteit
async function searchOrders() {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        alert('Voer een zoekterm in');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Zoekfout:', error);
        alert('Fout bij zoeken');
    }
}

// Laad notificaties
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications`);
        const notifications = await response.json();
        displayNotifications(notifications);
    } catch (error) {
        console.error('Fout bij laden notificaties:', error);
    }
}

// Toon notificaties
function displayNotifications(notifications) {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = '<p>Geen meldingen</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification ${notif.prioriteit}">
            <strong>${notif.type.toUpperCase()}</strong>
            <p>${notif.bericht}</p>
            <small>Order: ${notif.ordernummer}</small>
        </div>
    `).join('');
}

// Toon zoekresultaten
function displaySearchResults(results) {
    // TODO: Implementeer resultaten weergave
    console.log('Zoekresultaten:', results);
    alert(`Gevonden: ${results.length} orders`);
}

// Enter toets voor zoeken
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchOrders();
            }
        });
    }
});

