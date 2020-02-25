import { MqttClient, connect, IClientOptions } from "mqtt"

import DeviceModel from "./models/device"
import DeviceMap from "./devices"
import { MQTT_BROKER_URL } from './config/index';

export default (url: string, options: IClientOptions = {}): Promise<MqttClient> => {
        const client: MqttClient = connect(url, options);

        return new Promise((resolve, reject) => {

                client.on("connect", async () => {
                        try {
                                const devices = await DeviceModel.find();
                        
                                devices.forEach(device => {
                                      

                                        
                                })
                        
                                resolve(client)
                        
                        } catch (e) {
                                reject(e);
                        }
                });



                setTimeout(reject, 10 * 1000);
                client.on("error", reject);
                
        });
}