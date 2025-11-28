// JavaScript voor Week Planning weergave - Volledig herzien
// Structuur: Medewerker + Uren/Week | Project Lijst | 7 Kolommen per Week (Ma-Zo) met Project Balken + Milestones

const API_BASE = '/api';

let currentWeek = null;
let currentYear = null;
let numWeeks = 1; // Standaard 1 week
let viewMode = 'week'; // 'week', '2weeks', 'month'
let isLoadingWeeks = false; // Flag voor lazy loading

// Laad planning bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    // Laad eerst week opties in dropdowns
    loadWeekOptions();
    
    // Zet huidige week/jaar
    setCurrentWeek();
    
    // Zet viewMode dropdown op huidige waarde
    const viewModeSelect = document.getElementById('viewMode');
    if (viewModeSelect) {
        viewModeSelect.value = viewMode;
    }
});

// Stel huidige week in - DATUM BEWUST
function setCurrentWeek() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentWeek = getWeekNumber(now);
    
    // Update week/jaar selectors als ze bestaan
    const weekSelect = document.getElementById('weekSelect');
    const jaarSelect = document.getElementById('jaarSelect');
    if (weekSelect) weekSelect.value = currentWeek;
    if (jaarSelect) jaarSelect.value = currentYear;
    
    loadWeekPlanning();
}

// Bepaal week nummer (ISO 8601)
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// Bepaal alle dagen in een week (ma t/m zo)
function getWeekDays(weekNumber, year) {
    const days = [];
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
    const targetMonday = new Date(week1Monday);
    targetMonday.setUTCDate(week1Monday.getUTCDate() + (weekNumber - 1) * 7);
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(targetMonday);
        day.setUTCDate(targetMonday.getUTCDate() + i);
        days.push(day);
    }
    return days;
}

// Format datum
function formatDate(date) {
    const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
    return `${days[date.getUTCDay()]} ${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
}

// Format datum voor key
function dateToKey(date) {
    return date.toISOString().split('T')[0];
}

// Laad week opties
function loadWeekOptions() {
    const weekSelect = document.getElementById('weekSelect');
    const jaarSelect = document.getElementById('jaarSelect');
    
    if (!weekSelect || !jaarSelect) {
        console.error('Week of jaar select niet gevonden');
        return;
    }
    
    // Vul jaar dropdown
    const currentYear = new Date().getFullYear();
    jaarSelect.innerHTML = ''; // Reset
    for (let jaar = currentYear - 1; jaar <= currentYear + 1; jaar++) {
        const option = document.createElement('option');
        option.value = jaar;
        option.textContent = jaar;
        if (jaar === currentYear) option.selected = true;
        jaarSelect.appendChild(option);
    }
    
    // Vul week dropdown (1-52)
    weekSelect.innerHTML = ''; // Reset
    for (let w = 1; w <= 52; w++) {
        const option = document.createElement('option');
        option.value = w;
        option.textContent = `Week ${w}`;
        weekSelect.appendChild(option);
    }
}

// Laad week planning
async function loadWeekPlanning() {
    const weekSelect = document.getElementById('weekSelect');
    const jaarSelect = document.getElementById('jaarSelect');
    
    const week = weekSelect ? parseInt(weekSelect.value) || currentWeek : currentWeek;
    const jaar = jaarSelect ? parseInt(jaarSelect.value) || currentYear : currentYear;
    
    currentWeek = week;
    currentYear = jaar;
    
    try {
        // Bepaal huidige datum voor datum-bewuste planning
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Als geen week/jaar geselecteerd, gebruik huidige week
        if (!currentWeek || !currentYear) {
            const currentDate = new Date();
            currentYear = currentYear || currentDate.getFullYear();
            currentWeek = currentWeek || getWeekNumber(currentDate);
        }
        
        const [medewerkersResponse, assignmentsResponse, ordersResponse] = await Promise.all([
            fetch(`${API_BASE}/medewerkers`),
            fetch(`${API_BASE}/order-assignments`),
            fetch(`${API_BASE}/orders`)
        ]);
        
        if (!medewerkersResponse.ok || !assignmentsResponse.ok || !ordersResponse.ok) {
            throw new Error('Fout bij ophalen data');
        }
        
        const medewerkers = await medewerkersResponse.json();
        let assignments = await assignmentsResponse.json();
        const orders = await ordersResponse.json();
        
        // AUTOMATISCHE ASSIGNMENT GENERATIE: Genereer assignments voor alle orders met leverdatum
        if (window.generateAutomaticAssignments) {
            const newAssignmentsCount = await window.generateAutomaticAssignments(orders, medewerkers);
            if (newAssignmentsCount > 0) {
                // Herlaad assignments na automatische generatie
                const assignmentsResponse2 = await fetch(`${API_BASE}/order-assignments`);
                if (assignmentsResponse2.ok) {
                    assignments = await assignmentsResponse2.json();
                }
            }
        }
        
        // Haal week planning op voor beschikbare uren per dag
        const weekPlannings = [];
        for (let w = week; w < week + numWeeks; w++) {
            try {
                const wpResponse = await fetch(`${API_BASE}/week-planning?week_nummer=${w}&jaar=${jaar}`);
                if (wpResponse.ok) {
                    const wp = await wpResponse.json();
                    weekPlannings.push({week: w, data: wp});
                } else {
                    weekPlannings.push({week: w, data: []});
                }
            } catch (e) {
                weekPlannings.push({week: w, data: []});
            }
        }
        
        // Debug logging - TOON ALLE ASSIGNMENTS
        console.log('Planning data geladen:', {
            medewerkers: medewerkers.length,
            assignments: assignments.length,
            orders: orders.length,
            weekPlannings: weekPlannings.length,
            week: week,
            jaar: jaar,
            numWeeks: numWeeks
        });
        
        // Debug: Toon alle assignments met bewerking
        console.log('Alle assignments met bewerking:', assignments.map(a => ({
            ordernummer: a.ordernummer,
            medewerker: a.medewerker,
            bewerking: a.bewerking,
            uren: a.uren,
            start_datum: a.start_datum,
            eind_datum: a.eind_datum
        })));
        
        displayWeekPlanning(medewerkers, assignments, orders, weekPlannings, week, jaar);
    } catch (error) {
        console.error('Fout bij laden planning:', error);
        // Toon error in planning body
        const planningBodyError = document.getElementById('planningBody');
        if (planningBodyError) {
            planningBodyError.innerHTML = `<div style="padding: 20px; color: #e74c3c;">
                <h3>Fout bij laden planning</h3>
                <p>${error.message || 'Onbekende fout'}</p>
                <p>Controleer de console voor meer details.</p>
            </div>`;
        }
        if (typeof showError === 'function') {
            showError('Fout bij laden planning: ' + (error.message || 'Onbekende fout'), 'Planning Laden');
        } else {
            alert('Fout bij laden planning: ' + (error.message || 'Onbekende fout'));
        }
    }
}

// Toon week planning - NIEUWE STRUCTUUR
function displayWeekPlanning(medewerkers, assignments, orders, weekPlannings, startWeek, jaar) {
    console.log('displayWeekPlanning aangeroepen:', {
        medewerkers: medewerkers?.length || 0,
        assignments: assignments?.length || 0,
        orders: orders?.length || 0,
        weekPlannings: weekPlannings?.length || 0,
        startWeek,
        jaar
    });
    
    // Valideer input
    if (!medewerkers || medewerkers.length === 0) {
        console.warn('Geen medewerkers gevonden');
    }
    if (!assignments || assignments.length === 0) {
        console.warn('Geen assignments gevonden');
    }
    if (!orders || orders.length === 0) {
        console.warn('Geen orders gevonden');
    }
    
    // Bereken beschikbare ruimte voor weeks (bereken op basis van viewport)
    const container = document.querySelector('.planning-week-container');
    if (!container) {
        console.error('Planning container niet gevonden!');
        return;
    }
    
    const planningLeftWidth = 400; // Vaste breedte van planning-row-left
    // Wacht even tot container geladen is voor juiste breedte
    let containerWidth = container.clientWidth || container.offsetWidth;
    if (!containerWidth || containerWidth < 100) {
        // Wacht even en probeer opnieuw
        setTimeout(() => {
            containerWidth = container.clientWidth || container.offsetWidth || (window.innerWidth - 100);
        }, 100);
        containerWidth = window.innerWidth - 100; // Fallback
    }
    const availableWidth = containerWidth - planningLeftWidth - 20; // 20px margin voor scrollbar
    
    // Bereken dagbreedte op basis van aantal weken en beschikbare ruimte
    // Per week: 7 dagen, dus totale dagen = numWeeks * 7
    const totalDays = numWeeks * 7;
    const dayWidth = Math.floor(availableWidth / totalDays);
    // Minimum breedte per dag - kleiner maken voor betere fit
    const minDayWidth = Math.max(40, Math.floor((availableWidth - 100) / totalDays)); // Dynamisch minimum
    const calculatedDayWidth = Math.max(minDayWidth, dayWidth);
    const weekCellWidth = calculatedDayWidth * 7; // Breedte per week cell
    
    // ZORG DAT ALLES PAST - verklein font indien nodig
    if (calculatedDayWidth < 60) {
        // Font verkleinen voor kleine dagen
        document.documentElement.style.setProperty('--planning-font-size', '0.75rem');
    } else {
        document.documentElement.style.setProperty('--planning-font-size', '1rem');
    }
    
    console.log('Planning layout berekening:', {
        containerWidth,
        availableWidth,
        totalDays,
        calculatedDayWidth,
        weekCellWidth,
        numWeeks,
        viewMode
    });
    
    // Update week select - zorg dat de juiste week geselecteerd is
    const weekSelect = document.getElementById('weekSelect');
    if (weekSelect) {
        weekSelect.value = startWeek;
    }
    
    // Update jaar select
    const jaarSelect = document.getElementById('jaarSelect');
    if (jaarSelect) {
        jaarSelect.value = jaar;
    }
    
    // Maak week headers met 7 dagen per week (met dynamische breedte)
    const weeksHeader = document.getElementById('weeksHeader');
    if (weeksHeader) {
        weeksHeader.innerHTML = '';
        // Stel breedte in voor weeks header container
        const totalWeeksHeaderWidth = weekCellWidth * numWeeks;
        weeksHeader.style.width = `${totalWeeksHeaderWidth}px`;
        weeksHeader.style.minWidth = `${totalWeeksHeaderWidth}px`;
        
        for (let w = startWeek; w < startWeek + numWeeks; w++) {
            const weekDays = getWeekDays(w, jaar);
            const weekHeader = document.createElement('div');
            weekHeader.className = 'week-header-group';
            weekHeader.style.width = `${weekCellWidth}px`;
            weekHeader.style.minWidth = `${weekCellWidth}px`;
            weekHeader.style.flex = '0 0 auto'; // Geen flex, vaste breedte
            
            const weekTitle = document.createElement('div');
            weekTitle.className = 'week-title';
            weekTitle.textContent = `Week ${w}`;
            weekHeader.appendChild(weekTitle);
            
            const daysContainer = document.createElement('div');
            daysContainer.className = 'week-days';
            
            weekDays.forEach((day) => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'day-header';
                dayHeader.style.width = `${calculatedDayWidth}px`;
                dayHeader.style.minWidth = `${calculatedDayWidth}px`;
                dayHeader.style.flex = '0 0 auto'; // Geen flex, vaste breedte
                // Check of het weekend is (zaterdag=6, zondag=0)
                const dayOfWeek = day.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    dayHeader.classList.add('weekend');
                }
                dayHeader.textContent = formatDate(day);
                dayHeader.setAttribute('data-date', dateToKey(day));
                daysContainer.appendChild(dayHeader);
            });
            
            weekHeader.appendChild(daysContainer);
            weeksHeader.appendChild(weekHeader);
        }
    }
    
    // Maak planning body
    const planningBody = document.getElementById('planningBody');
    if (!planningBody) return;
    
    const actieveMedewerkers = medewerkers.filter(m => m.actief);
    
    if (actieveMedewerkers.length === 0) {
        planningBody.innerHTML = '<div class="empty-week">Geen actieve medewerkers gevonden</div>';
        return;
    }
    
    // Bereken alle dagen voor alle weken
    const allDays = [];
    for (let w = startWeek; w < startWeek + numWeeks; w++) {
        const weekDays = getWeekDays(w, jaar);
        allDays.push(...weekDays.map(d => dateToKey(d)));
    }
    
    // Check voor ontbrekende data
    const missingDataWarnings = [];
    
    planningBody.innerHTML = actieveMedewerkers.map(medewerker => {
        // Bereken beschikbare uren per dag en totaal per week
        const beschikbareUrenPerDag = {};
        
        for (let w = startWeek; w < startWeek + numWeeks; w++) {
            const weekDays = getWeekDays(w, jaar);
            const weekPlan = weekPlannings.find(wp => wp.week === w);
            const medewerkerPlan = weekPlan?.data.find(wp => wp.medewerker === medewerker.naam);
            
            const dagenUren = [
                medewerkerPlan?.uren_ma ?? medewerker.standaard_uren_ma ?? 8,
                medewerkerPlan?.uren_di ?? medewerker.standaard_uren_di ?? 8,
                medewerkerPlan?.uren_wo ?? medewerker.standaard_uren_wo ?? 8,
                medewerkerPlan?.uren_do ?? medewerker.standaard_uren_do ?? 8,
                medewerkerPlan?.uren_vr ?? medewerker.standaard_uren_vr ?? 8,
                // Zaterdag alleen als medewerker zaterdag uren heeft
                (medewerker.standaard_uren_za > 0) ? (medewerkerPlan?.uren_za ?? medewerker.standaard_uren_za ?? 0) : 0,
                0 // Zondag altijd 0
            ];
            
            weekDays.forEach((day, idx) => {
                beschikbareUrenPerDag[dateToKey(day)] = dagenUren[idx];
            });
        }
        
        // Bereken totaal uren per week (voor alle weken in zicht)
        // Gebruik gemiddelde over alle zichtbare weken voor betere weergave
        let totaalUrenAlleWeken = 0;
        let aantalDagen = 0;
        for (let w = startWeek; w < startWeek + numWeeks; w++) {
            const weekDays = getWeekDays(w, jaar);
            weekDays.forEach(day => {
                const uren = beschikbareUrenPerDag[dateToKey(day)] || 0;
                totaalUrenAlleWeken += uren;
                if (uren > 0) aantalDagen++;
            });
        }
        // Bereken totaal uren per week - gebruik ALTIJD standaard uren van medewerker
        // Tel alle standaard dagelijkse uren op uit Medewerkers module
        const displayUrenPerWeek = (medewerker.standaard_uren_ma || 0) +
            (medewerker.standaard_uren_di || 0) +
            (medewerker.standaard_uren_wo || 0) +
            (medewerker.standaard_uren_do || 0) +
            (medewerker.standaard_uren_vr || 0) +
            (medewerker.standaard_uren_za || 0) +
            (medewerker.standaard_uren_zo || 0);
        
        // Als totaal 0 is, gebruik standaard_uren_per_week als fallback
        const finalDisplayUren = displayUrenPerWeek > 0 ? displayUrenPerWeek : (medewerker.standaard_uren_per_week || 40);
        
        // CRITICAL FIX: Maak projecten voor ALLE orders met leverdatum, niet alleen die met assignments
        // Voor elke order met leverdatum: genereer projecten voor alle bewerkingen met uren
        const uniqueProjects = {};
        const seenKeys = new Set();
        
        // Eerst: voeg projecten toe op basis van assignments (zoals voorheen)
        const medewerkerAssignments = assignments.filter(a => 
            a.medewerker === medewerker.naam && 
            a.bewerking && // Bewerking moet bestaan
            a.uren && parseFloat(a.uren) > 0 // Moet uren hebben
        );
        
        medewerkerAssignments.forEach(assignment => {
            const order = orders.find(o => o.ordernummer === assignment.ordernummer);
            if (!order) {
                missingDataWarnings.push(`Order ${assignment.ordernummer} niet gevonden voor medewerker ${medewerker.naam}`);
                return;
            }
            
            const key = `${assignment.ordernummer}-${assignment.bewerking}`.toLowerCase().trim();
            
            if (seenKeys.has(key)) {
                // Key bestaat al - combineer data
                if (uniqueProjects[key]) {
                    uniqueProjects[key].uren = Math.max(
                        uniqueProjects[key].uren, 
                        parseFloat(assignment.uren) || 0
                    );
                    
                    // Combineer datum ranges
                    if (assignment.start_datum && uniqueProjects[key].start_datum) {
                        const oldStart = new Date(uniqueProjects[key].start_datum);
                        const newStart = new Date(assignment.start_datum);
                        if (newStart < oldStart) {
                            uniqueProjects[key].start_datum = assignment.start_datum;
                        }
                    } else if (assignment.start_datum && !uniqueProjects[key].start_datum) {
                        uniqueProjects[key].start_datum = assignment.start_datum;
                    }
                    
                    if (assignment.eind_datum && uniqueProjects[key].eind_datum) {
                        const oldEnd = new Date(uniqueProjects[key].eind_datum);
                        const newEnd = new Date(assignment.eind_datum);
                        if (newEnd > oldEnd) {
                            uniqueProjects[key].eind_datum = assignment.eind_datum;
                        }
                    } else if (assignment.eind_datum && !uniqueProjects[key].eind_datum) {
                        uniqueProjects[key].eind_datum = assignment.eind_datum;
                    }
                    
                    uniqueProjects[key].assignments.push(assignment);
                }
                return;
            }
            
            seenKeys.add(key);
            uniqueProjects[key] = {
                ordernummer: assignment.ordernummer,
                bewerking: assignment.bewerking,
                order: order,
                uren: parseFloat(assignment.uren) || 0,
                start_datum: assignment.start_datum,
                eind_datum: assignment.eind_datum,
                week_nummer: assignment.week_nummer,
                jaar: assignment.jaar,
                assignments: [assignment]
            };
        });
        
        // NU: Voeg projecten toe voor ALLE orders met leverdatum, ook zonder assignments
        // Genereer automatisch projecten voor alle bewerkingen met uren
        orders.forEach(order => {
            if (!order.leverdatum) return; // Skip orders zonder leverdatum
            
            // Check of deze medewerker al assignments heeft voor dit order
            const heeftAssignmentsVoorOrder = medewerkerAssignments.some(a => a.ordernummer === order.ordernummer);
            
            // Als er al assignments zijn, skip (al toegevoegd hierboven)
            if (heeftAssignmentsVoorOrder) return;
            
            // Genereer projecten voor alle bewerkingen met uren voor deze medewerker
            // Voor nu: voeg alle bewerkingen toe (wordt later verdeeld over medewerkers)
            const bewerkingen = [];
            
            if (order.uren_voorbereiding && parseFloat(order.uren_voorbereiding) > 0) {
                bewerkingen.push({ bewerking: 'Voorbereiding', uren: parseFloat(order.uren_voorbereiding) });
            }
            if (order.uren_samenstellen && parseFloat(order.uren_samenstellen) > 0) {
                bewerkingen.push({ bewerking: 'Samenstellen', uren: parseFloat(order.uren_samenstellen) });
            }
            if (order.uren_aflassen && parseFloat(order.uren_aflassen) > 0) {
                bewerkingen.push({ bewerking: 'Aflassen', uren: parseFloat(order.uren_aflassen) });
            }
            if (order.heeft_montage) {
                bewerkingen.push({ bewerking: 'Montage', uren: order.montage_uren || 8 });
            }
            
            // Voeg projecten toe voor alle bewerkingen
            bewerkingen.forEach(bew => {
                const key = `${order.ordernummer}-${bew.bewerking}`.toLowerCase().trim();
                
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueProjects[key] = {
                        ordernummer: order.ordernummer,
                        bewerking: bew.bewerking,
                        order: order,
                        uren: bew.uren,
                        start_datum: null, // Wordt automatisch berekend
                        eind_datum: null,  // Wordt automatisch berekend
                        week_nummer: null,
                        jaar: null,
                        assignments: [] // Geen bestaande assignments
                    };
                }
            });
        });
        
        const projectList = Object.values(uniqueProjects);
        
        // PLANNINGLOGICA: Controleer logische volgorde en capaciteit
        // Sorteer projecten op prioriteit (leverdatum)
        projectList.sort((a, b) => {
            const aLeverdatum = new Date(a.order.leverdatum || 0);
            const bLeverdatum = new Date(b.order.leverdatum || 0);
            return aLeverdatum - bLeverdatum;
        });
        
        // Automatische planning: genereer datums als ze ontbreken
        // MET CAPACITEITSCONTROLE EN LOGISCHE VOLGORDE
        projectList.forEach((proj, idx) => {
            const order = proj.order;
            
            // LOGICA 1: Check of materialen binnen zijn (voor productie)
            if ((proj.bewerking === 'samenstellen' || proj.bewerking === 'aflassen') && !order.materiaal_binnen) {
                missingDataWarnings.push(`⚠ ${proj.ordernummer} ${proj.bewerking}: Materialen moeten eerst binnen zijn voordat productie kan starten`);
                return; // Skip planning voor dit project
            }
            
            // LOGICA 2: Aflassen kan niet vóór samenstellen
            if (proj.bewerking === 'aflassen') {
                // Check of er een samenstellen bewerking is voor dit order
                const samenstellenProj = projectList.find(p => 
                    p.ordernummer === proj.ordernummer && 
                    p.bewerking === 'samenstellen' &&
                    p !== proj
                );
                if (samenstellenProj && samenstellenProj.eind_datum) {
                    // Aflassen moet starten na samenstellen eind
                    const samenstellenEind = new Date(samenstellenProj.eind_datum);
                    samenstellenEind.setHours(23, 59, 59, 999);
                    // Set minimum start datum
                    if (!proj.start_datum || new Date(proj.start_datum) < samenstellenEind) {
                        const minStart = skipWeekendDaysForward(samenstellenEind, 1);
                        if (!proj.start_datum || new Date(proj.start_datum) < minStart) {
                            // Moet na samenstellen
                            proj.start_datum = minStart.toISOString().split('T')[0];
                            // Herbereken eind datum
                            const urenPerDag = Object.values(beschikbareUrenPerDag).reduce((sum, uren) => sum + uren, 0) / Object.keys(beschikbareUrenPerDag).length || 8;
                            const benodigdeDagen = Math.ceil(proj.uren / urenPerDag);
                            let eindDatum = skipWeekendDaysForward(minStart, benodigdeDagen - 1);
                            proj.eind_datum = eindDatum.toISOString().split('T')[0];
                        }
                    }
                }
            }
            
            if (!proj.start_datum || !proj.eind_datum) {
                // Check of er conservering bestaat (ook al niet zichtbaar in gewone planning)
                const heeftConservering = order.conserveringen && Array.isArray(order.conserveringen) && order.conserveringen.length > 0;
                const heeftConserveringsdatum = order.conserveringsdatum ? true : false;
                
                // Genereer planning op basis van conserveringsdatum
                if (order.conserveringsdatum) {
                    // Productie moet 1-2 dagen voor conservering klaar zijn
                    const conserveringDate = new Date(order.conserveringsdatum);
                    conserveringDate.setHours(0, 0, 0, 0);
                    
                    // Bereken hoeveel dagen nodig zijn voor deze bewerking
                    // Gebruik gemiddelde dagelijkse uren van deze medewerker
                    const gemiddeldeDagelijkseUren = Object.values(beschikbareUrenPerDag).reduce((sum, uren) => sum + uren, 0) / Object.keys(beschikbareUrenPerDag).length || 8;
                    const urenPerDag = gemiddeldeDagelijkseUren || 8; // Fallback naar 8u als geen data
                    const benodigdeDagen = Math.ceil(proj.uren / urenPerDag);
                    
                    // Start 2 dagen voor conservering minus benodigde dagen
                    // SLUIT WEEKEND UIT - skip zaterdag en zondag
                    let eindDatum = new Date(conserveringDate);
                    eindDatum = skipWeekendDaysBackward(eindDatum, 2); // 2 werkdagen voor conservering
                    
                    let startDatum = new Date(eindDatum);
                    startDatum = skipWeekendDaysBackward(startDatum, benodigdeDagen - 1);
                    
                    proj.start_datum = startDatum.toISOString().split('T')[0];
                    proj.eind_datum = eindDatum.toISOString().split('T')[0];
                    
                    missingDataWarnings.push(`Planning gegenereerd voor ${proj.ordernummer} ${proj.bewerking}: ${proj.start_datum} - ${proj.eind_datum}`);
                } else if (order.leverdatum) {
                    // Fallback: gebruik leverdatum
                    // BELANGRIJK: Als er conservering bestaat, productie kan NIET doorgaan tot leverdatum
                    // Productie moet ruimte laten voor conservering + montage
                    const leverdatumDate = new Date(order.leverdatum);
                    leverdatumDate.setHours(0, 0, 0, 0);
                    
                    // Gebruik gemiddelde dagelijkse uren van deze medewerker
                    const gemiddeldeDagelijkseUren = Object.values(beschikbareUrenPerDag).reduce((sum, uren) => sum + uren, 0) / Object.keys(beschikbareUrenPerDag).length || 8;
                    const urenPerDag = gemiddeldeDagelijkseUren || 8;
                    const benodigdeDagen = Math.ceil(proj.uren / urenPerDag);
                    
                    // Bepaal hoeveel ruimte nodig is tussen productie eind en leverdatum
                    let ruimteTotLeverdatum = 1; // Standaard 1 dag ruimte
                    
                    if (heeftConservering) {
                        // Als er conservering bestaat, moet productie eerder stoppen
                        // Ruimte voor conservering (standaard 5 werkdagen) + montage (minimaal 1 werkdag als montage bestaat)
                        const conserveringDoorlooptijd = order.conservering_doorlooptijd || 5;
                        ruimteTotLeverdatum = conserveringDoorlooptijd + (order.heeft_montage ? 1 : 0); // Conservering + montage (als bestaat)
                    } else if (order.heeft_montage) {
                        // Geen conservering, maar wel montage - ruimte voor montage
                        ruimteTotLeverdatum = 2; // 2 werkdagen ruimte voor montage
                    } else {
                        // Geen conservering, geen montage - 1 dag ruimte tussen einde productie en leverdatum
                        ruimteTotLeverdatum = 1;
                    }
                    
                    let maxProductieEind = skipWeekendDaysBackward(leverdatumDate, ruimteTotLeverdatum);
                    let eindDatum = new Date(maxProductieEind);
                    let startDatum = new Date(eindDatum);
                    startDatum = skipWeekendDaysBackward(startDatum, benodigdeDagen - 1);
                    
                    proj.start_datum = startDatum.toISOString().split('T')[0];
                    proj.eind_datum = eindDatum.toISOString().split('T')[0];
                } else {
                    missingDataWarnings.push(`Geen conserveringsdatum of leverdatum voor order ${proj.ordernummer}`);
                }
            }
        });
        
        // Sorteer projecten chronologisch
        projectList.sort((a, b) => {
            const aStart = a.start_datum ? new Date(a.start_datum) : new Date(0);
            const bStart = b.start_datum ? new Date(b.start_datum) : new Date(0);
            return aStart - bStart;
        });
        
        // CRITICAL FIX: Genereer automatische datums voor ALLE projecten zonder datums
        // ALLE projecten met leverdatum MOETEN in de planning komen
        projectList.forEach(proj => {
            if (!proj.start_datum || !proj.eind_datum) {
                // Genereer automatische datums op basis van order en leverdatum
                const order = proj.order;
                if (!order || !order.leverdatum) return; // Skip als geen leverdatum
                
                // Bereken automatische datums
                if (window.calculateAutomaticDates) {
                    const dates = window.calculateAutomaticDates(
                        { bewerking: proj.bewerking, uren: proj.uren, ordernummer: proj.ordernummer },
                        order,
                        medewerker,
                        projectList
                    );
                    
                    if (dates) {
                        proj.start_datum = dates.start_datum;
                        proj.eind_datum = dates.eind_datum;
                    }
                }
            }
        });
        
        // Filter projecten voor de zichtbare weken - ALLEEN projecten die in zichtbare periode vallen
        // Dit zorgt ervoor dat de projecten kolom alleen projecten toont die daadwerkelijk in beeld zijn
        const visibleProjects = projectList.filter(proj => {
            // ZORG DAT ALLE PROJECTEN MET LEVERDATUM GETOOND WORDEN (maar alleen als ze in zichtbare periode vallen)
            if (!proj.start_datum || !proj.eind_datum) {
                // Als nog steeds geen datums, check of order wel leverdatum heeft
                const order = proj.order;
                if (order && order.leverdatum) {
                    // Forceer basis datums op basis van leverdatum
                    const leverdatum = new Date(order.leverdatum);
                    const urenPerDag = Object.values(beschikbareUrenPerDag).reduce((sum, uren) => sum + uren, 0) / Math.max(1, Object.keys(beschikbareUrenPerDag).length) || 8;
                    const benodigdeDagen = Math.ceil(proj.uren / urenPerDag);
                    
                    // Start 2 weken voor leverdatum (fallback)
                    let start = new Date(leverdatum);
                    start.setDate(start.getDate() - (benodigdeDagen + 10));
                    
                    let end = new Date(leverdatum);
                    end.setDate(end.getDate() - 1);
                    
                    proj.start_datum = start.toISOString().split('T')[0];
                    proj.eind_datum = end.toISOString().split('T')[0];
                } else {
                    return false; // Skip als echt geen datums
                }
            }
            
            // Check of project binnen zichtbare periode valt
            const start = new Date(proj.start_datum);
            const end = new Date(proj.eind_datum);
            const firstVisibleDay = new Date(allDays[0] + 'T00:00:00');
            const lastVisibleDay = new Date(allDays[allDays.length - 1] + 'T23:59:59');
            
            // Project is zichtbaar als het overlapt met de zichtbare periode
            const isVisible = (start <= lastVisibleDay && end >= firstVisibleDay);
            
            // BELANGRIJK: Alleen projecten die daadwerkelijk in zichtbare periode vallen
            return isVisible;
        });
        
        // Maak week cellen met 7 dagen per week en project balken
        const weekCells = [];
        let totaalProjectenInWeken = 0; // Totaal aantal projectbalken in alle zichtbare weken
        
        for (let w = startWeek; w < startWeek + numWeeks; w++) {
            const weekDays = getWeekDays(w, jaar);
            
            // Verzamel projecten voor deze week
            const weekProjects = [];
            const weekMilestones = [];
            
            visibleProjects.forEach(proj => {
                if (proj.start_datum && proj.eind_datum) {
                    const start = new Date(proj.start_datum);
                    const eind = new Date(proj.eind_datum);
                    start.setHours(0, 0, 0, 0);
                    eind.setHours(23, 59, 59, 999);
                    
                    // Check welke dagen dit project beslaat - SKIP ZONDAG ALTIJD (dag 0)
                    const projectDays = [];
                    weekDays.forEach((day, dayIdx) => {
                        const dayDate = new Date(day);
                        dayDate.setHours(0, 0, 0, 0);
                        const dayOfWeek = dayDate.getDay();
                        
                        // SKIP ZONDAG ALTIJD - geen enkele werknemer heeft zondag uren
                        if (dayOfWeek === 0) {
                            return; // Skip zondag - NOOIT plannen op zondag
                        }
                        
                        // Check of medewerker zaterdag uren heeft - zo niet, skip zaterdag
                        if (dayOfWeek === 6 && (!medewerker.standaard_uren_za || medewerker.standaard_uren_za === 0)) {
                            return; // Skip zaterdag als medewerker geen zaterdag uren heeft
                        }
                        
                        // Check of dit project op deze dag valt
                        if (dayDate >= start && dayDate <= eind) {
                            projectDays.push({
                                date: dateToKey(day),
                                dayIdx: dayIdx // Behoud originele index (0-6) voor grid positioning
                            });
                        }
                    });
                    
                    if (projectDays.length > 0) {
                        // Gebruik de eerste dayIdx als start kolom
                        const firstDayIdx = projectDays[0].dayIdx;
                        const lastDayIdx = projectDays[projectDays.length - 1].dayIdx;
                        const span = lastDayIdx - firstDayIdx + 1;
                        
                        weekProjects.push({
                            project: proj,
                            startCol: firstDayIdx, // 0-6 index (exact grid position)
                            span: Math.min(span, 7 - firstDayIdx) // Span aantal dagen
                        });
                        totaalProjectenInWeken++; // Tel projectbalken in zichtbare weken
                    }
                }
            });
            
            // Voeg milestones toe - ALLEEN einddatum (GEEN conservering in gewone planning)
            // CONSERVERING ZAL ALLEEN IN PROJECTPLANNING WORDEN GETOOND
            visibleProjects.forEach(proj => {
                const order = proj.order;
                
                // Conserveringsdatum VERWIJDERD - alleen in projectplanning
                
                // Einddatum als milestone
                if (order.leverdatum) {
                    const eindDate = new Date(order.leverdatum);
                    const dayIdx = weekDays.findIndex(d => {
                        const dayDate = new Date(d);
                        return dayDate.getTime() === eindDate.getTime();
                    });
                    
                    if (dayIdx !== -1) {
                        weekMilestones.push({
                            type: 'einddatum',
                            day: dayIdx,
                            span: 1,
                            order: order,
                            datum: order.leverdatum
                        });
                    }
                }
            });
            
            // Maak dag cellen met dynamische breedte - ZORG VOOR JUISTE UITLIJNING
            const dayCells = weekDays.map((day, dayIdx) => {
                const dateStr = dateToKey(day);
                const beschikbaar = beschikbareUrenPerDag[dateStr] || 0;
                
                const dayOfWeek = day.getUTCDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                return `
                    <div class="day-cell ${isWeekend ? 'weekend' : ''}" data-date="${dateStr}" style="width: ${calculatedDayWidth}px; min-width: ${calculatedDayWidth}px; max-width: ${calculatedDayWidth}px; flex: 0 0 ${calculatedDayWidth}px !important;">
                        <!-- Uren verborgen zoals gevraagd -->
                    </div>
                `;
            }).join('');
            
            // Maak project balken en milestones container - ZORG DAT GRID EXACT KLOPT
            let projectBarsHtml = '';
            if (weekProjects.length > 0 || weekMilestones.length > 0) {
                // Grid moet EXACT overeenkomen met day-cells (7 kolommen, elk calculatedDayWidth breed)
                // ZORG DAT PROJECT BARS ZICHTBAAR ZIJN
                projectBarsHtml = `
                    <div class="week-projects-container" style="grid-template-columns: repeat(7, ${calculatedDayWidth}px) !important; width: ${calculatedDayWidth * 7}px !important; display: grid !important;">
                        ${weekProjects.map((wp, idx) => {
                            const bewerking = (wp.project.bewerking || 'onbekend').toLowerCase();
                            return `
                                <div class="project-bar ${bewerking}" 
                                     style="grid-column: ${wp.startCol + 1} / span ${wp.span} !important; position: relative !important; z-index: 10 !important; opacity: 1 !important; visibility: visible !important;"
                                     data-ordernummer="${wp.project.ordernummer}"
                                     data-bewerking="${wp.project.bewerking}"
                                     data-uren="${wp.project.uren}"
                                     data-order='${JSON.stringify(wp.project.order).replace(/'/g, "&#39;")}'
                                     onclick="showProjectDetailsFromBar(this)"
                                     title="Klik voor details: ${wp.project.order.omschrijving || wp.project.ordernummer} - ${wp.project.bewerking} - ${wp.project.uren.toFixed(1)}u">
                                    <span class="project-bar-title">${wp.project.ordernummer}</span>
                                    ${wp.span > 1 ? `<span class="project-bar-days">${wp.span}d</span>` : ''}
                                    <span class="project-bar-uren">${wp.project.uren.toFixed(1)}u</span>
                                    ${wp.project.order.conserveringsdatum ? `<span style="font-size: 0.65rem; margin-left: 3px;">🔧${new Date(wp.project.order.conserveringsdatum).toLocaleDateString('nl-NL', {day: '2-digit', month: '2-digit'})}</span>` : ''}
                                    ${wp.project.order.leverdatum ? `<span style="font-size: 0.65rem; margin-left: 3px;">✓${new Date(wp.project.order.leverdatum).toLocaleDateString('nl-NL', {day: '2-digit', month: '2-digit'})}</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                        ${weekMilestones.map((ms, idx) => {
                            const milestoneClass = ms.type === 'conservering' ? 'milestone-conservering' : 'milestone-einddatum';
                            return `
                                <div class="milestone ${milestoneClass}" 
                                     style="grid-column: ${ms.day + 1} / span ${ms.span};"
                                     title="${ms.type === 'conservering' ? 'Conservering' : 'Einddatum'}: ${ms.order.ordernummer}">
                                    <span class="milestone-icon">${ms.type === 'conservering' ? '🔧' : '✓'}</span>
                                    <span class="milestone-label">${ms.type === 'conservering' ? 'Conservering' : 'Eind'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            
            // Maak week cell met dynamische breedte
            weekCells.push(`
                <div class="week-cell" style="width: ${weekCellWidth}px; min-width: ${weekCellWidth}px; flex: 0 0 auto;">
                    ${dayCells}
                    ${projectBarsHtml}
                </div>
            `);
        }
        
        // Stel breedte in voor planning-row-weeks container
        const totalWeeksWidth = weekCellWidth * numWeeks;
        
        // Maak project lijst (rechts naast medewerker)
        let projectListHtml = '';
        if (visibleProjects.length > 0) {
            projectListHtml = `
                <div class="project-list">
                    ${visibleProjects.map(proj => {
                        const bewerking = (proj.bewerking || 'onbekend').toLowerCase();
                        return `
                            <div class="project-list-item ${bewerking}">
                                <span class="project-list-code">${proj.ordernummer}</span>
                                <span class="project-list-bewerking">${proj.bewerking}</span>
                                <span class="project-list-uren">${proj.uren.toFixed(1)}u</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            projectListHtml = '<div class="empty-projects">Geen projecten</div>';
        }
        
        // Bereken dynamische hoogte op basis van aantal ZICHTBARE projecten in de lijst
        // ZORG DAT HOOGTE DYNAMISCH IS - hoe meer projecten, hoe hoger de rij
        // Medewerker en planning moeten GELIJK TREKKEN (sync)
        // Aantal regels bij naam = aantal projecten in beeld (visibleProjects.length)
        // 0 projecten = 1 lege regel (klein), 1 project = 1 regel, 3 projecten = 3 regels
        const aantalProjectenInBeeld = visibleProjects.length;
        
        // Basis hoogte voor medewerker cel (naam + uren) - kleiner voor mensen zonder projecten
        const basisMedewerkerHoogte = aantalProjectenInBeeld === 0 ? 40 : 55; // Kleinere basis als geen projecten
        // Hoogte per project item moet EXACT overeenkomen met projectbalk (18px + 2px gap = 20px per project)
        // Projectbalk heeft 18px hoogte, dus project item moet ook 18px zijn + gap
        const projectItemHoogte = 20; // 18px item (gelijk aan project-bar) + 2px gap
        // Hoogte voor de rij = basis + (aantal projecten * item hoogte)
        // Minimaal 1 regel (ook als geen projecten), maar kleiner
        const aantalRegels = Math.max(1, aantalProjectenInBeeld);
        const minHoogte = 40; // Minimum hoogte voor mensen zonder projecten
        // Dynamische hoogte die groeit met aantal projecten - ZORG DAT MEDEWERKER EN PLANNING EXACT GELIJK TREKKEN
        const dynamischeHoogte = Math.max(minHoogte, basisMedewerkerHoogte + (aantalRegels * projectItemHoogte));
        
        return `
            <div class="planning-row" style="min-height: ${dynamischeHoogte}px; height: ${dynamischeHoogte}px;">
                <div class="planning-row-left">
                    <div class="medewerker-cell">
                        <div class="medewerker-naam">${medewerker.naam}</div>
                        <div class="medewerker-uren">${finalDisplayUren.toFixed(1)}u/week</div>
                    </div>
                    <div class="project-list-container" style="height: ${dynamischeHoogte - basisMedewerkerHoogte}px; overflow-y: visible !important;">
                        ${projectListHtml}
                    </div>
                </div>
                <div class="planning-row-weeks" style="width: ${totalWeeksWidth}px; min-width: ${totalWeeksWidth}px;">
                    ${weekCells.join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Voeg scroll listener toe voor lazy loading van weken (alleen als nog niet toegevoegd)
    const planningBodyElement = document.getElementById('planningBody');
    if (planningBodyElement && !planningBodyElement.hasAttribute('data-scroll-listener')) {
        planningBodyElement.setAttribute('data-scroll-listener', 'true');
        planningBodyElement.addEventListener('scroll', handlePlanningScroll);
    }
    
    // Reset loading flag
    isLoadingWeeks = false;
    
    // Toon waarschuwingen voor ontbrekende data (met sluitknop)
    if (missingDataWarnings.length > 0) {
        const warningsDiv = document.getElementById('warnings');
        if (warningsDiv) {
            warningsDiv.innerHTML = `
                <div class="warnings-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0;">Waarschuwingen:</h4>
                        <button onclick="document.getElementById('warnings').style.display='none'" 
                                style="background: #ffc107; border: 1px solid #856404; color: #856404; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Verberg
                        </button>
                    </div>
                    <ul style="margin: 0;">
                        ${missingDataWarnings.map(w => `<li>${w}</li>`).join('')}
                    </ul>
                </div>
            `;
            warningsDiv.style.display = 'block';
        }
    } else {
        const warningsDiv = document.getElementById('warnings');
        if (warningsDiv) {
            warningsDiv.style.display = 'none';
        }
    }
}

// Navigatie
function previousWeek() {
    currentWeek = currentWeek > 1 ? currentWeek - 1 : 52;
    if (currentWeek === 52) currentYear--;
    document.getElementById('weekSelect').value = currentWeek;
    document.getElementById('jaarSelect').value = currentYear;
    loadWeekPlanning();
}

function changeViewMode() {
    const modeSelect = document.getElementById('viewMode');
    if (!modeSelect) {
        console.error('viewMode selector niet gevonden!');
        return;
    }
    
    const mode = modeSelect.value;
    viewMode = mode;
    
    // Zet aantal weken op basis van gekozen modus
    if (mode === 'week') {
        numWeeks = 1;
    } else if (mode === '2weeks') {
        numWeeks = 2;
    } else if (mode === 'month') {
        numWeeks = 4; // ~1 maand
    } else {
        numWeeks = 1; // Fallback
    }
    
    console.log(`ViewMode veranderd naar: ${mode}, numWeeks: ${numWeeks}`);
    
    // Herlaad planning met nieuwe weergave
    if (!currentWeek || !currentYear) {
        setCurrentWeek();
    } else {
        loadWeekPlanning();
    }
}

function previousPeriod() {
    if (!currentWeek || !currentYear) {
        setCurrentWeek();
        return;
    }
    
    if (viewMode === 'week' || viewMode === '2weeks') {
        currentWeek = currentWeek > numWeeks ? currentWeek - numWeeks : (52 - numWeeks + currentWeek);
        if (currentWeek > 52) {
            currentYear--;
            currentWeek = currentWeek - 52;
        }
    } else if (viewMode === 'month') {
        currentWeek = currentWeek > 4 ? currentWeek - 4 : (52 - 4 + currentWeek);
        if (currentWeek > 52) {
            currentYear--;
            currentWeek = currentWeek - 52;
        }
    }
    
    const weekSelect = document.getElementById('weekSelect');
    const jaarSelect = document.getElementById('jaarSelect');
    if (weekSelect) weekSelect.value = currentWeek;
    if (jaarSelect) jaarSelect.value = currentYear;
    
    console.log(`Previous period: week ${currentWeek}, jaar ${currentYear}, numWeeks: ${numWeeks}`);
    loadWeekPlanning();
}

function nextPeriod() {
    if (!currentWeek || !currentYear) {
        setCurrentWeek();
        return;
    }
    
    if (viewMode === 'week' || viewMode === '2weeks') {
        currentWeek = currentWeek + numWeeks;
        if (currentWeek > 52) {
            currentYear++;
            currentWeek = currentWeek - 52;
        }
    } else if (viewMode === 'month') {
        currentWeek = currentWeek + 4;
        if (currentWeek > 52) {
            currentYear++;
            currentWeek = currentWeek - 52;
        }
    }
    
    const weekSelect = document.getElementById('weekSelect');
    const jaarSelect = document.getElementById('jaarSelect');
    if (weekSelect) weekSelect.value = currentWeek;
    if (jaarSelect) jaarSelect.value = currentYear;
    
    console.log(`Next period: week ${currentWeek}, jaar ${currentYear}, numWeeks: ${numWeeks}`);
    loadWeekPlanning();
}

function previousWeek() {
    previousPeriod();
}

function nextWeek() {
    nextPeriod();
}

// Handlers voor dropdown changes - ZORG DAT ZE WERKEN
function handleWeekChange() {
    const weekSelect = document.getElementById('weekSelect');
    if (weekSelect && weekSelect.value) {
        currentWeek = parseInt(weekSelect.value);
        console.log(`Week veranderd naar: ${currentWeek}`);
        loadWeekPlanning();
    }
}

function handleYearChange() {
    const jaarSelect = document.getElementById('jaarSelect');
    if (jaarSelect && jaarSelect.value) {
        currentYear = parseInt(jaarSelect.value);
        console.log(`Jaar veranderd naar: ${currentYear}`);
        loadWeekPlanning();
    }
}

// Helper functie: ga N werkdagen terug (skip weekend)
function skipWeekendDaysBackward(startDate, days) {
    const result = new Date(startDate);
    let daysRemaining = days;
    
    while (daysRemaining > 0) {
        result.setDate(result.getDate() - 1);
        const dayOfWeek = result.getDay();
        // Skip zaterdag (6) en zondag (0) - alleen werkdagen tellen
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysRemaining--;
        }
    }
    
    return result;
}

// Helper functie: ga N werkdagen vooruit (skip weekend)
function skipWeekendDaysForward(startDate, days) {
    const result = new Date(startDate);
    let daysRemaining = days;
    
    while (daysRemaining > 0) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        // Skip zaterdag (6) en zondag (0) - alleen werkdagen tellen
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysRemaining--;
        }
    }
    
    return result;
}

// Toon project details modal vanuit balk
function showProjectDetailsFromBar(element) {
    const ordernummer = element.getAttribute('data-ordernummer');
    const bewerking = element.getAttribute('data-bewerking');
    const uren = parseFloat(element.getAttribute('data-uren'));
    const orderJson = element.getAttribute('data-order');
    
    try {
        const order = JSON.parse(orderJson.replace(/&#39;/g, "'"));
        showProjectDetails(ordernummer, order, bewerking, uren);
    } catch (e) {
        console.error('Fout bij parsen order data:', e);
        if (typeof showError === 'function') {
            showError('Fout bij laden project details', 'Project Details');
        } else {
            alert('Fout bij laden project details');
        }
    }
}

// Toon project details modal
function showProjectDetails(ordernummer, order, bewerking, uren) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('Modal elementen niet gevonden');
        return;
    }
    
    modalTitle.textContent = `${ordernummer} - ${bewerking}`;
    
    // Opmerkingen per fase verzamelen
    const opmerkingenVoorbereiding = order.voorbereiding_opmerkingen || order.opmerkingen || '';
    const opmerkingenProductie = order.productie_opmerkingen || order.opmerkingen || '';
    const opmerkingenConservering = order.conservering_opmerkingen || order.opmerkingen || '';
    const opmerkingenMontage = order.montage_opmerkingen || order.opmerkingen || '';
    
    // Conserveringen lijst
    const conserveringen = order.conserveringen && Array.isArray(order.conserveringen) 
        ? order.conserveringen.join(', ') 
        : (order.conserveringen || 'Geen');
    
    let html = `
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Basis Informatie</h3>
            <p><strong>Project:</strong> ${ordernummer}</p>
            <p><strong>Klant:</strong> ${order.klant || 'Onbekend'}</p>
            <p><strong>Omschrijving:</strong> ${order.omschrijving || 'Geen'}</p>
            <p><strong>Bewerking:</strong> ${bewerking}</p>
            <p><strong>Uren:</strong> ${uren.toFixed(1)}u</p>
        </div>
        
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Datums</h3>
            <p><strong>Leverdatum:</strong> ${order.leverdatum ? new Date(order.leverdatum).toLocaleDateString('nl-NL') : 'Niet ingevuld'}</p>
            <p><strong>Conserveringsdatum:</strong> ${order.conserveringsdatum ? new Date(order.conserveringsdatum).toLocaleDateString('nl-NL') : 'Niet ingevuld'}</p>
            ${order.uiterste_leverdatum_materiaal ? `<p><strong>Uiterste leverdatum materiaal:</strong> ${new Date(order.uiterste_leverdatum_materiaal).toLocaleDateString('nl-NL')}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Conservering</h3>
            <p><strong>Conserveringen:</strong> ${conserveringen}</p>
            ${order.conservering_doorlooptijd ? `<p><strong>Doorlooptijd:</strong> ${order.conservering_doorlooptijd} dagen</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Opmerkingen per Fase</h3>
            ${bewerking.toLowerCase().includes('voorbereiding') || bewerking.toLowerCase() === 'voorbereiden' ? `
                <p><strong>Voorbereiding:</strong> ${opmerkingenVoorbereiding || 'Geen opmerkingen'}</p>
            ` : ''}
            ${(bewerking.toLowerCase().includes('samenstellen') || bewerking.toLowerCase() === 'samenstellen' || bewerking.toLowerCase().includes('aflassen') || bewerking.toLowerCase() === 'aflassen') ? (
                opmerkingenProductie && opmerkingenProductie.trim() && opmerkingenProductie !== (order.opmerkingen || '') ? 
                    `<p><strong>Productie:</strong> ${opmerkingenProductie}</p>` : ''
            ) : ''}
            ${bewerking.toLowerCase().includes('montage') || bewerking.toLowerCase() === 'montage' ? `
                <p><strong>Montage:</strong> ${opmerkingenMontage || 'Geen opmerkingen'}</p>
            ` : ''}
            ${order.opmerkingen ? `<p><strong>Algemene opmerkingen:</strong> ${order.opmerkingen}</p>` : ''}
        </div>
        
        ${order.materiaal_opmerkingen ? `
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Materiaal Opmerkingen</h3>
            <p>${order.materiaal_opmerkingen}</p>
        </div>
        ` : ''}
    `;
    
    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

// Sluit project details modal
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Sluit modal bij klik buiten modal
window.addEventListener('click', function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeProjectModal();
    }
});

// Maak functies globaal beschikbaar
window.changeViewMode = changeViewMode;
window.previousPeriod = previousPeriod;
window.nextPeriod = nextPeriod;
window.setCurrentWeek = setCurrentWeek;
window.loadWeekPlanning = loadWeekPlanning;
window.showProjectDetailsFromBar = showProjectDetailsFromBar;
window.closeProjectModal = closeProjectModal;
window.handleWeekChange = handleWeekChange;
window.handleYearChange = handleYearChange;

// Lazy loading: laad extra weken bij scrollen
function handlePlanningScroll(event) {
    if (isLoadingWeeks) return;
    
    const container = event.target;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    // Check of gebruiker naar rechts scrollt (90% van breedte)
    if (scrollLeft + clientWidth >= scrollWidth * 0.85) {
        // Laad volgende weken
        isLoadingWeeks = true;
        numWeeks = Math.min(numWeeks + 2, 52); // Max 52 weken (1 jaar)
        loadWeekPlanning();
    } else if (scrollLeft <= scrollWidth * 0.15 && currentWeek > 1) {
        // Laad vorige weken (alleen als we niet al bij week 1 zijn)
        isLoadingWeeks = true;
        if (currentWeek > 2) {
            currentWeek = Math.max(1, currentWeek - 2);
        }
        numWeeks = Math.min(numWeeks + 2, 52);
        loadWeekPlanning();
    }
}

// Maak functies globaal beschikbaar voor inline event handlers
window.changeViewMode = changeViewMode;
window.previousPeriod = previousPeriod;
window.nextPeriod = nextPeriod;
window.setCurrentWeek = setCurrentWeek;
window.showProjectDetailsFromBar = showProjectDetailsFromBar;
window.closeProjectModal = closeProjectModal;
