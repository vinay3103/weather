const key = "7c4df2c6c5e8edb2f92b792004733d39";
const url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBar = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherContainer = document.querySelector(".weather");
const iconImage = document.querySelector(".icon");
const forecastContainer = document.querySelector(".forecast-days");

window.onload = function() {
    getUserLocation();
};

async function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await checkWeatherByCoordinates(lat, lon);
            await checkForecastByCoordinates(lat, lon);
        }, (error) => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve location. Please use the search function.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function checkWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`);
        const data = await response.json();

        if (data.cod === "404") {
            alert("Weather data not found for this location.");
            return;
        }

        // Update UI with weather data
        document.querySelector(".city").textContent = `${data.name}, ${data.sys.country}`;
        document.querySelector(".temp").textContent = `${data.main.temp} °C`;
        document.querySelector(".humidity").textContent = data.main.humidity;
        document.querySelector(".wind-speed").textContent = data.wind.speed;
        document.querySelector(".pressure").textContent = data.main.pressure;

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        document.querySelector(".sunrise").textContent = sunrise.toLocaleTimeString();
        document.querySelector(".sunset").textContent = sunset.toLocaleTimeString();

        const weatherCondition = data.weather[0].main.toLowerCase();
        const icon = data.weather[0].icon;
        iconImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        iconImage.style.display = "block";

        setBackgroundBasedOnWeather(weatherCondition, data.dt, data.sys.sunrise, data.sys.sunset);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching weather data. Please try again.");
    }
}

async function checkForecastByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`);
        const data = await response.json();
        forecastContainer.innerHTML = "";

        // Display 3-day forecast (using 3-hour interval data and showing one per day)
        const uniqueDays = new Set();
        data.list.forEach((entry) => {
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

            if (uniqueDays.size < 3 && !uniqueDays.has(day)) {
                uniqueDays.add(day);
                const temp = entry.main.temp;
                const weatherDesc = entry.weather[0].description;
                const icon = entry.weather[0].icon;

                const forecastElement = document.createElement("div");
                forecastElement.classList.add("forecast-day");
                forecastElement.innerHTML = `
                    <h4>${day}</h4>
                    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
                    <p>${temp} °C</p>
                    <p>${weatherDesc}</p>
                `;
                forecastContainer.appendChild(forecastElement);
            }
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}
async function checkWeather(city) {
    try {
        const response = await fetch(`${url}${city}&appid=${key}`);
        const data = await response.json();

        if (data.cod === "404") {
            alert("City not found. Please try again.");
            return;
        }

        document.querySelector(".city").textContent = `${data.name}, ${data.sys.country}`;
        document.querySelector(".temp").textContent = `${data.main.temp} °C`;
        document.querySelector(".humidity").textContent = data.main.humidity;
        document.querySelector(".wind-speed").textContent = data.wind.speed;
        document.querySelector(".pressure").textContent = data.main.pressure;

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        document.querySelector(".sunrise").textContent = sunrise.toLocaleTimeString();
        document.querySelector(".sunset").textContent = sunset.toLocaleTimeString();

        const weatherCondition = data.weather[0].main.toLowerCase();
        const icon = data.weather[0].icon;
        iconImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        iconImage.style.display = "block";

        setBackgroundBasedOnWeather(weatherCondition, data.dt, data.sys.sunrise, data.sys.sunset);
        checkForecast(city);
    } catch (error) {
        alert("Error fetching data. Please try again later.");
        console.error(error);
    }
}

async function checkForecast(city) {
    try {
        const response = await fetch(`${forecastUrl}${city}&appid=${key}`);
        const data = await response.json();
        forecastContainer.innerHTML = "";

        // Display 3-day forecast (using 3-hour interval data and showing one per day)
        const uniqueDays = new Set();
        data.list.forEach((entry) => {
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

            if (uniqueDays.size < 3 && !uniqueDays.has(day)) {
                uniqueDays.add(day);
                const temp = entry.main.temp;
                const weatherDesc = entry.weather[0].description;
                const icon = entry.weather[0].icon;

                const forecastElement = document.createElement("div");
                forecastElement.classList.add("forecast-day");
                forecastElement.innerHTML = `
                    <h4>${day}</h4>
                    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
                    <p>${temp} °C</p>
                    <p>${weatherDesc}</p>
                `;
                forecastContainer.appendChild(forecastElement);
            }
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

function setBackgroundBasedOnWeather(weather, currentTime, sunrise, sunset) {
    const body = document.body;
    const isDay = currentTime >= sunrise && currentTime <= sunset;

    switch (weather) {
        case 'clear':
            body.style.background = isDay
                ? 'linear-gradient(to right, #87CEFA, #FFD700)' // Lighter blue-yellow gradient for daytime
                : 'linear-gradient(to right, #000046, #1cb5e0)';
            break;
        case 'clouds':
            body.style.background = 'linear-gradient(to right, #d3d3d3, #bdc3c7)'; // Softer grey
            break;
        case 'rain':
            body.style.background = 'linear-gradient(to right, #4b79a1, #283e51)';
            break;
        case 'thunderstorm':
            body.style.background = 'linear-gradient(to right, #1f1c2c, #928dab)';
            break;
        case 'snow':
            body.style.background = 'linear-gradient(to right, #b6fbff, #d3e9f7)';
            break;
        default:
            body.style.background = isDay
                ? 'linear-gradient(to right, #87CEEB, #7FDBFF)' // Light blue gradient for day
                : 'linear-gradient(to right, #141e30, #243b55)';
            break;
    }

    // Adjust text color for better contrast
    const textColor = isDay ? "rgb(130, 202, 255)" : "#0A0D0C";
    body.style.color = textColor;
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBar.value);
});
searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBar.value);
    }
});
</script><script>
const key = "7c4df2c6c5e8edb2f92b792004733d39";
const url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBar = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherContainer = document.querySelector(".weather");
const iconImage = document.querySelector(".icon");
const forecastContainer = document.querySelector(".forecast-days");

window.onload = function() {
    getUserLocation();
};

async function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await checkWeatherByCoordinates(lat, lon);
            await checkForecastByCoordinates(lat, lon);
        }, (error) => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve location. Please use the search function.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function checkWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`);
        const data = await response.json();

        if (data.cod === "404") {
            alert("Weather data not found for this location.");
            return;
        }

        // Update UI with weather data
        document.querySelector(".city").textContent = `${data.name}, ${data.sys.country}`;
        document.querySelector(".temp").textContent = `${data.main.temp} °C`;
        document.querySelector(".humidity").textContent = data.main.humidity;
        document.querySelector(".wind-speed").textContent = data.wind.speed;
        document.querySelector(".pressure").textContent = data.main.pressure;

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        document.querySelector(".sunrise").textContent = sunrise.toLocaleTimeString();
        document.querySelector(".sunset").textContent = sunset.toLocaleTimeString();

        const weatherCondition = data.weather[0].main.toLowerCase();
        const icon = data.weather[0].icon;
        iconImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        iconImage.style.display = "block";

        setBackgroundBasedOnWeather(weatherCondition, data.dt, data.sys.sunrise, data.sys.sunset);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching weather data. Please try again.");
    }
}

async function checkForecastByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`);
        const data = await response.json();
        forecastContainer.innerHTML = "";

        // Display 3-day forecast (using 3-hour interval data and showing one per day)
        const uniqueDays = new Set();
        data.list.forEach((entry) => {
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

            if (uniqueDays.size < 3 && !uniqueDays.has(day)) {
                uniqueDays.add(day);
                const temp = entry.main.temp;
                const weatherDesc = entry.weather[0].description;
                const icon = entry.weather[0].icon;

                const forecastElement = document.createElement("div");
                forecastElement.classList.add("forecast-day");
                forecastElement.innerHTML = `
                    <h4>${day}</h4>
                    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
                    <p>${temp} °C</p>
                    <p>${weatherDesc}</p>
                `;
                forecastContainer.appendChild(forecastElement);
            }
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}
async function checkWeather(city) {
    try {
        const response = await fetch(`${url}${city}&appid=${key}`);
        const data = await response.json();

        if (data.cod === "404") {
            alert("City not found. Please try again.");
            return;
        }

        document.querySelector(".city").textContent = `${data.name}, ${data.sys.country}`;
        document.querySelector(".temp").textContent = `${data.main.temp} °C`;
        document.querySelector(".humidity").textContent = data.main.humidity;
        document.querySelector(".wind-speed").textContent = data.wind.speed;
        document.querySelector(".pressure").textContent = data.main.pressure;

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        document.querySelector(".sunrise").textContent = sunrise.toLocaleTimeString();
        document.querySelector(".sunset").textContent = sunset.toLocaleTimeString();

        const weatherCondition = data.weather[0].main.toLowerCase();
        const icon = data.weather[0].icon;
        iconImage.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        iconImage.style.display = "block";

        setBackgroundBasedOnWeather(weatherCondition, data.dt, data.sys.sunrise, data.sys.sunset);
        checkForecast(city);
    } catch (error) {
        alert("Error fetching data. Please try again later.");
        console.error(error);
    }
}

async function checkForecast(city) {
    try {
        const response = await fetch(`${forecastUrl}${city}&appid=${key}`);
        const data = await response.json();
        forecastContainer.innerHTML = "";

        // Display 3-day forecast (using 3-hour interval data and showing one per day)
        const uniqueDays = new Set();
        data.list.forEach((entry) => {
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

            if (uniqueDays.size < 3 && !uniqueDays.has(day)) {
                uniqueDays.add(day);
                const temp = entry.main.temp;
                const weatherDesc = entry.weather[0].description;
                const icon = entry.weather[0].icon;

                const forecastElement = document.createElement("div");
                forecastElement.classList.add("forecast-day");
                forecastElement.innerHTML = `
                    <h4>${day}</h4>
                    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
                    <p>${temp} °C</p>
                    <p>${weatherDesc}</p>
                `;
                forecastContainer.appendChild(forecastElement);
            }
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

function setBackgroundBasedOnWeather(weather, currentTime, sunrise, sunset) {
    const body = document.body;
    const isDay = currentTime >= sunrise && currentTime <= sunset;

    switch (weather) {
        case 'clear':
            body.style.background = isDay
                ? 'linear-gradient(to right, #87CEFA, #FFD700)' // Lighter blue-yellow gradient for daytime
                : 'linear-gradient(to right, #000046, #1cb5e0)';
            break;
        case 'clouds':
            body.style.background = 'linear-gradient(to right, #d3d3d3, #bdc3c7)'; // Softer grey
            break;
        case 'rain':
            body.style.background = 'linear-gradient(to right, #4b79a1, #283e51)';
            break;
        case 'thunderstorm':
            body.style.background = 'linear-gradient(to right, #1f1c2c, #928dab)';
            break;
        case 'snow':
            body.style.background = 'linear-gradient(to right, #b6fbff, #d3e9f7)';
            break;
        default:
            body.style.background = isDay
                ? 'linear-gradient(to right, #87CEEB, #7FDBFF)' // Light blue gradient for day
                : 'linear-gradient(to right, #141e30, #243b55)';
            break;
    }

    // Adjust text color for better contrast
    const textColor = isDay ? "rgb(130, 202, 255)" : "#0A0D0C";
    body.style.color = textColor;
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBar.value);
});
searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBar.value);
    }
});
