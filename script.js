// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityElement = document.getElementById("city");
const tempElement = document.getElementById("temp");
const humidityElement = document.getElementById("humidity");
const conditionElement = document.getElementById("condition");
const forecastElement = document.getElementById("forecast");
const tempChart = document.getElementById("tempChart");
const humidityChart = document.getElementById("humidityChart");

// Three.js Scene for Background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sphere as Background
const geometry = new THREE.SphereGeometry(50, 32, 32);
const textureLoader = new THREE.TextureLoader();
let material = new THREE.MeshBasicMaterial({
    map: textureLoader.load('https://th.bing.com/th/id/OIP.8KdffgUX64aGGBuKSH7AfwHaE8?rs=1&pid=ImgDetMain'), // Default texture URL
    side: THREE.BackSide
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
camera.position.z = 1;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.001;
    renderer.render(scene, camera);
}
animate();

// Update Background
function updateBackground(condition) {
    let texturePath = '';
    if (condition.includes("clear")) {
        texturePath = "https://th.bing.com/th/id/OIP.vYec9_VaS_BnSs3Fq-1dKAHaFj?rs=1&pid=ImgDetMain"; // Replace with image URL
    } else if (condition.includes("clouds")) {
        texturePath = "https://th.bing.com/th/id/OIP.dN7ohsmSYVcXXa7rJpaLIAHaEK?rs=1&pid=ImgDetMain"; // Replace with image URL
    } else if (condition.includes("rain")) {
        texturePath = "https://th.bing.com/th/id/OIP.I3KfLlVx5i3LAppkbcb0bwHaHa?rs=1&pid=ImgDetMain"; // Replace with image URL
    } else if (condition.includes("snow")) {
        texturePath = "https://th.bing.com/th/id/R.fcf93030a66e59c422285e0edc16eec8?rik=36pQqkJdMOL9MQ&riu=http%3a%2f%2fwww.highcountryweather.com%2fwp-content%2fuploads%2f2016%2f11%2f2016-november-03-how-snowy.jpg&ehk=BwpRnN2dWveFBC0pcjRb9Zg2MeUZJ8lonK1Cs0AwpJg%3d&risl=&pid=ImgRaw&r=0"; // Replace with image URL
    }else if (condition.includes("mist")) {
        texturePath = "https://th.bing.com/th/id/OIP.8KdffgUX64aGGBuKSH7AfwHaE8?rs=1&pid=ImgDetMain"; // Replace with image URL
    }
    else {
        texturePath = "https://th.bing.com/th/id/OIP.IWuGCRMN1-wTanMLRCrMsAHaEK?rs=1&pid=ImgDetMain"; // Replace with image URL
    }
    const transitionSpeed = 1.5; // Seconds
    document.body.style.transition = `background-image ${transitionSpeed}s ease-in-out`;
    material.map = textureLoader.load(texturePath);
    material.needsUpdate = true;
}

// Fetch Weather Data
async function fetchWeather(city) {
    const apiKey = "7c4df2c6c5e8edb2f92b792004733d39";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(url),
            fetch(forecastUrl)
        ]);
        
        if (!weatherRes.ok || !forecastRes.ok) throw new Error("City not found");
        
        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        const { name } = weatherData;
        const { temp, humidity } = weatherData.main;
        const { description } = weatherData.weather[0];
        

        cityElement.textContent = `Weather in ${name}`;
        tempElement.textContent = `Temperature: ${temp}°C`;
        humidityElement.textContent = `Humidity: ${humidity}%`;
        conditionElement.textContent = `Condition: ${description}`;

        updateBackground(description);
        updateForecast(forecastData);
        updateCharts(temp, humidity);

    } catch (error) {
        alert(error.message);
    }
}

// Fetch Current Location Weather
function fetchCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiKey = "7c4df2c6c5e8edb2f92b792004733d39";
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            try {
                const [weatherRes, forecastRes] = await Promise.all([
                    fetch(url),
                    fetch(forecastUrl)
                ]);
                const weatherData = await weatherRes.json();
                const forecastData = await forecastRes.json();

                const { name } = weatherData;
                const { temp, humidity } = weatherData.main;
                const { description } = weatherData.weather[0];

                cityElement.textContent = `Weather in ${name}`;
                tempElement.textContent = `Temperature: ${temp}°C`;
                humidityElement.textContent = `Humidity: ${humidity}%`;
                conditionElement.textContent = `Condition: ${description}`;

                updateBackground(description);
                updateForecast(forecastData);
                updateCharts(temp, humidity);
            } catch (error) {
                alert("Could not fetch current location weather.");
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Update Forecast
// Update Forecast
function updateForecast(forecastData) {
    forecastElement.innerHTML = '';
    const forecastDays = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    forecastDays.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
        const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const { temp_max, temp_min } = day.main;
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <p><strong>${dayName}</strong></p>
            <p>${formattedDate}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" title="${description}">
            <p>Max: ${(temp_max)}°C</p>
            <p>Min: ${(temp_min)}°C</p>
            <p>${description}</p>
        `;
        forecastElement.appendChild(forecastDay);
    });
}


// Update Charts
function updateCharts(temp, humidity) {
    toggleLoading(true);

    const loadingContainer = document.getElementById("loadingContainer");
    const chartContainer = document.getElementById("chartContainer");

    // Simulate a loading delay (replace this with your actual data-fetching logic)
    setTimeout(() => {
        loadingContainer.style.display = "none"; // Hide loading animation
        chartContainer.style.display = "block"; // Show charts
        const tempChartInstance = echarts.init(tempChart, null, { 
            renderer: 'canvas', 
            useDirtyRect: true 
        });
        const humidityChartInstance = echarts.init(humidityChart, null, { 
            renderer: 'canvas', 
            useDirtyRect: true 
        }); 

    // Example hourly data for temperature and humidity
        const hourlyTemp = [temp - 2, temp - 1, temp, temp + 1, temp + 2];
        const hourlyHumidity = [humidity - 5, humidity - 3, humidity, humidity + 4, humidity + 6];
        const hours = ['Now', '+1h', '+2h', '+3h', '+4h'];

        tempChartInstance.setOption({
            title: { text: "Temperature Trends (°C)" , axisLabel: {
                color:"#000000"
             } },
            xAxis: { type: "category", data: hours ,axisLabel: {
                color: "#333", // Darker color for axis labels
                fontSize: 14,  // Larger font size
            }, },
            yAxis: {
                type: "value",
                min: Math.floor(Math.min(...hourlyTemp) / 5) * 5 - 5, // Minimum value rounded down
                max: Math.ceil(Math.max(...hourlyTemp) / 5) * 5 + 5, // Maximum value rounded up
                interval: 5, // Increase spacing between lines
                axisLabel: {
                    color: "#333", // Darker color for axis labels
                    fontSize: 14,  // Larger font size
                },
            },
            series: [{ data: hourlyTemp, type: "line", smooth: true }]
        });

        humidityChartInstance.setOption({
            title: { text: "Humidity Trends (%)" },
            xAxis: { type: "category", data: hours ,axisLabel: {
                color: "#333", // Darker color for axis labels
                fontSize: 14,  // Larger font size
            },},
            yAxis: {
                type: "value",
                min: Math.floor(Math.min(...hourlyHumidity) / 10) * 10 - 10, // Minimum value rounded down
                max: Math.ceil(Math.max(...hourlyHumidity) / 10) * 10 + 10, // Maximum value rounded up
                interval: 10, // Increase spacing between lines
                axisLabel: {
                    color: "#333", // Darker color for axis labels
                    fontSize: 14,  // Larger font size
                },
            },
            series: [{ data: hourlyHumidity, type: "line", smooth: true }]
        });

        // Resize charts when the window size changes
        window.addEventListener("resize", () => {
            tempChartInstance.resize();
            humidityChartInstance.resize();
        });
    },1000);
}

function toggleLoading(show) {
    const loadingContainer = document.getElementById("loadingContainer");
    const chartContainer = document.getElementById("chartContainer");
    if (show) {
        loadingContainer.style.display = "flex";
        chartContainer.style.display = "none";
    } else {
        loadingContainer.style.display = "none";
        chartContainer.style.display = "block";
    }
}
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Event Listeners
// searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
window.addEventListener("load", fetchCurrentLocationWeather);

// Event listener for search button
document.getElementById("searchButton").addEventListener("click", () => {
    const cityInput = document.getElementById("cityInput").value.trim();
    if (cityInput) {
        // Simulate API call to fetch weather data
        console.log(`Fetching weather data for: ${cityInput}`);
        const temp = Math.floor(Math.random() * 30) + 10; // Simulated temperature
        const humidity = Math.floor(Math.random() * 50) + 50; // Simulated humidity
        updateCharts(temp, humidity);
    } else {
        alert("Please enter a city name.");
    }
});

// Initial data load on page load
document.addEventListener("DOMContentLoaded", () => {
    updateCharts(25, 60); // Default data
});
