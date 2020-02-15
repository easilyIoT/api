import { Schema, model } from 'mongoose';

import { Client } from "../types"

const clientSchema: Schema = new Schema({
        client_id: {
                type: String,
                required: true
        },
        client_secret: {
                type: String,
                required: true
        },
        owner: {
                type: String,
                required: true
        },
        name: {
                required: true,
                type: String
        }
})

export default model<Client> ("Client", clientSchema);