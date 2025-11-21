// JavaScript voor Projectplanning - Alle projecten onder elkaar met Gantt balken
const API_BASE = '/api';

let startDate = null;
let endDate = null;
let timelineDays = [];

// Laad planning bij pagina load
document.addEventListener('DOMContentLoaded', function() {
    setCurrentPeriod();
    loadProjectPlanning();
});

// Stel huidige periode in (start vanaf eerste order, eind tot laatste order + buffer)
function setCurrentPeriod() {
    const today = new Date();
    
    // Bepaal automatisch periode op basis van alle orders
    fetch(`${API_BASE}/orders`)
        .then(r => r.json())
        .then(orders => {
            if (orders && orders.length > 0) {
                const leverdatums = orders
                    .filter(o => o.leverdatum)
                    .map(o => new Date(o.leverdatum));
                
                if (leverdatums.length > 0) {
                    const minDate = new Date(Math.min(...leverdatums));
                    const maxDate = new Date(Math.max(...leverdatums));
                    
                    startDate = new Date(minDate);
                    startDate.setDate(startDate.getDate() - 7); // 1 week voor eerste order
                    
                    endDate = new Date(maxDate);
                    endDate.setDate(endDate.getDate() + 7); // 1 week na laatste order
                } else {
                    // Fallback: gebruik huidige week + 4 weken
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 7);
                    endDate = new Date(today);
                    endDate.setDate(today.getDate() + 21);
                }
            } else {
                // Fallback: gebruik huidige week + 4 weken
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                endDate = new Date(today);
                endDate.setDate(today.getDate() + 21);
            }
            
            document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
            document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
            
            generateTimelineDays();
            loadProjectPlanning();
        })
        .catch(() => {
            // Fallback bij fout
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
            endDate.setDate(today.getDate() + 21);
            
            document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
            document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
            
            generateTimelineDays();
        });
}

// Genereer lijst van alle dagen in de timeline
function generateTimelineDays() {
    timelineDays = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
        const day = new Date(current);
        timelineDays.push(day);
        current.setDate(current.getDate() + 1);
    }
}

// Laad projectplanning
async function loadProjectPlanning() {
    startDate = new Date(document.getElementById('startDate').value);
    endDate = new Date(document.getElementById('endDate').value);
    
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setCurrentPeriod();
    }
    
    generateTimelineDays();
    
    try {
        const [ordersResponse, assignmentsResponse, standardsResponse] = await Promise.all([
            fetch(`${API_BASE}/orders`),
            fetch(`${API_BASE}/order-assignments`),
            fetch(`${API_BASE}/standards`)
        ]);
        
        if (!ordersResponse.ok || !assignmentsResponse.ok || !standardsResponse.ok) {
            throw new Error('Fout bij ophalen data');
        }
        
        const orders = await ordersResponse.json();
        const assignments = await assignmentsResponse.json();
        const standards = await standardsResponse.json();
        
        displayProjectPlanning(orders, assignments, standards);
    } catch (error) {
        console.error('Fout bij laden projectplanning:', error);
        alert('Fout bij laden projectplanning: ' + error.message);
    }
}

// Toon projectplanning
function displayProjectPlanning(orders, assignments, standards) {
    const body = document.getElementById('projectplanningBody');
    if (!body) return;
    
    // Filter orders met planning data
    const projectsWithPlanning = orders
        .filter(order => {
            // Filter op orders met leverdatum binnen de timeline
            if (!order.leverdatum) return false;
            const leverdatum = new Date(order.leverdatum);
            return leverdatum >= startDate && leverdatum <= endDate;
        })
        .sort((a, b) => {
            // Sorteer chronologisch op vroegste start datum (productie start)
            // Bereken productie start voor elk project
            const getProductieStart = (order) => {
                // Haal assignments op voor dit order
                const orderAssignments = assignments.filter(a => a.ordernummer === order.ordernummer);
                if (orderAssignments.length === 0) return new Date(order.leverdatum || 0);
                
                // Bepaal vroegste start datum
                const startDatums = orderAssignments
                    .filter(a => a.start_datum)
                    .map(a => new Date(a.start_datum));
                
                if (startDatums.length === 0) {
                    // Geen start datums - gebruik materiaal datum of vandaag
                    if (order.uiterste_leverdatum_materiaal) {
                        return new Date(order.uiterste_leverdatum_materiaal);
                    }
                    return new Date(); // Vandaag
                }
                
                return new Date(Math.min(...startDatums.map(d => d.getTime())));
            };
            
            const dateA = getProductieStart(a);
            const dateB = getProductieStart(b);
            return dateA - dateB;
        });
    
    // Maak timeline header
    const timelineHeader = `
        <div class="projectplanning-header">
            <div class="project-info">
                <div class="project-code-col">Projectnummer</div>
                <div class="project-omschrijving-col">Omschrijving</div>
                <div class="project-klant-col">Klant</div>
            </div>
            <div class="project-timeline" style="background: #2c3e50;">
                ${timelineDays.map(day => {
                    const dayOfWeek = day.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    // Format: dag/maand (korter formaat voor leesbaarheid)
                    const dayNum = day.getDate();
                    const monthNum = day.getMonth() + 1;
                    return `
                        <div class="timeline-day ${isWeekend ? 'weekend' : ''}" style="position: relative; min-width: 45px;">
                            <div class="timeline-day-header ${isWeekend ? 'weekend' : ''}" title="${day.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}">
                                ${dayNum}/${monthNum}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Maak project rijen
    const projectRows = projectsWithPlanning.map(order => {
        return createProjectRow(order, assignments, standards);
    }).join('');
    
    body.innerHTML = timelineHeader + projectRows;
}

// Helper: Skip weekend dagen bij datum berekening (ALLEEN werkdagen tellen)
// Als days=0, retourneert startDate (inclusief als het een werkdag is)
// Als days>0, telt het aantal WERKdagen vooruit vanaf startDate (startDate is dag 1)
function skipWeekendDays(startDate, days) {
    if (days === 0) {
        // Als startDate zelf een weekend is, ga naar volgende werkdag
        const dayOfWeek = startDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const result = new Date(startDate);
            while (result.getDay() === 0 || result.getDay() === 6) {
                result.setDate(result.getDate() + 1);
            }
            return result;
        }
        return new Date(startDate);
    }
    
    const result = new Date(startDate);
    const direction = days >= 0 ? 1 : -1;
    let daysRemaining = Math.abs(days);
    
    // Start datum is dag 0, dus als days=1, is het de volgende werkdag
    while (daysRemaining > 0) {
        result.setDate(result.getDate() + direction);
        const dayOfWeek = result.getDay();
        // Skip zaterdag (6) en zondag (0) - ALLEEN werkdagen tellen
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysRemaining--;
        }
    }
    
    // Zorg dat resultaat een werkdag is
    while (result.getDay() === 0 || result.getDay() === 6) {
        result.setDate(result.getDate() + direction);
    }
    
    return result;
}

// Maak project rij - NIEUWE LOGICA: 7 Stappen
function createProjectRow(order, assignments, standards) {
    // STAP 1: Materiaal binnen? - Check uiterste materiaal datum
    const leverdatum = new Date(order.leverdatum);
    const conserveringsdatum = order.conserveringsdatum ? new Date(order.conserveringsdatum) : null;
    const uitersteMateriaalDatum = order.uiterste_leverdatum_materiaal ? new Date(order.uiterste_leverdatum_materiaal) : null;
    const heeftMaterialenBinnen = order.materiaal_binnen === true || order.materiaal_binnen === 'true' || order.materiaal_binnen === 1;
    
    // Start datum: uiterste materiaal datum OF vandaag (als materialen al binnen zijn)
    let projectStart = new Date();
    if (uitersteMateriaalDatum && uitersteMateriaalDatum > projectStart) {
        projectStart = uitersteMateriaalDatum; // Materialen moeten eerst binnen zijn
    }
    if (!heeftMaterialenBinnen && !uitersteMateriaalDatum) {
        // Materialen nog niet binnen en geen datum opgegeven - gebruik vandaag + 1 dag
        projectStart = skipWeekendDays(new Date(), 1);
    }
    
    // Haal fase uren op uit assignments EN order (fallback naar order uren)
    let voorbereidingUren = assignments
        .filter(a => a.ordernummer === order.ordernummer && a.bewerking && a.bewerking.toLowerCase().includes('voorbereiding'))
        .reduce((sum, a) => sum + (a.uren || 0), 0);
    // Fallback naar order uren als geen assignment
    if (voorbereidingUren === 0 && order.uren_voorbereiding) {
        voorbereidingUren = parseFloat(order.uren_voorbereiding) || 0;
    }
    
    let samenstellenUren = assignments
        .filter(a => a.ordernummer === order.ordernummer && a.bewerking && a.bewerking.toLowerCase().includes('samenstellen'))
        .reduce((sum, a) => sum + (a.uren || 0), 0);
    // Fallback naar order uren als geen assignment
    if (samenstellenUren === 0 && order.uren_samenstellen) {
        samenstellenUren = parseFloat(order.uren_samenstellen) || 0;
    }
    
    let aflassenUren = assignments
        .filter(a => a.ordernummer === order.ordernummer && a.bewerking && a.bewerking.toLowerCase().includes('aflassen'))
        .reduce((sum, a) => sum + (a.uren || 0), 0);
    // Fallback naar order uren als geen assignment
    if (aflassenUren === 0 && order.uren_aflassen) {
        aflassenUren = parseFloat(order.uren_aflassen) || 0;
    }
    
    // Bereken gemiddelde dagelijkse uren (aanname: 8 uur per dag)
    const urenPerDag = 8;
    
    // STAP 2: Voorbereiding (als aanwezig)
    let voorbereidingStart = null;
    let voorbereidingEind = null;
    if (voorbereidingUren > 0) {
        voorbereidingStart = projectStart;
        const voorbereidingDagen = Math.ceil(voorbereidingUren / urenPerDag);
        voorbereidingEind = skipWeekendDays(voorbereidingStart, voorbereidingDagen - 1);
    }
    
    // STAP 3: Samenstellen (na voorbereiding, of direct na project start)
    let samenstellenStart = voorbereidingEind ? skipWeekendDays(voorbereidingEind, 1) : projectStart;
    let samenstellenEind = null;
    if (samenstellenUren > 0) {
        const samenstellenDagen = Math.ceil(samenstellenUren / urenPerDag);
        // Als dagen=1, is eind=start. Als dagen>1, tel dagen-1 werkdagen vooruit
        samenstellenEind = samenstellenDagen === 1 
            ? samenstellenStart 
            : skipWeekendDays(samenstellenStart, samenstellenDagen - 1);
    }
    
    // STAP 4: Aflassen (mag GELIJK lopen met samenstellen, maar NIET eerder beginnen)
    let aflassenStart = null;
    let aflassenEind = null;
    if (aflassenUren > 0) {
        // Aflassen kan starten zodra samenstellen start (mag gelijk lopen, niet eerder)
        aflassenStart = samenstellenStart;
        const aflassenDagen = Math.ceil(aflassenUren / urenPerDag);
        // Als dagen=1, is eind=start. Als dagen>1, tel dagen-1 werkdagen vooruit
        aflassenEind = aflassenDagen === 1 
            ? aflassenStart 
            : skipWeekendDays(aflassenStart, aflassenDagen - 1);
        
        // BELANGRIJKE LOGICA:
        // - Aflassen kan WEL langer duren dan samenstellen (als het meer uren heeft)
        // - Aflassen kan NOOIT eerder starten dan samenstellen (al gefixt: aflassenStart = samenstellenStart)
        // - Samenstellen kan NOOIT later klaar zijn dan aflassen (samenstellenEind <= aflassenEind)
        
        // Als samenstellen later klaar is dan aflassen, moet samenstellen eerder klaar zijn
        // (Samenstellen moet altijd klaar zijn voordat of tegelijk met aflassen)
        if (samenstellenEind && aflassenEind && samenstellenEind > aflassenEind) {
            // Samenstellen kan niet later klaar zijn dan aflassen
            // Zet samenstellen eind op aflassen eind (of eerder als nodig)
            samenstellenEind = aflassenEind;
            
            // Recalculate samenstellen start als nodig om binnen uren te blijven
            // Maar dit mag niet eerder zijn dan de oorspronkelijke start
            // Voor nu: gebruik gewoon aflassen eind als samenstellen eind
        }
    }
    
    // Bepaal productie eind (laatste van samenstellen/aflassen)
    let productieEind = new Date(Math.max(
        samenstellenEind ? samenstellenEind.getTime() : 0,
        aflassenEind ? aflassenEind.getTime() : 0
    ));
    if (productieEind.getTime() === 0) {
        productieEind = projectStart; // Fallback
    }
    
    // STAP 5: Conservering (na productie, doorlooptijd NOOIT weekend meetellen)
    // BELANGRIJK: Conservering mag NOOIT vóór samenstellen/aflassen komen!
    // ALLEEN TONEN ALS ER ECHT CONSERVERINGEN ZIJN AANGEVIKT (niet leeg/null)
    let conserveringDoorlooptijd = order.conservering_doorlooptijd;
    const heeftConserveringen = order.conserveringen && Array.isArray(order.conserveringen) && order.conserveringen.length > 0;
    
    if (!conserveringDoorlooptijd && heeftConserveringen) {
        const conservering = order.conserveringen[0];
        const standard = standards.find(s => s.nabehandeling === conservering);
        if (standard) {
            conserveringDoorlooptijd = standard.standaard_doorlooptijd_dagen;
        }
    }
    conserveringDoorlooptijd = conserveringDoorlooptijd || 5; // Default 5 WERKdagen
    
    let conserveringStart = null;
    let conserveringEind = null;
    // ALLEEN CONSERVERING TONEN ALS ER ECHT CONSERVERINGEN ZIJN AANGEVIKT (niet leeg/null)
    // EN er is een conserveringsdatum OF een doorlooptijd
    // BEIDE moeten aanwezig zijn: conserveringen array EN (conserveringsdatum OF doorlooptijd)
    if (heeftConserveringen && conserveringsdatum && conserveringDoorlooptijd > 0) {
        // Conservering start 1 werkdag na productie eind (NA samenstellen/aflassen)
        // ZORG DAT PRODUCTIE EIND EERST WORDT BEREKEND (hierboven al gedaan)
        conserveringStart = skipWeekendDays(productieEind, 1);
        
        // VALIDATIE: Conservering mag NOOIT vóór productie eind komen
        if (conserveringStart < productieEind) {
            conserveringStart = skipWeekendDays(productieEind, 1); // Forceer 1 dag NA productie eind
        }
        
        if (conserveringsdatum) {
            // Gebruik opgegeven conserveringsdatum (einddatum)
            // VALIDATIE: Conserveringsdatum mag niet vóór productie eind liggen
            if (conserveringsdatum < productieEind) {
                // Als conserveringsdatum vóór productie eind ligt, gebruik productie eind + doorlooptijd
                conserveringEind = skipWeekendDays(productieEind, conserveringDoorlooptijd);
            } else {
                conserveringEind = conserveringsdatum;
            }
        } else {
            // Gebruik doorlooptijd (WERKdagen - weekend wordt overgeslagen)
            conserveringEind = skipWeekendDays(conserveringStart, conserveringDoorlooptijd - 1);
        }
    }
    
    // STAP 6: Montage (na conservering, of direct na productie als geen conservering)
    let montageStart = null;
    let montageEind = null;
    if (order.heeft_montage) {
        // Montage start NA conservering (als conservering bestaat), anders NA productie
        if (conserveringEind) {
            montageStart = skipWeekendDays(conserveringEind, 1);
        } else if (productieEind && productieEind.getTime() > 0) {
            // Geen conservering, maar wel productie - montage start na productie
            montageStart = skipWeekendDays(productieEind, 1);
        } else {
            // Geen conservering, geen productie - montage start na voorbereiding of project start
            montageStart = voorbereidingEind ? skipWeekendDays(voorbereidingEind, 1) : skipWeekendDays(projectStart, 1);
        }
        montageEind = leverdatum; // Montage eindigt op leverdatum
    }
    
    // STAP 7: Uitlevering = leverdatum (milestone)
    
    // Bereken posities en span voor balken
    const dayWidth = 100 / timelineDays.length; // Percentage per dag
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    function getBarStyle(startDate, endDate, color) {
        const startIdx = timelineDays.findIndex(d => d >= startDate);
        const endIdx = timelineDays.findIndex(d => d > endDate);
        
        if (startIdx === -1) return 'display: none;'; // Niet in timeline
        
        const left = (startIdx / timelineDays.length) * 100;
        const span = endIdx === -1 
            ? ((timelineDays.length - startIdx) / timelineDays.length) * 100
            : ((endIdx - startIdx) / timelineDays.length) * 100;
        
        return `
            left: ${left}%;
            width: ${span}%;
            background: ${color};
        `;
    }
    
    return `
        <div class="projectplanning-row">
            <div class="project-info">
                <div class="project-code-col">${order.ordernummer}</div>
                <div class="project-omschrijving-col">${order.omschrijving || 'Geen omschrijving'}</div>
                <div class="project-klant-col">${order.klant || 'Onbekend'}</div>
            </div>
            <div class="project-timeline">
                ${voorbereidingStart && voorbereidingEind && voorbereidingStart <= voorbereidingEind ? `
                    <div class="project-bar voorbereiding" 
                         style="${getBarStyle(voorbereidingStart, voorbereidingEind, '#95a5a6')}"
                         title="Voorbereiding: ${voorbereidingStart.toLocaleDateString('nl-NL')} - ${voorbereidingEind.toLocaleDateString('nl-NL')}">
                        Voorbereiding
                    </div>
                ` : ''}
                ${((samenstellenStart && samenstellenEind && samenstellenStart <= samenstellenEind) || (aflassenStart && aflassenEind && aflassenStart <= aflassenEind) || (samenstellenUren > 0 || aflassenUren > 0)) ? `
                    <div class="project-bar productie" 
                         style="${getBarStyle(
                             // Productie start = vroegste van samenstellen of aflassen start, of projectStart als geen datums
                             (samenstellenStart && aflassenStart) 
                                 ? (samenstellenStart < aflassenStart ? samenstellenStart : aflassenStart)
                                 : (samenstellenStart || aflassenStart || productieStart),
                             // Productie eind = laatste van samenstellen of aflassen eind, of productieEind als geen datums
                             (samenstellenEind && aflassenEind) 
                                 ? (samenstellenEind > aflassenEind ? samenstellenEind : aflassenEind)
                                 : (samenstellenEind || aflassenEind || productieEind),
                             '#3498db'
                         )}"
                         title="Productie${samenstellenStart && samenstellenEind ? ' (Samenstellen: ' + samenstellenStart.toLocaleDateString('nl-NL') + ' - ' + samenstellenEind.toLocaleDateString('nl-NL') + ')' : ''}${aflassenStart && aflassenEind ? (samenstellenStart ? ' | Aflassen: ' : ' (Aflassen: ') + aflassenStart.toLocaleDateString('nl-NL') + ' - ' + aflassenEind.toLocaleDateString('nl-NL') + ')' : ''}">
                        Productie
                    </div>
                ` : ''}
                ${conserveringStart && conserveringEind && conserveringStart <= conserveringEind ? `
                    <div class="project-bar conservering" 
                         style="${getBarStyle(conserveringStart, conserveringEind, '#e67e22')}"
                         title="Conservering: ${conserveringStart.toLocaleDateString('nl-NL')} - ${conserveringEind.toLocaleDateString('nl-NL')} (${conserveringDoorlooptijd} werkdagen)">
                        Conservering
                    </div>
                ` : ''}
                ${montageStart && montageEind && montageStart <= montageEind ? `
                    <div class="project-bar montage" 
                         style="${getBarStyle(montageStart, montageEind, '#9b59b6')}"
                         title="Montage: ${montageStart.toLocaleDateString('nl-NL')} - ${montageEind.toLocaleDateString('nl-NL')}">
                        Montage
                    </div>
                ` : ''}
                ${conserveringsdatum ? `
                    <div class="milestone conservering" 
                         style="left: ${(timelineDays.findIndex(d => d >= conserveringsdatum) / timelineDays.length) * 100}%;"
                         title="Conserveringsdatum: ${conserveringsdatum.toLocaleDateString('nl-NL')}">
                    </div>
                ` : ''}
                <div class="milestone" 
                     style="left: ${(timelineDays.findIndex(d => d >= leverdatum) / timelineDays.length) * 100}%;"
                     title="Leverdatum: ${leverdatum.toLocaleDateString('nl-NL')}">
                </div>
            </div>
        </div>
    `;
}

// Navigatie
function previousPeriod() {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() - 1);
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    loadProjectPlanning();
}

function nextPeriod() {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() + 1);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    loadProjectPlanning();
}

