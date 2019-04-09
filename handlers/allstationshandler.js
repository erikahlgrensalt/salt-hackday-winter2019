require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

// 5 calls/min || 500 calls/month with each.
const apiKey = process.env.SITEAPIKEY;

const apiURL = `https://api.sl.se/api2/linedata.json?key=${apiKey}&model=`;

const allMetroStationSiteIDs = async () => {
  const stationArray = await allMetroStations(apiURL + 'stop');
  const stopAreaNumbers = stationArray.map(el => el.StopAreaNumber);
  const siteArray = await allMetroSites(apiURL + 'site');
  let uniqueStopAreaNumbers = [...new Set(stopAreaNumbers)];

  const siteIds = siteArray
    .filter(el => uniqueStopAreaNumbers.includes(el.StopAreaNumber))
    .map(el => el.SiteId)
    .filter(el => el[0] === '9');
  fs.writeFileSync('./jsons/siteids.json', JSON.stringify(siteIds));
  return siteIds;
}

const allMetroStations = async (url) => {
  const allStations = await getAllMetros(url);
  const allMetroStations = allStations.filter(el => el.StopAreaTypeCode ==='METROSTN');
  return allMetroStations;
}

const allMetroSites = async (url) => {
  const allSites = await getAllMetros(url);
  return allSites;
}

const getAllMetros = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.json())
      .then(data => data.ResponseData.Result)
      .then(stations => resolve(stations))
      .catch(err => reject(err));
  });
};

module.exports.allMetroStationSiteIDs = allMetroStationSiteIDs;
