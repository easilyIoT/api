
import "../src/env";

import supertest, { SuperTest, Test } from "supertest"
import { connect } from "mongoose"

import { DB_URL, MQTT_BROKER_URL } from "../src/config"

import app from "../src/app"
import initMQTT from "../src/mqtt"


test("Server run", () => {
        const request: SuperTest<Test> = supertest(app);
})

test("MQTT connect successfully", done => {
        initMQTT(MQTT_BROKER_URL, {})
                .then(() => done())
                .catch(e => done(e))
})

test("Connect with DB", done => {
        connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
                .then(() => done())
                .catch(e => done(e));
})

