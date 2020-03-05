import { sign } from "jsonwebtoken"

import DeviceModel from "../models/device"

import { User, Device } from '../types';


export const signToken = (user: User, expires_in: number = 0): string => {
        const obj = {
                sub: user._id,
                iat: new Date().getTime(),
                exp: new Date().setSeconds(new Date().getSeconds() + expires_in),
                iss: "AUTH server user id"
        };


        return sign(obj, process.env.JWT_SECRET || "secret")
};

export const toHexString = (byteArray: any) => {
        return Array.prototype.map.call(byteArray, function (byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
};

export const getKeysOfMap = function <T>(map: Map<T, any>): T[] {
        let res: T[] = [];

        const keys = map.keys();
        let type: IteratorResult<T, T>;

        while (!(type = keys.next()).done)
                res.push(type.value);

        return res;
}

export const isFloat = (value: string): boolean => !isNaN(parseFloat(value));

export const getDevices = async (devices: string[]): Promise<Device[]> => {
        return (await Promise.all(
                devices.map(async id => await DeviceModel.findById(id))
        )).filter(nullableDevice => nullableDevice) as Device[];
}