import { Request, Response, NextFunction } from "express"
import { MqttClient } from 'mqtt';

import RefreshToken from "../models/refresh_token"
import User from "../models/user";
import { signToken } from "../helpers"


export const headerLogger = (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers),
                next();
};

export const bodyLogger = (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body),
                next();
};

export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
        const oldWrite = res.write,
                oldEnd = res.end;

        const chunks: Buffer[] = [];

        res.write = function (chunk: any): boolean {
                chunks.push(new Buffer(chunk));

                return oldWrite.apply(res, arguments as any);
        };

        res.end = function () {

                const body = Buffer.concat(chunks).toString('utf8');
                console.log("Response from", req.path, "=>", body);

                oldEnd.apply(res, arguments as any);
        };

        next();
};

export const injectMQTT = (client: MqttClient) => (req: Request, res: Response, next: NextFunction) => {
        req.mqtt = client;
        next();
};