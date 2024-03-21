document.addEventListener("DOMContentLoaded", function () {
	const apiKey = "bb15f7436bc7d4e8f60b7b9e794888cd";
	const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";

	// DOM access
	const cityName = document.querySelector(".city");
	const description = document.querySelector(".description");
	const temperature = document.querySelector(".temperature");
	const humidity = document.querySelector(".humidity");
	const wind = document.querySelector(".wind");
	const weatherIcon = document.querySelector(".weather-icon");

	/**
	 * Makes an API request to OpenWeatherMap to retrieve weather data for a given city.
	 * @param {string} city - The name of the city for which to retrieve weather data.
	 * @param {string} lang - The language to use for the API request.
	 */
	async function loadWeatherData(city, lang) {
		const response = await fetch(
			`${apiUrl}&appid=${apiKey}&q=${city}&lang=${lang}`
		);

		const data = await response.json();
		// console.log(data);
		// console.log(data.sys.country); // for two letter country code
		// console.log(data.weather[0].description);

		// city name and country code
		if (cityName) {
			// removing unnecessary 'Arrondissement' from city name if present
			cityName.innerText = data.name.includes("Arrondissement de ")
				? data.name.replace("Arrondissement de ", "") + ", " + data.sys.country
				: data.name + ", " + data.sys.country;
		}
		// description
		if (description) {
			description.innerText = data.weather[0].description;
		}
		// temperature
		if (temperature) {
			temperature.innerText = Math.round(data.main.temp) + "°c";
		}
		// humidity
		if (humidity) {
			humidity.innerText = data.main.humidity + "%";
		}
		// wind speed
		if (wind) {
			wind.innerText = data.wind.speed.toFixed(1) + " km/h";
		}

		// weather icons from local files (higher quality)
		const weatherCode = data.weather[0].main;
		const weatherCodeId = data.weather[0].id;
		if (weatherCode === "Clear") {
			weatherIcon.src = "./graphics/img/clear.png";
		} else if (weatherCodeId >= 200 && weatherCodeId <= 210) {
			weatherIcon.src = "./graphics/img/rain.png";
		} else if (weatherCode === "Drizzle") {
			weatherIcon.src = "./graphics/img/drizzle.png";
		} else if (weatherCode === "Rain") {
			weatherIcon.src = "./graphics/img/rain.png";
		} else if (weatherCode === "Snow") {
			weatherIcon.src = "./graphics/img/snow.png";
		} else if (weatherCodeId >= 701 && weatherCodeId <= 731) {
			weatherIcon.src = "./graphics/img/mist.png";
		} else if (weatherCode === "Clouds") {
			weatherIcon.src = "./graphics/img/clouds.png";
		} else {
			// fallback icons to website if none of the local files match
			// weather icons from website (low quality)
			const iconCode = data.weather[0].icon;
			const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
			if (weatherIcon) {
				weatherIcon.src = iconUrl;
			}
		}
	}

	// Function to read the city from the conf.json file
	async function getCityAndLangFromConfig() {
		try {
			const response = await fetch("./data/conf.json");
			const config = await response.json();
			return { city: config.city, lang: config.lang };
		} catch (error) {
			console.error("Error reading conf.json:", error);
		}
	}

	// Use the city and language from conf.json to fetch weather data
	async function fetchWeatherData() {
		const { city, lang } = await getCityAndLangFromConfig();
		loadWeatherData(city, lang);

		// Check if the language is French and update the text
		if (lang === "fr") {
			document.querySelector(".humidity").nextElementSibling.innerText =
				"Humidité";
			document.querySelector(".wind").nextElementSibling.innerText =
				"Vitesse du vent";
		} else {
			document.querySelector(".humidity").nextElementSibling.innerText =
				"Humidity";
			document.querySelector(".wind").nextElementSibling.innerText =
				"Wind Speed";
		}
	}

	// Fetch the weather data immediately and then every hour
	fetchWeatherData();
	console.log("First weather call at:", getCurrentTime());

	setInterval(() => {
		fetchWeatherData();
		console.log("Weather was updated at:", getCurrentTime()); // to log when weather was updated
	}, 1000 * 60 * 60); // 1 hour in milliseconds

	// Get the current time, date and format it
	function getCurrentTime() {
		const date = new Date();
		const currentDate = date.toLocaleDateString();
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const formattedTime = hours + ":" + minutes;
		const currentDateAndTime = currentDate + " " + formattedTime;

		return currentDateAndTime;
	}
});
