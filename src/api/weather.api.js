/**
 * @file src/api/weather.api.js
 * @description Запросы к погодным API + SVG иконки.
 * Использует прокси cors.dev для обхода CORS и работы без VPN.
 */

const VOLGOGRAD_LAT = 48.7194;
const VOLGOGRAD_LON = 44.5018;

async function fetchWithProxy(url) {
    // Основной запрос через cors.dev
    try {
        const proxyUrl = `https://proxy.cors.dev/${url}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Ошибка прокси: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.warn('[Погода] cors.dev не ответил, пробуем напрямую (вдруг есть VPN)...', error);
        // Резервный вариант — прямой запрос (сработает только с VPN)
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Ошибка прямого запроса: ${res.status}`);
        return await res.json();
    }
}

export async function getWeather(provider = 'open-meteo') {
    try {
        if (provider === 'open-meteo') {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${VOLGOGRAD_LAT}&longitude=${VOLGOGRAD_LON}&current_weather=true&timezone=Europe%2FVolgograd`;
            const data = await fetchWithProxy(url);
            
            return {
                temp: Math.round(data.current_weather.temperature),
                condition: data.current_weather.weathercode,
                wind: Math.round(data.current_weather.windspeed),
            };
        } 
        
        if (provider === 'wttr.in') {
            const url = `https://wttr.in/Volgograd?format=j1`;
            const data = await fetchWithProxy(url);
            
            const current = data.current_condition[0];
            return {
                temp: parseInt(current.temp_C),
                condition: current.weatherDesc[0].value,
                wind: parseInt(current.windspeedKmph),
            };
        }
    } catch (error) {
        console.error('Ошибка загрузки погоды:', error);
        return null;
    }
}

// SVG иконки для погоды
export function getWeatherSVG(code) {
    if (code === 0) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    if ((typeof code === 'number' && code >= 1 && code <= 3) || String(code).toLowerCase().includes('cloud')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
    if ((typeof code === 'number' && code >= 51 && code <= 67) || String(code).toLowerCase().includes('rain')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>`;
    if ((typeof code === 'number' && code >= 71 && code <= 77) || String(code).toLowerCase().includes('snow')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"><path d="M20 17.5A4.5 4.5 0 0 0 17.5 9h-1.8A7 7 0 1 0 4 15.9"></path><path d="M8 16v6"></path><path d="M16 16v6"></path><path d="M12 19v3"></path></svg>`;
    if ((typeof code === 'number' && code >= 95) || String(code).toLowerCase().includes('thunder')) return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>`;
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
}

export function getClothingAdvice(temp) {
    if (temp > 25) {
        const arr = ["Футболка и шорты", "Легкая одежда", "Солнцезащитные очки", "Панама не помешает"];
        return arr[Math.floor(Math.random() * arr.length)];
    } else if (temp > 15) {
        const arr = ["Ветровка и джинсы", "Легкая кофта", "Кроссовки и худи"];
        return arr[Math.floor(Math.random() * arr.length)];
    } else if (temp > 5) {
        const arr = ["Куртка и джинсы", "Пальто и шарф", "Теплые ботинки"];
        return arr[Math.floor(Math.random() * arr.length)];
    } else {
        const arr = ["Пуховик и шапка", "Теплая куртка", "Шарф и перчатки", "Одевайся теплее!"];
        return arr[Math.floor(Math.random() * arr.length)];
    }
}