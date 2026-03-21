// ========================
//  THE ORBIT WEATHER FORECAST
//  Uses OpenWeatherMap API
//  Global city search + 7‑day forecast
// ========================

// ------------------------------
// ⚠️ REPLACE WITH YOUR API KEY ⚠️
const API_KEY = '983678ab75150983c250ad53102f2c11';
// ------------------------------

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const selectedCityDisplay = document.getElementById('selectedCityDisplay');
const forecastContainer = document.getElementById('forecastCardsContainer');

// Live timer
function updateTimer() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('liveTimer').innerText = timeStr;
}
updateTimer();
setInterval(updateTimer, 1000);

// Helper: format date to "Sat Mar 04" style
function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
}

// 1. Get coordinates from city name (OpenWeatherMap Geocoding)
async function getCoordinates(cityName) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;
    const response = await fetch(geoUrl);
    if (!response.ok) throw new Error('Geocoding service error');
    const data = await response.json();
    if (!data.length) throw new Error(`City "${cityName}" not found.`);
    const { lat, lon, name, country } = data[0];
    return { lat, lon, displayName: `${name}, ${country}` };
}

// 2. Get 7‑day daily forecast (One Call API 3.0)
async function getForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${API_KEY}`;
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error('Forecast service error');
    const data = await response.json();
    if (!data.daily || data.daily.length === 0) throw new Error('No forecast data available');
    // Return only the first 7 days (OneCall returns up to 7 or 8)
    return data.daily.slice(0, 7);
}

// Render forecast cards
function renderForecast(dailyData, cityName) {
    selectedCityDisplay.textContent = cityName;

    let cardsHtml = '<div class="cards-grid">';
    for (let i = 0; i < dailyData.length; i++) {
        const day = dailyData[i];
        const date = new Date(day.dt * 1000);
        const dayName = formatDate(date);
        const maxTemp = Math.round(day.temp.max);
        const minTemp = Math.round(day.temp.min);

        cardsHtml += `
            <div class="forecast-card">
                <div class="weekday">${dayName}</div>
                <div class="temp-max">${maxTemp}<span>°C</span></div>
                <div class="temp-min">↓ ${minTemp}<span>°C</span></div>
            </div>
        `;
    }
    cardsHtml += '</div>';
    forecastContainer.innerHTML = cardsHtml;
}

// Show loading state
function showLoading() {
    forecastContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div> Fetching forecast...
        </div>
    `;
    selectedCityDisplay.textContent = '—';
}

// Show error message
function showError(message) {
    forecastContainer.innerHTML = `
        <div class="error-message">
            ⚠️ ${message}<br>
            <small>Try a different city name (e.g., London, Berlin, Tokyo).</small>
        </div>
    `;
    selectedCityDisplay.textContent = '—';
}

// Main search function
async function searchCityAndForecast() {
    const rawCity = cityInput.value.trim();
    if (!rawCity) {
        showError('Please enter a city name.');
        return;
    }

    showLoading();

    try {
        // Step 1: Get coordinates
        const { lat, lon, displayName } = await getCoordinates(rawCity);
        // Step 2: Get 7‑day forecast
        const dailyForecast = await getForecast(lat, lon);
        // Step 3: Render
        renderForecast(dailyForecast, displayName);
    } catch (err) {
        console.error(err);
        showError(err.message || 'Failed to fetch weather data. Check your API key or network.');
    }
}

// Event listeners
searchBtn.addEventListener('click', searchCityAndForecast);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCityAndForecast();
});

// Optional default city on load
window.addEventListener('load', () => {
    cityInput.value = 'London';
    searchCityAndForecast();
});
