"use strict";

document.addEventListener('DOMContentLoaded', () => {
  // Open Weather API key
  const APIkey = 'ee399b08217b77b68c46f7e79d42d432';

  // variables related to cities
  let city = '';  // needed bc Open Weather JSON only has coordinates
  let cityInputEl = document.querySelector('#city');   // input text

  /*
   * Function to initialize the display with previous functions.
   * An array of city names is retrieved from local storage and
   * the corresponding buttons are created
   */
  const initDisplay = () => {
    // retrieve array of previous search cities from local storage
    let pastCities = JSON.parse(localStorage.getItem("pastCities"));

    // assuming there are some, set up the buttons
    if (pastCities !== null) {
      for (let i = 0; i < pastCities.length; i++) {
        let btnEl = document.createElement("button");
        btnEl.textContent = pastCities[i];
        document.querySelector("#search-history").append(btnEl);
      }
      // display the search from the first button
      city = pastCities[0];
      getWeather(city);
    }
  }

  /*
   * The counterpart to initDisplay(): this function saves past
   * searches to local storage. It does that by querying the current
   * buttons that represent those past searches.
   */
  const saveSearchCities = () => {
    let pastCities = [];

    // populate array from buttons
    let pastCitiesEl = document.querySelectorAll("#search-history button");

    for (let i = 0; i < pastCitiesEl.length; i++) {
      pastCities[i] = pastCitiesEl[i].textContent;
    }

    localStorage.setItem("pastCities", JSON.stringify(pastCities));
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Fetch Functions                             //
  /////////////////////////////////////////////////////////////////////////////
  /*
   * The getWeather() function does most of the heavy lifting for this web page:
   * it performs two fetches (one to get city coordinates, one to get weather forecast)
   * and updates the web page accordingly. The only input is a string representing
   * the city name.
   */
  const getWeather = city => {
    let url = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + APIkey;

    fetch(url)
      .then(response => response.json())

    // TODO: throw an error with a helpful message if there is no response
      .then(json => {
        // get the coordinates from the first city
        return {lat: json[0].lat, lon: json[0].lon};
      })
      .then(coords => {
        // fetch the weather forecast
        let weatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat='+coords.lat+'&lon='+coords.lon+'&appid='+APIkey+'&units=imperial';
        return fetch(weatherURL);
      })
      .then(response => response.json())
    // TODO: throw an error with a helpful message if there is no response

    // below is the named callback function that changes the DOM
      .then(json => updateDisplay(json))

    // TODO: need to alert the user if there is an error and which fetch caused it
      .catch(e => console.log(e.message))
  }; // end getWeather()

  /*
   * Simple convenience function that returns an image element that
   * points to the weather icon that is its only argument.
   */
  const getIconImage = (icon) => {
    let imgEl = document.createElement('img');
    imgEl.src = 'https://openweathermap.org/img/wn/' + icon + '.png';
    return imgEl;
  }

  /////////////////////////////////////////////////////////////////////////////
  //                              Display Update                              //
  /////////////////////////////////////////////////////////////////////////////
  /*
   * This function is called from getWeather() as its last function. The argument
   * passed to the function is the json retrieved from the weather fetch. Once
   * the data is parsed, it is used to update the appropriate DOM elements.
   */
  const updateDisplay = json => {
    let numElements = json.list.length, weather = [], dateTime;

    for (let i = 0, j=0; i < numElements; i+=8, j++) {
      // for now let's get conditions that are 24h apart, adjusted to local time
      weather[j] = {datetime: dayjs(json.list[i].dt_txt).add(json.city.timezone,'s').format('YYYY-MM-DD HH:MM'),
                    icon: json.list[i].weather[0].icon,
                    temp: 'Temp: ' + json.list[i].main.temp + '&deg;F',
                    wind: 'Wind: ' + json.list[i].wind.speed + ' MPH',
                    humidity: 'Humidity: ' + json.list[i].main.humidity + '%'
                   };
    }

    // the last entry is 21 hours (kind of a kludge, fix this eventually)
    // TODO: be more intelligent about getting the element from within a given date
    weather[5] = {datetime: dayjs(json.list[numElements-1].dt_txt).add(json.city.timezone,'s').format('YYYY-MM-DD HH:MM'),
                  icon: json.list[numElements-1].weather[0].icon,
                  temp: 'Temp: ' + json.list[numElements-1].main.temp + '&deg;F',
                  wind: 'Wind: ' + json.list[numElements-1].wind.speed + ' MPH',
                  humidity: 'Humidity: ' + json.list[numElements-1].main.humidity + '%'
                 };


    // need to clear previous search history, if any
    document.querySelector('#results-now h2').textContent = "";
    let cardEl = document.querySelectorAll('div.weather-card');
    for (let i=0; i<cardEl.length; i++) {
      cardEl[i].innerHTML = '';
    }

    // FOR loop to update the weather divs
    for (let i = 0; i < cardEl.length; i++) {
      // Header differs for today vs next 5 days
      if (i===0) {
        // header for today: larger and includes icon
        document.querySelector('#results-now h2').textContent = city + ' (' + dayjs(weather[0].datetime).format('M/D/YYYY') + ')';
        document.querySelector('#results-now h2').appendChild(getIconImage(weather[0].icon));
      } else  {
        // only for the 5-day forecast
        cardEl[i].innerHTML = '<h3>' + dayjs(weather[i].datetime).format('M/D/YYYY') + '</h3>';
        cardEl[i].appendChild(getIconImage(weather[i].icon));
      }
      let ul = cardEl[i].appendChild(document.createElement("ul"));
      let listEl = ul.appendChild(document.createElement("li"));
      listEl.innerHTML = weather[i].temp;
      listEl = ul.appendChild(document.createElement("li"));
      listEl.textContent = weather[i].wind;
      listEl = ul.appendChild(document.createElement("li"));
      listEl.textContent = weather[i].humidity;
    }

    // save this search
    let pastCitiesEl = document.querySelectorAll("#search-history button");
    let previousSearchCity = false;
    for (let i = 0; i < pastCitiesEl.length; i++) {
      if (pastCitiesEl[i].textContent == city) {
        previousSearchCity = true;
      }
    }
    if (!previousSearchCity) {
      updateHistory(city);
    }

    // clear the text input for city and re-focus on text input for next search
    // allows the user to type a number of cities in succession, hitting Enter between each
    city = '';
    cityInputEl.value = city;
    cityInputEl.focus();

  } // end updateDisplay()

  /*
   * Function updates search history, adding a button if one doesn't already
   * exist with the most recent city name. It calls saveSearchCities() at the
   * end of the function to save the updates list of cities to local storage.
   */
  const updateHistory = latestCity => {
    // use current buttons (or local storage?) to initialize an array of objects with previous searches
    let pastCities = JSON.parse(localStorage.getItem("pastCities"));

    // update the seach history array with the recent search
    if (pastCities !== null) {
      pastCities.push(latestCity);
    } else {
      pastCities = [];
      pastCities[0] = latestCity;
    }

    // display a button with the name of the city. Also store the coordinates as a data attribute.
    let btnEl = document.createElement("button");
    btnEl.textContent = latestCity;
    document.querySelector('#search-history').appendChild(btnEl);

    // update local storage with the updated object array
    saveSearchCities();
  };

  /*
   * Event listener "click" for the previous search buttons
   */
  document.querySelector('#search-history').addEventListener("click", evt => {
    let btnEl = evt.target;
    city = btnEl.textContent;
    getWeather(city);
  })

  /*
   * Function to clear previous searches.
   * I feel that this is necessary otherwise they will just accumulate!
   * This could be tied to another button or maybe double-clicking an existing
   * search will remove just that one.
   */
  const clearHistory = () => {

  };

  /*
   * Named callback function to start the fetch for the input city.
   * If the input is blank, an alert is displayed.
   */
  const startSearch = () => {
    city = cityInputEl.value;
    if (city==='') {
      window.alert('You must enter a value for the city!');
      return;
    }
    getWeather(city);
  }

  /*
   * When user clicks on search or hits enter in the text input, display the weather for the city
   */
  document.querySelector('#search').addEventListener("click", startSearch);
  cityInputEl.addEventListener("keypress", e => {
    if (e.key == "Enter") {
      startSearch();
    }
  });

  // populate previous search buttons
  initDisplay();
  // set focus on text input
  cityInputEl.focus();

}, false);  // end DOM ready
