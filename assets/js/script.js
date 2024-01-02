"use strict";

$(document).ready(function() {
  // Open Weather API key
  const APIkey = 'ee399b08217b77b68c46f7e79d42d432';

  // Most recent city searched
  let city = '';

  // function accepts input and changes DOM with weather forecast
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
      .then(json => updateDisplay(json))

    // TODO: need to alert the user if there is an error and which fetch caused it
      .catch(e => console.log(e.message))
  }; // end getWeather()

  // return an jQuery image object with the desired icon
  const getIconImage = (icon) => $("<img></img>").attr('src','https://openweathermap.org/img/wn/' + icon + '.png');

  // function to update the display with the 5-day forecast
  // input is a json object from the Open Weather API fetch
  // remember that fetches are asynchronous, so this function has to be part of a .then chain
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
    weather[5] = {datetime: dayjs(json.list[numElements-1].dt_txt).add(json.city.timezone,'s').format('YYYY-MM-DD HH:MM'),
                  icon: json.list[numElements-1].weather[0].icon,
                  temp: 'Temp: ' + json.list[numElements-1].main.temp + '&deg;F',
                  wind: 'Wind: ' + json.list[numElements-1].wind.speed + ' MPH',
                  humidity: 'Humidity: ' + json.list[numElements-1].main.humidity + '%'
                 };

    // need to clear previous search history, if any
    $('#results-now').empty().append('<h2></h2>');
    $('#results-five-day').empty().append('<h2>5-day Forecast</h2>');

    // set up the headings
    $('#results-now h2').text(city + ' (' + dayjs(weather[0].datetime).format('M/D/YYYY') + ')');
    $('#results-now').append(getIconImage(weather[0].icon));

    // put the first entry in "#results-now"
    // ideally this should be part of the FOR loop at some point
    $('#results-now').append('<ul></ul>');
    $('#results-now ul').append('<li>' + weather[0].temp + '</li>');
    $('#results-now ul').append('<li>' + weather[0].wind + '</li>');
    $('#results-now ul').append('<li>' + weather[0].humidity + '</li>');

    // put the next five entries in "#results-five-day", one div per output
    for (let i = 1; i < weather.length; i++) {
      $('#results-five-day').append('<div></div>');
      $('#results-five-day div').last().addClass('day-card');
      $('#results-five-day div').last().append('<h3>' + dayjs(weather[i].datetime).format('M/D/YYYY') + '</h3>');
      $('#results-five-day div').last().append('<ul></ul>');
      $('#results-five-day ul').last().append(getIconImage(weather[i].icon));
      $('#results-five-day ul').last().append('<li>' + weather[i].temp + '</li>');
      $('#results-five-day ul').last().append('<li>' + weather[i].wind + '</li>');
      $('#results-five-day ul').last().append('<li>' + weather[i].humidity + '</li>');
    }
    // clear the text input for city and re-focus on text input for next search
    city = '';
    $('#city').val(city).focus();

    // diagnostics
    console.log(weather);
    console.log(json);
  } // end updateDisplay()

  // function to save and update search history
  const updateHistory = (city, coordinates) => {
    // use current buttons (or local storage?) to initialize an array of objects with previous searches


    // update the seach history array with the recent search


    // display a button with the name of the city. Also store the coordinates as a data attribute.


    // set an event listener on the button that was created. When clicked, a new weather search is run


    // update local storage with the updated object array

  };


  // function to clear previous searches
  // I feel that this is necessary otherwise they will just accumulate!
  const clearHistory = () => {

  };

  // for testing, eventually get the city from the value of the text input

  // Event listener to get the city
  $('#city').focus();

  // function to start search by click or hitting Enter
  const startSearch = () => {
    city = $("#city").val();
    if (city==='') {
      window.alert('You must enter a value for the city!');
      return;
    }
    getWeather(city);
  }

  $('#search').click(startSearch);
  $('#city').keypress( e => {
    if (e.keyCode == 13) {
      startSearch();
    }
  });

  // when user clicks on search (or hits enter in the text input?), display the weather for the city
  // Will need to do some error checking: that the city is valid, that the input isn't empty
  // If a state is entered, should I return an error or ignore it or use the info?

}); // end ready
