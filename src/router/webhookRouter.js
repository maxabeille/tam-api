import express from "express";
import { nextTram } from "../responseActions/nextTram";

export const webhookRouter = new express.Router();

const ACTIONS = {
  nextTram: nextTram,
  nextTrams : nextTram
}

webhookRouter.post('/', async (req, res) => {
  const action = req.body.queryResult?.action
    try {
        if (action in ACTIONS) {
            return ACTIONS[action](req, res);
        } else {
            return res.json({ fulfillmentText: "Je ne peux pas répondre à cette action." });
        }
    } catch (error) {
        console.error(error);
        res.json({ fulfillmentText: "Je ne peux pas récupérer les horaires pour le moment." });
    }
});