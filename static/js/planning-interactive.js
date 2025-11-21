// Interactieve functies voor planning
// 1. Drag & Drop planning
// 2. Conflict detectie
// 3. Automatische waarschuwingen

let draggedProjectBar = null;
let draggedStartDate = null;
let draggedEndDate = null;

// Initialiseer drag & drop voor project bars
function initDragAndDrop() {
    document.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
}

function handleDragStart(e) {
    const projectBar = e.target.closest('.project-bar');
    if (!projectBar) return;
    
    // Check of deze bar draggable is (niet milestones)
    if (projectBar.classList.contains('milestone')) return;
    
    draggedProjectBar = projectBar;
    draggedProjectBar.style.opacity = '0.5';
    draggedProjectBar.style.cursor = 'grabbing';
    
    // Haal ordernummers en bewerking op
    const ordernummer = draggedProjectBar.getAttribute('data-ordernummer');
    const bewerking = draggedProjectBar.getAttribute('data-bewerking');
    
    // Haal huidige start en eind datum op uit grid-column position
    const style = draggedProjectBar.style.gridColumn;
    const match = style.match(/(\d+)\s*\/\s*span\s+(\d+)/);
    if (match) {
        const startCol = parseInt(match[1]) - 1;
        const span = parseInt(match[2]);
        
        // Vind de dag header voor deze kolom om datum te bepalen
        const weekCell = draggedProjectBar.closest('.week-cell');
        if (weekCell) {
            const dayHeaders = weekCell.parentElement.previousElementSibling?.querySelectorAll('.day-header');
            if (dayHeaders && dayHeaders[startCol]) {
                const dateStr = dayHeaders[startCol].getAttribute('data-date');
                if (dateStr) {
                    draggedStartDate = new Date(dateStr);
                    draggedEndDate = new Date(dateStr);
                    draggedEndDate.setDate(draggedEndDate.getDate() + span - 1);
                }
            }
        }
    }
    
    e.preventDefault();
}

function handleDragMove(e) {
    if (!draggedProjectBar) return;
    
    // Bepaal nieuwe positie op basis van muis positie
    const weekCells = document.querySelectorAll('.week-cell');
    let newStartDate = null;
    
    weekCells.forEach(weekCell => {
        const rect = weekCell.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
            // Bepaal welke dag kolom
            const dayHeaders = weekCell.parentElement.previousElementSibling?.querySelectorAll('.day-header');
            if (dayHeaders) {
                const dayWidth = rect.width / 7;
                const relativeX = e.clientX - rect.left;
                const dayIndex = Math.floor(relativeX / dayWidth);
                
                if (dayIndex >= 0 && dayIndex < dayHeaders.length) {
                    const dateStr = dayHeaders[dayIndex].getAttribute('data-date');
                    if (dateStr) {
                        newStartDate = new Date(dateStr);
                    }
                }
            }
        }
    });
    
    if (newStartDate && draggedStartDate && draggedEndDate) {
        // Bereken verschil in dagen
        const daysDiff = Math.round((newStartDate - draggedStartDate) / (1000 * 60 * 60 * 24));
        
        // Update visuele positie (tijdelijk, niet persisteren tot drop)
        const style = draggedProjectBar.style.gridColumn;
        const match = style.match(/(\d+)\s*\/\s*span\s+(\d+)/);
        if (match) {
            const originalStartCol = parseInt(match[1]) - 1;
            const span = parseInt(match[2]);
            const newStartCol = originalStartCol + daysDiff;
            
            if (newStartCol >= 0 && newStartCol + span <= 7) {
                // Visuele update (tijdelijk)
                draggedProjectBar.style.gridColumn = `${newStartCol + 1} / span ${span}`;
            }
        }
    }
}

async function handleDragEnd(e) {
    if (!draggedProjectBar) return;
    
    draggedProjectBar.style.opacity = '1';
    draggedProjectBar.style.cursor = 'pointer';
    
    // Haal nieuwe positie op
    const style = draggedProjectBar.style.gridColumn;
    const match = style.match(/(\d+)\s*\/\s*span\s+(\d+)/);
    
    if (match) {
        const ordernummer = draggedProjectBar.getAttribute('data-ordernummer');
        const bewerking = draggedProjectBar.getAttribute('data-bewerking');
        const weekCell = draggedProjectBar.closest('.week-cell');
        
        if (weekCell) {
            const dayHeaders = weekCell.parentElement.previousElementSibling?.querySelectorAll('.day-header');
            if (dayHeaders) {
                const newStartCol = parseInt(match[1]) - 1;
                const dateStr = dayHeaders[newStartCol].getAttribute('data-date');
                
                if (dateStr) {
                    const newStartDate = new Date(dateStr);
                    
                    // Valideer nieuwe positie (capaciteit, logica, etc.)
                    const validation = await validateProjectMove(ordernummer, bewerking, newStartDate);
                    
                    if (validation.valid) {
                        // Sla nieuwe positie op
                        await updateProjectAssignment(ordernummer, bewerking, newStartDate);
                        
                        // Herlaad planning
                        loadWeekPlanning();
                    } else {
                        // Reset positie en toon foutmelding
                        alert(`⚠ ${validation.error}`);
                        loadWeekPlanning(); // Herlaad om originele positie te herstellen
                    }
                }
            }
        }
    }
    
    draggedProjectBar = null;
    draggedStartDate = null;
    draggedEndDate = null;
}

// Valideer project verplaatsing
async function validateProjectMove(ordernummer, bewerking, newStartDate) {
    // Haal order en assignments op
    try {
        const [ordersResponse, assignmentsResponse] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/assignments')
        ]);
        
        const orders = await ordersResponse.json();
        const assignments = await assignmentsResponse.json();
        
        const order = orders.find(o => o.ordernummer === ordernummer);
        if (!order) {
            return { valid: false, error: 'Order niet gevonden' };
        }
        
        // Check logische regels
        const assignment = assignments.find(a => 
            a.ordernummer === ordernummer && 
            a.bewerking === bewerking
        );
        
        if (!assignment) {
            return { valid: false, error: 'Assignment niet gevonden' };
        }
        
        // Check materiaal binnen
        if ((bewerking === 'samenstellen' || bewerking === 'aflassen') && !order.materiaal_binnen) {
            return { valid: false, error: 'Materialen moeten eerst binnen zijn voordat productie kan starten' };
        }
        
        // Check conserveringsdatum
        if (order.conserveringsdatum) {
            const conserveringDate = new Date(order.conserveringsdatum);
            const projectEind = new Date(newStartDate);
            projectEind.setDate(projectEind.getDate() + Math.ceil(assignment.uren / 8)); // Schatting dagen
            
            if (projectEind > conserveringDate) {
                return { valid: false, error: `Project eind (${projectEind.toLocaleDateString('nl-NL')}) mag niet na conserveringsdatum (${conserveringDate.toLocaleDateString('nl-NL')}) komen` };
            }
        }
        
        // Check leverdatum
        if (order.leverdatum) {
            const leverdatum = new Date(order.leverdatum);
            const projectEind = new Date(newStartDate);
            projectEind.setDate(projectEind.getDate() + Math.ceil(assignment.uren / 8));
            
            if (projectEind > leverdatum) {
                return { valid: false, error: `Project eind (${projectEind.toLocaleDateString('nl-NL')}) mag niet na leverdatum (${leverdatum.toLocaleDateString('nl-NL')}) komen` };
            }
        }
        
        return { valid: true };
    } catch (error) {
        console.error('Fout bij validatie:', error);
        return { valid: false, error: 'Fout bij validatie: ' + error.message };
    }
}

// Update project assignment
async function updateProjectAssignment(ordernummer, bewerking, newStartDate) {
    try {
        // Haal assignments op
        const assignmentsResponse = await fetch('/api/assignments');
        const assignments = await assignmentsResponse.json();
        
        const assignment = assignments.find(a => 
            a.ordernummer === ordernummer && 
            a.bewerking === bewerking
        );
        
        if (!assignment) {
            throw new Error('Assignment niet gevonden');
        }
        
        // Bereken nieuwe eind datum
        const uren = parseFloat(assignment.uren) || 0;
        const urenPerDag = 8; // Standaard
        const benodigdeDagen = Math.ceil(uren / urenPerDag);
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + benodigdeDagen - 1);
        
        // Skip weekends
        while (newEndDate.getDay() === 0 || newEndDate.getDay() === 6) {
            newEndDate.setDate(newEndDate.getDate() + 1);
        }
        
        // Update assignment
        const updateData = {
            start_datum: newStartDate.toISOString().split('T')[0],
            eind_datum: newEndDate.toISOString().split('T')[0]
        };
        
        const response = await fetch(`/api/assignments/${assignment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error('Fout bij updaten assignment');
        }
        
        return true;
    } catch (error) {
        console.error('Fout bij updaten assignment:', error);
        throw error;
    }
}

// Conflict detectie
function detectConflicts(medewerkers, assignments, orders) {
    const conflicts = [];
    
    medewerkers.forEach(medewerker => {
        const medewerkerAssignments = assignments.filter(a => a.medewerker === medewerker.naam);
        
        // Groepeer per datum
        const assignmentsPerDate = {};
        
        medewerkerAssignments.forEach(assignment => {
            if (!assignment.start_datum || !assignment.eind_datum) return;
            
            const start = new Date(assignment.start_datum);
            const end = new Date(assignment.eind_datum);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                if (d.getDay() === 0 || d.getDay() === 6) continue; // Skip weekend
                
                if (!assignmentsPerDate[dateKey]) {
                    assignmentsPerDate[dateKey] = [];
                }
                assignmentsPerDate[dateKey].push(assignment);
            }
        });
        
        // Check per datum of capaciteit overschreden wordt
        Object.keys(assignmentsPerDate).forEach(dateKey => {
            const dayAssignments = assignmentsPerDate[dateKey];
            const totalUren = dayAssignments.reduce((sum, a) => sum + (parseFloat(a.uren) || 0), 0);
            
            // Bepaal beschikbare uren voor deze dag
            const date = new Date(dateKey);
            const dayOfWeek = date.getDay();
            let beschikbaarUren = 0;
            
            if (dayOfWeek === 1) beschikbaarUren = medewerker.standaard_uren_ma || 0;
            else if (dayOfWeek === 2) beschikbaarUren = medewerker.standaard_uren_di || 0;
            else if (dayOfWeek === 3) beschikbaarUren = medewerker.standaard_uren_wo || 0;
            else if (dayOfWeek === 4) beschikbaarUren = medewerker.standaard_uren_do || 0;
            else if (dayOfWeek === 5) beschikbaarUren = medewerker.standaard_uren_vr || 0;
            else if (dayOfWeek === 6) beschikbaarUren = medewerker.standaard_uren_za || 0;
            
            if (totalUren > beschikbaarUren && beschikbaarUren > 0) {
                conflicts.push({
                    medewerker: medewerker.naam,
                    datum: dateKey,
                    totaalUren: totalUren,
                    beschikbaarUren: beschikbaarUren,
                    assignments: dayAssignments.map(a => a.ordernummer + ' ' + a.bewerking)
                });
            }
        });
    });
    
    return conflicts;
}

// Export functies
window.initDragAndDrop = initDragAndDrop;
window.detectConflicts = detectConflicts;

