import url from "url"
import uuid from "uuid/v1"
import { Request, Response, NextFunction } from "express"

import UserModel from "../models/user";
import CodeModel from "../models/code";
import ClientModel from "../models/client";
import RefreshTokenModel from "../models/refresh_token";

import { signToken } from "../helpers"
import { SecureRandom } from '../helpers/SecureRandom';

import { User, Client } from "../types"



export const auth = (req: Request, res: Response) => {
        console.log(req.query);

        res.redirect(url.format({
                pathname: "https://frontend.arcanediver.now.sh/authorize",
                query: { ...req.query },
        }));
};

export const authorization_code_grant = async (req: Request, res: Response) => {
                
        try {

                const { code: codeId, client_id, client_secret, grant_type, redirect_uri } = req.body;

                const code = await CodeModel.findById(codeId);
                
                console.log(req.body);
                        
                if (!code)
                        return res.status(400).json({
                                error: true,
                                message: "Dont found any match for code providden"
                        });
                        
                
                const user = await UserModel.findById(code.user);
                const client = await ClientModel.findById(code.client);

                await code.remove()

                if (!user)
                        return res.status(400).json({
                                error: true,
                                message: "User not found"
                        })
                        
                if (!client)
                        return res.status(400).json({
                                error: true,
                                message: "OAuth2 Client not found"
                        })
                
                const expires_in = 360;
                const accessToken = signToken(user, expires_in);
                const refresh_token = new RefreshTokenModel({ user: user._id });

                await refresh_token.save();

                      
                res.status(200).json({
                        access_token: accessToken,
                        refresh_token: refresh_token._id,
                        token_type: "Bearer",
                        expires_in,
                        "scope": "device:all"
                });

        } catch (e) {
                console.log(e)
                res.status(500).json({
                        error: e.message
                })
        }
};


export const refresh_token_grant = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        
        const grant_type = req.body.grant_type;

        if (grant_type !== "refresh_token")
                next()
        
        
        const refresh_token_id = req.body.refresh_token;

        if (!refresh_token_id)
                return res.send(400).json({
                        error: true,
                        messagge: "refresh_token not found"
                });

        try {
                const refresh_token = await RefreshTokenModel.findById(refresh_token_id);

                if (!refresh_token)
                        res.send(400).json({
                                error: true,
                                messagge: "refresh_token not found"
                        });
                else {
                        const user = await UserModel.findById(refresh_token.user);
                        
                        if (!user) 
                                res.send(400).json({
                                        error: true,
                                        messagge: "user not found"
                                })
                        else 
                                res.status(200).json({
                                        access_token: signToken(user, 360),
                                        token_type: "Bearer",
                                        expires_in: 360,
                                        refresh_token: refresh_token_id,
                                        "scope": "device:all"
                                });
                }
        } catch (e) {
                return res.send(500).json({
                        error: true,
                        messagge: e.messagge
                });
        }
};

export const generateCode = async (req: Request, res: Response) => {
        try {
                const { client_id, response_type } = req.body;
                const user = req.user as User;
                const client = await ClientModel.findOne({ client_id });

                
                if (!client)
                        return res.status(400).json({
                                error: "ClientID not found"
                        });
                        
                const code = new CodeModel({
                        user: user._id,
                        client: client._id,
                        expire_time: new Date().setMinutes(new Date().getMinutes() + 6)
                });

                
                await code.save();

                res.status(201).json({
                        code: code._id,
                });
        } catch (e) {
                res.status(500).json({
                        error: e.message
                })
        }
};


// CRUD on client

export const getClients = async (req: Request, res: Response) => {

        const user: any = req.user;

        try {
                const clients: Client[] = await ClientModel.find({ owner: user._id });
                
                res.status(200).json({ clients });
        } catch (e) {
                res.status(500).json({
                        error: e.message
                })
        }
};

export const createClient = async (req: Request, res: Response) => {
        try {
                const user: any = req.user;
                const { name } = req.body;

                if (!req.body.name) {
                        return res.status(400).json({
                                error: "Missing name of Client"
                        });
                }

                const client = new ClientModel({
                        client_id: uuid(),
                        client_secret: SecureRandom.generate(),
                        owner: user._id,
                        name
                });

                await client.save();

                res.status(201).json({
                        client_id: client.client_id,
                        client_secret: client.client_secret
                });

        } catch (e) {
                res.status(500).json({
                        error: e
                })
        } 
};

export const getClient = async (req: Request, res: Response) => {
        const user: any = req.user;
        const client_id = req.params.id;

        try {

                const client = await ClientModel.findOne({ client_id });
                        
                if (!client)
                        return res.status(404).json({ error: "Client not found" })
                        
                        
                res.status(200).json(client);

        } catch (e) {
                res.status(500).json({
                        error: e.message
                })
        }
};

export const deleteClient = async (req: Request, res: Response) => {
        try {
                const user: User = req.user as User;
                const client_id = req.params.id;

                                
                const client = await ClientModel.findOne({ client_id, owner: user._id });
                if (!client)
                        return res.status(400).json({
                                error: "client did't exist"
                        });
                
                await client.remove();

                res.status(200).json({});
        } catch (e) {
                res.status(500).json({
                        error: e.message
                });
        }
};