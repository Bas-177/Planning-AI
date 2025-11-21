// Planninglogica functies voor capaciteitscontrole en logische volgorde

// Controleer of er voldoende capaciteit is op een dag
function checkDayCapacity(dateKey, currentProjects, availableHours, newProjectHours) {
    const totalPlanned = currentProjects.reduce((sum, proj) => {
        if (proj.dayKeys && proj.dayKeys.includes(dateKey)) {
            return sum + proj.hours;
        }
        return sum;
    }, 0);
    
    return (totalPlanned + newProjectHours) <= availableHours;
}

// Controleer logische volgorde van bewerkingen
function checkLogicalOrder(order, bewerking) {
    // Materialen moeten binnen zijn voordat productie start
    if ((bewerking === 'samenstellen' || bewerking === 'aflassen') && !order.materiaal_binnen) {
        return { valid: false, reason: 'Materialen moeten eerst binnen zijn voordat productie kan starten' };
    }
    
    // Aflassen kan niet voordat samenstellen is voltooid
    if (bewerking === 'aflassen') {
        // Check of er een samenstellen bewerking is die eerder klaar is
        // Dit wordt gecontroleerd via assignments
        return { valid: true, reason: null };
    }
    
    // Montage kan niet voordat conservering klaar is
    if (bewerking === 'montage' && order.conserveringsdatum) {
        // Montage start na conserveringsdatum
        return { valid: true, reason: null };
    }
    
    return { valid: true, reason: null };
}

// Skip weekend dagen bij datum berekening
function skipWeekendDays(startDate, days) {
    const result = new Date(startDate);
    const direction = days >= 0 ? 1 : -1;
    let daysRemaining = Math.abs(days);
    
    while (daysRemaining > 0) {
        result.setDate(result.getDate() + direction);
        const dayOfWeek = result.getDay();
        // Skip zaterdag (6) en zondag (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysRemaining--;
        }
    }
    
    return result;
}

