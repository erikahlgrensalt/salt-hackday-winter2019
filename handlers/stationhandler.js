require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const util = require('util');

const fileWrite = util.promisify(fs.writeFile);
const fileRead = util.promisify(fs.readFile);

// DEV mode to not exhaust SL's site-API quota, should initialize .json-file with allStationsHandler.
// const allStationsHandler = require('./allstationshandler');
// const siteIds = (async () => await allStationsHandler.allMetroStationSiteIDs())();
const siteIds = require('./siteids.json'); 

// 30 calls/min || 10 000 calls/month with each.
const apiKeys = process.env.REALTIMEAPIKEYS.split(',');  

async function getNextDepartureDeviation(siteid, key) {
  
  const url = `http://api.sl.se/api2/realtimedeparturesV4.json?key=${key}&siteid=${siteid}&Bus=false&Train=false&Tram=false&Ship=false&timewindow=15`;
  const nextDeviation = await nextDepartureDeviation(url);

  if(nextDeviation === null || nextDeviation === undefined) 
    return null;
  
  return {
    schedule: nextDeviation[0].TimeTabledDateTime,
    expected: nextDeviation[0].ExpectedDateTime,
    deviation: nextDeviation[0].ExpectedDateTime.localeCompare(nextDeviation[0].TimeTabledDateTime)
  };
}

const nextDepartureDeviation = async (url) => {
  
  const data = await fetch(url)
    .then(res => res.json());
  
  if(data === undefined) {
    console.log('no response');
    return null;
  }

  if(data.StatusCode !== 0){
    console.log('Error in response: ', data.StatusCode);
    return null;
  }

  if(data.ResponseData.Metros.length === 0) {
    console.log('no departures');
    return null;
  }

  return data.ResponseData.Metros;
};

function repeatArray(arr, count) {

  var length = arr.length;    
  var newArr = new Array();  
  
  for(let i=0; i<count; i++) {  
    newArr.push(arr[i%length]); 
  } 

  return newArr;     
}

async function calculateAvgMinute(arr) {
  
  const deviationMinuteArray = [];
  
  arr.forEach(el => {
    
    if(el !== null) {
      
      const scheduleMinute = el.schedule.slice(14,16);
      const scheduleSecond = el.schedule.slice(17);
      const expectedMinute = el.expected.slice(14,16);
      const expectedSecond = el.expected.slice(17);  

      let minuteDeviation = expectedMinute - scheduleMinute;
      const secondDeviation = expectedSecond - scheduleSecond;
  
      const standardMin = 60;
      let actualDeviation;
      
      if(minuteDeviation < 0) {
        minuteDeviation = 0;
      }

      actualDeviation = minuteDeviation > 1 || minuteDeviation < 0 ? minuteDeviation*standardMin + secondDeviation: standardMin + secondDeviation;
      
      // individual api-call result logging
      console.log('deviation minute', minuteDeviation, secondDeviation, actualDeviation);
      
      deviationMinuteArray.push(actualDeviation);
    }
  });

  let actualMinute = deviationMinuteArray.reduce((a,b) => a + b, 0) / deviationMinuteArray.length;
  
  console.log('Actual Live Minute: ', actualMinute);
  
  if(isNaN(actualMinute)) {
    return 'SL is too cheap with their API to give you an actual response';
  }

  const deviations = await fileRead('./jsons/deviations.json', 'utf8');
  const parsedDeviations = JSON.parse(deviations);
  
  if(!deviations) {
    fileWrite('./jsons/deviations.json', JSON.stringify({minutes: [actualMinute]}));
  }

  if(deviations) {
    parsedDeviations.minutes.push(actualMinute);
    fileWrite('./jsons/deviations.json', JSON.stringify({minutes: parsedDeviations.minutes}));
  }

  actualMinute = parsedDeviations.minutes.reduce((a, cv, i, arr) => {
    a += cv;
    
    return i === arr.length-1 ? a/arr.length : a;
  });
  
  const minutes = Math.floor(actualMinute / 60);
  const seconds = Math.round(actualMinute - minutes * 60);

  console.log('Average minute over time: ', actualMinute);
   
  return `${minutes} minute, ${seconds} seconds`;
}

function getMinute () {
 
  const keyArr = repeatArray(apiKeys, siteIds.length);
  
  return Promise.all(siteIds.map((el, i) => getNextDepartureDeviation(el, keyArr[i])))
    .then(data => calculateAvgMinute(data));
}

module.exports.getMinute = getMinute;
