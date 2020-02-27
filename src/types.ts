
import express, { Request, Express, Response, NextFunction } from "express"
import { Document } from "mongoose"
import { MqttClient } from 'mqtt';
import passport from 'passport';

import { HealthStatus } from "./mqtt"

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

export type DeviceType = "LockController" | "TemperatureSensor";

export type DeviceAction = "lock" | "unlock";
export type DeviceRead = "health" | "temperature";

export interface Device extends Document {
        type: DeviceType,
        name: string,
        owner: string,
        actions: DeviceAction,
        reads: DeviceRead
        state: string,
        isOnline: boolean
}

type Timer = NodeJS.Timeout;

declare global {
        namespace Express {
                interface Request {
                        mqtt: MqttClient,
                        deviceHealth: Map<string, HealthStatus>
                }
        }
        namespace NodeJS {
                interface ProcessEnv {
                        DB_USER: string | undefined,
                        DB_PASSWORD: string | undefined,
                        JWT_SECRET: string | undefined,
                        MQTT_USER: string | undefined,
                        MQTT_PASSWORD: string | undefined,
                        NODE_ENV: "PRODUCTION" | "DEV" | "TEST"
                }
        }
}