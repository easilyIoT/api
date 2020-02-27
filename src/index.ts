import "./env"
require("util").inspect.defaultOptions.depth = null;

import express, { Application } from "express";

import server from "./app"
import initMqtt from "./mqtt"
import initDBConnection from "./db"

import { MQTT_BROKER_URL, DB_URL } from "./config"
import { injectMQTT, injectDeviceHealth } from './middlewares';


const main = async () => {
        console.log("Initilizing SERVER");

        const app: Application = express();
        const port = process.env.PORT || 8000;

        try {
                await initDBConnection;
                console.log("✅  MONGODB connection initialized");
        } catch (e) {
                console.error("⛔  Failed connection with DB")
                process.exit(1);
        }

        try {
                const { client, devices } = await initMqtt(MQTT_BROKER_URL, {
                        clientId: "Central Node"
                });

                app.use(injectMQTT(client));
                app.use(injectDeviceHealth(devices));
                
                console.log("✅  MQTT initialized");

        } catch (e) {
                console.error("⛔  Failed connection with MQTT Broker");
                process.exit(1);
        }

       
        app.use(server);
        app.listen(port, () => console.log(`Server Online at port ${port} 🚀`));

};

main();
