const yargs = require('yargs');
const axios = require('axios');
const geoip = require('geoip-lite');

const apiKeys = require('./config.js');

const argv = yargs
  .options({
    ipaddress: {
      alias: 'ip',
      describe: 'IP Address to lookup',
      string: true
    },
    date: {
      alias: 'd',
      describe: 'Date of order as UNIX timestamp',
      string: true
    }
  })
  .help()
  .alias('help', 'h')
  .argv;

if (argv.ipaddress && argv.date) {
  console.log(`Return historical weather from ${argv.ipaddress} on ${new Date(argv.date*1000)}`);
  console.log('--');

  var geo = geoip.lookup(argv.ipaddress);
  if (geo) {
    var lat = geo.ll[0];
    var lng = geo.ll[1];

    var weatherUrl = `https://api.darksky.net/forecast/${apiKeys.keys.darkskyAPIKey}/${lat},${lng},${argv.date}?exclude=currently,minutely,hourly,flags`;
    axios.get(weatherUrl).then((response) => {
      //console.log(JSON.stringify(response.data, undefined, 2));
      console.log(`Summary: ${response.data.daily.data[0].summary}`);
      var temperatureInCelsius = (((response.data.daily.data[0].temperatureMin + response.data.daily.data[0].temperatureMax) / 2 ) - 32 ) * 5 / 9;
      console.log(`Average Temperature: ${temperatureInCelsius}`);
    }).catch((e) => {
      if (e) {
        console.log(e.message);
      }
    });

  } else {
    console.log('not a valid ip');
  }
} else {
  console.log('IP or Date not specified.');
}