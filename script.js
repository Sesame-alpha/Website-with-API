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

    document.getElementById("result").innerHTML = `
      <h2>${data.name}</h2>
      <p>${data.main.temp}°C</p>
      <p>${data.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
    `;
  } catch (error) {
    document.getElementById("result").innerHTML = `<p>Error fetching data</p>`;
  }
}
