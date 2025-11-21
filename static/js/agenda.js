// JavaScript voor Agenda pagina

const API_BASE = '/api';

// Laad vrije dagen bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadVrijeDagen();
    loadMedewerkers();
});

// Laad vrije dagen
async function loadVrijeDagen() {
    try {
        const response = await fetch(`${API_BASE}/vrije-dagen`);
        const vrijeDagen = await response.json();
        displayVrijeDagen(vrijeDagen);
    } catch (error) {
        console.error('Fout bij laden vrije dagen:', error);
    }
}

// Laad medewerkers voor dropdown
async function loadMedewerkers() {
    try {
        const response = await fetch(`${API_BASE}/medewerkers`);
        const medewerkers = await response.json();
        const select = document.getElementById('vrijeDagMedewerker');
        
        // Voeg medewerkers toe aan dropdown
        medewerkers.forEach(m => {
            const option = document.createElement('option');
            option.value = m.naam;
            option.textContent = m.naam;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Fout bij laden medewerkers:', error);
    }
}

// Toon vrije dagen
function displayVrijeDagen(vrijeDagen) {
    const tbody = document.getElementById('agendaTableBody');
    if (!tbody) return;
    
    if (vrijeDagen.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Geen vrije dagen ingepland</td></tr>';
        return;
    }
    
    // Sorteer op datum
    vrijeDagen.sort((a, b) => new Date(a.datum) - new Date(b.datum));
    
    tbody.innerHTML = vrijeDagen.map(dag => {
        const datum = new Date(dag.datum);
        const dagNamen = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
        const dagNaam = dagNamen[datum.getDay()];
        const datumStr = datum.toLocaleDateString('nl-NL');
        
        return `
            <tr>
                <td>${datumStr}</td>
                <td>${dagNaam}</td>
                <td>${dag.omschrijving || '-'}</td>
                <td>${dag.medewerker || 'Alle medewerkers'}</td>
                <td>
                    <button class="btn btn-small btn-danger" onclick="deleteVrijeDag('${dag.datum}')">Verwijderen</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Toon formulier
function showAddVrijeDagForm() {
    document.getElementById('vrijeDagForm').style.display = 'block';
    document.getElementById('addVrijeDagForm').reset();
}

// Verberg formulier
function hideAddVrijeDagForm() {
    document.getElementById('vrijeDagForm').style.display = 'none';
}

// Voeg vrije dag toe
async function addVrijeDag(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const vrijeDagData = {
        datum: formData.get('datum'),
        omschrijving: formData.get('omschrijving') || null,
        medewerker: formData.get('medewerker') || null
    };
    
    try {
        const response = await fetch(`${API_BASE}/vrije-dagen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vrijeDagData)
        });
        
        if (response.ok) {
            alert('Vrije dag toegevoegd!');
            hideAddVrijeDagForm();
            loadVrijeDagen();
        } else {
            const error = await response.json();
            alert(`Fout: ${error.detail || 'Onbekende fout'}`);
        }
    } catch (error) {
        console.error('Fout bij toevoegen vrije dag:', error);
        alert('Fout bij toevoegen vrije dag');
    }
}

// Verwijder vrije dag
async function deleteVrijeDag(datum) {
    if (!confirm(`Weet je zeker dat je deze vrije dag wilt verwijderen?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/vrije-dagen/${datum}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Vrije dag verwijderd');
            loadVrijeDagen();
        } else {
            alert('Fout bij verwijderen vrije dag');
        }
    } catch (error) {
        console.error('Fout bij verwijderen vrije dag:', error);
        alert('Fout bij verwijderen vrije dag');
    }
}

