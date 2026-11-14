/**
 * @file src/ui/weather-widget.ui.js
 * @description Виджет погоды и совета по одежде.
 */
import { getWeather, getWeatherSVG, getClothingAdvice } from '../api/weather.api.js';

export async function loadWeatherWidget(provider) {
    const widget = document.getElementById('weather-content');
    const adviceWidget = document.getElementById('clothing-advice');
    if (!widget) return;
    
    widget.innerHTML = '<span style="opacity:0.5;">Загрузка...</span>';
    const data = await getWeather(provider);
    
    if (data) {
        const icon = getWeatherSVG(data.condition);
        widget.innerHTML = `
            ${icon}
            <span style="font-weight:bold; font-size: 16px;">${data.temp}°C</span>
            <span style="color: var(--text-muted); font-size: 12px;">ветер ${data.wind} м/с</span>
        `;
        adviceWidget.textContent = `👕 ${getClothingAdvice(data.temp)}`;
    } else {
        widget.innerHTML = '<span style="color: var(--text-muted);">Погода недоступна</span>';
        adviceWidget.textContent = '';
    }
}