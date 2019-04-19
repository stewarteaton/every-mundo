var express = require('express');
var router = express.Router();
//used for get request
var request =require('request');
//used for sending JSON form body data to API
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//used to decode  B64 JSON to use for sorting
var atob = require('atob');

//API Key - get environment variable to protect key
api_key = process.env.API_KEY;

/* GET home page. */
router.get('/', function(req, res, next) {
  request.get(`https://everymundointernship.herokuapp.com/popularRoutes/${api_key}`,(err, response, body) => {
    if (err){
      return next(err);
    }
    const popRoutes = JSON.parse(body);
    console.log(popRoutes);
    res.render('index', {title: 'Popular Routes', popRoutes})
    
  })

});

//Pass selected POPULAR route (one way) to SEARCH FORM
router.get('/searchForm/:origin/:destination/:tripType/:m/:d/:y', function(req, res, next) {
  const origin = req.params.origin;
  const destination = req.params.destination;
  const tripType = req.params.tripType;

  var isOneWay;
  if(tripType == "oneWay"){
    isOneWay = true;
  } else{
    isOneWay = false;
  }
  
  var month = req.params.m;
  var day = req.params.d;
  const year = req.params.y;
  //if month or day is single digit, add a zero so it works with date string
  if (/^\d$/.test(month))  {
    month = "0"+month;
  }
  if (/^\d$/.test(day))  {
    day = "0" + day;
  }

  //must put date in this format so can pass predefined value to type date input
  var departDate = year +"-"+month+"-"+day;

  res.render('searchForm', {title : 'Search For Flights', origin: origin, destination:destination, tripType: tripType, departureDate: departDate ,isOneWay: isOneWay})  
});


//Pass selected POPULAR routes (round trip) to SEARCH FORM
router.get('/searchForm/:origin/:destination/:tripType/:m/:d/:y/:m2/:d2/:y2', function(req, res, next) {
  const origin = req.params.origin;
  const destination = req.params.destination;
  const tripType = req.params.tripType;

  var isOneWay;
  if(tripType == "oneWay"){
    isOneWay = true;
  } else{
    isOneWay = false;
  }
  //DEPART
  var month = req.params.m;
  var day = req.params.d;
  const year = req.params.y;
  //if month or day is single digit, add a zero so it works with date string
  if (/^\d$/.test(month))  {
    month = "0"+month;
  }
  if (/^\d$/.test(day))  {
    day = "0" + day;
  }

  //must put date in this format so can pass predefined value to type date input
  var departDate = year +"-"+month+"-"+day;

  //RETURN
  var month2 = req.params.m2;
  var day2 = req.params.d2;
  const year2 = req.params.y2;
  //if month or day is single digit, add a zero so it works with date string
  if (/^\d$/.test(month2))  {
    month2 = "0"+month2;
  }
  if (/^\d$/.test(day2))  {
    day2 = "0" + day2;
  }

  //must put date in this format so can pass predefined value to type date input
  var returnDate = year2 +"-"+month2+"-"+day2;

  //Date Min

  res.render('searchForm', {title : 'Search For Flights', origin: origin, destination:destination, tripType: tripType, departureDate: departDate, returnDate: returnDate,isOneWay: isOneWay})  
});



// **** get POST Values From SEARCH FORM  **** //
// **** Send JSON to API  **** //
// **** Render Search RESULTS  **** //
router.post('/searchPost', function(req, res) {
    //get form data
    var results = (req.body);
    //parse passenger count to (int) to comply with post request parameters
    results.passengerCount = parseInt(results.passengerCount, 10);
    //Check if round trip
    var returnDate =  results.returnDate;
    var isOneWay;
    console.log("THIs is teh re " +results.tripType);
    // if (returnDate == undefined){
    //   isOneWay = true;
    // }
    // else{
    //   isOneWay = false;
    // }
    if (results.tripType == "1"){
      isOneWay = true;
    }
    else{
      isOneWay = false;
    }

    //declare variable for json search results
    var jsonReturned;
    //create XML http request to send form body to API and recieve search results
    var xhr = new XMLHttpRequest();
    var url = `https://everymundointernship.herokuapp.com/search/${api_key}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            jsonReturned = JSON.parse(xhr.responseText);


            var data = jsonReturned[0].routes;
          
            // console.log("This is : "+data[0].arrivalTime);
  
            //declare string to hold flight duration
            var duration = [];
            var counter = 0; 
            for(key in data) {
                counter = counter +1;
             };

             
            //Create flight duration variable and append to array
            for(i = 0; i<counter; i++){
              var arrival = data[i].arrivalTime;
                arrival = arrival.replace(/:/g, '.');
                arrival = parseFloat(arrival);
              var depart =  data[i].departureTime;
                depart = depart.replace(/:/g, '.');
                depart = parseFloat(depart);
              var x = arrival - depart;
              //round to hundredths place
              x = Math.ceil(x*100)/100;
              //convert to minutes
              duration.push(x);
            };
            //add duration to js object departs
            for(i=0; i<counter; i++){
              jsonReturned[0].routes[i].duration = duration[i];
            };


            //if round trip, get duration of returning flights
            var duration2 = [];
            var counter2 =0;
            if(!isOneWay){
              data2 = jsonReturned[1].routes;
              for(key in data2) {
                counter2 = counter2 +1;
              }
              //  creater flight duration varibale append to array
              for(i = 0; i<counter2; i++){
                var arrival = data2[i].arrivalTime;
                arrival = arrival.replace(/:/g, '.');
                arrival = parseFloat(arrival);
                 var depart =  data2[i].departureTime;
                depart = depart.replace(/:/g, '.');
                depart = parseFloat(depart);
                var x = arrival - depart;
                //round to hundredths place
                x = Math.ceil(x*100)/100;
                //convert to minutes
                duration2.push(x);
              };

                //add duration array to js objec returns
                 for(i=0; i<counter2; i++){
                  jsonReturned[1].routes[i].duration = duration2[i]
               };
            }

            //pass stringified json for purpose of passing to sorted function upon click
            var objJsonStr = JSON.stringify(jsonReturned);
            var objJsonB64 = Buffer.from(objJsonStr).toString("base64");           
             if(isOneWay){
              res.render('resultsOneWay',{title: '', flightsTo : jsonReturned[0], jsonBase64: objJsonB64, duration: duration});
            }
            else{
              res.render('resultsRoundTrip',{title: '', flightsTo : jsonReturned[0],flightsFrom : jsonReturned[1], jsonBase64: objJsonB64});              
              // res.render('results',{title: 'Available Flights', flightsFrom : jsonReturned[1] });
            }
            
        }
    };
    //Send JSON Form data to API
    xhr.send(JSON.stringify(results));
    
  });


  // *****   SORT RESULTS  (One Way)  *****
  router.get('/sortResults/:sortID/:jsonString', function(req, res, next) {
    var sortID = req.params.sortID;
    console.log(sortID);
    var jsonB64 = req.params.jsonString
    console.log('\n'+jsonB64);
    var decoded = JSON.parse(atob(jsonB64));

    //sort price lowest to highest 
    if(sortID == 0){
        decoded[0].routes.sort(function(a,b){
        return a.priceUSD - b.priceUSD;
        });
        res.render('resultsOneWay', {title: 'Sorted Price (low -> high)', flightsTo: decoded[0], jsonBase64: jsonB64}) 
    }
    //sort price high to low
    if(sortID == 1){
      decoded[0].routes.sort(function(a,b){
      return b.priceUSD - a.priceUSD;
      });
      res.render('resultsOneWay', {title: 'Sorted Price (high -> low)', flightsTo: decoded[0], jsonBase64: jsonB64}) 
    }
    //sorts by arrival times
    if(sortID == 2){
      decoded[0].routes.sort(function(a,b){
      return a.arrivalTime - b.arrivalTime;
      });
      res.render('resultsOneWay', {title: 'Sorted by Arrival Time', flightsTo: decoded[0], jsonBase64: jsonB64}) 
    }
    //sorts by departure times
    if(sortID == 3){
      decoded[0].routes.sort(function(a,b){
      return a.duration - b.duration;
      });
      res.render('resultsOneWay', {title: 'Sorted by Duration', flightsTo: decoded[0], jsonBase64: jsonB64}) 
    }
  });

  // *****   SORT RESULTS  (Round Trip)  *****
  router.get('/sortResultsRoundTrip/:sortID/:jsonString', function(req, res, next) {
    var sortID = req.params.sortID;
    console.log(sortID);
    var jsonB64 = req.params.jsonString
    console.log('\n'+jsonB64);
    var decoded = JSON.parse(atob(jsonB64));

    //sort price lowest to highest 
    if(sortID == 0){
        decoded[0].routes.sort(function(a,b){
        return a.priceUSD - b.priceUSD;
        });
        decoded[1].routes.sort(function(a,b){
        return a.priceUSD - b.priceUSD;
        });
        res.render('resultsRoundTrip', {title: 'Sorted Price (low -> high)', flightsTo: decoded[0], flightsFrom: decoded[1], jsonBase64: jsonB64}) 
    }
    //sort price high to low
    if(sortID == 1){
      decoded[0].routes.sort(function(a,b){
      return b.priceUSD - a.priceUSD;
      });
      decoded[1].routes.sort(function(a,b){
      return b.priceUSD - a.priceUSD;
      });
      res.render('resultsRoundTrip', {title: 'Sorted Price (low -> high)', flightsTo: decoded[0], flightsFrom: decoded[1], jsonBase64: jsonB64}) 
    }
    //sorts by arrival times
    if(sortID == 2){
      decoded[0].routes.sort(function(a,b){
      return a.arrivalTime - b.arrivalTime;
      });
      decoded[1].routes.sort(function(a,b){
      return a.arrivalTime - b.arrivalTime;
      });
      res.render('resultsRoundTrip', {title: 'Sorted Price (low -> high)', flightsTo: decoded[0], flightsFrom: decoded[1], jsonBase64: jsonB64}) 
    }
    //sorts by duration
    if(sortID == 3){
      decoded[0].routes.sort(function(a,b){
      return a.duration - b.duration;
      });
      decoded[1].routes.sort(function(a,b){
      return a.duration - b.duration;
      });
      res.render('resultsRoundTrip', {title: 'Sorted Price (low -> high)', flightsTo: decoded[0], flightsFrom: decoded[1], jsonBase64: jsonB64}) 
    }
  });

module.exports = router;
