const axios = require('axios');

var apiKey = 'd6d67865e1837a3aab81407f5199a103';
var weatherUrl = `https://api.darksky.net/forecast/d6d67865e1837a3aab81407f5199a103/42.3601,-71.0589,2018-01-08T10:10:10?exclude=currently,flags`;

axios.get(weatherUrl).then((response) => {
  console.log(response.data);
}).catch((e) => {
  console.log(e.message);
});
