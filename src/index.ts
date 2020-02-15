import "./env"

import { connect } from "mongoose"

import app from "./app"
import initMqtt from "./mqtt"
import initDBConnection from "./db"

import { MQTT_BROKER_URL, DB_URL } from "./config"
import { enqueueMQTT } from './middlewares/index';

(async () => {
        console.log("Initilizing SERVER")
        const port = process.env.PORT || 8000;

        try {
                const client = await initMqtt(MQTT_BROKER_URL, {
                        clientId: "Central Node"
                });

                app.use(enqueueMQTT(client));

                console.log("MQTT initialized");

        } catch (e) {
                console.error("Failed connection with MQTT Broker");
                process.exit(1);
        }

        try {
                await initDBConnection;
                console.log("MONGODB connection initialized");
        } catch (e) {
                console.error("Failed connection with DB")
                process.exit(1);
        }

        app.listen(port, () => console.log("Server Online at port " + port));

})()
