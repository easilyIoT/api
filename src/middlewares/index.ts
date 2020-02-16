import { Request, Response, NextFunction } from "express"
import { MqttClient } from 'mqtt';
 
import RefreshToken from "../models/refresh_token"
import User from "../models/user";
import { signToken } from "../helpers"


export const headerLoggers = (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers),
        next();
};


export const enqueueMQTT = (client: MqttClient) => (req: Request, res: Response, next: NextFunction) => {
        req.mqtt = client;
        next();
};