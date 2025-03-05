import express from "express";

export const getResearch = async (query) => {
  const baseURL = `https://cartographie.tam-voyages.com/api/itinerary/autocomplete?q=${encodeURIComponent(query)}`
  return (await (await fetch(baseURL)).json()).Data
}

export const searchRouter = new express.Router();
searchRouter.get('/', async (req, res) => {
  if(!req.query.q) {
    return res.status(400).json({error: 'Missing query parameter'})
  }

  const data = await getResearch(req.query.q)
  res.json(data.slice(0, +req.query.limit || 5))
});