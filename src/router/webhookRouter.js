import express from "express";
import { nextTram } from "../responseActions/nextTram.js";
import { nextTrams } from "../responseActions/nextTrams.js";

const ACTIONS = {
  nextTram: nextTram,
  nextTrams : nextTrams
}

const getResponse = text => ({
  fulfillment_response: {
    messages: [
      {
        text: {
          text: [text]
        }
      }
    ]
  },
})

export const webhookRouter = new express.Router();
webhookRouter.post('/', async (req, res) => {
  const action = req?.body?.fulfillmentInfo?.tag;
    try {
        if (action in ACTIONS) {
            const text = ACTIONS[action](req, res);
            return res.json(getResponse(text));
        } else {
            return res.json(getResponse("Je ne peux pas répondre à cette action."));
        }
    } catch (error) {
        console.error(error);
        res.json(getResponse("Je ne peux pas récupérer les horaires pour le moment."));
    }
});