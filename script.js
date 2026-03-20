async function getWeather() {
  const city = document.getElementById("city").value;
  const apiKey = "983678ab75150983c250ad53102f2c11";

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== "200") {
      document.getElementById("result").innerHTML = "City not found";
      return;
    }

    let temps = [];
    let labels = [];

    let forecastHTML = `<h2>${data.city.name}</h2><div class="forecast-container">`;

    for (let i = 0; i < data.list.length; i += 8) {
      let day = data.list[i];

      temps.push(day.main.temp);
      labels.push(new Date(day.dt_txt).toDateString().slice(0, 10));

      forecastHTML += `
        <div class="forecast-card">
          <p>${labels[labels.length - 1]}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
          <p>${day.main.temp}°C</p>
        </div>
      `;
    }

    forecastHTML += `</div>`;
    document.getElementById("result").innerHTML = forecastHTML;

    // 📊 Chart
    new Chart(document.getElementById("chart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Temperature (°C)",
          data: temps,
          borderWidth: 2
        }]
      }
    });

  } catch (err) {
    console.log(err);
  }
        }
