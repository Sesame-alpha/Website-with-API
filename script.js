async function getWeather() {
  const city = document.getElementById("city").value;
  const apiKey = "983678ab75150983c250ad53102f2c11";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      document.getElementById("result").innerHTML = `<p>City not found</p>`;
      return;
    }

    const condition = data.weather[0].main.toLowerCase();

    // Change background
    if (condition.includes("cloud")) {
      document.body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
    } else if (condition.includes("rain")) {
      document.body.style.background = "linear-gradient(135deg, #4b79a1, #283e51)";
    } else if (condition.includes("clear")) {
      document.body.style.background = "linear-gradient(135deg, #fceabb, #f8b500)";
    } else {
      document.body.style.background = "linear-gradient(135deg, #89cff0, #0077b6)";
    }

    // Icon animation
    let iconClass = "cloudy";

    if (condition.includes("clear")) {
      iconClass = "sunny";
    } else if (condition.includes("rain")) {
      iconClass = "rainy";
    } else if (condition.includes("cloud")) {
      iconClass = "cloudy";
    }

    // Display result
    document.getElementById("result").innerHTML = `
      <div class="weather-card">
        <h2>${data.name}</h2>
        <p>${data.main.temp}°C</p>
        <p>${data.weather[0].description}</p>
        <img class="icon ${iconClass}" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
      </div>
    `;

  } catch (error) {
    document.getElementById("result").innerHTML = `<p>Error fetching data</p>`;
  }
      }
