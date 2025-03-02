import express from "express";
import { parse } from "csv-parse/sync";
import { parseTime } from "../utils/time.js";

export const stopRouter = new express.Router();
const TAM_DATA_ENDPOINT = "http://data.montpellier3m.fr/sites/default/files/ressources/TAM_MMM_TpsReel.csv"

stopRouter.get('/next/:station', async (req, res) => {
  // #swagger.tags = ['Stop']
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