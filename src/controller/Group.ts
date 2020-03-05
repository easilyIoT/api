import { Request, Response } from "express"

import { getDevices } from "../helpers"

import GroupModel from "../models/group"
import DeviceModel from "../models/device"

import { Device, Group, User, GroupWithDevices } from '../types';



export const getAllGroups = async (req: Request, res: Response) => {
        const user: User = req.user as User;

        try {
                const groups: Group[] = await GroupModel.find({ owner: user._id });
                const withDevices = await Promise.all(groups.map(async (group) => {
                        const groupWithDevices: GroupWithDevices = {
                                name: group.name,
                                description: group.description,
                                owner: group.owner,
                                _id: group._id,
                                devices: await getDevices(group.devices as string[])
                        };
                        console.log(group)
                        return groupWithDevices;
                }));

                res.status(200).json({
                        groups: withDevices
                });
        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                });
                console.error(e.stack);
        }
}

export const createGroup = async (req: Request, res: Response) => {
        const user: User = req.user as User;

        const name: string | undefined = req.body.name;
        const description: string | undefined = req.body.description;
        const devices: string[] = !req.body.devices ? [] : req.body.devices;

        if (!name)
                return res.status(400).json({
                        error: true,
                        message: "Name field not found"
                })

        if (!description)
                return res.status(400).json({
                        erorr: true,
                        message: "Description field not found"
                })

        try {
                const nameAlreadyExists: Group | null = await GroupModel.findOne({ name });

                if (nameAlreadyExists)
                        return res.status(400).json({
                                error: true,
                                message: "Name already exists"
                        })

                const group: Group = new GroupModel({
                        name,
                        description,
                        owner: user._id,
                        devices
                });

                await group.save();

                res.status(201).json({});
        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                })
                console.error(e.stack);
        }
}

export const getGroup = async (req: Request, res: Response) => {
        const groupID: string = req.params.id;
        const user: User = req.user as User;

        if (!groupID)
                return res.status(400).json({
                        error: true,
                        message: "the id of group is missing"
                })

        try {
                const group: Group | null = await GroupModel.findById(groupID);

                if (!group)
                        return res.status(400).json({
                                error: true,
                                message: "Group not found"
                        })

                if (group.owner !== String(user._id))
                        return res.status(401).json({
                                error: true,
                                message: "User is not the owner of Group"
                        })

                const groupWithDevices: GroupWithDevices = {
                        name: group.name,
                        description: group.description,
                        owner: group.owner,
                        _id: group._id,
                        devices: await getDevices(group.devices as string[])
                };
                
                res.status(200).json({
                        group: groupWithDevices
                });

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                });

                console.error(e.stack);
        }
}

export const updateGroup = async (req: Request, res: Response) => {
        const groupID: string = req.params.id;
        const user: User = req.user as User;

        const { name, description, devices } = req.body;

        if (!name || !description || !devices)
                return res.status(400).json({
                        error: true,
                        message: "some fields are missing"
                })


        if (!groupID)
                return res.status(400).json({
                        error: true,
                        message: "the id of group is missing"
                });

        try {
                const group = await GroupModel.findById(groupID);

                if (!group)
                        return res.status(400).json({
                                error: true,
                                message: "Group not found"
                        });

                if (group.owner !== String(user._id))
                        return res.status(401).json({
                                error: true,
                                message: "User is not the owner of Group"
                        });

                group.name = name;
                group.description = description;
                group.devices = devices;

                await group.save();

                res.status(200).json({});

        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                });
                console.error(e.stack);
        }
}

export const deleteGroup = async (req: Request, res: Response) => {
        const groupID: string = req.params.id;
        const user: User = req.user as User;

        if (!groupID)
                return res.status(400).json({
                        error: true,
                        message: "the id of group is missing"
                });

        try {
                const group = await GroupModel.findById(groupID);

                if (!group)
                        return res.status(400).json({
                                error: true,
                                message: "Group not found"
                        });

                if (group.owner !== String(user._id))
                        return res.status(401).json({
                                error: true,
                                message: "User is not the owner of Group"
                        });

                await group.remove();

                res.status(200).json({})
        } catch (e) {
                res.status(500).json({
                        error: true,
                        message: e.message
                });
                console.error(e.stack);
        }
}