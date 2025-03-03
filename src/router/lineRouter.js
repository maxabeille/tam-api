import express from "express";
import lineMappings from "../data/lineMappings.json" with { type: "json" };

export const lineRouter = express.Router()

const getStop = (stop) => ({
  id: stop.Id,
  name: stop.Name,
  lat: stop.Latitude,
  lon: stop.Longitude,
  logicalId: stop.LogicalStop.Id
})

const BASE = "https://www.tam-voyages.com/WebServices/TransinfoService/api/MAP/v2/GetLineStops/json?key=TAM&Lang=FR"

export const getLineData = async (lineId, lineNumber, direction) => {
  const data = await (await fetch(`${BASE}&Line=${lineId}&Direction=${direction}`)).json()

  const line = {
    id: lineId,
    number: lineNumber,
    name: data.Data[0].LineList[0].Name,
    bounds: {
      first: getStop(data.Data[0]),
      last: getStop(data.Data[data.Data.length - 1])
    },
    stops: data.Data.map(getStop)
  }
  return line
}

lineRouter.get('/:line/:direction', async (req, res) => {
  // #swagger.tags = ['Line']
  // #swagger.summary = 'Get line informations like stops, bounds, etc.'
  const lineId = lineMappings.find(x => x.number === +req.params.line)?.id
  if (!lineId) {
    res.status(404).json({error: 'Line not found'})
    return
  }

  if (!['1', '2'].includes(req.params.direction)) {
    res.status(404).json({error: 'Direction not found'})
    return
  }

  const data = await getLineData(lineId, req.params.line, req.params.direction)
  res.json(data)
});

lineRouter.get('/', async (req, res) => {
  // #swagger.tags = ['Line']
  // #swagger.summary = 'Get all lines'
  if (req.query.type && !['tram', 'bus'].includes(req.query.type)) {
    return res.status(404).json({error: 'Type not found'})
  }

  if (req.query.type) {
    return res.json(lineMappings.filter(x => x.type === req.query.type))
  }
  res.json(lineMappings)
});