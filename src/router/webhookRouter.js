import express from "express";

export const webhookRouter = new express.Router();

webhookRouter.post('/', async (req, res) => {
  // const nomStation = req.body.queryResult.parameters.nom_station;
    // if (!nomStation) {
    //     return res.json({ fulfillmentText: "Je n'ai pas compris le nom de la station." });
    // }

    try {
        const response = await fetch(`https://tam.alexis-mateo.fr/stop/next/${encodeURIComponent('pl. de l\'europe')}?line=1&destination=mosson`);
        const data = await response.json();
        const nextTram = data[0].duration;
        res.json({ fulfillmentText: `Le prochain tram arrive dans toto minutes.` });
        // res.json({ fulfillmentText: `Le prochain tram arrive dans ${nextTram} minutes.` });
    } catch (error) {
        console.error(error);
        res.json({ fulfillmentText: "Je ne peux pas récupérer les horaires pour le moment." });
    }
});