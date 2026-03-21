# The Orbit Weather Forecast

A responsive web application that provides a 7‑day weather forecast for any city worldwide. Built with HTML, CSS, and JavaScript, it uses the OpenWeatherMap API to deliver daily high/low temperatures and intuitive weather icons.

## Features

- **Global city search** – enter any city name; the app fetches coordinates and weather data.
- **7‑day forecast** – daily maximum and minimum temperatures, grouped from the 5‑day/3‑hour OpenWeatherMap endpoint.
- **Weather icons** – each day shows an emoji representing the dominant weather condition (☀️ clear, ☁️ clouds, 🌧️ rain, ⛈️ thunderstorm, ❄️ snow, etc.).
- **Clean, responsive design** – glass‑morphism style, works on desktop and mobile.
- **Live input validation** – user‑friendly error messages for unknown cities or network issues.

## How It Works

1. The user types a city name and clicks **Get Forecast** (or presses Enter).
2. The app calls OpenWeatherMap’s **Geocoding API** to obtain latitude and longitude.
3. It then fetches the **5‑day forecast** (3‑hour intervals) from the **5‑day / 3‑hour forecast endpoint**.
4. The data is aggregated into daily summaries: the highest temperature and the weather condition from the warmest period of each day, plus the lowest temperature.
5. The result is displayed as a grid of cards showing the weekday, weather icon, high and low temperatures.

## Technologies Used

- **HTML5** – semantic structure
- **CSS3** – custom styling, flexbox, grid, media queries, glassmorphic effects
- **JavaScript (ES6+)** – async/await, fetch API, DOM manipulation, map/reduce data aggregation
- **OpenWeatherMap API** – Geocoding and 5‑day forecast endpoints

