"use strict";

$(document).ready(function() {
  // Open Weather API key
  const APIkey = 'ee399b08217b77b68c46f7e79d42d432';

  // function accepts input and changes DOM with weather forecast
  const getWeather = city => {
    let url = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + APIkey;

    fetch(url)
      .then(response => response.json())
      .then(json => {
        let lat = json[0].lat;
        let lon = json[0].lon;
        console.log([lat, lon]);
      })
      .catch(e => console.log(e.message))
  };


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
  getWeather('New York City');

}); // end ready
