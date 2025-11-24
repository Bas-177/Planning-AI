// Automatische planning logica - intelligente planning op basis van leverdatum
// Zorgt ervoor dat ALLE projecten met leverdatum automatisch gepland worden

/**
 * Genereer automatische assignments voor alle orders met leverdatum
 * Dit zorgt ervoor dat alle projecten in de planning komen
 */
async function generateAutomaticAssignments(orders, medewerkers) {
    try {
        // Haal alle bestaande assignments op
        const response = await fetch('/api/order-assignments');
        if (!response.ok) {
            console.error('Fout bij ophalen assignments:', response.status);
            return 0; // Fout bij ophalen assignments
        }
        
        const existingAssignments = await response.json() || [];
        const existingKeys = new Set(
            existingAssignments.map(a => `${a.ordernummer}-${a.medewerker}-${a.bewerking}`.toLowerCase().trim())
        );
        
        const newAssignments = [];
        
        // Filter actieve medewerkers
        const actieveMedewerkers = medewerkers.filter(m => m.actief !== false && m.actief !== 'false');
        if (actieveMedewerkers.length === 0) {
            console.warn('Geen actieve medewerkers gevonden voor automatische assignment generatie');
            return 0;
        }
        
        // Voor elke order met leverdatum OF productie uren
        for (const order of orders) {
            // Skip orders zonder leverdatum EN zonder productie uren
            const heeftLeverdatum = order.leverdatum;
            const heeftProductieUren = (order.uren_samenstellen && parseFloat(order.uren_samenstellen) > 0) ||
                                       (order.uren_aflassen && parseFloat(order.uren_aflassen) > 0) ||
                                       (order.uren_voorbereiding && parseFloat(order.uren_voorbereiding) > 0) ||
                                       (order.heeft_montage === true || order.heeft_montage === 'true' || order.heeft_montage === 1);
            
            if (!heeftLeverdatum && !heeftProductieUren) continue; // Skip orders zonder leverdatum EN zonder productie uren
            
            // Bepaal welke bewerkingen deze order heeft
            const bewerkingen = [];
            
            // Voorbereiding
            if (order.uren_voorbereiding && parseFloat(order.uren_voorbereiding) > 0) {
                bewerkingen.push({
                    bewerking: 'Voorbereiding',
                    uren: parseFloat(order.uren_voorbereiding)
                });
            }
            
            // Samenstellen
            if (order.uren_samenstellen && parseFloat(order.uren_samenstellen) > 0) {
                bewerkingen.push({
                    bewerking: 'Samenstellen',
                    uren: parseFloat(order.uren_samenstellen)
                });
            }
            
            // Aflassen
            if (order.uren_aflassen && parseFloat(order.uren_aflassen) > 0) {
                bewerkingen.push({
                    bewerking: 'Aflassen',
                    uren: parseFloat(order.uren_aflassen)
                });
            }
            
            // Montage
            if (order.heeft_montage) {
                // Schat uren voor montage (of gebruik gegeven uren)
                bewerkingen.push({
                    bewerking: 'Montage',
                    uren: order.montage_uren || 8 // Standaard 8 uren
                });
            }
            
            // Voor elke bewerking: verdeel over medewerkers
            for (const bewerking of bewerkingen) {
                // Vind medewerkers die deze bewerking kunnen doen (check competenties)
                const bewerkingLower = bewerking.bewerking.toLowerCase();
                const geschikteMedewerkers = medewerkers.filter(m => {
                    if (!m.actief) return false;
                    
                    // Check competenties op basis van bewerking
                    if (bewerkingLower.includes('voorbereiding') || bewerkingLower.includes('voorbereiden')) {
                        return m.kan_voorbereiden === true || m.kan_voorbereiden === 'true' || m.kan_voorbereiden === 1;
                    } else if (bewerkingLower.includes('samenstellen')) {
                        return m.kan_samenstellen === true || m.kan_samenstellen === 'true' || m.kan_samenstellen === 1;
                    } else if (bewerkingLower.includes('aflassen')) {
                        return m.kan_aflassen === true || m.kan_aflassen === 'true' || m.kan_aflassen === 1;
                    } else if (bewerkingLower.includes('montage')) {
                        return m.kan_montage === true || m.kan_montage === 'true' || m.kan_montage === 1;
                    }
                    
                    // Fallback: als geen specifieke competentie check, toestaan
                    return true;
                });
                
                if (geschikteMedewerkers.length === 0) continue;
                
                // Verdeel uren over medewerkers (voor nu: kies de eerste met minste werk)
                // In de toekomst: intelligentere verdeling
                // Kies medewerker met minste bestaande assignments voor deze bewerking
                let minAssignments = Infinity;
                let selectedMedewerker = geschikteMedewerkers[0];
                
                for (const m of geschikteMedewerkers) {
                    const aantalAssignments = existingAssignments.filter(a => 
                        a.medewerker === m.naam && 
                        a.bewerking && a.bewerking.toLowerCase().includes(bewerking.bewerking.toLowerCase())
                    ).length;
                    
                    if (aantalAssignments < minAssignments) {
                        minAssignments = aantalAssignments;
                        selectedMedewerker = m;
                    }
                }
                
                const medewerker = selectedMedewerker;
                const key = `${order.ordernummer}-${medewerker.naam}-${bewerking.bewerking}`.toLowerCase().trim();
                
                // Check of assignment al bestaat
                if (!existingKeys.has(key)) {
                    newAssignments.push({
                        ordernummer: order.ordernummer,
                        medewerker: medewerker.naam,
                        bewerking: bewerking.bewerking,
                        uren: bewerking.uren,
                        start_datum: null, // Wordt automatisch berekend
                        eind_datum: null,  // Wordt automatisch berekend
                        week_nummer: null, // Wordt automatisch berekend
                        jaar: null         // Wordt automatisch berekend
                    });
                    existingKeys.add(key); // Voeg toe om duplicaten te voorkomen
                }
            }
        }
        
        // Voeg nieuwe assignments toe
        for (const assignment of newAssignments) {
            try {
                await fetch('/api/order-assignments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(assignment)
                });
            } catch (e) {
                console.error(`Fout bij toevoegen assignment voor ${assignment.ordernummer}:`, e);
            }
        }
        
        if (newAssignments.length > 0) {
            console.log(`${newAssignments.length} automatische assignments gegenereerd`);
        }
        
        return newAssignments.length;
    } catch (error) {
        console.error('Fout bij genereren automatische assignments:', error);
        return 0;
    }
}

/**
 * Bereken automatische datums voor assignments zonder datums
 */
function calculateAutomaticDates(assignment, order, medewerker, otherAssignments) {
    if (!order.leverdatum) return null;
    
    const leverdatum = new Date(order.leverdatum);
    leverdatum.setHours(0, 0, 0, 0);
    
    // Bepaal beschikbare uren per dag voor deze medewerker
    const urenPerDag = getAverageHoursPerDay(medewerker);
    const benodigdeDagen = Math.ceil(assignment.uren / urenPerDag);
    
    // Bepaal eind datum op basis van leverdatum en bewerking
    let eindDatum = null;
    let ruimteTotLeverdatum = 1;
    
    const bewerking = assignment.bewerking.toLowerCase();
    
    // Voorbereiding kan vroegst starten
    if (bewerking.includes('voorbereiding')) {
        // Voorbereiding start zo vroeg mogelijk, maar na materiaal datum
        const materiaalDatum = order.uiterste_leverdatum_materiaal 
            ? new Date(order.uiterste_leverdatum_materiaal) 
            : new Date(); // Vandaag als geen materiaal datum
        
        // Reken terug vanaf leverdatum
        const heeftConservering = order.conserveringen && Array.isArray(order.conserveringen) && order.conserveringen.length > 0;
        const heeftConserveringsdatum = order.conserveringsdatum ? true : false;
        
        if (heeftConserveringsdatum && order.conserveringsdatum) {
            // Voorbereiding moet voor conservering klaar zijn
            const conserveringDatum = new Date(order.conserveringsdatum);
            ruimteTotLeverdatum = order.conservering_doorlooptijd || 5;
            eindDatum = skipWeekendDaysBackward(conserveringDatum, ruimteTotLeverdatum + (order.heeft_montage ? 1 : 0));
        } else {
            // Geen conservering - ruimte tot leverdatum
            ruimteTotLeverdatum = order.heeft_montage ? 2 : 1;
            eindDatum = skipWeekendDaysBackward(leverdatum, ruimteTotLeverdatum);
        }
        
        // Start datum = eind datum - benodigde dagen
        const startDatum = skipWeekendDaysBackward(eindDatum, benodigdeDagen - 1);
        
        // Start niet eerder dan materiaal datum
        if (startDatum < materiaalDatum) {
            eindDatum = skipWeekendDays(materiaalDatum, benodigdeDagen - 1);
            return {
                start_datum: materiaalDatum.toISOString().split('T')[0],
                eind_datum: eindDatum.toISOString().split('T')[0]
            };
        }
        
        return {
            start_datum: startDatum.toISOString().split('T')[0],
            eind_datum: eindDatum.toISOString().split('T')[0]
        };
    }
    
    // Productie (samenstellen/aflassen) - moet na materiaal binnen zijn
    if (bewerking.includes('samenstellen') || bewerking.includes('aflassen')) {
        const materiaalDatum = order.uiterste_leverdatum_materiaal 
            ? new Date(order.uiterste_leverdatum_materiaal) 
            : new Date();
        
        const heeftConservering = order.conserveringen && Array.isArray(order.conserveringen) && order.conserveringen.length > 0;
        const heeftConserveringsdatum = order.conserveringsdatum ? true : false;
        
        if (heeftConserveringsdatum && order.conserveringsdatum) {
            const conserveringDatum = new Date(order.conserveringsdatum);
            ruimteTotLeverdatum = order.conservering_doorlooptijd || 5;
            eindDatum = skipWeekendDaysBackward(conserveringDatum, ruimteTotLeverdatum + (order.heeft_montage ? 1 : 0));
        } else {
            ruimteTotLeverdatum = order.heeft_montage ? 2 : 1;
            eindDatum = skipWeekendDaysBackward(leverdatum, ruimteTotLeverdatum);
        }
        
        // Aflassen moet na samenstellen (als samenstellen bestaat)
        if (bewerking.includes('aflassen')) {
            const samenstellenAssignment = otherAssignments.find(a => 
                a.ordernummer === assignment.ordernummer && 
                a.medewerker === assignment.medewerker &&
                a.bewerking && a.bewerking.toLowerCase().includes('samenstellen')
            );
            
            if (samenstellenAssignment && samenstellenAssignment.eind_datum) {
                // Aflassen start na samenstellen
                const samenstellenEind = new Date(samenstellenAssignment.eind_datum);
                const minStart = skipWeekendDays(samenstellenEind, 1);
                
                if (minStart > eindDatum) {
                    eindDatum = skipWeekendDays(minStart, benodigdeDagen - 1);
                }
                
                return {
                    start_datum: minStart.toISOString().split('T')[0],
                    eind_datum: eindDatum.toISOString().split('T')[0]
                };
            }
        }
        
        const startDatum = skipWeekendDaysBackward(eindDatum, benodigdeDagen - 1);
        
        // Start niet eerder dan materiaal datum
        if (startDatum < materiaalDatum) {
            eindDatum = skipWeekendDays(materiaalDatum, benodigdeDagen - 1);
            return {
                start_datum: materiaalDatum.toISOString().split('T')[0],
                eind_datum: eindDatum.toISOString().split('T')[0]
            };
        }
        
        return {
            start_datum: startDatum.toISOString().split('T')[0],
            eind_datum: eindDatum.toISOString().split('T')[0]
        };
    }
    
    // Montage - na conservering of productie
    if (bewerking.includes('montage')) {
        const heeftConservering = order.conserveringen && Array.isArray(order.conserveringen) && order.conserveringen.length > 0;
        const heeftConserveringsdatum = order.conserveringsdatum ? true : false;
        
        let montageStart = null;
        
        if (heeftConserveringsdatum && order.conserveringsdatum) {
            const conserveringDatum = new Date(order.conserveringsdatum);
            montageStart = skipWeekendDays(conserveringDatum, 1);
        } else {
            // Zoek productie eind datum
            const productieAssignments = otherAssignments.filter(a => 
                a.ordernummer === assignment.ordernummer &&
                (a.bewerking && (a.bewerking.toLowerCase().includes('samenstellen') || a.bewerking.toLowerCase().includes('aflassen')))
            );
            
            if (productieAssignments.length > 0) {
                const productieEind = new Date(Math.max(...productieAssignments
                    .filter(a => a.eind_datum)
                    .map(a => new Date(a.eind_datum).getTime())
                ));
                montageStart = skipWeekendDays(productieEind, 1);
            } else {
                montageStart = skipWeekendDaysBackward(leverdatum, 1);
            }
        }
        
        const eindDatum = leverdatum;
        
        return {
            start_datum: montageStart.toISOString().split('T')[0],
            eind_datum: eindDatum.toISOString().split('T')[0]
        };
    }
    
    return null;
}

/**
 * Helper functie: Skip weekend dagen vooruit
 */
function skipWeekendDays(date, days) {
    let current = new Date(date);
    let added = 0;
    
    while (added < days) {
        current.setDate(current.getDate() + 1);
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip zondag en zaterdag
            added++;
        }
    }
    
    return current;
}

/**
 * Helper functie: Skip weekend dagen achteruit
 */
function skipWeekendDaysBackward(date, days) {
    let current = new Date(date);
    let subtracted = 0;
    
    while (subtracted < days) {
        current.setDate(current.getDate() - 1);
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip zondag en zaterdag
            subtracted++;
        }
    }
    
    return current;
}

/**
 * Helper functie: Gemiddelde uren per dag voor medewerker
 */
function getAverageHoursPerDay(medewerker) {
    const totaal = (medewerker.standaard_uren_ma || 0) +
                   (medewerker.standaard_uren_di || 0) +
                   (medewerker.standaard_uren_wo || 0) +
                   (medewerker.standaard_uren_do || 0) +
                   (medewerker.standaard_uren_vr || 0) +
                   (medewerker.standaard_uren_za || 0);
    
    const werkdagen = [
        medewerker.standaard_uren_ma,
        medewerker.standaard_uren_di,
        medewerker.standaard_uren_wo,
        medewerker.standaard_uren_do,
        medewerker.standaard_uren_vr,
        medewerker.standaard_uren_za
    ].filter(h => h && h > 0).length;
    
    if (werkdagen === 0) return 8; // Fallback
    
    return totaal / werkdagen;
}

// Export functies
window.generateAutomaticAssignments = generateAutomaticAssignments;
window.calculateAutomaticDates = calculateAutomaticDates;
window.skipWeekendDays = skipWeekendDays;
window.skipWeekendDaysBackward = skipWeekendDaysBackward;
window.getAverageHoursPerDay = getAverageHoursPerDay;

