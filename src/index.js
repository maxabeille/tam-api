import express from 'express';
import cors from 'cors';
import { stopRouter } from './router/stopRouter.js';
import { lineRouter } from "./router/lineRouter.js";
import { webhookRouter } from "./router/webhookRouter.js";
import swaggerUi from 'swagger-ui-express'
import swaggerFile from '../swagger_output.json' with { type: "json" };

const app = express();
app.use(express.json());
app.use(cors());

app.use('/stop', stopRouter)
app.use('/line', lineRouter)
app.use('/webhook', webhookRouter)
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.get('/', (req, res) => {
     // #swagger.ignore = true
    res.redirect('/doc')
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})