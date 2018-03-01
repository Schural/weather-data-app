const csv = require('csvtojson');
const json2csv = require('json2csv').parse;
const fs = require('fs');

var request = require("request");
var RequestQueue = require("limited-request-queue");

const apiKeys = require('./config.js');
const csvFilePath = 'import_data_without_new_headers.csv';
const months = [
  'January', 'February', 'March', 'April', 'May',
  'June', 'July', 'August', 'September',
  'October', 'November', 'December'
];

var dataArray = [];
var googleUrls = [];
var darkskyUrls = [];
var currentArrayPositionGoogleUrls = 0;
var currentArrayPositionDarkskyUrls = 0;

function monthNameToNum(monthname) {
  return month = months.indexOf(monthname);
}

csv()
  .fromFile(csvFilePath)
  .on('json', (jsonObj) => {

    var encodedAddress = encodeURIComponent(jsonObj["GeoSegmentation Cities"] + ", " + jsonObj["GeoSegmentation Countries"]);
    var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKeys.keys.googleMapsAPIKey}`;

    googleUrls.push(geocodeUrl);
    dataArray.push(jsonObj);
  })
  .on('done', (error) => {
    googleUrls.forEach(queueGoogleRequests.enqueue, queueGoogleRequests);
  });

var queueGoogleRequests = new RequestQueue(null, {
  item: function (input, done) {
    request(input.url, function (error, response, body) {

      body = JSON.parse(body);

      if (body.status === 'ZERO_RESULTS') {
        console.log('Unable to find address, pushing localhost to darkskyUrls Array, to keep same size');
        darkskyUrls.push('http://127.0.0.1');
        currentArrayPositionGoogleUrls++;
        done();
      } else {
        var lat = body.results[0].geometry.location.lat;
        var lng = body.results[0].geometry.location.lng;

        var adobeDate = dataArray[currentArrayPositionGoogleUrls].Hour;
        var timezoneOffset = dataArray[currentArrayPositionGoogleUrls]["Time Zones"] - 1;

        var seperatedAdobeDate = adobeDate.split(',');

        var adobeMonth = monthNameToNum(seperatedAdobeDate[0].split(' ')[0].trim());
        var adobeDay = seperatedAdobeDate[0].split(' ')[1].trim();
        var adobeYear = seperatedAdobeDate[1].trim();
        var adobeHour = seperatedAdobeDate[2].split(' ')[2].trim();

        var adobeTimeDateObject = new Date();

        adobeTimeDateObject.setUTCDate(Number(adobeDay));
        adobeTimeDateObject.setUTCMonth(Number(adobeMonth));
        adobeTimeDateObject.setUTCFullYear(Number(adobeYear));
        adobeTimeDateObject.setUTCHours(Number(adobeHour) - timezoneOffset);
        adobeTimeDateObject.setUTCMinutes(0);
        adobeTimeDateObject.setUTCSeconds(0);
        adobeTimeDateObject.setUTCMilliseconds(0);

        unixTimestamp = adobeTimeDateObject.getTime() / 1000;

        var weatherUrl = `https://api.darksky.net/forecast/${apiKeys.keys.darkskyAPIKey}/${lat},${lng},${unixTimestamp}?exclude=hourly,daily,flags,alerts&units=ca`;
        darkskyUrls.push(weatherUrl);
        currentArrayPositionGoogleUrls++;
        done();
      }
    });
  },
  end: function () {
    console.log("Google Request Queue completed!");
    darkskyUrls.forEach(queueDarkskyRequests.enqueue, queueDarkskyRequests);
  }
});

var queueDarkskyRequests = new RequestQueue(null, {
  item: function (input, done) {
    request(input.url, function (error, response, body) {

      if (input.url == 'http://127.0.0.1') {
        console.log('no valid request was possible, due to missing url');
        dataArray[currentArrayPositionDarkskyUrls].latitude = null;
        dataArray[currentArrayPositionDarkskyUrls].longitude = null;
        dataArray[currentArrayPositionDarkskyUrls].unixTimestamp = null;
        dataArray[currentArrayPositionDarkskyUrls].apparentTemperature = null;
        dataArray[currentArrayPositionDarkskyUrls].cloudCover = null;
        dataArray[currentArrayPositionDarkskyUrls].dewPoint = null;
        dataArray[currentArrayPositionDarkskyUrls].humidity = null;
        dataArray[currentArrayPositionDarkskyUrls].icon = null;
        dataArray[currentArrayPositionDarkskyUrls].cloudCover = null;
        dataArray[currentArrayPositionDarkskyUrls].precipIntensity = null;
        dataArray[currentArrayPositionDarkskyUrls].precipProbability = null;
        dataArray[currentArrayPositionDarkskyUrls].precipType = null;
        dataArray[currentArrayPositionDarkskyUrls].pressure = null;
        dataArray[currentArrayPositionDarkskyUrls].summary = null;
        dataArray[currentArrayPositionDarkskyUrls].temperature = null;
        dataArray[currentArrayPositionDarkskyUrls].visibility = null;
        dataArray[currentArrayPositionDarkskyUrls].windBearing = null;
        dataArray[currentArrayPositionDarkskyUrls].windSpeed = null;
        currentArrayPositionDarkskyUrls++;
        done();
      } else {

        body = JSON.parse(body);

        dataArray[currentArrayPositionDarkskyUrls].latitude = body.latitude || null;
        dataArray[currentArrayPositionDarkskyUrls].longitude = body.longitude || null;
        dataArray[currentArrayPositionDarkskyUrls].unixTimestamp = body.currently.time || null;
        dataArray[currentArrayPositionDarkskyUrls].apparentTemperature = body.currently.apparentTemperature || null;
        dataArray[currentArrayPositionDarkskyUrls].cloudCover = body.currently.cloudCover || null;
        dataArray[currentArrayPositionDarkskyUrls].dewPoint = body.currently.dewPoint || null;
        dataArray[currentArrayPositionDarkskyUrls].humidity = body.currently.humidity || null;
        dataArray[currentArrayPositionDarkskyUrls].icon = body.currently.icon || null;
        dataArray[currentArrayPositionDarkskyUrls].cloudCover = body.currently.cloudCover || null;
        dataArray[currentArrayPositionDarkskyUrls].precipIntensity = body.currently.precipIntensity || null;
        dataArray[currentArrayPositionDarkskyUrls].precipProbability = body.currently.precipProbability || null;
        dataArray[currentArrayPositionDarkskyUrls].precipType = body.currently.precipType || null;
        dataArray[currentArrayPositionDarkskyUrls].pressure = body.currently.pressure || null;
        dataArray[currentArrayPositionDarkskyUrls].summary = body.currently.summary || null;
        dataArray[currentArrayPositionDarkskyUrls].temperature = body.currently.temperature || null;
        dataArray[currentArrayPositionDarkskyUrls].visibility = body.currently.visibility || null;
        dataArray[currentArrayPositionDarkskyUrls].windBearing = body.currently.windBearing || null;
        dataArray[currentArrayPositionDarkskyUrls].windSpeed = body.currently.windSpeed || null;

        currentArrayPositionDarkskyUrls++;
        done();
      }

    });
  },
  end: function () {
    console.log("Darksky Request Queue completed!");
    try {
      const csv = json2csv(dataArray);
      fs.writeFileSync('import_data_without_new_headers2.csv', csv);
    } catch (err) {
      console.error(err);
    }
  }
});