import { config } from "dotenv"
config();

import express, { Application } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mqtt, { MqttClient } from 'mqtt';

import routes from "./routes";
import { enqueueMQTT } from "./middlewares";

import initMQTT from "./mqtt"

import { DB_URL, MQTT_BROKER_URL } from "./config";
import "./passport";

const app: Application = express();

console.log(DB_URL)

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"))
app.use(cors({
        methods: "GET,POST,DELETE,OPTIONS",
        credentials: true,
        origin: true
}));
app.set(`trust proxy`, true);


//Routes
app.use(routes);


export default app;
