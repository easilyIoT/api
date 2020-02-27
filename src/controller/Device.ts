import { Request, Response } from "express";

import DeviceModel from "../models/device"
import { HealthStatus } from "../mqtt"
import deviceData, { isRead, isAction, getImplementedTypes } from "../devices";

import { Device, User, DeviceType, DeviceAction } from '../types';

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
        
        const type: DeviceType = req.body.type;
        const name: string = req.body.name;

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
                        category: deviceTypeDatos.category,
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

        if (!deviceID || deviceID === undefined)
                return res.status(400).json({
                        error: true,
                        message: "deviceID is missing"
                })
        
        try {

                const device: Device | null = await DeviceModel.findById(deviceID);

                if (!device)
                        return res.status(400).json({
                                error: true,
                                message: "Device not found"
                        })
                
                if (device.owner === user._id)
                        return res.status(401).json({
                                error: true,
                                message: "User dont own the device"
                        })
                
                
                res.status(200).json({
                        device
                });

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })

                console.error(e.stack);
        }
};

export const deleteDevice = async (req: Request, res: Response) => {
        const deviceID: string = req.params.id;
        const user: User = req.body as User;


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
                
                if (device.owner === user._id)
                        return res.status(401).json({
                                error: true,
                                message: "User dont own the device"
                        })
                
                await device.remove();
                
                const deviceTypeDatos = deviceData.get(device.type);

                if (!deviceTypeDatos)
                        return res.status(500).json({
                                error: true,
                                message: "Device Type not found"
                        })
                
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

                
                req.mqtt.publish(`/${device._id}/${actionName}`, "1");
                
                // Soluzione temporanea ⚠
                device.state = actionName + "ed";

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

