import express from "express";
import { parse } from "csv-parse/sync";
import { parse as htmlParse } from 'node-html-parser';
import { parseTime } from "../utils/time.js";
import { getLineData } from "./lineRouter.js";
import { writeFileSync } from 'fs';
import lineMappings from "../data/lineMappings.json" with { type: "json" };
import {getResearch} from "../helper/searchHelper.js";
import {deepToArray, flattenStops} from "../helper/stopHelper.js";

export const stopRouter = new express.Router();

stopRouter.get('/schedule/:station/:line/:direction', async (req, res) => {
  // #swagger.tags = ['Stop']
  // #swagger.summary = 'Get the schedule of a station for a line and a direction.'

  const baseURL = 'https://www.tam-voyages.com/horaires_arret/?rub_code=28'
  if(!req.params.station || !req.params.direction || !req.params.line) {
    return res.status(400).json({error: 'Missing parameters'})
  }

  const lineId = lineMappings.find(x => +x.numero === +req.params.line)?.ligne_param.commercialId
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

stopRouter.get('/next/:station', async (req, res) => {
  // #swagger.tags = ['Stop']
  // #swagger.summary = 'Get next trams at a station. You can filter by line and destination.'
  const regex = /S+\d*/g

  let id = req.params.station
  if (!id.match(regex)) {
    const search = await getResearch(id)
    if (search.length) {
      const exactMatch = search.find(stop => stop.Name.toLowerCase() === id.toLowerCase())
      if(exactMatch) {
        id = exactMatch.Id
      } else {
        id = search[0].Id
      }
    }
  }

  if (String(id).charAt(0) !== 'S') {
    id = 'S' + id
  }

  const response = await fetch(`https://cartographie.tam-voyages.com/gtfs/stop/rt/${id}`);
  let data = flattenStops(await response.json());

  if (req.query.line) {
    data = data.filter(tram => tram.ligne === req.query.line);
  }

  if (req.query.destination) {
    data = data.filter(tram => tram.direction_name.toLowerCase().includes(req.query.destination.toLowerCase()))
  }

  for (const stop of data) {
    stop.details = lineMappings.find(x => x.numero === stop.ligne)
  }

  res.json(data);
});

stopRouter.get('/:station/related', async (req, res) => {
  // #swagger.tags = ['Stop']
  // #swagger.summary = 'Get related line to a station.'

  const regex = /S+\d*/g

  let id = req.params.station
  if (!id.match(regex)) {
    const search = await getResearch(id)
    if (search.length) {
      const exactMatch = search.find(stop => stop.Name.toLowerCase() === id.toLowerCase())
      if(exactMatch) {
        id = exactMatch.Id
      } else {
        id = search[0].Id
      }
    }
  }

  const response = await fetch(`https://cartographie.tam-voyages.com/gtfs/stopsarea`);
  let data = await response.json()
  const linkedLines = data.find(stop => stop.stop_code == id).linked_lignes

  res.json(linkedLines.map(line => {
    const lineData = lineMappings.find(x => x.id == line.id)
    return lineData
  }));
})