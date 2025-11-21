// JavaScript voor Medewerkers pagina

const API_BASE = '/api';

let currentMedewerker = null;

// Laad data bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadMedewerkers();
    setCurrentWeek();
});

// Stel huidige week in
function setCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    
    document.getElementById('weekSelect').value = week;
    document.getElementById('jaarSelect').value = now.getFullYear();
    loadWeekPlanning();
}

// Laad medewerkers
async function loadMedewerkers() {
    try {
        const response = await fetch(`${API_BASE}/medewerkers`);
        const medewerkers = await response.json();
        displayMedewerkers(medewerkers);
    } catch (error) {
        console.error('Fout bij laden medewerkers:', error);
    }
}

// Toon medewerkers
function displayMedewerkers(medewerkers) {
    const tbody = document.getElementById('medewerkersTableBody');
    if (!tbody) return;
    
    if (medewerkers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Geen medewerkers gevonden</td></tr>';
        return;
    }
    
    tbody.innerHTML = medewerkers.map(m => {
        const bewerkingen = [];
        if (m.kan_voorbereiden) bewerkingen.push('Voorbereiden');
        if (m.kan_samenstellen) bewerkingen.push('Samenstellen');
        if (m.kan_aflassen) bewerkingen.push('Aflassen');
        if (m.kan_montage) bewerkingen.push('Montage');
        const bewerkingenStr = bewerkingen.length > 0 ? bewerkingen.join(', ') : 'Geen';
        
        return `
            <tr>
                <td><strong>${m.naam}</strong></td>
                <td>${m.actief ? '✓ Actief' : '✗ Inactief'}</td>
                <td>${m.standaard_uren_per_week || 40} u/week</td>
                <td>${bewerkingenStr}</td>
                <td>
                    <button class="btn btn-small" onclick="editMedewerker('${m.naam}')">Bewerken</button>
                    <button class="btn btn-small btn-danger" onclick="deleteMedewerker('${m.naam}')">Verwijderen</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Laad week planning
async function loadWeekPlanning() {
    const week = document.getElementById('weekSelect').value;
    const jaar = document.getElementById('jaarSelect').value;
    
    if (!week || !jaar) {
        document.getElementById('weekPlanningContainer').innerHTML = '<p>Selecteer week en jaar</p>';
        return;
    }
    
    try {
        const [medewerkersResponse, planningResponse] = await Promise.all([
            fetch(`${API_BASE}/medewerkers`),
            fetch(`${API_BASE}/week-planning?week_nummer=${week}&jaar=${jaar}`)
        ]);
        
        const medewerkers = await medewerkersResponse.json();
        const planning = await planningResponse.json();
        
        displayWeekPlanning(medewerkers, planning, week, jaar);
    } catch (error) {
        console.error('Fout bij laden week planning:', error);
    }
}

// Toon week planning
function displayWeekPlanning(medewerkers, planning, week, jaar) {
    const container = document.getElementById('weekPlanningContainer');
    
    // Maak planning map
    const planningMap = {};
    planning.forEach(p => {
        const key = `${p.medewerker}_${p.week_nummer}_${p.jaar}`;
        planningMap[key] = p;
    });
    
    let html = `
        <h4>Week ${week} - ${jaar}</h4>
        <table class="table-container" style="margin-top: 15px;">
            <thead>
                <tr>
                    <th>Medewerker</th>
                    <th>Beschikbare Uren</th>
                    <th>Opmerkingen</th>
                    <th>Acties</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    medewerkers.filter(m => m.actief).forEach(medewerker => {
        const key = `${medewerker.naam}_${week}_${jaar}`;
        const weekPlan = planningMap[key];
        const uren = weekPlan ? weekPlan.beschikbare_uren : medewerker.standaard_uren_per_week || 40;
        const opmerkingen = weekPlan ? weekPlan.opmerkingen : '';
        
        html += `
            <tr>
                <td><strong>${medewerker.naam}</strong></td>
                <td>
                    <input type="number" 
                           id="uren_${medewerker.naam}" 
                           value="${uren}" 
                           step="0.5" 
                           min="0" 
                           style="width: 100px;">
                </td>
                <td>
                    <input type="text" 
                           id="opmerkingen_${medewerker.naam}" 
                           value="${opmerkingen || ''}" 
                           placeholder="Opmerkingen">
                </td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="saveWeekPlanning('${medewerker.naam}', ${week}, ${jaar})">Opslaan</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Sla week planning op
async function saveWeekPlanning(medewerker, week, jaar) {
    const uren = parseFloat(document.getElementById(`uren_${medewerker}`).value);
    const opmerkingen = document.getElementById(`opmerkingen_${medewerker}`).value || null;
    
    const weekPlanning = {
        week_nummer: parseInt(week),
        jaar: parseInt(jaar),
        medewerker: medewerker,
        beschikbare_uren: uren,
        opmerkingen: opmerkingen
    };
    
    try {
        const response = await fetch(`${API_BASE}/week-planning`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(weekPlanning)
        });
        
        if (response.ok) {
            alert('Week planning opgeslagen!');
            loadWeekPlanning();
        } else {
            alert('Fout bij opslaan week planning');
        }
    } catch (error) {
        console.error('Fout bij opslaan week planning:', error);
        alert('Fout bij opslaan week planning');
    }
}

// Toon medewerker formulier
function showAddMedewerkerForm() {
    currentMedewerker = null;
    document.getElementById('modalTitle').textContent = 'Medewerker Toevoegen';
    document.getElementById('medewerkerForm').reset();
    document.getElementById('medewerkerActief').checked = true;
        document.getElementById('medewerkerStandaardUren').value = 40;
        // Reset dagelijkse uren
        document.getElementById('uren_ma').value = 8;
        document.getElementById('uren_di').value = 8;
        document.getElementById('uren_wo').value = 8;
        document.getElementById('uren_do').value = 8;
        document.getElementById('uren_vr').value = 8;
        document.getElementById('uren_za').value = 0;
        document.getElementById('uren_zo').value = 0;
        updateWeeklyTotal();
        document.getElementById('kan_voorbereiden').checked = false;
        document.getElementById('kan_samenstellen').checked = false;
        document.getElementById('kan_aflassen').checked = false;
        document.getElementById('kan_montage').checked = false;
        document.getElementById('medewerkerModal').style.display = 'block';
}

// Bewerk medewerker
async function editMedewerker(naam) {
    try {
        const response = await fetch(`${API_BASE}/medewerkers`);
        const medewerkers = await response.json();
        const medewerker = medewerkers.find(m => m.naam === naam);
        
        if (!medewerker) {
            alert('Medewerker niet gevonden');
            return;
        }
        
        currentMedewerker = naam;
        document.getElementById('modalTitle').textContent = 'Medewerker Bewerken';
        document.getElementById('medewerkerNaam').value = medewerker.naam;
        document.getElementById('medewerkerNaam').disabled = true;
        document.getElementById('medewerkerActief').checked = medewerker.actief;
        document.getElementById('medewerkerStandaardUren').value = medewerker.standaard_uren_per_week || 40;
        // Laad dagelijkse uren
        document.getElementById('uren_ma').value = medewerker.standaard_uren_ma || 8;
        document.getElementById('uren_di').value = medewerker.standaard_uren_di || 8;
        document.getElementById('uren_wo').value = medewerker.standaard_uren_wo || 8;
        document.getElementById('uren_do').value = medewerker.standaard_uren_do || 8;
        document.getElementById('uren_vr').value = medewerker.standaard_uren_vr || 8;
        document.getElementById('uren_za').value = medewerker.standaard_uren_za || 0;
        document.getElementById('uren_zo').value = medewerker.standaard_uren_zo || 0;
        updateWeeklyTotal();
        document.getElementById('kan_voorbereiden').checked = medewerker.kan_voorbereiden || false;
        document.getElementById('kan_samenstellen').checked = medewerker.kan_samenstellen || false;
        document.getElementById('kan_aflassen').checked = medewerker.kan_aflassen || false;
        document.getElementById('kan_montage').checked = medewerker.kan_montage || false;
        document.getElementById('medewerkerModal').style.display = 'block';
    } catch (error) {
        console.error('Fout bij ophalen medewerker:', error);
        alert('Fout bij ophalen medewerker');
    }
}

// Sluit modal
function closeMedewerkerModal() {
    document.getElementById('medewerkerModal').style.display = 'none';
    currentMedewerker = null;
    document.getElementById('medewerkerNaam').disabled = false;
}

// Sla medewerker op
async function saveMedewerker(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const medewerkerData = {
        naam: formData.get('naam'),
        actief: formData.get('actief') === 'on',
        standaard_uren_per_week: parseFloat(formData.get('standaard_uren_per_week')) || 40,
        standaard_uren_ma: parseFloat(formData.get('standaard_uren_ma')) || 8,
        standaard_uren_di: parseFloat(formData.get('standaard_uren_di')) || 8,
        standaard_uren_wo: parseFloat(formData.get('standaard_uren_wo')) || 8,
        standaard_uren_do: parseFloat(formData.get('standaard_uren_do')) || 8,
        standaard_uren_vr: parseFloat(formData.get('standaard_uren_vr')) || 8,
        standaard_uren_za: parseFloat(formData.get('standaard_uren_za')) || 0,
        standaard_uren_zo: parseFloat(formData.get('standaard_uren_zo')) || 0,
        kan_voorbereiden: formData.get('kan_voorbereiden') === 'on',
        kan_samenstellen: formData.get('kan_samenstellen') === 'on',
        kan_aflassen: formData.get('kan_aflassen') === 'on',
        kan_montage: formData.get('kan_montage') === 'on'
    };
    
    try {
        let response;
        if (currentMedewerker) {
            // Update
            response = await fetch(`${API_BASE}/medewerkers/${currentMedewerker}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medewerkerData)
            });
        } else {
            // Create
            response = await fetch(`${API_BASE}/medewerkers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medewerkerData)
            });
        }
        
        if (response.ok) {
            alert('Medewerker opgeslagen!');
            closeMedewerkerModal();
            loadMedewerkers();
            loadWeekPlanning();
        } else {
            const error = await response.json();
            alert(`Fout: ${error.detail || 'Onbekende fout'}`);
        }
    } catch (error) {
        console.error('Fout bij opslaan medewerker:', error);
        alert('Fout bij opslaan medewerker');
    }
}

// Verwijder medewerker
async function deleteMedewerker(naam) {
    if (!confirm(`Weet je zeker dat je medewerker ${naam} wilt verwijderen?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/medewerkers/${naam}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Medewerker verwijderd');
            loadMedewerkers();
            loadWeekPlanning();
        } else {
            alert('Fout bij verwijderen medewerker');
        }
    } catch (error) {
        console.error('Fout bij verwijderen medewerker:', error);
        alert('Fout bij verwijderen medewerker');
    }
}

