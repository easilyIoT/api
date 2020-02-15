import { Schema, model } from 'mongoose';

import { Code } from "../types"

const codeSchema = new Schema({
        client: {
                required: true,
                type: String
        },
        user: {
                required: true,
                type: String
        },
        expire_time: {
                type: Number,
                required: true
        }
});


export default model<Code> ("Code", codeSchema);