import express from "express";
import lineMappings from "../data/lineMappings.json" with { type: "json" };
import busGeo from "../data/MMM_MMM_BusLigne.json" with { type: "json" };
import tramGeo from "../data/MMM_MMM_LigneTram.json" with { type: "json" };

export const lineRouter = express.Router()

const getStop = (stop) => ({
  id: stop.Id,
  name: stop.Name,
  lat: stop.Latitude,
  lon: stop.Longitude,
  logicalId: stop.LogicalStop.Id
})

const BASE = "https://www.tam-voyages.com/WebServices/TransinfoService/api/MAP/v2/GetLineStops/json?key=TAM&Lang=FR"

export const getLineData = async (lineNumber, direction) => {
  const data = await (await fetch(`https://cartographie.tam-voyages.com/gtfs/ligne/${lineNumber}/ordered-arrets/${direction - 1}`)).json()
  return { ...data, stops: Object.values(data.stops) }
}

lineRouter.get('/geojson/:line/:direction', async (req, res) => {
  // #swagger.tags = ['Line']
  // #swagger.summary = 'Get GeoJSON of a line'

  const mapping = ["Aller", "Retour"]
  let geoJson = []
  if (['1', '2'].includes(req.params.direction)) {
    geoJson = busGeo.features.find(x =>
        x.properties.num_exploitation === +req.params.line
        && x.properties.sens === mapping[req.params.direction - 1]
    )
  } else {
    geoJson = tramGeo.features.find(x =>
        x.properties.num_exploitation === +req.params.line
        && x.properties.nom_ligne.endsWith(req.params.direction)
    )
  }
  res.json(geoJson || [])
})

lineRouter.get('/:line/:direction', async (req, res) => {
  // #swagger.tags = ['Line']
  // #swagger.summary = 'Get line informations like stops, bounds, etc.'
  const lineId = lineMappings.find(x => +x.id === +req.params.line)
  if (!lineId) {
    res.status(404).json({error: 'Line not found'})
    return
  }

  if (!['1', '2'].includes(req.params.direction)) {
    res.status(404).json({error: 'Direction not found'})
    return
  }

  const data = await getLineData(req.params.line, req.params.direction)
  res.json(data)
});

lineRouter.get('/', async (req, res) => {
  // #swagger.tags = ['Line']
  // #swagger.summary = 'Get all lines'
  if (req.query.type && !['tramway', 'bus', 'autobus'].includes(req.query.type)) {
    return res.status(404).json({error: 'Type not found'})
  }

  if (req.query.type) {
    return res.json(lineMappings.filter(x => x.type === req.query.type))
  }
  res.json(lineMappings)
});