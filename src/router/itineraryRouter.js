import express from "express";

export const itineraryRouter = express.Router()


itineraryRouter.get('/', async (req, res) => {
  // #swagger.tags = ['Itinerary']
  // #swagger.summary = 'Get itinerary from stop to stop'

  let { from, to, date, time } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing stops' });
  }
  const now = new Date();
  date = date || now.toISOString().split('T')[0];
  time = time || now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const url = new URL(`https://cartographie.tam-voyages.com/api/itinerary/search`);
  url.searchParams.set('from_id', from);
  url.searchParams.set('from_type', '4');
  url.searchParams.set('to_id', to);
  url.searchParams.set('to_type', '4');
  url.searchParams.set('date', date);
  url.searchParams.set('time', time);
  const itinerary = await fetch(url)

  res.json(await itinerary.json())

})