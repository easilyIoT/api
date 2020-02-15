import { Schema, model } from "mongoose"

import { RefreshToken } from "../types"

const refreshTokenSchema = new Schema({
        user: {
                required: true,
                type: String
        },
        expireAt: {
                type: Number
        }
});

export default model<RefreshToken> ("RefreshToken", refreshTokenSchema);