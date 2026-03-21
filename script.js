// ========================
//  THE ORBIT WEATHER FORECAST
//  Uses OpenWeatherMap 5-day forecast (free tier)
//  Now includes weather icons 🌤️🌧️⛈️
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

// Map OpenWeather condition codes to emojis
function getWeatherEmoji(conditionId) {
    // Thunderstorm
    if (conditionId >= 200 && conditionId < 300) return '⛈️';
    // Drizzle
    if (conditionId >= 300 && conditionId < 400) return '🌧️';
    // Rain
    if (conditionId >= 500 && conditionId < 600) return '🌧️';
    // Snow
    if (conditionId >= 600 && conditionId < 700) return '❄️';
    // Atmosphere (fog, mist, etc.)
    if (conditionId >= 700 && conditionId < 800) return '🌫️';
    // Clear
    if (conditionId === 800) return '☀️';
    // Clouds
    if (conditionId === 801) return '🌤️';   // few clouds
    if (conditionId === 802) return '⛅';    // scattered clouds
    if (conditionId === 803) return '☁️';    // broken clouds
    if (conditionId === 804) return '☁️';    // overcast clouds
    return '🌡️'; // fallback
}

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

// 2. Get 5-day forecast (3-hour intervals) and aggregate daily min/max + representative weather
async function getDailyForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error('Forecast service error');
    const data = await response.json();

    // Group by date (YYYY-MM-DD)
    const dailyMap = new Map(); // key: date string, value: { max, min, date, conditionId, conditionMain }

    for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const temp = item.main.temp;
        const conditionId = item.weather[0].id;
        const conditionMain = item.weather[0].main;

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                max: temp,
                min: temp,
                date: date,
                conditionId: conditionId,
                conditionMain: conditionMain,
                // we'll store the best condition (choose one with highest temp later)
                bestConditionId: conditionId,
                bestTemp: temp
            });
        } else {
            const entry = dailyMap.get(dateKey);
            // Update min/max
            entry.max = Math.max(entry.max, temp);
            entry.min = Math.min(entry.min, temp);
            // For weather condition, we pick the condition from the entry with the highest temperature (assumed daytime)
            if (temp > entry.bestTemp) {
                entry.bestTemp = temp;
                entry.bestConditionId = conditionId;
                entry.bestConditionMain = conditionMain;
            }
        }
    }

    // Convert map to array and sort by date, take first 7 days
    let dailyArray = Array.from(dailyMap.values())
        .sort((a, b) => a.date - b.date)
        .slice(0, 7);

    // For each day, set the final condition to the one with highest temp (already stored)
    return dailyArray.map(day => ({
        date: day.date,
        max: day.max,
        min: day.min,
        conditionId: day.bestConditionId,
        conditionMain: day.bestConditionMain
    }));
}

// Render forecast cards with weather emoji
function renderForecast(dailyData, cityName) {
    selectedCityDisplay.textContent = cityName;

    let cardsHtml = '<div class="cards-grid">';
    for (const day of dailyData) {
        const dayName = formatDate(day.date);
        const maxTemp = Math.round(day.max);
        const minTemp = Math.round(day.min);
        const emoji = getWeatherEmoji(day.conditionId);

        cardsHtml += `
            <div class="forecast-card">
                <div class="weekday">${dayName}</div>
                <div class="weather-emoji">${emoji}</div>
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
        const { lat, lon, displayName } = await getCoordinates(rawCity);
        const dailyForecast = await getDailyForecast(lat, lon);
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
