## Salt Hackday Winter 2019

The purpose of this project is to display the actual length of a "subway minute" in the Stockholm subway. Time is calculated from actual departures compared to the timtables. The times are collected through various API calls. Time is also averaged out over time the server is running. A new time entry is made for every HTTP-request.

The logic is divided over: 
- `index.js` 
- `handlers/allstationhandler.js`
- `handlers/stationhandler.js` 
- & a simple front end script in `public/index.js`.

### Instructions:

The backend is a simple express server. `npm i` & `npm start` to launch. It listens on port `8001`on `localhost`. Keys from the Trafiklab API have been purged from the repo.

