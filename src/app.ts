import { config } from "dotenv"
config();

import "./passport";


import express, { Application } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';

import routes from "./routes";
import * as Middlewares from "./middlewares"
import { responseLogger } from './middlewares/index';

const app: Application = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
(process.env.NODE_ENV === "DEV" ? app.use(morgan("dev")) : null);
app.use(cors({
        methods: "GET,POST,DELETE,OPTIONS",
        credentials: true,
        origin: true
}));

app.use(Middlewares.responseLogger);
app.use(routes);

export default app;
