import express from "express";
import { parse } from "csv-parse/sync";
import { parse as htmlParse } from 'node-html-parser';
import { parseTime } from "../utils/time.js";
import { getLineData } from "./lineRouter.js";
import { writeFileSync } from 'fs';
import lineMappings from "../data/lineMappings.json" with { type: "json" };

export const stopRouter = new express.Router();
const TAM_DATA_ENDPOINT = "http://data.montpellier3m.fr/sites/default/files/ressources/TAM_MMM_TpsReel.csv"

stopRouter.get('/next/:station', async (req, res) => {
  // #swagger.tags = ['Stop']
  // #swagger.summary = 'Get next trams at a station. You can filter by line and destination.'
  const tamCSV = await (await fetch(TAM_DATA_ENDPOINT)).text()
  const records = parse(tamCSV, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';',
  })

  let data = records.filter(record => record.stop_name === req.params.station.toUpperCase());

  if (req.query.line) {
    data = data.filter(record => record.route_short_name === req.query.line);
  }

  if (req.query.destination) {
    data = data.filter(record => record.trip_headsign === req.query.destination.toUpperCase());
  }
  res.json(data.map(data => ({
    line: data.route_short_name,
    stop: data.stop_name,
    destination: data.trip_headsign,
    time: data.departure_time,
    duration: parseTime(data.departure_time),
    isTheorical: Boolean(+data.is_theorical),
  })));
});

const baseURL = 'https://www.tam-voyages.com/horaires_arret/?rub_code=28'
stopRouter.get('/schedule/:station/:line/:direction', async (req, res) => {
  // #swagger.tags = ['Stop']
  // #swagger.summary = 'Get the schedule of a station for a line and a direction.'

  if(!req.params.station || !req.params.direction || !req.params.line) {
    return res.status(400).json({error: 'Missing parameters'})
  }

  const lineId = lineMappings.find(x => +x.numero === +req.params.line)?.id
  const lineData = await getLineData(req.params.line, req.params.direction)  
  const stopId = lineData.stops.find(stop => stop.nom.toLowerCase() === req.params.station.toLowerCase())?.id
  if (!stopId) {
    return res.status(404).json({error: 'Stop not found'})
  }

  const url = `${baseURL}&lign_id=${lineId}&sens=${req.params.direction}&laDate=${encodeURIComponent(new Date().toLocaleDateString('fr-FR'))}&pa_id=${stopId}`
  fetch(url)
    .then(response => {
      return response.text()
    }).then(text => {
      const root = htmlParse(text)
      const table = root.getElementById('stophour')
      if(!table) {
        return res.status(404).json({error: `Schedule not found at this url : ${url}`})
      }

      const schedule = {};

      const hourCells = table.querySelectorAll('td.hour');
      hourCells.forEach(cell => {
        const hour = cell.getAttribute('headers').replace('hour', '');
        const minutes = [];
        cell.querySelectorAll('div').forEach(div => {
            const minuteText = div.childNodes?.[0]?.rawText;
            if (minuteText) {
                minutes.push(minuteText);
            }
        });
        schedule[hour] = minutes;
      });
      res.json({
        station: req.params.station,
        line: req.params.line,
        destination: lineData.ligne_param[['nom_aller', 'nom_retour'][(+req.params.direction) - 1]],
        schedule
      })
    })

})