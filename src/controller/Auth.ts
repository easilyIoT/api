import { Request, Response } from "express"
import { signToken } from "../helpers"

import UserModel from "../models/user"


export const register = async (req: Request, res: Response) => {
        try {
                const { email, password } = req.body;

                const emailAlreadyExist = await UserModel.findOne({ email });
                if (emailAlreadyExist)
                        return res.sendStatus(400).json({
                                message: "Email already exists"
                        })

                const newUser = new UserModel({
                        email,
                        password
                });


                await newUser.save();

                res.status(201).json();
        } catch (e) {
                res.status(400).json({
                        message: e.message
                });
        }
};
export const login = (req: Request, res: Response) => {

        res.status(200).json({
                token: signToken(req.user as any, 36000)
        })
};
export const verify = (req: Request, res: Response) => {
        res.sendStatus(200);
};