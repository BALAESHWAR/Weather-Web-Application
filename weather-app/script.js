function weatherIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫";
    if (code <= 67) return "🌧";
    if (code <= 77) return "❄️";
    if (code <= 99) return "⛈";
    return "🌤";
}

async function fetchWeather(lat, lon, place = "Your Location") {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("location").innerText = place;
    document.querySelector(".temp").innerText =
        data.current_weather.temperature + "°";

    document.getElementById("icon").innerText =
        weatherIcon(data.current_weather.weathercode);

    document.getElementById("condition").innerText = "Current Weather";

    document.getElementById("feels").innerText =
        "🌡 " + data.current_weather.temperature + "°";

    document.getElementById("wind").innerText =
        "🌬 " + data.current_weather.windspeed + " km/h";

    const forecast = document.getElementById("forecast");
    forecast.innerHTML = "";

    data.daily.temperature_2m_max.forEach((max, i) => {
        const min = data.daily.temperature_2m_min[i];
        const icon = weatherIcon(data.daily.weathercode[i]);

        const day = document.createElement("div");
        day.className = "day";
        day.innerHTML = `
            <b>Day ${i + 1}</b>
            <p style="font-size:22px">${icon}</p>
            <p>${max}°</p>
            <small>${min}°</small>
        `;
        forecast.appendChild(day);
    });
}

async function suggestCities() {
    const input = document.getElementById("cityInput").value;
    const box = document.getElementById("suggestions");

    if (input.length < 2) {
        box.innerHTML = "";
        return;
    }

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=5`;

    const res = await fetch(url);
    const data = await res.json();

    box.innerHTML = "";

    if (!data.results) return;

    data.results.forEach(city => {
        const div = document.createElement("div");
        div.innerHTML = `<b>${city.name}</b>, ${city.admin1 || ""}, ${city.country}`;
        div.onclick = () => {
            document.getElementById("cityInput").value = city.name;
            box.innerHTML = "";
            fetchWeather(city.latitude, city.longitude, `${city.name}, ${city.country}`);
        };
        box.appendChild(div);
    });
}

async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) return;

    const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    const res = await fetch(geoUrl);
    const data = await res.json();

    if (!data.results) {
        alert("City not found");
        return;
    }

    const { latitude, longitude, name, country } = data.results[0];
    fetchWeather(latitude, longitude, `${name}, ${country}`);
}

function getLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
    });
}

document.addEventListener("click", e => {
    if (!e.target.closest(".autocomplete")) {
        document.getElementById("suggestions").innerHTML = "";
    }
});

/* Auto-detect on load */
getLocationWeather();
