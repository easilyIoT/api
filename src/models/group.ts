import { Schema, model } from 'mongoose';


import { Group } from '../types';

const groupSchema = new Schema({
        name: {
                type: String,
                required: true
        },
        description: {
                type: String,
                required: true
        },
        owner: {
                type: String,
                required: true
        },
        devices: {
                type: [String],
                required: true
        }
})

export default model<Group>("Group", groupSchema)