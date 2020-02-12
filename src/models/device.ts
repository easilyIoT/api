import { Schema, model } from 'mongoose';
import { Device } from '../types';


const deviceSchema = new Schema({
        type: {
                type: String,
                required: true,
                enum: ["LockController"]
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
        state: {
                type: String,
                required: true
        }
});

export default model<Device>("Device", deviceSchema);