// ========================
//  THE ORBIT WEATHER FORECAST
//  Uses OpenWeatherMap 5-day forecast (free tier)
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

// Helper: format date to "Sat Mar 04"
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

// 2. Get 5-day forecast (3-hour intervals) and aggregate daily min/max
async function getDailyForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error('Forecast service error');
    const data = await response.json();

    // Group by date (YYYY-MM-DD)
    const dailyMap = new Map(); // key: date string, value: { max, min, date }

    for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const temp = item.main.temp;

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { max: temp, min: temp, date: date });
        } else {
            const entry = dailyMap.get(dateKey);
            entry.max = Math.max(entry.max, temp);
            entry.min = Math.min(entry.min, temp);
        }
    }

    // Convert map to array and sort by date, take first 7 days (max)
    let dailyArray = Array.from(dailyMap.values())
        .sort((a, b) => a.date - b.date)
        .slice(0, 7);

    // If less than 7 days available (shouldn't happen), return what we have
    return dailyArray;
}

// Render forecast cards
function renderForecast(dailyData, cityName) {
    selectedCityDisplay.textContent = cityName;

    let cardsHtml = '<div class="cards-grid">';
    for (const day of dailyData) {
        const dayName = formatDate(day.date);
        const maxTemp = Math.round(day.max);
        const minTemp = Math.round(day.min);

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
        // Step 2: Get 5-day forecast and aggregate daily min/max
        const dailyForecast = await getDailyForecast(lat, lon);
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

// No default city – input is empty on load
// The initial message in HTML is "Enter a city to begin"
