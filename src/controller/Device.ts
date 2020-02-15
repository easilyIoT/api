import { Request, Response } from "express";

import DeviceModel from "../models/device"
import { Device, User, DeviceTypes } from '../types';
import { actionFromType } from "../helpers";

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
        }
}      

export const createDevice = async (req: Request, res: Response) => {
        
        const user: User = req.user as User;
        
        const type: DeviceTypes = req.body.type;
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
                
                const actions: string[] = actionFromType(type);
                // actions.forEach(action => req.mqtt.subscribe(`/${name}${action}`));

                const device: Device = new DeviceModel({ name, type, owner: user._id, actions, state: "default" });

                await device.save();


                res.status(201).json();


        } catch (e) {
                res.status(500).json({
                        error: true,
                        messagge: e.message
                })
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
                
                //device.actions.forEach(action => req.mqtt.unsubscribe(`/${device.name}${action}`));

                res.status(200).json({});

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })
        }
};

export const triggerAction = async (req: Request, res: Response) => {
        const user: User = req.user as User;

        const deviceID: string = req.params.id;
        const actionName: string = req.params.action;

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
                
                if (!device.actions.includes(actionName))
                        return res.status(400).json({
                                error: true,
                                message: "Action supported from this device"
                        })
                
                req.mqtt.publish(`/${device._id}/${actionName}`, "1");
                device.state = actionName + "ed";

                await device.save();
                
                res.status(200).json({});
                
        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })
        }
}