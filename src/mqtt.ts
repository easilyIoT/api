import { MqttClient, connect, IClientOptions } from "mqtt"

import DeviceModel from "./models/device"
import DeviceData, { DeviceDataStorage, isRead } from "./devices"

import { getKeysOfMap, isFloat } from "./helpers"

import { MQTT_BROKER_URL } from './config/index';

import { DeviceRead } from "./types"

export class HealthStatus {

        private timer: NodeJS.Timeout;

        constructor(private _status: boolean, private _deviceID: string) {
                this.timer = setTimeout(this.fn.bind(this), 5000)
        }

        public reset(): void {
                clearTimeout(this.timer);
                this.timer = setTimeout(this.fn.bind(this), 5000);
        }

        public stop(): void {
                clearTimeout(this.timer);
        }

        public set status(value: boolean) {
                this._status = value;
        }

        public get status(): boolean {
                return this._status;
        }

        public get deviceID(): string {
                return this._deviceID;
        }
        private async fn(): Promise<void> {
                if (this._status) {
                        try {
                                const device = await DeviceModel.findOne({ _id: this._deviceID });

                                if (!device)
                                        return console.error("⛔  Device not found")

                                device.isOnline = false;

                                await device.save();

                                this._status = false;
                        } catch (e) {
                                console.error(e.stack);
                        }
                }

                this.reset();
        }

}

export default (url: string, options: IClientOptions = {}): Promise<{ client: MqttClient, devices: Map<string, HealthStatus> }> => {
        const client: MqttClient = connect(url, options);

        let deviceHealthStatus = new Map<string, HealthStatus>();
        return new Promise((resolve, reject) => {


                client.on("connect", async () => {
                        try {
                                const devices = await DeviceModel.find();

                                devices.forEach(async device => {
                                        const data: DeviceDataStorage | undefined = DeviceData.get(device.type);

                                        if (!data) {
                                                console.error(`⛔  Internal Error type: ${device.type} not found in \`DeviceData\` keys`)
                                                process.exit(1);
                                        } else {

                                                deviceHealthStatus.set(String(device._id), new HealthStatus(false, device._id))
                                                data.reads.forEach(read => {
                                                        client.subscribe(`/${device._id}/${read}`);
                                                        console.log(`✅  [${device.name}] subscribe at /${device._id}/${read}`);
                                                })

                                                device.isOnline = false;

                                                await device.save();
                                        }
                                })

                                resolve({ client, devices: deviceHealthStatus })

                        } catch (e) {
                                reject(e);
                        }
                });

                client.on("message", async (topic: string, payload: Buffer) => {
                        const deviceID: string = topic.split("/")[1];
                        const readToBeVerified: string = topic.split("/")[2];


                        if (isRead(readToBeVerified)) {
                                const readType: DeviceRead = readToBeVerified as DeviceRead;


                                switch (readType) {
                                        case "health": {
                                                const data = deviceHealthStatus.get(deviceID);


                                                if (!data)
                                                        return console.error(`⛔  ${topic} error on parsing`);

                                                if (!data.status) {
                                                        data.status = true;

                                                        try {
                                                                const device = await DeviceModel.findOne({ _id: data.deviceID });

                                                                if (!device)
                                                                        return console.error(`⛔  id: ${data.deviceID} of Device not found in DB`)

                                                                device.isOnline = true;

                                                                await device.save();
                                                        } catch (e) {
                                                                console.error(e.stack);
                                                        }
                                                }
                                                data.reset();
                                                break;
                                        }
                                        case "temperature": {
                                                if (!isFloat(payload.toString()))
                                                        return
                                                
                                                try {
                                                        const device = await DeviceModel.findOne({ _id: deviceID });

                                                        if (!device)
                                                                return console.error(`⛔  id: ${deviceID} of Device not found in DB`)
                                                        
                                                        device.state = payload.toString();

                                                        await device.save();
                                                } catch (e) {
                                                        console.error(e.stack)
                                                }

                                                break;
                                        }
                                        default: {
                                                break;
                                        }
                                }
                        }


                })


                setTimeout(reject, 10 * 1000);
                client.on("error", reject);

        });
}