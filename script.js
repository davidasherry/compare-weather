window.addEventListener("load", () => {
        var appID = config.key;

        // CREATE VALUES
        const roundTemp = temp => {
            const roundedTemp = Math.round(temp * 10) / 10;
            return roundedTemp;
        }
        

        const generateRandomCoord = value => {
            let coord = (Math.random() * value).toFixed(4);
            coord *= Math.round(Math.random()) ? 1 : -1;
            return coord;
        }



        // INPUTS
        const clearFields = () => {
            const locationInput = document.querySelector("#location-input").value = "";
        }


        const primaryLocationValue = () => {
            const locationInput = document.querySelector("#primary-input").value;
            clearFields();
            fetchPrimary(`http://api.openweathermap.org/data/2.5/weather?q=${locationInput}&units=metric&appid=${appID}`);        
        }


        const secondaryLocationValue = () => {
            const locationInput = document.querySelector("#location-input").value;
            clearFields();
            fetchSecondary(`http://api.openweathermap.org/data/2.5/weather?q=${locationInput}&units=metric&appid=${appID}`);
        }
 


        // PICK LOCATIONS
        const randomLongLatLocations = (val1, val2) => {
            let longRange = 180;
            let latRange = 90;

            let long = generateRandomCoord(longRange);
            let lat = generateRandomCoord(latRange);


            const randomAPI = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${appID}`;
            fetchSecondary(randomAPI);
            return randomAPI;
        }


        const randomGivenLocations = () => {
            readTextFile("https://raw.githubusercontent.com/russ666/all-countries-and-cities-json/master/countries.json", function(response){ 
                const data = JSON.parse(response);
                const countries = Object.keys(data);
                const randomCountry = countries[Math.floor(countries.length * Math.random())];
                const randomValueLength = Math.floor(data[randomCountry].length * Math.random());
                const randomCountryCity = data[randomCountry][randomValueLength];

                getWeatherByCityStateCountry(randomCountryCity, randomCountry);
            });
        }


        function readTextFile(file, callback) {
            var rawFile = new XMLHttpRequest();

            // rawFile.getResponseHeader();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function() {
                if (rawFile.readyState === 4 && rawFile.status == "200") {
                    // callback(rawFile.responseText);
                    callback(rawFile.responseText, rawFile.status);
                }
            };
            rawFile.send();
        }

        

        // FETCH DATA
        const fetchPrimary = api => {
            fetch(api)
                .then(data => {
                    return data.json();
                })
                .then(data => {
                    generateData(data, true);
                })
        }


        const fetchSecondary = api => {
            fetch(api)
                .then(data => {
                    return data.json();
                })
                .then(data => {
                    generateData(data, false);
                })
        }


        function getWeatherByCityStateCountry(cityName,  countryCode){
            fetch(`http://api.openweathermap.org/data/2.5/weather?q=${cityName},${countryCode}&units=metric&appid=${appID}`)
                .then(data => {
                    return data.json();
                })
                .then(data => {
                    generateData(data, false);
                })
                // remove to to see data on line 179
                .catch(error => randomGivenLocations());
        } 



        const generateData = (source, primary) => {
            let values = populateLocationData(primary);

            let timezone = values.locationTimezone,
                country = values.locationCountry,
                degree = values.temperatureDegree,
                feels = values.feelsLike,
                description = values.temperatureDescription,
                icon = values.icon;
                
            if(source.name != ""){
                const primaryInput = document.querySelector("#primary-input").style.display = "none";
                const primaryButton = document.querySelector("#primary-button").style.display = "none";
                timezone.textContent = source.name + ",";
                country.textContent = source.sys.country;
                degree.textContent = roundTemp(source.main.temp);
                feels.textContent = "FL: " + roundTemp(source.main.feels_like);
                description.textContent = source.weather[0].main;
                icon.textContent = source.weather[0].description;
            } 
            else {
                randomGivenLocations();
            }
        }



        const populateLocationData = (primary) => {
            let locationTimezone;
            let locationCountry;
            let temperatureDegree;
            let feelsLike;
            let temperatureDescription;
            let icon;

            if(primary){
                locationTimezone = document.querySelector(".location-timezone");
                locationCountry = document.querySelector(".location-country");
                temperatureDegree = document.querySelector(".temperature-degree");
                feelsLike = document.querySelector(".feels-like");
                temperatureDescription = document.querySelector(".temperature-description");
                icon = document.querySelector(".icon");
            } else {
                locationTimezone = document.querySelector(".sec-location");
                locationCountry = document.querySelector(".sec-country");
                temperatureDegree = document.querySelector(".sec-degree");
                feelsLike = document.querySelector(".sec-feels");
                temperatureDescription = document.querySelector(".sec-description");
                icon = document.querySelector(".sec-icon")
            }

            return {
                locationTimezone,
                locationCountry,
                temperatureDegree,
                feelsLike,
                temperatureDescription,
                icon
            };
        }


        const main = () => {
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(position => {
                    let long = position.coords.longitude;
                    let lat = position.coords.latitude;

                    fetchPrimary(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${appID}`);
                    randomGivenLocations();
                })
            }
        }


        const randomBtn = document.querySelector("#randomBtn").addEventListener("click", randomGivenLocations);
        const compareBtn = document.querySelector("#compareBtn").addEventListener("click", secondaryLocationValue);
        const inputButton = document.querySelector("#primary-button").addEventListener("click", primaryLocationValue);
        const locationInput = document.querySelector("#location-input").addEventListener("keypress", function(event){
            if (event.keyCode === 13) {
                event.preventDefault();
                secondaryLocationValue();
            }
        });


        main();
    }
)