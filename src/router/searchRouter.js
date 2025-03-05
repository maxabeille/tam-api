import express from "express";
import {getResearch} from "../helper/searchHelper.js";

export const searchRouter = new express.Router();
searchRouter.get('/', async (req, res) => {
  if(!req.query.q) {
    return res.status(400).json({error: 'Missing query parameter'})
  }

  const data = await getResearch(req.query.q)
  res.json(data.slice(0, +req.query.limit || 5))
});
