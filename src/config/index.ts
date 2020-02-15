
export const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@db-iot-c1see.mongodb.net/${process.env.NODE_ENV !== "test" ? "api": "test"}?retryWrites=true&w=majority`;
//export const DB_URL = `mongodb://127.0.0.1:27017/IoTSys`;

export const MQTT_BROKER_URL = `mqtt://${process.env.MQTT_USER}:${process.env.MQTT_PASSWORD}@broker.shiftr.io`;