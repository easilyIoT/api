import express, { Request, Express, Response, NextFunction } from "express"
import { Document } from "mongoose"
import { MqttClient } from 'mqtt';
import passport from 'passport';


export interface Code extends Document {
        client: string,
        user: string,
        expireTime: Date
}

export interface Client extends Document {
        client_id: string,
        client_secret: string,
        name: string,
        owner: string
}

export interface User extends Document {
        email: string,
        password: string,
        isValidPassword: (this: User, newPassword: string) => Promise<Boolean>
}

export interface RefreshToken extends Document {
        user: string
}

export type DeviceTypes = "LockController";

export interface Device extends Document {
        type: DeviceTypes,
        name: string,
        owner: string,
        actions: string[],
        state: string
}

process.env
declare global {
        namespace Express {
                interface Request {
                        mqtt: MqttClient,
                }
        }
        namespace Node {
                interface ProcessEnv {
                        DB_USER: string | undefined,
                        DB_PASSWORD: string | undefined,
                        JWT_SECRET: string | undefined,
                        MQTT_USER: string | undefined,
                        MQTT_PASSWORD: string | undefined
        }
}
}