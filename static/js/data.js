// JavaScript voor Data pagina - Standaard Doorlooptijden
const API_BASE = '/api';

// Laad standards bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadStandards();
});

// Toon nieuw standard formulier
function showNewStandardForm() {
    document.getElementById('newStandardForm').style.display = 'block';
    document.getElementById('standardForm').reset();
    document.getElementById('submitButton').textContent = 'Standaard Toevoegen';
}

// Verberg nieuw standard formulier
function hideNewStandardForm() {
    document.getElementById('newStandardForm').style.display = 'none';
}

// Laad alle standards
async function loadStandards() {
    try {
        const response = await fetch(`${API_BASE}/standards`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const standards = await response.json();
        displayStandards(standards);
    } catch (error) {
        console.error('Fout bij laden standards:', error);
        alert('Fout bij laden standaard doorlooptijden: ' + error.message);
    }
}

// Toon standards in tabel
function displayStandards(standards) {
    const tbody = document.getElementById('standardsTableBody');
    if (!tbody) return;
    
    if (!Array.isArray(standards) || standards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">Geen standaard doorlooptijden gevonden. Voeg er een toe om te beginnen.</td></tr>';
        return;
    }
    
    tbody.innerHTML = standards.map(standard => `
        <tr>
            <td><strong>${standard.nabehandeling || '-'}</strong></td>
            <td>${standard.standaard_doorlooptijd_dagen || 0} dagen</td>
            <td>${standard.klant || '<em>Algemeen</em>'}</td>
            <td>${standard.opmerkingen || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteStandard('${standard.nabehandeling}')">Verwijder</button>
            </td>
        </tr>
    `).join('');
}

// Maak nieuwe standard
async function createStandard(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    const standardData = {
        nabehandeling: formData.get('nabehandeling'),
        standaard_doorlooptijd_dagen: parseInt(formData.get('standaard_doorlooptijd_dagen')),
        klant: formData.get('klant') || null,
        opmerkingen: formData.get('opmerkingen') || null
    };
    
    try {
        const response = await fetch(`${API_BASE}/standards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(standardData)
        });
        
        if (response.ok) {
            alert('Standaard doorlooptijd succesvol toegevoegd!');
            hideNewStandardForm();
            loadStandards();
        } else {
            const error = await response.json();
            alert(`Fout: ${error.detail || 'Onbekende fout'}`);
        }
    } catch (error) {
        console.error('Fout bij opslaan standard:', error);
        alert('Fout bij opslaan standaard: ' + error.message);
    }
}

// Verwijder standard
async function deleteStandard(nabehandeling) {
    if (!confirm(`Weet je zeker dat je de standaard doorlooptijd voor "${nabehandeling}" wilt verwijderen?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/standards/${encodeURIComponent(nabehandeling)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Standaard doorlooptijd succesvol verwijderd!');
            loadStandards();
        } else {
            const error = await response.json();
            alert(`Fout: ${error.detail || 'Onbekende fout'}`);
        }
    } catch (error) {
        console.error('Fout bij verwijderen standard:', error);
        alert('Fout bij verwijderen standaard: ' + error.message);
    }
}

