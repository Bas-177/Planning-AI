// JavaScript voor Orders pagina

const API_BASE = '/api';

let assignments = [];
let medewerkers = [];

// Laad orders bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadMedewerkers();
    
    // Update totaal uren bij wijziging
    ['uren_voorbereiding', 'uren_samenstellen', 'uren_aflassen'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateTotaalUren);
        }
    });
    
    // Initialiseer uren overzicht
    updateUrenOverzicht();
    
    // Paste event listener voor hele pagina (Ctrl+V)
    document.addEventListener('paste', function(e) {
        const dragDropArea = document.getElementById('dragDropArea');
        // Check of drag drop area zichtbaar is en of gebruiker daar wil plakken
        if (dragDropArea && dragDropArea.offsetParent !== null) {
            // Focus eerst op drag drop area voor visuele feedback
            if (document.activeElement !== dragDropArea) {
                dragDropArea.focus();
            }
            handlePaste(e);
        }
    });
    
    // Focus event listeners voor drag drop area
    const dragDropArea = document.getElementById('dragDropArea');
    if (dragDropArea) {
        dragDropArea.addEventListener('focus', function() {
            if (!this.style.borderColor.includes('#2ecc71')) {
                this.style.borderColor = '#3498db';
                this.style.background = '#e8f4f8';
            }
        });
        dragDropArea.addEventListener('blur', function() {
            if (!this.style.borderColor.includes('#2ecc71')) {
                this.style.borderColor = '#ccc';
                this.style.background = '#f8f9fa';
            }
        });
    }
});

// Laad medewerkers
async function loadMedewerkers() {
    try {
        const response = await fetch(`${API_BASE}/medewerkers`);
        medewerkers = await response.json();
    } catch (error) {
        console.error('Fout bij laden medewerkers:', error);
    }
}

// Voeg toewijzing toe
function addAssignment() {
    assignments.push({
        medewerker: '',
        bewerking: '',
        uren: 0
    });
    renderAssignments();
}

// Verwijder toewijzing
function removeAssignment(index) {
    assignments.splice(index, 1);
    renderAssignments();
    updateUrenOverzicht();
}

// Render toewijzingen
function renderAssignments() {
    const container = document.getElementById('assignmentsContainer');
    if (!container) return;
    
    if (assignments.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">Geen toewijzingen toegevoegd</p>';
        updateUrenOverzicht();
        return;
    }
    
    container.innerHTML = assignments.map((assignment, index) => {
        const beschikbareMedewerkers = medewerkers.filter(m => m.actief).map(m => 
            `<option value="${m.naam}">${m.naam}</option>`
        ).join('');
        
        return `
            <div class="assignment-row" style="display: grid; grid-template-columns: 2fr 2fr 1fr auto; gap: 10px; margin-bottom: 10px; align-items: end;">
                <div class="form-group" style="margin: 0;">
                    <label>Medewerker</label>
                    <select class="assignment-medewerker" data-index="${index}" onchange="updateAssignment(${index}, 'medewerker', this.value)">
                        <option value="">-- Selecteer --</option>
                        ${beschikbareMedewerkers}
                    </select>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label>Bewerking</label>
                    <select class="assignment-bewerking" data-index="${index}" onchange="updateAssignment(${index}, 'bewerking', this.value)">
                        <option value="">-- Selecteer --</option>
                        <option value="voorbereiding">Voorbereiding</option>
                        <option value="samenstellen">Samenstellen</option>
                        <option value="aflassen">Aflassen</option>
                        <option value="montage">Montage</option>
                    </select>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label>Uren</label>
                    <input type="number" class="assignment-uren" data-index="${index}" step="0.5" min="0" value="${assignment.uren}" onchange="updateAssignment(${index}, 'uren', parseFloat(this.value))">
                </div>
                <button type="button" class="btn btn-small btn-danger" onclick="removeAssignment(${index})">Verwijder</button>
            </div>
        `;
    }).join('');
    
    // Herstel waarden
    assignments.forEach((assignment, index) => {
        const medewerkerSelect = container.querySelector(`.assignment-medewerker[data-index="${index}"]`);
        const bewerkingSelect = container.querySelector(`.assignment-bewerking[data-index="${index}"]`);
        const urenInput = container.querySelector(`.assignment-uren[data-index="${index}"]`);
        
        if (medewerkerSelect) medewerkerSelect.value = assignment.medewerker;
        if (bewerkingSelect) bewerkingSelect.value = assignment.bewerking;
        if (urenInput) urenInput.value = assignment.uren;
    });
    
    updateUrenOverzicht();
}

// Update toewijzing
function updateAssignment(index, field, value) {
    if (assignments[index]) {
        assignments[index][field] = value;
        updateUrenOverzicht();
    }
}

// Update uren overzicht
function updateUrenOverzicht() {
    const container = document.getElementById('urenBalkjes');
    if (!container) return;
    
    // Haal geplande uren op uit formulier
    const heeftMontage = document.getElementById('heeft_montage')?.checked || false;
    // Voor montage: gebruik een schatting of voeg later een veld toe voor montage uren
    // Voor nu: als montage is aangevinkt, toon het in het overzicht
    const geplandeUren = {
        voorbereiding: parseFloat(document.getElementById('uren_voorbereiding')?.value) || 0,
        samenstellen: parseFloat(document.getElementById('uren_samenstellen')?.value) || 0,
        aflassen: parseFloat(document.getElementById('uren_aflassen')?.value) || 0,
        montage: heeftMontage ? 999 : 0 // Placeholder - toon alleen als montage is aangevinkt
    };
    
    // Bereken verdeelde uren per bewerking
    const verdeeldeUren = {
        voorbereiding: 0,
        samenstellen: 0,
        aflassen: 0,
        montage: 0
    };
    
    assignments.forEach(assignment => {
        if (assignment.medewerker && assignment.bewerking && assignment.uren > 0) {
            const bewerking = assignment.bewerking.toLowerCase();
            if (verdeeldeUren.hasOwnProperty(bewerking)) {
                verdeeldeUren[bewerking] += parseFloat(assignment.uren) || 0;
            }
        }
    });
    
    // Toon balkjes
    const bewerkingen = [
        { key: 'voorbereiding', label: 'Voorbereiding', color: '#e74c3c' },
        { key: 'samenstellen', label: 'Samenstellen', color: '#3498db' },
        { key: 'aflassen', label: 'Aflassen', color: '#2ecc71' },
        { key: 'montage', label: 'Montage', color: '#f39c12' }
    ];
    
    container.innerHTML = bewerkingen.map(bew => {
        const gepland = geplandeUren[bew.key];
        const verdeeld = verdeeldeUren[bew.key];
        
        // Voor montage: toon alleen als er toewijzingen zijn of als montage is aangevinkt
        if (bew.key === 'montage') {
            if (verdeeld === 0 && !heeftMontage) return '';
            // Als montage is aangevinkt maar geen uren gepland, toon alleen verdeelde uren
            if (gepland === 999 && verdeeld > 0) {
                return `
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-weight: bold;">${bew.label}</span>
                            <span style="color: #666; font-size: 0.9rem;">
                                ${verdeeld.toFixed(1)}u verdeeld
                            </span>
                        </div>
                        <div style="background: #e0e0e0; border-radius: 4px; height: 25px; position: relative; overflow: hidden;">
                            <div style="background: ${bew.color}; height: 100%; width: ${Math.min(100, (verdeeld / 10) * 100)}%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.85rem; font-weight: bold;">
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        if (gepland === 0 && verdeeld === 0) return ''; // Verberg als geen uren
        
        const percentage = gepland > 0 && gepland !== 999 ? Math.min(100, (verdeeld / gepland) * 100) : 0;
        const showPercentage = gepland !== 999; // Geen percentage voor montage placeholder
        
        return `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: bold;">${bew.label}</span>
                    <span style="color: #666; font-size: 0.9rem;">
                        ${verdeeld.toFixed(1)}u${showPercentage ? ` / ${gepland.toFixed(1)}u` : ''}
                        ${showPercentage && verdeeld > gepland ? ' <span style="color: #e74c3c;">(over)</span>' : ''}
                        ${showPercentage && verdeeld === gepland && gepland > 0 ? ' <span style="color: #2ecc71;">✓</span>' : ''}
                    </span>
                </div>
                <div style="background: #e0e0e0; border-radius: 4px; height: 25px; position: relative; overflow: hidden;">
                    <div style="background: ${bew.color}; height: 100%; width: ${percentage}%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.85rem; font-weight: bold;">
                        ${percentage > 20 ? percentage.toFixed(0) + '%' : ''}
                    </div>
                    ${showPercentage && verdeeld > gepland ? `
                        <div style="position: absolute; right: 0; top: 0; background: rgba(231, 76, 60, 0.3); height: 100%; width: ${Math.min(100, ((verdeeld - gepland) / gepland) * 100)}%;"></div>
                    ` : ''}
                </div>
            </div>
        `;
    }).filter(html => html !== '').join('');
}

// Toon nieuw order formulier
function showNewOrderForm() {
    document.getElementById('newOrderForm').style.display = 'block';
    const formTitle = document.getElementById('orderForm').querySelector('h3');
    if (formTitle) formTitle.textContent = 'Nieuw Project Aanmaken';
    
    const submitButton = document.getElementById('submitButton');
    if (submitButton) submitButton.textContent = 'Project Aanmaken';
    
    document.getElementById('orderForm').reset();
    document.getElementById('ordernummer').disabled = false;
    assignments = [];
    renderAssignments();
    updateTotaalUren();
    document.getElementById('ordernummer').focus();
}

// Verberg nieuw order formulier
function hideNewOrderForm() {
    document.getElementById('newOrderForm').style.display = 'none';
}

// Update totaal uren
function updateTotaalUren() {
    const voorbereiding = parseFloat(document.getElementById('uren_voorbereiding').value) || 0;
    const samenstellen = parseFloat(document.getElementById('uren_samenstellen').value) || 0;
    const aflassen = parseFloat(document.getElementById('uren_aflassen').value) || 0;
    const totaalProductie = samenstellen + aflassen;
    const totaal = voorbereiding + samenstellen + aflassen;
    
    if (document.getElementById('totaalProductieUren')) {
        document.getElementById('totaalProductieUren').textContent = totaalProductie.toFixed(1);
    }
    if (document.getElementById('totaalUren')) {
        document.getElementById('totaalUren').textContent = totaal.toFixed(1);
    }
    
    // Update ook uren overzicht
    updateUrenOverzicht();
}

// Laad alle orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const orders = await response.json();
        if (!Array.isArray(orders)) {
            console.error('Orders is geen array:', orders);
            displayOrders([]);
            return;
        }
        console.log(`Geladen: ${orders.length} orders`);
        displayOrders(orders);
    } catch (error) {
        console.error('Fout bij laden orders:', error);
        alert('Fout bij laden orders: ' + error.message);
        displayOrders([]); // Toon lege tabel bij fout
    }
}

// Toon orders in tabel
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Geen orders gevonden</td></tr>';
        return;
    }
    
    // Filter orders zonder ordernummer
    const validOrders = orders.filter(order => order && order.ordernummer && order.ordernummer !== 'null' && order.ordernummer !== 'undefined');
    
    if (validOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Geen geldige orders gevonden</td></tr>';
        return;
    }
    
    tbody.innerHTML = validOrders.map((order, index) => {
        // Valideer ordernummer
        if (!order.ordernummer || order.ordernummer === 'null' || order.ordernummer === 'undefined') {
            console.error('Order zonder geldig ordernummer:', order);
            return '';
        }
        
        const ordernummer = String(order.ordernummer);
        const leverdatum = formatDate(order.leverdatum);
        const conserveringsdatum = formatDate(order.conserveringsdatum);
        const totaalUren = (order.uren_voorbereiding || 0) + (order.uren_samenstellen || 0) + (order.uren_aflassen || 0);
        const status = getOrderStatus(order);
        const orderId = `order-${index}-${ordernummer}`;
        
        // Bewerkingen
        const bewerkingen = [];
        if (order.uren_voorbereiding > 0) {
            const voorbereidingTypes = Array.isArray(order.voorbereiding_types) ? order.voorbereiding_types : [];
            bewerkingen.push(`Voorbereiding: ${order.uren_voorbereiding}u${voorbereidingTypes.length > 0 ? ` (${voorbereidingTypes.join(', ')})` : ''}`);
        }
        if (order.uren_samenstellen > 0) bewerkingen.push(`Samenstellen: ${order.uren_samenstellen}u`);
        if (order.uren_aflassen > 0) bewerkingen.push(`Aflassen: ${order.uren_aflassen}u`);
        if (parseBoolean(order.heeft_montage)) {
            const montageType = order.montage_type ? ` (${order.montage_type})` : '';
            bewerkingen.push(`Montage${montageType}`);
        }
        
        // Conserveringen
        const conserveringen = Array.isArray(order.conserveringen) ? order.conserveringen : [];
        const conserveringText = conserveringen.length > 0 ? conserveringen.join(', ') : 'Geen';
        
        return `
            <tr class="order-row" data-order-id="${orderId}">
                <td>
                    <button class="expand-btn" onclick="toggleOrderDetails('${orderId}')" aria-label="Uitklappen">
                        <span class="expand-icon">▶</span>
                    </button>
                    <strong>${ordernummer}</strong>
                </td>
                <td>${order.klant || '-'}</td>
                <td>${order.omschrijving || '-'}</td>
                <td>${leverdatum}</td>
                <td>${totaalUren.toFixed(1)} u</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatusFromOrders('${ordernummer}', this.value)">
                        <option value="werkvoorbereiding" ${status === 'werkvoorbereiding' ? 'selected' : ''}>Werkvoorbereiding</option>
                        <option value="materiaal_besteld" ${status === 'materiaal_besteld' ? 'selected' : ''}>Materiaal Besteld</option>
                        <option value="materiaal_binnen" ${status === 'materiaal_binnen' ? 'selected' : ''}>Materiaal Binnen</option>
                        <option value="in_productie" ${status === 'in_productie' ? 'selected' : ''}>In Productie</option>
                        <option value="productie_gereed" ${status === 'productie_gereed' ? 'selected' : ''}>Productie Gereed</option>
                        <option value="project_gereed" ${status === 'project_gereed' ? 'selected' : ''}>Project Gereed</option>
                    </select>
                </td>
                    <td>
                        <button class="btn btn-small" onclick="editOrder('${ordernummer}')">Bewerken</button>
                        <button class="btn btn-small" onclick="copyOrder('${ordernummer}')" style="background: #3498db; margin-left: 5px;">Kopiëren</button>
                        <button class="btn btn-small btn-danger" onclick="deleteOrder('${ordernummer}')">Verwijderen</button>
                    </td>
            </tr>
            <tr class="order-details" id="${orderId}-details" style="display: none;">
                <td colspan="7">
                    <div class="order-details-content">
                        <div class="details-grid">
                            <div class="detail-item">
                                <strong>Bewerkingen:</strong>
                                <div>${bewerkingen.length > 0 ? bewerkingen.join('<br>') : 'Geen bewerkingen'}</div>
                            </div>
                            <div class="detail-item">
                                <strong>Conservering:</strong>
                                <div>${conserveringText}</div>
                                ${conserveringsdatum !== '-' ? `<div><small>Datum: ${conserveringsdatum}</small></div>` : ''}
                            </div>
                            <div class="detail-item">
                                <strong>Montage:</strong>
                                <div>${parseBoolean(order.heeft_montage) ? `Ja${order.montage_type ? ` (${order.montage_type})` : ''}` : 'Nee'}</div>
                                ${order.montage_opmerkingen ? `<div><small>${order.montage_opmerkingen}</small></div>` : ''}
                            </div>
                            <div class="detail-item">
                                <strong>Leverdatum:</strong>
                                <div>${leverdatum}</div>
                            </div>
                            <div class="detail-item">
                                <strong>Totaal Uren:</strong>
                                <div>${totaalUren.toFixed(1)} uur</div>
                                <div class="uren-breakdown">
                                    ${order.uren_voorbereiding > 0 ? `Voorbereiding: ${order.uren_voorbereiding}u<br>` : ''}
                                    ${order.uren_samenstellen > 0 ? `Samenstellen: ${order.uren_samenstellen}u<br>` : ''}
                                    ${order.uren_aflassen > 0 ? `Aflassen: ${order.uren_aflassen}u` : ''}
                                </div>
                            </div>
                            ${order.opmerkingen ? `
                            <div class="detail-item full-width">
                                <strong>Opmerkingen:</strong>
                                <div>${order.opmerkingen}</div>
                            </div>
                            ` : ''}
                            ${order.uitlevering_opmerkingen ? `
                            <div class="detail-item full-width">
                                <strong>Uitlevering Opmerkingen:</strong>
                                <div>${order.uitlevering_opmerkingen}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).filter(html => html !== '').join('');
}

// Toggle order details
function toggleOrderDetails(orderId) {
    const detailsRow = document.getElementById(`${orderId}-details`);
    const expandBtn = document.querySelector(`[data-order-id="${orderId}"] .expand-icon`);
    
    if (detailsRow) {
        const isVisible = detailsRow.style.display !== 'none';
        detailsRow.style.display = isVisible ? 'none' : 'table-row';
        
        if (expandBtn) {
            expandBtn.textContent = isVisible ? '▶' : '▼';
            expandBtn.parentElement.classList.toggle('expanded', !isVisible);
        }
    }
}


// Maak nieuwe order aan of update bestaande
async function createOrder(event) {
    event.preventDefault();
    
    // Haal ordernummer direct uit het DOM element (werkt ook als disabled)
    const ordernummerField = document.getElementById('ordernummer');
    if (!ordernummerField) {
        alert('Ordernummer veld niet gevonden');
        return;
    }
    
    const ordernummer = ordernummerField.value;
    const isEdit = ordernummerField.disabled;
    
    // Valideer ordernummer
    if (!ordernummer || ordernummer.trim() === '') {
        alert('Ordernummer is verplicht');
        return;
    }
    
    const formData = new FormData(event.target);
    
    // Verzamel alle geselecteerde conserveringen
    const conserveringen = [];
    const conserveringCheckboxes = document.querySelectorAll('input[name="conservering"]:checked');
    conserveringCheckboxes.forEach(cb => conserveringen.push(cb.value));
    
    // Verzamel alle geselecteerde voorbereiding types
    const voorbereidingTypes = [];
    const voorbereidingCheckboxes = document.querySelectorAll('input[name="voorbereiding_type"]:checked');
    voorbereidingCheckboxes.forEach(cb => voorbereidingTypes.push(cb.value));
    
    // Verzamel alle bestelde materialen
    const besteldeMaterialen = [];
    const materiaalCheckboxes = document.querySelectorAll('input[name="besteld_materiaal"]:checked');
    materiaalCheckboxes.forEach(cb => besteldeMaterialen.push(cb.value));
    
    const orderData = {
        ordernummer: ordernummer,
        klant: formData.get('klant'),
        omschrijving: formData.get('omschrijving'),
        klantreferentie: formData.get('klantreferentie') || null,
        leverdatum: formData.get('leverdatum'),
        opmerkingen: formData.get('opmerkingen') || null,
        // Voorbereiding
        uren_voorbereiding: parseFloat(formData.get('uren_voorbereiding')) || 0,
        voorbereiding_types: voorbereidingTypes,
        voorbereiding_parallel_toegestaan: document.getElementById('voorbereiding_parallel_toegestaan')?.checked || false,
        // Productie
        uren_samenstellen: parseFloat(formData.get('uren_samenstellen')) || 0,
        uren_aflassen: parseFloat(formData.get('uren_aflassen')) || 0,
        // Conservering
        conserveringen: conserveringen,
        conserveringsdatum: formData.get('conserveringsdatum') || null,
        conservering_doorlooptijd: formData.get('conservering_doorlooptijd') ? parseInt(formData.get('conservering_doorlooptijd')) : null,
        // Montage
        heeft_montage: formData.get('heeft_montage') === 'on',
        montage_type: formData.get('montage_type') || null,
        montage_opmerkingen: formData.get('montage_opmerkingen') || null,
        uitlevering_opmerkingen: formData.get('uitlevering_opmerkingen') || null,
        // Status
        materiaal_besteld: formData.get('materiaal_besteld') === 'on',
        materiaal_binnen: formData.get('materiaal_binnen') === 'on',
        productie_gereed: formData.get('productie_gereed') === 'on',
        project_gereed: formData.get('project_gereed') === 'on',
        // Bestelde materialen
        bestelde_materialen: besteldeMaterialen,
        materiaal_opmerkingen: formData.get('materiaal_opmerkingen') || null,
        uiterste_leverdatum_materiaal: formData.get('uiterste_leverdatum_materiaal') || null
    };
    
    try {
        let response;
        if (isEdit) {
            // Update bestaande order
            const encodedOrdernummer = encodeURIComponent(String(ordernummer));
            response = await fetch(`${API_BASE}/orders/${encodedOrdernummer}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
        } else {
            // Maak nieuwe order
            response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
        }
        
        if (response.ok) {
            // Update toewijzingen
            // Verwijder oude toewijzingen eerst (bij edit)
            if (isEdit) {
                try {
                    const encodedOrdernummer = encodeURIComponent(String(ordernummer));
                    const oldAssignments = await fetch(`${API_BASE}/order-assignments?ordernummer=${encodedOrdernummer}`);
                    if (oldAssignments.ok) {
                        const old = await oldAssignments.json();
                        for (const oldAss of old) {
                            const encodedMedewerker = encodeURIComponent(String(oldAss.medewerker));
                            const encodedBewerking = encodeURIComponent(String(oldAss.bewerking));
                            await fetch(`${API_BASE}/order-assignments/${encodedOrdernummer}/${encodedMedewerker}/${encodedBewerking}`, {
                                method: 'DELETE'
                            });
                        }
                    }
                } catch (err) {
                    console.error('Fout bij verwijderen oude toewijzingen:', err);
                }
            }
            
            // Voeg nieuwe toewijzingen toe
            for (const assignment of assignments) {
                if (assignment.medewerker && assignment.bewerking && assignment.uren > 0) {
                    try {
                        // Bepaal week en jaar op basis van leverdatum
                        const leverdatum = new Date(orderData.leverdatum);
                        const week = getWeekNumber(leverdatum);
                        const jaar = leverdatum.getFullYear();
                        
                        await fetch(`${API_BASE}/order-assignments`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                ordernummer: ordernummer,
                                medewerker: assignment.medewerker,
                                bewerking: assignment.bewerking,
                                uren: assignment.uren,
                                week_nummer: week,
                                jaar: jaar
                            })
                        });
                    } catch (err) {
                        console.error('Fout bij toevoegen toewijzing:', err);
                    }
                }
            }
            
            alert(isEdit ? 'Order succesvol bijgewerkt!' : 'Order succesvol aangemaakt!');
            hideNewOrderForm();
            loadOrders();
        } else {
            // Probeer error als JSON te parsen, maar vang HTML error pages op
            let errorMessage = 'Onbekende fout';
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || 'Onbekende fout';
                } else {
                    // Als het geen JSON is, lees als tekst voor debugging
                    const errorText = await response.text();
                    console.error('Server error response (niet JSON):', errorText.substring(0, 200));
                    errorMessage = `Server fout (${response.status}): ${errorText.substring(0, 100)}`;
                }
            } catch (parseError) {
                console.error('Fout bij parsen error response:', parseError);
                errorMessage = `Server fout (${response.status}): ${response.statusText}`;
            }
            alert(`Fout: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Fout bij opslaan order:', error);
        // Als het een network error is, check of order misschien wel is opgeslagen
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            // Probeer orders te herladen om te zien of het wel gelukt is
            setTimeout(() => {
                loadOrders();
            }, 500);
            alert('Mogelijk netwerkfout. Controleer of de order is opgeslagen. Als de order wel is opgeslagen, wordt deze automatisch getoond.');
        } else {
            alert('Fout bij opslaan order: ' + error.message);
        }
    }
}

// Bewerk order
async function editOrder(ordernummer) {
    // Valideer ordernummer
    if (!ordernummer || ordernummer === 'null' || ordernummer === 'undefined') {
        console.error('Ongeldig ordernummer:', ordernummer);
        alert('Fout: Ordernummer ontbreekt');
        return;
    }
    
    try {
        const encodedOrdernummer = encodeURIComponent(String(ordernummer));
        const response = await fetch(`${API_BASE}/orders/${encodedOrdernummer}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Order niet gevonden' }));
            throw new Error(errorData.detail || 'Order niet gevonden');
        }
        
        const order = await response.json();
        
        // Valideer dat order een ordernummer heeft
        if (!order.ordernummer) {
            console.error('Order zonder ordernummer ontvangen:', order);
            alert('Fout: Order zonder ordernummer ontvangen');
            return;
        }
        
        // Toon formulier met bestaande data
        showEditOrderForm(order);
    } catch (error) {
        console.error('Fout bij ophalen order:', error);
        alert('Fout bij ophalen order: ' + error.message);
    }
}

// Kopieer order
async function copyOrder(ordernummer) {
    try {
        const encodedOrdernummer = encodeURIComponent(String(ordernummer));
        const response = await fetch(`${API_BASE}/orders/${encodedOrdernummer}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Order niet gevonden' }));
            throw new Error(errorData.detail || 'Order niet gevonden');
        }
        
        const order = await response.json();
        
        // Genereer nieuw ordernummer (voeg "-kopie" toe of verhoog nummer)
        let newOrdernummer = order.ordernummer;
        if (newOrdernummer.match(/^\w+-\d+$/)) {
            // Format: PREFIX-NUMMER (bijv. P25-0061)
            const parts = newOrdernummer.split('-');
            const prefix = parts[0];
            const nummer = parts[1];
            const newNummer = String(parseInt(nummer) + 1).padStart(nummer.length, '0');
            newOrdernummer = `${prefix}-${newNummer}`;
        } else {
            // Voeg "-kopie" toe
            newOrdernummer = `${newOrdernummer}-kopie`;
        }
        
        // Reset specifieke velden
        order.ordernummer = newOrdernummer;
        order.materiaal_besteld = false;
        order.materiaal_binnen = false;
        order.productie_gereed = false;
        order.project_gereed = false;
        delete order.datum_aangemaakt;
        delete order.laatste_update;
        
        // Toon formulier met gekopieerde data
        showNewOrderForm();
        showEditOrderForm(order);
        
        // Focus op ordernummer zodat gebruiker het kan aanpassen
        document.getElementById('ordernummer').disabled = false;
        document.getElementById('ordernummer').focus();
        document.getElementById('ordernummer').select();
    } catch (error) {
        console.error('Fout bij kopiëren order:', error);
        alert('Fout bij kopiëren order: ' + error.message);
    }
}

// Toon edit formulier
function showEditOrderForm(order) {
    // Vul formulier met bestaande data
    document.getElementById('newOrderForm').style.display = 'block';
    const formTitle = document.getElementById('orderForm').querySelector('h3');
    if (formTitle) formTitle.textContent = 'Order Bewerken';
    
    const submitButton = document.getElementById('submitButton');
    if (submitButton) submitButton.textContent = 'Order Bijwerken';
    
    // Vul alle velden
    document.getElementById('ordernummer').value = order.ordernummer;
    document.getElementById('ordernummer').disabled = true; // Ordernummer kan niet gewijzigd worden
    document.getElementById('klant').value = order.klant || '';
    document.getElementById('omschrijving').value = order.omschrijving || '';
    document.getElementById('klantreferentie').value = order.klantreferentie || '';
    document.getElementById('leverdatum').value = order.leverdatum || '';
    document.getElementById('opmerkingen').value = order.opmerkingen || '';
    
    // Voorbereiding
    document.getElementById('uren_voorbereiding').value = order.uren_voorbereiding || 0;
    const voorbereidingParallelCheckbox = document.getElementById('voorbereiding_parallel_toegestaan');
    if (voorbereidingParallelCheckbox) {
        voorbereidingParallelCheckbox.checked = order.voorbereiding_parallel_toegestaan || false;
    }
    if (order.voorbereiding_types && Array.isArray(order.voorbereiding_types)) {
        order.voorbereiding_types.forEach(type => {
            const checkbox = document.querySelector(`input[name="voorbereiding_type"][value="${type}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Productie
    document.getElementById('uren_samenstellen').value = order.uren_samenstellen || 0;
    document.getElementById('uren_aflassen').value = order.uren_aflassen || 0;
    
    // Conservering
    if (order.conserveringen && Array.isArray(order.conserveringen)) {
        order.conserveringen.forEach(cons => {
            const checkbox = document.querySelector(`input[name="conservering"][value="${cons}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    if (order.conserveringsdatum) {
        document.getElementById('conserveringsdatum').value = order.conserveringsdatum;
    }
    
    // Montage
    document.getElementById('heeft_montage').checked = order.heeft_montage || false;
    toggleMontageType();
    if (order.montage_type) {
        document.getElementById('montage_type').value = order.montage_type;
    }
    document.getElementById('montage_opmerkingen').value = order.montage_opmerkingen || '';
    document.getElementById('uitlevering_opmerkingen').value = order.uitlevering_opmerkingen || '';
    
    // Bestelde materialen
    if (order.bestelde_materialen && Array.isArray(order.bestelde_materialen)) {
        order.bestelde_materialen.forEach(materiaal => {
            const checkbox = document.querySelector(`input[name="besteld_materiaal"][value="${materiaal}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Materiaal velden
    if (order.uiterste_leverdatum_materiaal) {
        document.getElementById('uiterste_leverdatum_materiaal').value = order.uiterste_leverdatum_materiaal;
    }
    if (order.materiaal_opmerkingen) {
        document.getElementById('materiaal_opmerkingen').value = order.materiaal_opmerkingen;
    }
    
    // Status
    document.getElementById('materiaal_besteld').checked = order.materiaal_besteld || false;
    document.getElementById('materiaal_binnen').checked = order.materiaal_binnen || false;
    document.getElementById('productie_gereed').checked = order.productie_gereed || false;
    document.getElementById('project_gereed').checked = order.project_gereed || false;
    
    // Laad toewijzingen
    loadOrderAssignments(order.ordernummer);
    
    updateTotaalUren();
    
    // Scroll naar formulier
    document.getElementById('newOrderForm').scrollIntoView({ behavior: 'smooth' });
}

// Laad toewijzingen voor order
async function loadOrderAssignments(ordernummer) {
    try {
        const response = await fetch(`${API_BASE}/order-assignments?ordernummer=${ordernummer}`);
        if (response.ok) {
            const existingAssignments = await response.json();
            assignments = existingAssignments.map(a => ({
                medewerker: a.medewerker,
                bewerking: a.bewerking,
                uren: a.uren
            }));
            renderAssignments();
        }
    } catch (error) {
        console.error('Fout bij laden toewijzingen:', error);
    }
}

// Verwijder order
async function deleteOrder(ordernummer) {
    // Valideer ordernummer
    if (!ordernummer || ordernummer === 'null' || ordernummer === 'undefined') {
        console.error('Ongeldig ordernummer:', ordernummer);
        alert('Fout: Ordernummer ontbreekt');
        return;
    }
    
    if (!confirm(`Weet je zeker dat je order ${ordernummer} wilt verwijderen?`)) {
        return;
    }
    
    try {
        const encodedOrdernummer = encodeURIComponent(String(ordernummer));
        const response = await fetch(`${API_BASE}/orders/${encodedOrdernummer}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Order verwijderd');
            loadOrders();
        } else {
            const errorData = await response.json().catch(() => ({ detail: 'Onbekende fout' }));
            alert('Fout bij verwijderen order: ' + (errorData.detail || `HTTP ${response.status}`));
        }
    } catch (error) {
        console.error('Fout bij verwijderen order:', error);
        alert('Fout bij verwijderen order: ' + error.message);
    }
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    // TODO: Implementeer client-side filtering of server-side
    loadOrders();
}

// Format datum
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

// Bepaal week nummer
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
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

// Update order status vanuit orders pagina
async function updateOrderStatusFromOrders(ordernummer, newStatus) {
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
            loadOrders(); // Herlaad orders
        } else {
            const errorData = await response.json().catch(() => ({ detail: 'Onbekende fout' }));
            alert('Fout bij updaten status: ' + (errorData.detail || `HTTP ${response.status}`));
        }
    } catch (error) {
        console.error('Fout bij updaten status:', error);
        alert('Fout bij updaten status: ' + error.message);
    }
}

// Drag & Drop functies voor Screenshot OCR
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.style.borderColor = '#3498db';
    event.currentTarget.style.background = '#e8f4f8';
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.style.borderColor = '#ccc';
    event.currentTarget.style.background = '#f8f9fa';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.style.borderColor = '#ccc';
    event.currentTarget.style.background = '#f8f9fa';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processImageFile(files[0]);
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processImageFile(files[0]);
    }
}

// Paste functie voor screenshots
function handlePaste(event) {
    const dragDropArea = document.getElementById('dragDropArea');
    
    // Check of drag drop area bestaat en zichtbaar is
    if (!dragDropArea || dragDropArea.offsetParent === null) {
        return; // Niet zichtbaar, laat normale paste gebeuren
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const items = event.clipboardData?.items || [];
    
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
                // Update visual feedback
                dragDropArea.style.borderColor = '#3498db';
                dragDropArea.style.background = '#e8f4f8';
                
                // Verwerk het bestand
                processImageFile(file);
                return;
            }
        }
    }
    
    // Als geen afbeelding gevonden, toon korte feedback
    if (dragDropArea && !dragDropArea.innerHTML.includes('✓')) {
        const originalBorder = dragDropArea.style.borderColor;
        const originalBg = dragDropArea.style.background;
        dragDropArea.style.borderColor = '#e74c3c';
        dragDropArea.style.background = '#fee';
        setTimeout(() => {
            if (!dragDropArea.innerHTML.includes('✓')) {
                dragDropArea.style.borderColor = originalBorder || '#ccc';
                dragDropArea.style.background = originalBg || '#f8f9fa';
            }
        }, 1000);
    }
}

async function processImageFile(file) {
    // Ondersteun afbeeldingen, PDF en Word bestanden
    const allowedTypes = [
        'image/', 
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Check file type en extension
    const isAllowedType = allowedTypes.some(type => file.type && file.type.startsWith(type));
    const isAllowedExtension = file.name && file.name.match(/\.(jpg|jpeg|png|gif|bmp|pdf|doc|docx)$/i);
    
    if (!isAllowedType && !isAllowedExtension) {
        alert('Alleen afbeeldingen (JPG, PNG, GIF), PDF of Word bestanden (DOC, DOCX) zijn toegestaan.\n\nGeselecteerd bestand: ' + file.name + '\nType: ' + (file.type || 'onbekend'));
        return;
    }
    
    const dragDropArea = document.getElementById('dragDropArea');
    const fileTypeDisplay = file.name.match(/\.(docx|doc)$/i) ? 'Word document' : 
                            file.name.match(/\.pdf$/i) ? 'PDF' : 
                            'bestand';
    dragDropArea.innerHTML = `<p style="margin: 0; color: #3498db;">Verwerken ${fileTypeDisplay}...</p>`;
    
    try {
        // Maak FormData voor upload
        const formData = new FormData();
        // Gebruik 'file' als parameter naam (niet 'image') voor alle bestandstypen
        formData.append('file', file);
        
        // Upload naar server voor OCR processing
        const response = await fetch(`${API_BASE}/ocr/screenshot`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('=== OCR RESULTAAT ===');
            console.log('Projectnummer:', result.projectnummer);
            console.log('Klant:', result.klant);
            console.log('Omschrijving:', result.omschrijving);
            console.log('Leverdatum:', result.leverdatum);
            console.log('Message:', result.message);
            console.log('Volledige result:', result);
            console.log('====================');
            displayOCRResults(result);
        } else {
            const errorData = await response.json().catch(() => ({ detail: 'Onbekende fout' }));
            console.error('=== OCR FOUT ===');
            console.error('Status:', response.status);
            console.error('Error data:', errorData);
            console.error('================');
            throw new Error(errorData.detail || 'OCR verwerking mislukt');
        }
    } catch (error) {
        console.error('Fout bij OCR verwerking:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Fout bij verwerken screenshot: ' + error.message);
        dragDropArea.innerHTML = `
            <p style="margin: 0; color: #e74c3c;">✗ Fout bij verwerken screenshot</p>
            <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #999;">Probeer opnieuw</p>
        `;
        dragDropArea.style.borderColor = '#e74c3c';
        dragDropArea.style.background = '#fee';
    }
}

function displayOCRResults(result) {
    const dragDropArea = document.getElementById('dragDropArea');
    const ocrResults = document.getElementById('ocrResults');
    const ocrFields = document.getElementById('ocrFields');
    
    // Reset drag & drop area - detecteer bestandstype
    const fileType = result.message?.includes('Word') || result.message?.includes('word') ? 'Word document' : 
                     result.message?.includes('PDF') || result.message?.includes('pdf') ? 'PDF' : 
                     'Bestand';
    dragDropArea.innerHTML = `
        <p style="margin: 0; color: #2ecc71;">✓ ${fileType} verwerkt</p>
        <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #999;">Nog een bestand? Sleep, plak (Ctrl+V) of klik om te selecteren</p>
        <input type="file" id="screenshotInput" accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display: none;" onchange="handleFileSelect(event)">
    `;
    dragDropArea.style.borderColor = '#2ecc71';
    dragDropArea.style.background = '#f0fff0';
    
    // Herstel event handlers voor paste
    dragDropArea.addEventListener('paste', handlePaste);
    dragDropArea.addEventListener('click', () => document.getElementById('screenshotInput').click());
    
    ocrResults.style.display = 'block';
    
    let html = '<div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px;">';
    let fieldsFilled = 0;
    
    // Vul formulier velden met uitgelezen data - AUTOMATISCH invullen
    if (result.projectnummer) {
        const ordernummerField = document.getElementById('ordernummer');
        if (ordernummerField && !ordernummerField.disabled) {
            // Vul altijd in, overschrijf bestaande waarde
            ordernummerField.value = result.projectnummer;
            ordernummerField.dispatchEvent(new Event('input', { bubbles: true })); // Trigger event
            html += `<p style="margin: 5px 0; color: #2ecc71;">✓ Project: <strong>${result.projectnummer}</strong></p>`;
            fieldsFilled++;
        }
    }
    
    if (result.omschrijving) {
        const omschrijvingField = document.getElementById('omschrijving');
        if (omschrijvingField) {
            omschrijvingField.value = result.omschrijving;
            omschrijvingField.dispatchEvent(new Event('input', { bubbles: true }));
            html += `<p style="margin: 5px 0; color: #2ecc71;">✓ Omschrijving: <strong>${result.omschrijving}</strong></p>`;
            fieldsFilled++;
        }
    }
    
    if (result.klant) {
        const klantField = document.getElementById('klant');
        if (klantField) {
            klantField.value = result.klant;
            klantField.dispatchEvent(new Event('input', { bubbles: true }));
            html += `<p style="margin: 5px 0; color: #2ecc71;">✓ Klant: <strong>${result.klant}</strong></p>`;
            fieldsFilled++;
        }
    }
    
    if (result.leverdatum) {
        const leverdatumField = document.getElementById('leverdatum');
        if (leverdatumField) {
            const formattedDate = formatDateForInput(result.leverdatum);
            if (formattedDate) {
                leverdatumField.value = formattedDate;
                leverdatumField.dispatchEvent(new Event('change', { bubbles: true }));
                html += `<p style="margin: 5px 0; color: #2ecc71;">✓ Leverdatum: <strong>${result.leverdatum}</strong></p>`;
                fieldsFilled++;
            }
        }
    }
    
    if (result.startdatum) {
        html += `<p style="margin: 5px 0; color: #3498db;">Startdatum: <strong>${result.startdatum}</strong></p>`;
    }
    
    // Referentie: alleen invullen als er echt een waarde is (niet leeg, niet null, niet undefined)
    if (result.referentienummer && result.referentienummer.trim() !== '' && result.referentienummer !== 'null' && result.referentienummer !== 'undefined') {
        const referentieField = document.getElementById('klantreferentie');
        if (referentieField) {
            referentieField.value = result.referentienummer;
            referentieField.dispatchEvent(new Event('input', { bubbles: true }));
            html += `<p style="margin: 5px 0; color: #2ecc71;">✓ Referentie: <strong>${result.referentienummer}</strong></p>`;
            fieldsFilled++;
        }
    } else {
        // Als er geen referentie is, veld leeg laten (niet invullen)
        const referentieField = document.getElementById('klantreferentie');
        if (referentieField) {
            referentieField.value = '';
        }
    }
    
    // Toon altijd een bericht, ook als er geen data is
    if (fieldsFilled === 0) {
        if (result.message) {
            html += `<p style="margin: 5px 0; color: #f39c12; font-weight: bold;">⚠ ${result.message}</p>`;
        } else {
            html += `<p style="margin: 5px 0; color: #f39c12;">⚠ Geen gegevens kunnen worden uitgelezen uit de screenshot. Vul handmatig in.</p>`;
        }
        html += `<p style="margin: 5px 0; color: #666; font-size: 0.85rem;">Tip: Zorg dat de screenshot scherp is en goed leesbaar. Voor betere resultaten, installeer pytesseract.</p>`;
    } else if (result.message && fieldsFilled > 0) {
        // Toon message ook als er wel data is (informatief)
        html += `<p style="margin: 10px 0 5px 0; color: #3498db; font-size: 0.85rem;">ℹ ${result.message}</p>`;
    }
    
    html += '</div>';
    ocrFields.innerHTML = html;
    
    // Scroll naar de OCR resultaten sectie zodat gebruiker het ziet
    if (ocrResults) {
        ocrResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function formatDateForInput(dateString) {
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 2) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateString;
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.error('Datum conversie fout:', e);
    }
    return null;
}

