import { Request, Response, NextFunction } from "express"
import { MqttClient } from 'mqtt';

import { HealthStatus } from "../mqtt";

export const headerLogger = (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers),
                next();
};

export const bodyLogger = (req: Request, res: Response, next: NextFunction) => {
        (req.body ? console.log("Body of", req.path, "=>", req.body) : false);
        next();
};

export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
        const oldJson = res.json;
        const oldSend = res.send;
        const oldEnd = res.end;

        let body: Object = {};

        res.json = function (obj: Object) {
                body = obj;

                return oldJson.apply(res, arguments as any);
        };

        res.send = function (text: string) {
                body = text;

                return oldSend.apply(res, arguments as any);
        }
        res.end = function () {

                console.log("Response from", req.url, "=>", body);

                oldEnd.apply(res, arguments as any);
        };

        next();
};

export const injectMQTT = (client: MqttClient) => (req: Request, res: Response, next: NextFunction) => {
        req.mqtt = client;
        next();
};

export const injectDeviceHealth = (deviceHealth: Map<string, HealthStatus>) => (req: Request, res: Response, next: NextFunction) => {
        req.deviceHealth = deviceHealth;
        next();
}