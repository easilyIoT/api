import { Request, Response } from "express";

import DeviceModel from "../models/device"
import { HealthStatus } from "../mqtt"
import deviceData, { isRead, isAction, getImplementedTypes } from "../devices";

import { Device, User, DeviceType, DeviceAction } from '../types';
import { isFloat } from '../helpers/index';

export const getAllDevices = async (req: Request, res: Response) => {
        const user: User = req.user as User;

        try {
                const devices: Device[] = await DeviceModel.find({ owner: user._id });

                res.status(200).json({
                        devices
                });
        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                });
                console.error(e.stack);
        }
}      

export const createDevice = async (req: Request, res: Response) => {
        
        const user: User = req.user as User;
        
        const type: DeviceType | undefined = req.body.type;
        const name: string | undefined = req.body.name;

        if (!type) 
                return res.status(400).json({
                        error: true,
                        message: "Type property is missing"
                })        
        

        if (!name) 
                return res.status(400).json({
                        error: true,
                        message: "Name property is missing"
                })
        

        try {
                const nameAlreadyExists: Device | null = await DeviceModel.findOne({ name });

                if (nameAlreadyExists) 
                        return res.status(400).json({
                                error: true,
                                message: "Name already exists"
                        })
                
                const deviceTypeDatos = deviceData.get(type);

                if (!deviceTypeDatos)
                        return res.status(400).json({
                                error: true,
                                message: "Device Type not found"
                        })
                
                        
                const device: Device = new DeviceModel({
                        name,
                        type,
                        owner: user._id,
                        actions: deviceTypeDatos.actions,
                        reads: deviceTypeDatos.reads,
                        categories: deviceTypeDatos.category,
                        state: "none",
                        isOnline: false
                });
                
                req.deviceHealth.set(String(device._id), new HealthStatus(false, device._id));
                deviceTypeDatos.reads.forEach(read => req.mqtt.subscribe(`/${device._id}/${read}`));

                await device.save();


                res.status(201).json({});

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })

                console.error(e.stack)
        }
}

export const getDevice = async (req: Request, res: Response) => {
        const deviceID: string = req.params.id;
        const user: User = req.user as User;

        if (!deviceID)
                return res.status(400).json({
                        error: true,
                        message: "the id of device is missing"
                })
        
        try {

                const device: Device | null = await DeviceModel.findById(deviceID);

                if (!device)
                        return res.status(400).json({
                                error: true,
                                message: "Device not found"
                        });
                
                if (device.owner !== user._id)
                        return res.status(401).json({
                                error: true,
                                message: "User is not the owner of Device"
                        });
                
                
                res.status(200).json({
                        device
                });

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                });

                console.error(e.stack);
        }
};

export const deleteDevice = async (req: Request, res: Response) => {
        const deviceID: string = req.params.id;
        const user: User = req.user as User;


        if (!deviceID || deviceID === undefined)
                return res.status(400).json({
                        error: true,
                        message: "deviceID is missing"
                });
        
        
        try {

                const device: Device | null = await DeviceModel.findById(deviceID);

                if (!device)
                        return res.status(400).json({
                                error: true,
                                message: "Device not found"
                        })
                
                
                if (device.owner !== String(user._id))
                        return res.status(401).json({
                                error: true,
                                message: "User is not the owner of Device"
                        })
                
                await device.remove();
                
                const deviceTypeDatos = deviceData.get(device.type);

                if (!deviceTypeDatos)
                        return res.status(500).json({
                                error: true,
                                message: "Device Type not found"
                        })
                
                req.deviceHealth.get(device._id)?.stop();
                req.deviceHealth.delete(device._id);
                deviceTypeDatos.reads.forEach(read => req.mqtt.unsubscribe(`/${device._id}/${read}`));

                res.status(200).json({});

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })
                console.error(e.stack);
        }
};

export const getTypes = async (req: Request, res: Response) => {
        const user: User = req.user as User;
        try {
                const definedTypes: DeviceType[] = getImplementedTypes();

                res.status(200).json({
                        types: definedTypes
                });

        } catch (e) {

                res.status(500).json({
                        error: true,
                        message: e
                })
                console.error(e.stack);
        }
};

export const triggerAction = async (req: Request, res: Response) => {
        const user: User = req.user as User;

        const deviceID: string = req.params.id;
        const actionName: DeviceAction = req.params.action as DeviceAction;

        if (!deviceID || deviceID === undefined)
                return res.status(400).json({
                        error: true,
                        message: "deviceID is missing"
                })
        
        if (!isAction(actionName))
                return res.status(400).json({
                        error: true,
                        message: "Action not found"
                })
        try {
                
                const device: Device | null = await DeviceModel.findById(deviceID);

                if (!device)
                        return res.status(400).json({
                                error: true,
                                message: "Device not found"
                        })
                
                if (!deviceData.get(device.type)?.actions.includes(actionName))
                        return res.status(400).json({
                                error: true,
                                message: "Actions not supported from this device type"
                        });


                switch (device.type) {
                        case "LockController":
                                device.state = actionName + "ed";
                                req.mqtt.publish(`/${device._id}/${actionName}`, "1");
                                
                                break;
                        case "PowerController":
                                device.state = actionName === "turnOFF" ? "OFF" : "ON";
                                
                                break;
                        case "ThermostatController":
                                const newTemperature: string = req.body.temperature;

                                if (!newTemperature) 
                                        return res.status(400).json({
                                                error: true,
                                                message: "newTemperature not found in body"
                                        })
                                
                                if (!isFloat(newTemperature))
                                        return res.status(400).json({
                                                error: true,
                                                message: "newTemperature is not a float"
                                        })
                                
                                device.state = newTemperature;
                                
                                break;
                        default:
                                break;
                }

                await device.save();
                
                res.status(200).json({});
                
        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })
                console.error(e.stack);
        }
}

