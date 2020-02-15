import { MqttClient, connect, IClientOptions } from "mqtt"
import { MQTT_BROKER_URL } from './config/index';

export default (url: string, options: IClientOptions = {}): Promise<MqttClient> => {
        const client: MqttClient = connect(url, options);

        return new Promise((resolve, reject) => {

                client.on("connect", () => resolve(client));

                setTimeout(reject, 10 * 1000);
                
                client.on("error", reject);
        });
}