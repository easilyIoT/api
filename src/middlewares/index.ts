import { Request, Response, NextFunction } from "express"
 
import RefreshToken from "../models/refresh_token"
import User from "../models/user";
import { MqttClient } from 'mqtt';


export const headerLoggers = (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers),
        next();
};

export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const refresh_token_id = req.body.refresh_token;

        if (!refresh_token_id)
                return res.send(400).json({
                        error: true,
                        messagge: "refresh_token not found"
                });

        try {
                const refresh_token = await RefreshToken.findById(refresh_token_id);

                if (!refresh_token)
                        return res.send(400).json({
                                error: true,
                                messagge: "refresh_token not found"
                        });
                else {
                        const user = await User.findById
                        next();
                }
        } catch (e) {
                return res.send(500).json({
                        error: true,
                        messagge: e.messagge
                });
        }
};

export const enqueueMQTT = (client: MqttClient) => (req: Request, res: Response, next: NextFunction) => {
        req.mqtt = client;
        next();
};