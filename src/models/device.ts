import { Schema, model } from 'mongoose';

import deviceData, { getImplementedTypes } from "../devices" 

import { Device } from '../types';


const deviceSchema = new Schema({
        type: {
                type: String,
                required: true,
                enum: getImplementedTypes()
        },
        name: {
                type: String,
                required: true
        },
        owner: {
                type: String,
                required: true
        },
        actions: {
                type: [String],
                required: true
        },
        reads: {
                type: [String],
                required: true
        },
        categories: {
                type: [String],
                required: true
        },
        state: {
                type: String,
                required: true
        },
        isOnline: {
                type: Boolean,
                required: true
        }
});

export default model<Device>("Device", deviceSchema);