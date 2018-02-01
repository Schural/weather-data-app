const yargs = require('yargs');
const axios = require('axios');
const geoip = require('geoip-lite');
const csv = require('fast-csv');

const apiKeys = require('./config.js');

/*const argv = yargs
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
*/

csv
 .fromPath("./tmp_exports_merged_orderIP.csv", {headers: true})
 .on("data", function(data){
  var inputTimestamp = data.serverTimeUnix;
  var resultTimestamps = [];


  var geo = geoip.lookup(data.ipEnsighten);
  if (geo) {
    var lat = geo.ll[0];
    var lng = geo.ll[1];

    var weatherUrl = `https://api.darksky.net/forecast/${apiKeys.keys.darkskyAPIKey}/${lat},${lng},${inputTimestamp}?exclude=currently,daily,flags,alerts&units=ca`;
    axios.get(weatherUrl).then((response) => {
      // Log full response for better understanding the result
      // console.log(JSON.stringify(response.data, undefined, 2));
      // console.log('--');

      // push only timestamps from result into array resultTimestamps
      for (i = 0; i < response.data.hourly.data.length; i++) {
        resultTimestamps.push(response.data.hourly.data[i].time);
      }

      // find nearest timestamp
      smallestDiff = Math.abs(inputTimestamp - resultTimestamps[0]);
      closestTimestamp = 0;

      for (i = 0; i < resultTimestamps.length; i++ ) {
          currentDiff = Math.abs(inputTimestamp - resultTimestamps[i]);
          if (currentDiff < smallestDiff) {
              smallestDiff = currentDiff;
              closestTimestamp = i;
          }
      }

      var nearestResult = response.data.hourly.data.find( (obj) => {
        return obj.time = resultTimestamps[closestTimestamp]
      });

      console.log('Found nearest object in Array');
      console.log(JSON.stringify(nearestResult, undefined, 2));
      console.log('Input date: ', new Date(inputTimestamp*1000));
      console.log('Closest date: ', new Date(resultTimestamps[closestTimestamp]*1000));
      console.log('--\n')
    }).catch((e) => {
      if (e) {
        console.log(e.message);
      }
    });

  } else {
    console.log('not a valid ip');
  }
 })
 .on("end", function(){
     //console.log("done");
 });

 /*
if (argv.ipaddress && argv.date) {
  console.log(`Return historical weather from ${argv.ipaddress} on ${new Date(argv.date*1000)}`);
  console.log('--');

  var inputTimestamp = argv.date;
  var resultTimestamps = [];


  var geo = geoip.lookup(argv.ipaddress);
  if (geo) {
    var lat = geo.ll[0];
    var lng = geo.ll[1];

    var weatherUrl = `https://api.darksky.net/forecast/${apiKeys.keys.darkskyAPIKey}/${lat},${lng},${inputTimestamp}?exclude=currently,daily,flags,alerts&units=ca`;
    axios.get(weatherUrl).then((response) => {
      // Log full response for better understanding the result
      // console.log(JSON.stringify(response.data, undefined, 2));
      // console.log('--');

      // push only timestamps from result into array resultTimestamps
      for (i = 0; i < response.data.hourly.data.length; i++) {
        resultTimestamps.push(response.data.hourly.data[i].time);
      }

      // find nearest timestamp
      smallestDiff = Math.abs(inputTimestamp - resultTimestamps[0]);
      closestTimestamp = 0;

      for (i = 0; i < resultTimestamps.length; i++ ) {
          currentDiff = Math.abs(inputTimestamp - resultTimestamps[i]);
          if (currentDiff < smallestDiff) {
              smallestDiff = currentDiff;
              closestTimestamp = i;
          }
      }

      var nearestResult = response.data.hourly.data.find( (obj) => {
        return obj.time = resultTimestamps[closestTimestamp]
      });

      console.log('Found nearest object in Array');
      console.log(JSON.stringify(nearestResult, undefined, 2));
      console.log('Input date: ', new Date(inputTimestamp*1000));
      console.log('Closest date: ', new Date(resultTimestamps[closestTimestamp]*1000));
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

*/