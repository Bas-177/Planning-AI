// Utility functies voor error handling, loading states en user feedback
// Centrale plek voor alle helper functies

/**
 * Toon een elegante error message in plaats van alert
 */
function showError(message, title = 'Fout') {
    // Verwijder bestaande error messages
    removeNotifications();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification notification-error';
    errorDiv.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Auto-verwijder na 5 seconden
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

/**
 * Toon een success message
 */
function showSuccess(message, title = 'Succes') {
    removeNotifications('notification-success');
    
    const successDiv = document.createElement('div');
    successDiv.className = 'notification notification-success';
    successDiv.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.insertBefore(successDiv, document.body.firstChild);
    
    // Auto-verwijder na 3 seconden
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 3000);
}

/**
 * Toon een info message
 */
function showInfo(message, title = 'Info') {
    removeNotifications('notification-info');
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'notification notification-info';
    infoDiv.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.insertBefore(infoDiv, document.body.firstChild);
    
    // Auto-verwijder na 4 seconden
    setTimeout(() => {
        if (infoDiv.parentElement) {
            infoDiv.remove();
        }
    }, 4000);
}

/**
 * Verwijder alle notificaties (of alleen een bepaald type)
 */
function removeNotifications(type = null) {
    const notifications = document.querySelectorAll('.notification' + (type ? `.${type}` : ''));
    notifications.forEach(n => n.remove());
}

/**
 * Toon loading spinner
 */
function showLoading(element = null, message = 'Laden...') {
    const targetElement = element || document.body;
    
    // Verwijder bestaande loading
    const existingLoading = targetElement.querySelector('.loading-overlay');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    targetElement.appendChild(loadingDiv);
    return loadingDiv;
}

/**
 * Verwijder loading spinner
 */
function hideLoading(element = null) {
    const targetElement = element || document.body;
    const loading = targetElement.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

/**
 * Veilige API call met error handling
 */
async function safeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        // Check of response OK is
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            // Probeer error details te krijgen
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } else {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText.length > 200 
                            ? errorText.substring(0, 200) + '...' 
                            : errorText;
                    }
                }
            } catch (e) {
                // Als we error niet kunnen parsen, gebruik default message
                console.warn('Kon error response niet parsen:', e);
            }
            
            throw new Error(errorMessage);
        }
        
        // Parse JSON response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
        
    } catch (error) {
        console.error('API call error:', error);
        
        // Check voor netwerk errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Geen verbinding met server. Controleer of de server draait.');
        }
        
        throw error;
    }
}

/**
 * Veilige parse van JSON met fallback
 */
function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('JSON parse error:', e);
        return fallback;
    }
}

/**
 * Formatteer datum naar Nederlandse notatie
 */
function formatDate(date, includeTime = false) {
    if (!date) return '-';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString('nl-NL', options);
    } catch (e) {
        console.warn('Date format error:', e);
        return '-';
    }
}

/**
 * Formatteer getal naar Nederlandse notatie
 */
function formatNumber(number, decimals = 1) {
    if (number === null || number === undefined || isNaN(number)) return '0';
    return parseFloat(number).toLocaleString('nl-NL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Debounce functie voor performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle functie voor performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check of een waarde bestaat en niet leeg is
 */
function exists(value) {
    return value !== null && value !== undefined && value !== '';
}

/**
 * Veilige get van object property
 */
function safeGet(obj, path, defaultValue = null) {
    try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result === null || result === undefined) {
                return defaultValue;
            }
            result = result[key];
        }
        return result !== undefined && result !== null ? result : defaultValue;
    } catch (e) {
        console.warn('Safe get error:', e);
        return defaultValue;
    }
}

