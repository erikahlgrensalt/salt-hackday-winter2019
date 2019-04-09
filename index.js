const express = require('express');
const deviations = require('./handlers/stationhandler');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const port = 8001;

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/info', renderMinute);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

async function renderMinute(req, res) {
  res.status(200);
  const minute = await deviations.getMinute();
  console.log(minute);
  res.send(JSON.stringify({key: minute}));
}