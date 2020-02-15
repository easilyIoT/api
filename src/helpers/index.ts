import { sign } from "jsonwebtoken"

import { User, DeviceTypes } from '../types';

/**
 * @param user User object from db query
 * @param expires_in number of seconds of token lifetime
 */
export const signToken = (user: User, expires_in: number = 0): string => {
        const obj = {
                sub: user._id,
                iat: new Date().getTime(),
                exp: new Date().setSeconds(new Date().getSeconds() + expires_in),
                iss: "AUTH server user id"
        };


        return sign(obj, process.env.JWT_SECRET || "nigga")
};

export const toHexString = (byteArray: any) => {
        return Array.prototype.map.call(byteArray, function (byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
};

export const actionFromType = (type: DeviceTypes): string[] => {
        switch (type) {
                case "LockController": 
                        return ["lock", "unlock"]
                default:
                        throw new Error("Cannot detect action type")
        }
}