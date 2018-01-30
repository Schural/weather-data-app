const yargs = require('yargs');
const axios = require('axios');
const apiKeys = require('./config.js');

const argv = yargs
  .options({
    address: {
      demand: true,
      alias: 'a',
      describe: 'Address to fetch weather for',
      string: true
    },
    historical: {
      alias: 'history',
      describe: 'Determines if fetched data should be from historical API',
      string: true
    }
  })
  .help()
  .alias('help', 'h')
  .argv;

var encodedAddress = encodeURIComponent(argv.address);
var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKeys.keys.googleMapsAPIKey}`;

if (argv.historical) {
  console.log('Historical: ', argv.historical);
  console.log('--');
  axios.get(geocodeUrl).then((response) => {
    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('Unable to find that address.');
    }

    var lat = response.data.results[0].geometry.location.lat;
    var lng = response.data.results[0].geometry.location.lng;

    var timeToUnix = argv.historical;

    var weatherUrl = `https://api.darksky.net/forecast/${apiKeys.keys.darkskyAPIKey}/${lat},${lng},${argv.historical}?exclude=currently,minutely,daily,flags`;

    console.log(response.data.results[0].formatted_address);
    return axios.get(weatherUrl);
  }).then((response) => {
    //var temperature = response.data.currently.temperature;
    //var apparentTemperature = response.data.currently.apparentTemperature;
    console.log(JSON.stringify(response.data, undefined, 2));
    //console.log(`It's currently ${temperature}. It feels like ${apparentTemperature}.`);
  }).catch((e) => {
    if (e.code === 'ENOTFOUND') {
      console.log('Unable to connect to API servers.')
    } else {
      console.log(e.message);
    }
  });
} else {
  axios.get(geocodeUrl).then((response) => {
    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('Unable to find that address.');
    }

    var lat = response.data.results[0].geometry.location.lat;
    var lng = response.data.results[0].geometry.location.lng;

    var weatherUrl = `https://api.darksky.net/forecast/${apiKeys.keys.darkskyAPIKey}/${lat},${lng}`;


    console.log(response.data.results[0].formatted_address);
    return axios.get(weatherUrl);
  }).then((response) => {
    var temperature = response.data.currently.temperature;
    var apparentTemperature = response.data.currently.apparentTemperature;
    console.log(`It's currently ${temperature}. It feels like ${apparentTemperature}.`);
  }).catch((e) => {
    if (e.code === 'ENOTFOUND') {
      console.log('Unable to connect to API servers.')
    } else {
      console.log(e.message);
    }
  });
}
